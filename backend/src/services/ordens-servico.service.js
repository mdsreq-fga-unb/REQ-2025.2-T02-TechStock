const ordensRepository = require('../repositories/ordens-servico.repository');
const clientesRepository = require('../repositories/clientes.repository');
const celularesRepository = require('../repositories/celulares.repository');
const historicoRepository = require('../repositories/celulares-historico.repository');
const { getPrisma } = require('../database/prisma');

const STATUS = {
  EM_ANDAMENTO: 'EmAndamento',
  CONCLUIDO: 'Concluido',
};

const EVENTOS = {
  CRIADA: 'OrdemServicoCriada',
  ATUALIZADA: 'OrdemServicoAtualizada',
  CONCLUIDA: 'OrdemServicoConcluida',
  PECA_REGISTRADA: 'OrdemServicoPecaRegistrada',
};

async function ensureClienteExists(clienteId) {
  const cliente = await clientesRepository.getById(clienteId);
  if (!cliente) {
    const err = new Error('Cliente não encontrado');
    err.status = 404;
    throw err;
  }
  return cliente;
}

function formatDataConclusao(data) {
  if (data instanceof Date) {
    return data.toLocaleString();
  }
  if (typeof data === 'string' && !Number.isNaN(Date.parse(data))) {
    return new Date(data).toLocaleString();
  }
  return String(data);
}

async function ensureCelularExists(celularId) {
  const celular = await celularesRepository.getById(celularId);
  if (!celular) {
    const err = new Error('Celular não encontrado');
    err.status = 404;
    throw err;
  }
  return celular;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
}

async function list({ page = 1, pageSize = 20, q, status, cliente_id, celular_id } = {}) {
  return ordensRepository.list({ page, pageSize, q, filters: { status, cliente_id, celular_id } });
}

async function getById(id) {
  return ordensRepository.getById(id);
}

async function create(data, user) {
  await Promise.all([ensureClienteExists(data.cliente_id), ensureCelularExists(data.celular_id)]);

  const prisma = getPrisma();
  const userId = user?.id || 1;

  const payload = {
    cliente_id: data.cliente_id,
    celular_id: data.celular_id,
    descricao: data.descricao,
    observacoes: data.observacoes,
    garantia_dias: data.garantia_dias,
    garantia_validade: data.garantia_validade ? new Date(data.garantia_validade) : undefined,
    status: STATUS.EM_ANDAMENTO,
  };

  const created = await prisma.$transaction(async (tx) => {
    const ordem = await ordensRepository.create(payload, userId, tx);
    await historicoRepository.addEvent(
      {
        celular_id: ordem.celular_id,
        ordem_servico_id: ordem.id,
        tipo_evento: EVENTOS.CRIADA,
        descricao: `Ordem de serviço #${ordem.id} criada (status ${ordem.status}).`,
      },
      tx,
    );
    return ordem;
  });

  return ordensRepository.getById(created.id);
}

function assertGuaranteeAllowed(targetStatus, data) {
  const wantsGuarantee = data.garantia_dias !== undefined || data.garantia_validade !== undefined;
  if (wantsGuarantee && targetStatus !== STATUS.CONCLUIDO) {
    const err = new Error('Garantia só pode ser registrada ao concluir a ordem');
    err.status = 400;
    throw err;
  }
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

async function update(id, data, user) {
  const atual = await ordensRepository.getById(id);
  if (!atual) {
    return null;
  }

  const targetStatus = data.status || atual.status;
  assertGuaranteeAllowed(targetStatus, data);

  const updates = {};
  if (data.descricao !== undefined) updates.descricao = data.descricao;
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes;

  if (data.status) {
    updates.status = data.status;
  }

  const concluindo = targetStatus === STATUS.CONCLUIDO && atual.status !== STATUS.CONCLUIDO;
  const retornando = data.status === STATUS.EM_ANDAMENTO && atual.status === STATUS.CONCLUIDO;

  if (concluindo) {
    const dataConclusao = normalizeDate(data.data_conclusao) || new Date();
    updates.data_conclusao = dataConclusao;
    if (data.garantia_dias !== undefined) updates.garantia_dias = data.garantia_dias;
    if (data.garantia_validade) updates.garantia_validade = normalizeDate(data.garantia_validade);
    if (updates.garantia_dias !== undefined && !updates.garantia_validade) {
      updates.garantia_validade = addDays(dataConclusao, updates.garantia_dias);
    }
  } else if (retornando) {
    updates.data_conclusao = null;
    updates.garantia_dias = null;
    updates.garantia_validade = null;
  } else {
    if (atual.status === STATUS.CONCLUIDO) {
      if (data.garantia_dias !== undefined) updates.garantia_dias = data.garantia_dias;
      if (data.garantia_validade) updates.garantia_validade = normalizeDate(data.garantia_validade);
    }
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error('Nenhum campo válido para atualizar');
    err.status = 400;
    throw err;
  }

  const prisma = getPrisma();
  const userId = user?.id || 1;

  await prisma.$transaction(async (tx) => {
    await ordensRepository.update(id, updates, userId, tx);

    if (concluindo) {
      const garantiaInfo = updates.garantia_dias
        ? ` com garantia de ${updates.garantia_dias} dias`
        : '';
      const dataConclusaoStr = formatDataConclusao(updates.data_conclusao);
      await historicoRepository.addEvent(
        {
          celular_id: atual.celular_id,
          ordem_servico_id: id,
          tipo_evento: EVENTOS.CONCLUIDA,
          descricao: `Ordem de serviço #${id} concluída em ${dataConclusaoStr}${garantiaInfo}.`,
        },
        tx,
      );
    } else if (data.status && data.status !== atual.status) {
      await historicoRepository.addEvent(
        {
          celular_id: atual.celular_id,
          ordem_servico_id: id,
          tipo_evento: EVENTOS.ATUALIZADA,
          descricao: `Ordem de serviço #${id} atualizada para status ${data.status}.`,
        },
        tx,
      );
    }
  });

  return ordensRepository.getById(id);
}

function aggregateItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    const err = new Error('Informe ao menos uma peça para registrar');
    err.status = 400;
    throw err;
  }

  const map = new Map();
  itens.forEach((item, index) => {
    const pecaId = Number(item?.peca_id);
    const quantidade = Number(item?.quantidade);
    if (!Number.isInteger(pecaId) || pecaId <= 0) {
      const err = new Error(`Peça inválida na posição ${index}`);
      err.status = 400;
      throw err;
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      const err = new Error(`Quantidade inválida para a peça ${pecaId}`);
      err.status = 400;
      throw err;
    }
    const current = map.get(pecaId) || 0;
    map.set(pecaId, current + quantidade);
  });

  return map;
}

async function registrarPecas(id, itens, user) {
  const agregados = aggregateItens(itens);
  const prisma = getPrisma();
  const userId = user?.id || 1;
  const dataUso = new Date();

  await prisma.$transaction(async (tx) => {
    const ordem = await tx.ordens_servico.findUnique({ where: { id }, select: { id: true, celular_id: true } });
    if (!ordem) {
      const err = new Error('Ordem de serviço não encontrada');
      err.status = 404;
      throw err;
    }

    const ids = Array.from(agregados.keys());
    const pecas = await tx.pecas.findMany({ where: { id: { in: ids } } });
    const pecasMap = new Map(pecas.map((p) => [p.id, p]));

    for (const [pecaId, quantidade] of agregados.entries()) {
      const peca = pecasMap.get(pecaId);
      if (!peca) {
        const err = new Error(`Peça ${pecaId} não encontrada`);
        err.status = 404;
        throw err;
      }
      if (peca.quantidade < quantidade) {
        const err = new Error(`Quantidade solicitada para a peça ${peca.nome} excede o estoque disponível (${peca.quantidade}).`);
        err.status = 400;
        throw err;
      }
    }

    for (const [pecaId, quantidade] of agregados.entries()) {
      await tx.pecas.update({ where: { id: pecaId }, data: { quantidade: { decrement: quantidade }, updated_by: userId } });
      await tx.ordens_servico_pecas.upsert({
        where: { ordem_servico_peca_unique: { ordem_servico_id: id, peca_id: pecaId } },
        update: { quantidade: { increment: quantidade }, data_uso: dataUso },
        create: { ordem_servico_id: id, peca_id: pecaId, quantidade, data_uso: dataUso },
      });
    }

    const descricao = Array.from(agregados.entries())
      .map(([pecaId, quantidade]) => {
        const peca = pecasMap.get(pecaId);
        if (!peca) {
          throw new Error(`Invariante violada: peça ${pecaId} não encontrada ao construir a descrição.`);
        }
        return `${peca.nome} x${quantidade}`;
      })
      .join(', ');

    await historicoRepository.addEvent(
      {
        celular_id: ordem.celular_id,
        ordem_servico_id: ordem.id,
        tipo_evento: EVENTOS.PECA_REGISTRADA,
        descricao: `Peças registradas: ${descricao}.`,
      },
      tx,
    );
  });

  return ordensRepository.getById(id);
}

module.exports = { list, getById, create, update, registrarPecas, STATUS };

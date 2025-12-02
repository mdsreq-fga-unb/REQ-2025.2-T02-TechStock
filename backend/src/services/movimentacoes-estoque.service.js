const movimentacoesRepository = require('../repositories/movimentacoes-estoque.repository');
const celularesRepository = require('../repositories/celulares.repository');
const pecasRepository = require('../repositories/pecas.repository');
const { getPrisma } = require('../database/prisma');

const TipoItem = {
  CELULAR: 'CELULAR',
  PECA: 'PECA',
};

const TipoOperacao = {
  COMPRA: 'COMPRA',
  VENDA: 'VENDA',
  DEVOLUCAO: 'DEVOLUCAO',
  CONSERTO: 'CONSERTO',
};

const ENTRADA_OPERACOES = new Set([TipoOperacao.COMPRA, TipoOperacao.DEVOLUCAO]);
const SAIDA_OPERACOES = new Set([TipoOperacao.VENDA, TipoOperacao.CONSERTO]);

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function normalizeTipoItem(value) {
  if (!value) {
    throw httpError(400, 'tipo_item é obrigatório');
  }
  const upper = String(value).toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(TipoItem, upper)) {
    throw httpError(400, 'tipo_item inválido');
  }
  return TipoItem[upper];
}

function normalizeTipoOperacao(value) {
  if (!value) {
    throw httpError(400, 'tipo_operacao é obrigatório');
  }
  const upper = String(value).toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(TipoOperacao, upper)) {
    throw httpError(400, 'tipo_operacao inválido');
  }
  return TipoOperacao[upper];
}

function ensureQuantidade(value, { allowMultiple } = { allowMultiple: true }) {
  const qtd = Number(value);
  if (!Number.isInteger(qtd) || qtd <= 0) {
    throw httpError(400, 'quantidade deve ser um inteiro maior que zero');
  }
  if (!allowMultiple && qtd !== 1) {
    throw httpError(400, 'Movimentações de celulares devem ter quantidade igual a 1');
  }
  return qtd;
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw httpError(400, 'data_movimentacao inválida');
  }
  return date;
}

function isEntrada(operacao) {
  return ENTRADA_OPERACOES.has(operacao);
}

function validateCelularOperation(operacao, celular) {
  if (operacao === TipoOperacao.VENDA && celular.status !== 'EmEstoque') {
    throw httpError(400, 'Celular indisponível para venda');
  }
  if (operacao === TipoOperacao.CONSERTO && celular.status === 'Descartado') {
    throw httpError(400, 'Celular descartado não pode ser enviado para conserto');
  }
  if (operacao === TipoOperacao.DEVOLUCAO && !['Vendido', 'EmReparo'].includes(celular.status)) {
    throw httpError(400, 'Celular não está vendido ou em conserto para registrar devolução');
  }
}

function nextCelularStatus(operacao) {
  switch (operacao) {
    case TipoOperacao.VENDA:
      return 'Vendido';
    case TipoOperacao.CONSERTO:
      return 'EmReparo';
    case TipoOperacao.DEVOLUCAO:
    case TipoOperacao.COMPRA:
    default:
      return 'EmEstoque';
  }
}

async function resolveUserId(tx, user) {
  if (user?.id) return user.id;
  const found = await tx.usuarios.findFirst({ select: { id: true }, orderBy: { id: 'asc' } });
  if (!found) {
    throw httpError(400, 'Nenhum usuário disponível para registrar movimentações');
  }
  return found.id;
}

async function list({
  page = 1,
  pageSize = 20,
  tipo_item,
  tipo_operacao,
  usuario_id,
  dataInicio,
  dataFim,
  celular_id,
  peca_id,
} = {}) {
  const filters = {};
  if (tipo_item) filters.tipo_item = normalizeTipoItem(tipo_item);
  if (tipo_operacao) filters.tipo_operacao = normalizeTipoOperacao(tipo_operacao);
  if (usuario_id) filters.usuario_id = Number(usuario_id);
  if (celular_id) filters.celular_id = Number(celular_id);
  if (peca_id) filters.peca_id = Number(peca_id);
  if (dataInicio) filters.dataInicio = normalizeDate(dataInicio);
  if (dataFim) filters.dataFim = normalizeDate(dataFim);

  return movimentacoesRepository.list({ page, pageSize, filters });
}

async function getById(id) {
  return movimentacoesRepository.getById(id);
}

async function create(data, user) {
  const prisma = getPrisma();
  const tipoItem = normalizeTipoItem(data.tipo_item);
  const tipoOperacao = normalizeTipoOperacao(data.tipo_operacao);
  const quantidadeBruta = data.quantidade ?? (tipoItem === TipoItem.CELULAR ? 1 : undefined);
  if (tipoItem === TipoItem.PECA && quantidadeBruta == null) {
    throw httpError(400, 'quantidade é obrigatória para movimentações de peças');
  }
  const quantidade = ensureQuantidade(quantidadeBruta, { allowMultiple: tipoItem === TipoItem.PECA });
  const dataMovimentacao = normalizeDate(data.data_movimentacao) || new Date();

  if (tipoItem === TipoItem.CELULAR && !data.celular_id) {
    throw httpError(400, 'celular_id é obrigatório para movimentações de celulares');
  }
  if (tipoItem === TipoItem.PECA && !data.peca_id) {
    throw httpError(400, 'peca_id é obrigatório para movimentações de peças');
  }

  const movimento = await prisma.$transaction(async (tx) => {
    const userId = await resolveUserId(tx, user);
    if (tipoItem === TipoItem.CELULAR) {
      const celular = await tx.celulares.findUnique({ where: { id: Number(data.celular_id) } });
      if (!celular) {
        throw httpError(404, 'Celular não encontrado');
      }
      validateCelularOperation(tipoOperacao, celular);
      const novoStatus = nextCelularStatus(tipoOperacao);
      await celularesRepository.update(celular.id, { status: novoStatus }, userId, tx);
      return movimentacoesRepository.create(
        {
          tipo_item: tipoItem,
          tipo_operacao: tipoOperacao,
          celular_id: celular.id,
          quantidade,
          saldo_resultante: 1,
          observacoes: data.observacoes,
          data_movimentacao: dataMovimentacao,
          usuario_id: userId,
        },
        tx,
      );
    }

    const peca = await tx.pecas.findUnique({ where: { id: Number(data.peca_id) } });
    if (!peca) {
      throw httpError(404, 'Peça não encontrada');
    }
    const delta = isEntrada(tipoOperacao) ? quantidade : -quantidade;
    const novoSaldo = peca.quantidade + delta;
    if (novoSaldo < 0) {
      throw httpError(400, 'Quantidade solicitada excede o estoque disponível');
    }
    await pecasRepository.update(peca.id, { quantidade: novoSaldo }, userId, tx);
    return movimentacoesRepository.create(
      {
        tipo_item: tipoItem,
        tipo_operacao: tipoOperacao,
        peca_id: peca.id,
        quantidade,
        saldo_resultante: novoSaldo,
        observacoes: data.observacoes,
        data_movimentacao: dataMovimentacao,
        usuario_id: userId,
      },
      tx,
    );
  });

  return movimento;
}

module.exports = { list, getById, create, TipoItem, TipoOperacao };

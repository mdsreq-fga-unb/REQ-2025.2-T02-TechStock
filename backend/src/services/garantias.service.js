const garantiasRepository = require('../repositories/garantias.repository');
const historicoRepository = require('../repositories/celulares-historico.repository');

const TipoGarantia = {
  PRODUTO: 'PRODUTO',
  SERVICO: 'SERVICO',
};

const GarantiaOrigem = {
  VENDA: 'VENDA',
  ORDEM_SERVICO: 'ORDEM_SERVICO',
  MANUAL: 'MANUAL',
};

const StatusGarantia = {
  ATIVA: 'ATIVA',
  PROXIMO_VENCIMENTO: 'PROXIMO_VENCIMENTO',
  VENCIDA: 'VENCIDA',
};

const DEFAULT_PRAZOS = {
  [TipoGarantia.SERVICO]: 90,
  [TipoGarantia.PRODUTO]: 365,
};

const ALERT_WINDOW_DAYS = 60;

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
}

function ensureDate(value, field) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const err = new Error(`Data inválida para ${field}`);
    err.status = 400;
    throw err;
  }
  return date;
}

function resolvePrazo(tipoGarantia, prazoDias) {
  if (prazoDias == null) {
    return DEFAULT_PRAZOS[tipoGarantia] || DEFAULT_PRAZOS[TipoGarantia.SERVICO];
  }
  const dias = Number(prazoDias);
  if (!Number.isInteger(dias) || dias <= 0) {
    const err = new Error('prazo_dias deve ser um inteiro positivo');
    err.status = 400;
    throw err;
  }
  return dias;
}

function computeStatus(dataFim, reference = new Date()) {
  const target = dataFim instanceof Date ? dataFim : new Date(dataFim);
  if (!target || Number.isNaN(target.getTime())) return StatusGarantia.ATIVA;
  if (target.getTime() < reference.getTime()) {
    return StatusGarantia.VENCIDA;
  }
  const diffMs = target.getTime() - reference.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= ALERT_WINDOW_DAYS) {
    return StatusGarantia.PROXIMO_VENCIMENTO;
  }
  return StatusGarantia.ATIVA;
}

function computeAlertaPrevisto(dataFim) {
  if (!dataFim) return null;
  const target = dataFim instanceof Date ? dataFim : new Date(dataFim);
  if (Number.isNaN(target.getTime())) return null;
  const alerta = addDays(target, -ALERT_WINDOW_DAYS);
  return alerta.toISOString();
}

function serializeGarantia(garantia) {
  if (!garantia) return garantia;
  const status = computeStatus(garantia.data_fim);
  return {
    ...garantia,
    status,
    alerta_prevista: computeAlertaPrevisto(garantia.data_fim),
  };
}

async function registrarEventoGarantia(garantia, tipoEvento, descricao, tx) {
  if (!garantia?.celular_id) return;
  await historicoRepository.addEvent(
    {
      celular_id: garantia.celular_id,
      ordem_servico_id:
        garantia.origem_tipo === GarantiaOrigem.ORDEM_SERVICO ? garantia.origem_id : undefined,
      tipo_evento: tipoEvento,
      descricao,
    },
    tx,
  );
}

async function registrarGarantia(
  { origemTipo, origemId, clienteId, celularId, tipoGarantia, prazoDias, dataInicio, observacoes },
  { tx, userId = 1, descricao } = {},
) {
  if (!clienteId || !celularId) {
    const err = new Error('cliente_id e celular_id são obrigatórios para registrar a garantia');
    err.status = 400;
    throw err;
  }
  const tipo = tipoGarantia || TipoGarantia.SERVICO;
  const prazo = resolvePrazo(tipo, prazoDias);
  const inicio = ensureDate(dataInicio, 'data_inicio') || new Date();
  const fim = addDays(inicio, prazo);

  const payload = {
    cliente_id: clienteId,
    celular_id: celularId,
    origem_tipo: origemTipo || GarantiaOrigem.MANUAL,
    origem_id: origemId,
    tipo,
    prazo_dias: prazo,
    data_inicio: inicio,
    data_fim: fim,
    observacoes,
  };

  const garantia = origemId != null
    ? await garantiasRepository.upsertByOrigem(payload, userId, tx)
    : await garantiasRepository.create(payload, userId, tx);

  await registrarEventoGarantia(
    garantia,
    'GarantiaRegistrada',
    descricao || `Garantia ${garantia.tipo} registrada. Validade até ${garantia.data_fim?.toISOString?.() || garantia.data_fim}.`,
    tx,
  );

  return serializeGarantia(garantia);
}

async function cancelarPorOrigem(origemTipo, origemId, { tx } = {}) {
  if (!origemTipo || origemId == null) return null;
  const removed = await garantiasRepository.removeByOrigem(origemTipo, origemId, tx);
  return removed ? serializeGarantia(removed) : null;
}

async function updateGarantia(id, data = {}, { tx, userId = 1 } = {}) {
  if (!id) {
    const err = new Error('ID da garantia é obrigatório');
    err.status = 400;
    throw err;
  }

  const current = await garantiasRepository.getById(id, tx);
  if (!current) return null;

  const updates = {};
  if (data.tipo) updates.tipo = data.tipo;
  if (data.observacoes !== undefined) updates.observacoes = data.observacoes;
  if (data.cliente_id) updates.cliente_id = data.cliente_id;
  if (data.celular_id) updates.celular_id = data.celular_id;

  const tipo = updates.tipo || current.tipo;
  let prazo = current.prazo_dias;
  if (data.prazo_dias !== undefined) {
    prazo = resolvePrazo(tipo || TipoGarantia.SERVICO, data.prazo_dias);
    updates.prazo_dias = prazo;
  }

  let inicio = current.data_inicio;
  if (data.data_inicio) {
    inicio = ensureDate(data.data_inicio, 'data_inicio');
    updates.data_inicio = inicio;
  }

  if (data.data_fim) {
    updates.data_fim = ensureDate(data.data_fim, 'data_fim');
  } else if (updates.data_inicio || updates.prazo_dias) {
    const effectiveInicio = updates.data_inicio || current.data_inicio || new Date();
    const effectivePrazo = updates.prazo_dias || current.prazo_dias || prazo;
    updates.data_fim = addDays(effectiveInicio, effectivePrazo);
  }

  const garantia = await garantiasRepository.update(id, updates, userId, tx);
  return serializeGarantia(garantia);
}

async function listGarantias({ page = 1, pageSize = 20, cliente_id, celular_id, tipo, status } = {}) {
  const filters = {};
  if (cliente_id) filters.cliente_id = Number(cliente_id);
  if (celular_id) filters.celular_id = Number(celular_id);
  if (tipo) filters.tipo = tipo;

  if (status) {
    const now = new Date();
    const limite = addDays(now, ALERT_WINDOW_DAYS);
    if (status === StatusGarantia.VENCIDA) {
      filters.data_fim_lte = now;
    } else if (status === StatusGarantia.PROXIMO_VENCIMENTO) {
      filters.data_fim_gte = now;
      filters.data_fim_lte = limite;
    } else if (status === StatusGarantia.ATIVA) {
      filters.data_fim_gte = limite;
    }
  }

  const { meta, items } = await garantiasRepository.list({ page, pageSize, filters });
  return {
    meta,
    items: items.map(serializeGarantia),
  };
}

async function getGarantiaById(id) {
  const garantia = await garantiasRepository.getById(id);
  if (!garantia) return null;
  return serializeGarantia(garantia);
}

async function removeGarantia(id, { tx } = {}) {
  if (!id) {
    const err = new Error('ID da garantia é obrigatório');
    err.status = 400;
    throw err;
  }
  const existente = await garantiasRepository.getById(id, tx);
  if (!existente) return null;
  await garantiasRepository.remove(id, tx);
  return serializeGarantia(existente);
}

async function processarAlertas({ userId = 1 } = {}) {
  const candidatos = await garantiasRepository.findAlertCandidates({ limiteDias: ALERT_WINDOW_DAYS });
  if (!candidatos.length) {
    return { quantidade: 0, garantias: [] };
  }
  const enviados = [];
  const now = new Date();
  for (const garantia of candidatos) {
    const atualizado = await garantiasRepository.update(
      garantia.id,
      { alerta_enviado_em: now },
      userId,
    );
    await registrarEventoGarantia(
      atualizado,
      'GarantiaAlerta',
      `Garantia próxima do vencimento (vence em ${atualizado.data_fim.toISOString?.() || atualizado.data_fim}).`,
    );
    enviados.push(serializeGarantia(atualizado));
  }
  return { quantidade: enviados.length, garantias: enviados };
}

module.exports = {
  registrarGarantia,
  cancelarPorOrigem,
  updateGarantia,
  listGarantias,
  getGarantiaById,
  removeGarantia,
  processarAlertas,
  TipoGarantia,
  GarantiaOrigem,
  StatusGarantia,
  computeStatus,
  DEFAULT_PRAZOS,
};

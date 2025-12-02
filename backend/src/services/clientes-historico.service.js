const historicoRepository = require('../repositories/clientes-historico.repository');

const TIPOS = {
  COMPRA: 'compra',
  REPARO: 'reparo',
  GARANTIA: 'garantia',
};

function normalizeTipo(tipo) {
  if (!tipo) return undefined;
  const value = String(tipo).trim().toLowerCase();
  if (['compra', 'compras', 'comprado'].includes(value)) return TIPOS.COMPRA;
  if (['reparo', 'reparos', 'reparado', 'manutencao'].includes(value)) return TIPOS.REPARO;
  if (['garantia', 'garantias', 'warranty'].includes(value)) return TIPOS.GARANTIA;
  return undefined;
}

function normalizePage(value) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  return 1;
}

function normalizePageSize(value) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return Math.min(parsed, 100);
  }
  return 20;
}

function resolveTimestamp(dateValue) {
  if (!dateValue) return 0;
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDate(timestamp) {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
}

function mapCompra(venda) {
  const timestamp = resolveTimestamp(venda?.data_venda || venda?.created_at);
  return {
    tipo: TIPOS.COMPRA,
    origem_id: venda?.id,
    data_evento: formatDate(timestamp),
    cliente: venda?.cliente ? { id: venda.cliente.id, nome: venda.cliente.nome } : null,
    celular: venda?.celular
      ? { id: venda.celular.id, modelo: venda.celular.modelo, imei: venda.celular.imei }
      : null,
    detalhes: {
      valor_venda: venda?.valor_venda ?? null,
      garantia_dias: venda?.garantia_dias ?? null,
      garantia_validade: venda?.garantia_validade || null,
    },
    _ts: timestamp,
  };
}

function mapReparo(ordem) {
  const refer = ordem?.data_conclusao || ordem?.data_abertura || ordem?.updated_at;
  const timestamp = resolveTimestamp(refer);
  const pecas = mapOrdemPecas(ordem);
  return {
    tipo: TIPOS.REPARO,
    origem_id: ordem?.id,
    data_evento: formatDate(timestamp),
    cliente: ordem?.cliente ? { id: ordem.cliente.id, nome: ordem.cliente.nome } : null,
    celular: ordem?.celular
      ? { id: ordem.celular.id, modelo: ordem.celular.modelo, imei: ordem.celular.imei }
      : null,
    detalhes: {
      status: ordem?.status || null,
      descricao: ordem?.descricao || null,
      garantia_dias: ordem?.garantia_dias ?? null,
      garantia_validade: ordem?.garantia_validade || null,
      pecas: pecas.length ? pecas : null,
    },
    _ts: timestamp,
  };
}

function resolveGarantiaStatus(dataFim) {
  const now = Date.now();
  const target = resolveTimestamp(dataFim);
  if (!target) return 'desconhecido';
  if (target < now) return 'vencida';
  const diffDays = (target - now) / (1000 * 60 * 60 * 24);
  if (diffDays <= 60) return 'proxima_do_vencimento';
  return 'ativa';
}

function mapGarantia(garantia) {
  const timestamp = resolveTimestamp(garantia?.data_inicio);
  const dataFimTs = resolveTimestamp(garantia?.data_fim);
  return {
    tipo: TIPOS.GARANTIA,
    origem_id: garantia?.id,
    data_evento: formatDate(timestamp),
    cliente: garantia?.cliente ? { id: garantia.cliente.id, nome: garantia.cliente.nome } : null,
    celular: garantia?.celular
      ? { id: garantia.celular.id, modelo: garantia.celular.modelo, imei: garantia.celular.imei }
      : null,
    detalhes: {
      origem_tipo: garantia?.origem_tipo || null,
      tipo_garantia: garantia?.tipo || null,
      prazo_dias: garantia?.prazo_dias ?? null,
      data_inicio: garantia?.data_inicio || null,
      data_fim: garantia?.data_fim || null,
      status: resolveGarantiaStatus(dataFimTs),
      alerta_enviado_em: garantia?.alerta_enviado_em || null,
    },
    _ts: timestamp || dataFimTs,
  };
}

function mapOrdemPecas(ordem) {
  if (!ordem?.pecas_utilizadas || !Array.isArray(ordem.pecas_utilizadas)) return [];
  return ordem.pecas_utilizadas
    .map((uso) => {
      if (!uso) return null;
      const peca = uso.peca || {};
      return {
        id: peca.id ?? uso.peca_id ?? uso.id ?? null,
        nome: peca.nome || null,
        codigo_interno: peca.codigo_interno || null,
        quantidade: typeof uso.quantidade === 'number' ? uso.quantidade : null,
      };
    })
    .filter((item) => item && (item.id != null || item.nome || item.quantidade != null));
}

function sortByTimestampDesc(a, b) {
  return (b._ts || 0) - (a._ts || 0);
}

function stripInternalFields(entries) {
  return entries.map((entry) => {
    const { _ts, ...rest } = entry;
    return rest;
  });
}

async function listHistorico({ page = 1, pageSize = 20, cliente_id, tipo } = {}) {
  const normalizedTipo = normalizeTipo(tipo);
  const includeCompras = !normalizedTipo || normalizedTipo === TIPOS.COMPRA;
  const includeReparos = !normalizedTipo || normalizedTipo === TIPOS.REPARO;
  const includeGarantias = !normalizedTipo || normalizedTipo === TIPOS.GARANTIA;

  const [comprasRaw, reparosRaw, garantiasRaw] = await Promise.all([
    includeCompras ? historicoRepository.fetchCompras({ cliente_id }) : Promise.resolve([]),
    includeReparos ? historicoRepository.fetchReparos({ cliente_id }) : Promise.resolve([]),
    includeGarantias ? historicoRepository.fetchGarantias({ cliente_id }) : Promise.resolve([]),
  ]);

  const combined = [];
  if (includeCompras) combined.push(...comprasRaw.map(mapCompra));
  if (includeReparos) combined.push(...reparosRaw.map(mapReparo));
  if (includeGarantias) combined.push(...garantiasRaw.map(mapGarantia));

  combined.sort(sortByTimestampDesc);

  const total = combined.length;
  const currentPage = normalizePage(page);
  const currentPageSize = normalizePageSize(pageSize);
  const start = (currentPage - 1) * currentPageSize;
  const items = combined.slice(start, start + currentPageSize);

  return {
    meta: { page: currentPage, pageSize: currentPageSize, total },
    items: stripInternalFields(items),
  };
}

module.exports = { listHistorico, TIPOS, normalizeTipo };

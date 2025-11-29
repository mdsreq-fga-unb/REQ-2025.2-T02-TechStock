const { getPrisma } = require('../database/prisma');
const historicoRepository = require('../repositories/celulares-historico.repository');
const testesRepository = require('../repositories/ordens-servico-testes.repository');

const EVENTO_TESTE = 'TesteTecnicoRegistrado';
const RESULTADOS = {
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO',
  NAO_TESTADO: 'NAO_TESTADO',
  PENDENTE: 'PENDENTE',
};

const ETAPAS_VALIDAS = ['INICIAL', 'INTERMEDIARIA', 'FINAL'];
const DEFAULT_ETAPA = 'INICIAL';

const TEST_CRITERIA = [
  { key: 'tela_touch', label: 'Tela / Touch' },
  { key: 'bateria_carregamento', label: 'Bateria / Carregamento' },
  { key: 'camera_traseira', label: 'Câmera Traseira' },
  { key: 'camera_frontal', label: 'Câmera Frontal' },
  { key: 'microfone', label: 'Microfone' },
  { key: 'alto_falante', label: 'Alto-falante' },
  { key: 'conectividade', label: 'Wi-Fi / Bluetooth' },
  { key: 'botoes_fisicos', label: 'Botões Físicos' },
  { key: 'sensores', label: 'Sensores (Proximidade/Luz)' },
];

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, '_');
}

function normalizeEtapa(etapa) {
  if (typeof etapa !== 'string') return DEFAULT_ETAPA;
  const upper = etapa.toUpperCase();
  return ETAPAS_VALIDAS.includes(upper) ? upper : DEFAULT_ETAPA;
}

const TEST_CRITERIA_INDEX = TEST_CRITERIA.reduce((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

function coerceStatus(value) {
  if (typeof value !== 'string') return RESULTADOS.NAO_TESTADO;
  const upper = value.toUpperCase();
  return RESULTADOS[upper] ? upper : RESULTADOS.NAO_TESTADO;
}

function buildCriterionEntry({ key, label, status, observacao }) {
  return {
    label: label || TEST_CRITERIA_INDEX[key] || key,
    status: coerceStatus(status),
    observacao: typeof observacao === 'string' ? observacao.trim() : '',
  };
}

function normalizeCriterios(raw) {
  if (!raw) return {};

  const normalized = {};
  const pushEntry = (key, value) => {
    if (!key) return;
    const slug = slugify(key);
    if (!slug) return;
    if (typeof value === 'string') {
      normalized[slug] = buildCriterionEntry({ key: slug, status: value });
      return;
    }
    if (typeof value === 'boolean') {
      normalized[slug] = buildCriterionEntry({ key: slug, status: value ? RESULTADOS.APROVADO : RESULTADOS.REPROVADO });
      return;
    }
    if (value && typeof value === 'object') {
      normalized[slug] = buildCriterionEntry({
        key: slug,
        label: value.label,
        status: value.status || value.resultado,
        observacao: value.observacao || value.observacoes,
      });
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      if (typeof entry === 'string') {
        pushEntry(entry, RESULTADOS.APROVADO);
      } else if (entry && typeof entry === 'object') {
        pushEntry(entry.nome || entry.key || entry.label, entry);
      }
    });
  } else if (typeof raw === 'object') {
    Object.entries(raw).forEach(([key, value]) => pushEntry(key, value));
  }

  return normalized;
}

function normalizeMidia(input) {
  const source = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? [input]
      : [];
  const cleaned = source
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
        return entry.url.trim();
      }
      return '';
    })
    .filter((entry) => entry);
  return cleaned.slice(0, 5);
}

function computeResultado(criterios, override) {
  if (override && typeof override === 'string') {
    const upper = override.toUpperCase();
    if (RESULTADOS[upper]) return upper;
  }

  const values = Object.values(criterios).map((item) => item.status);
  if (!values.length) return RESULTADOS.PENDENTE;
  if (values.every((status) => status === RESULTADOS.APROVADO)) return RESULTADOS.APROVADO;
  if (values.some((status) => status === RESULTADOS.REPROVADO)) return RESULTADOS.REPROVADO;
  if (values.every((status) => status === RESULTADOS.NAO_TESTADO)) return RESULTADOS.NAO_TESTADO;
  return RESULTADOS.PENDENTE;
}

async function ensureOrdemExists(ordemId, tx) {
  const prisma = tx || getPrisma();
  const ordem = await prisma.ordens_servico.findUnique({
    where: { id: ordemId },
    select: { id: true, celular_id: true, status: true },
  });
  if (!ordem) {
    const err = new Error('Ordem de serviço não encontrada');
    err.status = 404;
    throw err;
  }
  return ordem;
}

async function registrarTeste(ordemId, payload, user, options = {}) {
  const criterios = normalizeCriterios(payload.criterios || payload.tests || payload.passedTests);
  if (!Object.keys(criterios).length) {
    const err = new Error('Informe ao menos um critério de teste');
    err.status = 400;
    throw err;
  }

  const etapa = normalizeEtapa(payload.etapa || payload.stage);
  const midia = normalizeMidia(payload.midia_urls || payload.midia || payload.anexos || payload.evidencias);
  const resultado = computeResultado(criterios, payload.resultado);
  const aprovado = resultado === RESULTADOS.APROVADO;
  const userId = user?.id || payload.executado_por || 1;

  const run = async (tx) => {
    const ordem = await ensureOrdemExists(ordemId, tx);
    const created = await testesRepository.create(
      {
        ordem_servico_id: ordemId,
        criterios,
        observacoes: payload.observacoes || null,
        aprovado,
        resultado,
        etapa,
        midia_urls: midia,
        executado_por: userId,
      },
      tx,
    );

    await historicoRepository.addEvent(
      {
        celular_id: ordem.celular_id,
        ordem_servico_id: ordem.id,
        tipo_evento: EVENTO_TESTE,
        descricao: `Teste técnico (${etapa}) registrado com status ${resultado}.`,
      },
      tx,
    );

    return created;
  };

  if (options.tx) {
    return run(options.tx);
  }

  const prisma = getPrisma();
  return prisma.$transaction(run);
}

async function listarHistorico(ordemId, { page = 1, pageSize = 20 } = {}) {
  await ensureOrdemExists(ordemId);
  return testesRepository.listByOrdem(ordemId, { page, pageSize });
}

async function obterUltimo(ordemId) {
  await ensureOrdemExists(ordemId);
  return testesRepository.getLatestByOrdem(ordemId);
}

async function possuiTestesRegistrados(ordemId) {
  const total = await testesRepository.countByOrdem(ordemId);
  return total > 0;
}

async function garantirTestesAntesDeOperacao(ordemId) {
  const possui = await possuiTestesRegistrados(ordemId);
  if (!possui) {
    const err = new Error('Registre os testes técnicos iniciais antes de prosseguir com o reparo.');
    err.status = 400;
    throw err;
  }
}

module.exports = {
  registrarTeste,
  listarHistorico,
  obterUltimo,
  possuiTestesRegistrados,
  garantirTestesAntesDeOperacao,
  RESULTADOS,
  TEST_CRITERIA,
};

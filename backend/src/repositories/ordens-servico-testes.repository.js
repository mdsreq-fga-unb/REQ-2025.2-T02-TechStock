const { getPrisma } = require('../database/prisma');

function getClient(tx) {
  return tx || getPrisma();
}

function encodeCriterios(input) {
  if (typeof input === 'string') return input;
  try {
    return JSON.stringify(input || {});
  } catch (err) {
    return '{}';
  }
}

function decodeCriterios(value) {
  if (value == null || value === '') return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      return {};
    }
  }
  return value;
}

function encodeMidiaUrls(input) {
  if (Array.isArray(input)) {
    return input.length ? JSON.stringify(input) : null;
  }
  if (typeof input === 'string' && input.trim()) {
    return JSON.stringify([input.trim()]);
  }
  return null;
}

function decodeMidiaUrls(value) {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim());
    }
  } catch (err) {
    return [];
  }
  return [];
}

function serialize(entry) {
  if (!entry) return entry;
  return {
    id: entry.id,
    ordem_servico_id: entry.ordem_servico_id,
    criterios: decodeCriterios(entry.criterios),
    observacoes: entry.observacoes,
    aprovado: entry.aprovado,
    resultado: entry.resultado,
    etapa: entry.etapa,
    midia_urls: decodeMidiaUrls(entry.midia_urls),
    executado_por: entry.executado_por,
    data_execucao: entry.data_execucao,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
    executor: entry.executor
      ? {
          id: entry.executor.id,
          nome: entry.executor.nome,
          email: entry.executor.email,
        }
      : null,
  };
}

async function create(data, tx) {
  const prisma = getClient(tx);
  const created = await prisma.ordens_servico_testes.create({
    data: {
      ...data,
      criterios: encodeCriterios(data.criterios),
      midia_urls: encodeMidiaUrls(data.midia_urls),
    },
    include: {
      executor: { select: { id: true, nome: true, email: true } },
    },
  });
  return serialize(created);
}

async function countByOrdem(ordemId) {
  const prisma = getClient();
  return prisma.ordens_servico_testes.count({ where: { ordem_servico_id: ordemId } });
}

async function listByOrdem(ordemId, { page = 1, pageSize = 20 } = {}) {
  const prisma = getClient();
  const where = { ordem_servico_id: ordemId };
  const [total, rows] = await Promise.all([
    prisma.ordens_servico_testes.count({ where }),
    prisma.ordens_servico_testes.findMany({
      where,
      include: { executor: { select: { id: true, nome: true, email: true } } },
      orderBy: { data_execucao: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { meta: { page, pageSize, total }, items: rows.map(serialize) };
}

async function getLatestByOrdem(ordemId) {
  const prisma = getClient();
  const latest = await prisma.ordens_servico_testes.findFirst({
    where: { ordem_servico_id: ordemId },
    include: { executor: { select: { id: true, nome: true, email: true } } },
    orderBy: { data_execucao: 'desc' },
  });
  return serialize(latest);
}

module.exports = { create, listByOrdem, getLatestByOrdem, countByOrdem, serialize };

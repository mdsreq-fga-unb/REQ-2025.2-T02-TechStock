const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

function getClient(tx) {
  return tx || getPrisma();
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function buildWhere(filters = {}) {
  const AND = [];
  const celularId = parsePositiveInt(filters.celular_id);
  if (celularId) {
    AND.push({ celular_id: celularId });
  }
  const ordemId = parsePositiveInt(filters.ordem_servico_id);
  if (ordemId) {
    AND.push({ ordem_servico_id: ordemId });
  }
  if (filters.tipo_evento) {
    AND.push({ tipo_evento: filters.tipo_evento });
  }
  if (filters.q && filters.q.trim()) {
    AND.push({ descricao: { contains: filters.q.trim(), mode: 'insensitive' } });
  }
  return AND.length ? { AND } : undefined;
}

async function addEvent(data, tx) {
  const prisma = getClient(tx);
  const allowedFields = ['celular_id', 'ordem_servico_id', 'tipo_evento', 'descricao', 'data_evento'];
  const payload = pick(data, allowedFields);
  return prisma.celulares_historico.create({ data: payload });
}

async function list({ page = 1, pageSize = 20, filters = {} } = {}) {
  const prisma = getClient();
  const where = buildWhere(filters);
  const include = {
    celular: { select: { id: true, modelo: true, imei: true } },
    ordem_servico: { select: { id: true, descricao: true, status: true } },
  };
  const [total, items] = await Promise.all([
    prisma.celulares_historico.count({ where }),
    prisma.celulares_historico.findMany({
      where,
      include,
      orderBy: { data_evento: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

module.exports = { addEvent, list };

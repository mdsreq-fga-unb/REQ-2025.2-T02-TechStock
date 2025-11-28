const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

const INCLUDE_DEFAULT = {
  cliente: { select: { id: true, nome: true, telefone: true, email: true } },
  celular: { select: { id: true, modelo: true, imei: true, status: true } },
};

const ALLOWED_FIELDS = [
  'cliente_id',
  'celular_id',
  'origem_tipo',
  'origem_id',
  'tipo',
  'prazo_dias',
  'data_inicio',
  'data_fim',
  'alerta_enviado_em',
  'observacoes',
];

function getClient(tx) {
  return tx || getPrisma();
}

function buildWhere(filters = {}) {
  const where = {};
  if (filters.cliente_id) where.cliente_id = filters.cliente_id;
  if (filters.celular_id) where.celular_id = filters.celular_id;
  if (filters.tipo) where.tipo = filters.tipo;
  if (filters.origem_tipo) where.origem_tipo = filters.origem_tipo;
  if (filters.origem_id) where.origem_id = filters.origem_id;
  if (filters.data_inicio_gte || filters.data_inicio_lte) {
    where.data_inicio = {};
    if (filters.data_inicio_gte) where.data_inicio.gte = filters.data_inicio_gte;
    if (filters.data_inicio_lte) where.data_inicio.lte = filters.data_inicio_lte;
  }
  if (filters.data_fim_gte || filters.data_fim_lte) {
    where.data_fim = {};
    if (filters.data_fim_gte) where.data_fim.gte = filters.data_fim_gte;
    if (filters.data_fim_lte) where.data_fim.lte = filters.data_fim_lte;
  }
  return where;
}

async function list({ page = 1, pageSize = 20, filters = {}, orderBy = { id: 'desc' } } = {}) {
  const prisma = getClient();
  const where = buildWhere(filters);
  const [total, items] = await Promise.all([
    prisma.garantias.count({ where }),
    prisma.garantias.findMany({
      where,
      include: INCLUDE_DEFAULT,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id, tx) {
  const prisma = getClient(tx);
  return prisma.garantias.findUnique({ where: { id }, include: INCLUDE_DEFAULT });
}

async function findByOrigem(origem_tipo, origem_id, tx) {
  if (!origem_tipo || origem_id == null) return null;
  const prisma = getClient(tx);
  return prisma.garantias.findFirst({ where: { origem_tipo, origem_id }, include: INCLUDE_DEFAULT });
}

async function create(data, userId, tx) {
  const prisma = getClient(tx);
  const payload = pick(data, ALLOWED_FIELDS);
  return prisma.garantias.create({ data: { ...payload, created_by: userId, updated_by: userId }, include: INCLUDE_DEFAULT });
}

async function update(id, data, userId, tx) {
  const prisma = getClient(tx);
  const payload = pick(data, ALLOWED_FIELDS);
  if (!Object.keys(payload).length) {
    return getById(id, tx);
  }
  return prisma.garantias.update({ where: { id }, data: { ...payload, updated_by: userId }, include: INCLUDE_DEFAULT });
}

async function upsertByOrigem(data, userId, tx) {
  const existing = await findByOrigem(data.origem_tipo, data.origem_id, tx);
  if (existing) {
    return update(existing.id, data, userId, tx);
  }
  return create(data, userId, tx);
}

async function remove(id, tx) {
  const prisma = getClient(tx);
  return prisma.garantias.delete({ where: { id }, include: INCLUDE_DEFAULT });
}

async function removeByOrigem(origem_tipo, origem_id, tx) {
  if (!origem_tipo || origem_id == null) return null;
  const existing = await findByOrigem(origem_tipo, origem_id, tx);
  if (!existing) return null;
  await remove(existing.id, tx);
  return existing;
}

async function findAlertCandidates({ limiteDias = 60, dataBase } = {}) {
  const prisma = getClient();
  const now = dataBase ? new Date(dataBase) : new Date();
  const limite = new Date(now);
  limite.setDate(limite.getDate() + Number(limiteDias));
  return prisma.garantias.findMany({
    where: {
      alerta_enviado_em: null,
      data_fim: { gt: now, lte: limite },
    },
    include: INCLUDE_DEFAULT,
    orderBy: { data_fim: 'asc' },
  });
}

module.exports = {
  list,
  getById,
  findByOrigem,
  create,
  update,
  upsertByOrigem,
  remove,
  removeByOrigem,
  findAlertCandidates,
};

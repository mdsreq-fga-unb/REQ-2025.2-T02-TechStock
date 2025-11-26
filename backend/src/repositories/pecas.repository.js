const { getPrisma } = require('../database/prisma');

function getClient(tx) {
  return tx || getPrisma();
}

function buildWhere(q) {
  if (!q || !q.trim()) return undefined;
  const contains = q.trim();
  return {
    OR: [
      { nome: { contains, mode: 'insensitive' } },
      { codigo_interno: { contains, mode: 'insensitive' } },
      { nome_fornecedor: { contains, mode: 'insensitive' } },
    ],
  };
}

function pick(obj, keys) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      out[k] = obj[k];
    }
  }
  return out;
}

async function list({ page = 1, pageSize = 20, q } = {}) {
  const prisma = getClient();
  const where = buildWhere(q);
  const [total, items] = await Promise.all([
    prisma.pecas.count({ where }),
    prisma.pecas.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id, tx) {
  const prisma = getClient(tx);
  return prisma.pecas.findUnique({ where: { id } });
}

async function create(data, userId, tx) {
  const prisma = getClient(tx);
  const allowedCreateFields = [
    'nome',
    'codigo_interno',
    'compatibilidade',
    'quantidade',
    'garantia_padrao_dias',
    'nome_fornecedor',
    'usuario_cadastro_id',
  ];
  const dataToCreate = pick(data, allowedCreateFields);
  return prisma.pecas.create({ data: { ...dataToCreate, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId, tx) {
  const prisma = getClient(tx);
  const allowedUpdateFields = [
    'nome',
    'codigo_interno',
    'compatibilidade',
    'quantidade',
    'garantia_padrao_dias',
    'nome_fornecedor',
  ];
  const dataToUpdate = pick(data, allowedUpdateFields);
  return prisma.pecas.update({ where: { id }, data: { ...dataToUpdate, updated_by: userId } });
}

async function remove(id, tx) {
  const prisma = getClient(tx);
  await prisma.pecas.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };

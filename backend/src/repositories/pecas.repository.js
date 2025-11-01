const { getPrisma } = require('../database/prisma');

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

async function list({ page = 1, pageSize = 20, q } = {}) {
  const prisma = getPrisma();
  const where = buildWhere(q);
  const [total, items] = await Promise.all([
    prisma.pecas.count({ where }),
    prisma.pecas.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id) {
  const prisma = getPrisma();
  return prisma.pecas.findUnique({ where: { id } });
}

async function create(data, userId) {
  const prisma = getPrisma();
  return prisma.pecas.create({ data: { ...data, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId) {
  const prisma = getPrisma();
  return prisma.pecas.update({ where: { id }, data: { ...data, updated_by: userId } });
}

async function remove(id) {
  const prisma = getPrisma();
  await prisma.pecas.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };

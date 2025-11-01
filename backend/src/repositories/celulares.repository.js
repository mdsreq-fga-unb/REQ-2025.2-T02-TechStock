const { getPrisma } = require('../database/prisma');

function buildWhere(q) {
  if (!q) return undefined;
  const contains = q.trim();
  return {
    OR: [
      { modelo: { contains, mode: 'insensitive' } },
      { imei: { contains, mode: 'insensitive' } },
      { cor: { contains, mode: 'insensitive' } },
      { capacidade: { contains, mode: 'insensitive' } },
      { nome_fornecedor: { contains, mode: 'insensitive' } },
    ],
  };
}

async function list({ page = 1, pageSize = 20, q } = {}) {
  const prisma = getPrisma();
  const where = buildWhere(q);
  const [total, items] = await Promise.all([
    prisma.celulares.count({ where }),
    prisma.celulares.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id) {
  const prisma = getPrisma();
  return prisma.celulares.findUnique({ where: { id } });
}

async function create(data) {
  const prisma = getPrisma();
  return prisma.celulares.create({ data });
}

async function update(id, data) {
  const prisma = getPrisma();
  return prisma.celulares.update({ where: { id }, data });
}

async function remove(id) {
  const prisma = getPrisma();
  await prisma.celulares.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };

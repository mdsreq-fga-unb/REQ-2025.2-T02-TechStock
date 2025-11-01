const { getPrisma } = require('../database/prisma');

function buildWhere(q, filters = {}) {
  const where = {};
  if (q && q.trim()) {
    const contains = q.trim();
    where.OR = [
      { modelo: { contains, mode: 'insensitive' } },
      { imei: { contains, mode: 'insensitive' } },
      { cor: { contains, mode: 'insensitive' } },
      { capacidade: { contains, mode: 'insensitive' } },
      { nome_fornecedor: { contains, mode: 'insensitive' } },
    ];
  }
  if (filters.status) where.status = { equals: filters.status };
  if (filters.tipo) where.tipo = { equals: filters.tipo };
  if (filters.fornecedor) where.nome_fornecedor = { contains: filters.fornecedor, mode: 'insensitive' };
  if (filters.capacidade) where.capacidade = { contains: filters.capacidade, mode: 'insensitive' };
  return Object.keys(where).length ? where : undefined;
}

async function list({ page = 1, pageSize = 20, q, filters } = {}) {
  const prisma = getPrisma();
  const where = buildWhere(q, filters);
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

async function create(data, userId) {
  const prisma = getPrisma();
  return prisma.celulares.create({ data: { ...data, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId) {
  const prisma = getPrisma();
  return prisma.celulares.update({ where: { id }, data: { ...data, updated_by: userId } });
}

async function remove(id) {
  const prisma = getPrisma();
  await prisma.celulares.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };

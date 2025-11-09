const { getPrisma } = require('../database/prisma');

function buildWhere(q, filters = {}) {
  const AND = [];
  if (q && q.trim()) {
    const contains = q.trim();
    AND.push({
      OR: [
        { nome: { contains, mode: 'insensitive' } },
        { cpf: { contains, mode: 'insensitive' } },
        { email: { contains, mode: 'insensitive' } },
        { telefone: { contains, mode: 'insensitive' } },
      ],
    });
  }
  if (filters.cpf) AND.push({ cpf: { contains: filters.cpf.trim(), mode: 'insensitive' } });
  if (filters.tipo) AND.push({ tipo: { equals: filters.tipo } });
  return AND.length ? { AND } : undefined;
}

async function list({ page = 1, pageSize = 20, q, cpf, tipo } = {}) {
  const prisma = getPrisma();
  const where = buildWhere(q, { cpf, tipo });
  const [total, items] = await Promise.all([
    prisma.clientes.count({ where }),
    prisma.clientes.findMany({ where, orderBy: { id: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id) {
  const prisma = getPrisma();
  return prisma.clientes.findUnique({ where: { id } });
}

async function create(data, userId) {
  const prisma = getPrisma();
  const allowedCreate = ['nome', 'cpf', 'telefone', 'email', 'tipo'];
  const createData = Object.fromEntries(Object.entries(data).filter(([k, v]) => allowedCreate.includes(k) && v !== undefined));
  return prisma.clientes.create({ data: createData });
}

async function update(id, data, userId) {
  const prisma = getPrisma();
  const allowedUpdate = ['nome', 'telefone', 'email', 'tipo']; // cpf não deve ser alterado em regra
  const updateData = Object.fromEntries(Object.entries(data).filter(([k, v]) => allowedUpdate.includes(k) && v !== undefined));
  return prisma.clientes.update({ where: { id }, data: updateData });
}

async function remove(id) {
  const prisma = getPrisma();
  await prisma.clientes.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
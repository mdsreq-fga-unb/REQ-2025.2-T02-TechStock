const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

function stripCpf(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits || undefined;
}

function formatCpf(value) {
  const cpf = stripCpf(value);
  if (!cpf || cpf.length !== 11) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function mapCliente(cliente) {
  if (!cliente) return cliente;
  return { ...cliente, cpf: formatCpf(cliente.cpf) };
}

function buildWhere(q, filters = {}) {
  const AND = [];
  if (q && q.trim()) {
    const contains = q.trim();
    AND.push({
      OR: [
        { nome: { contains, mode: 'insensitive' } },
        { email: { contains, mode: 'insensitive' } },
        { telefone: { contains, mode: 'insensitive' } },
        ...(stripCpf(contains)
          ? [{ cpf: { contains: stripCpf(contains) } }]
          : []),
      ],
    });
  }
  if (filters.cpf) {
    const clean = stripCpf(filters.cpf);
    if (clean) AND.push({ cpf: { equals: clean } });
  }
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
  return { meta: { page, pageSize, total }, items: items.map(mapCliente) };
}

async function getById(id) {
  const prisma = getPrisma();
  const cliente = await prisma.clientes.findUnique({ where: { id } });
  return mapCliente(cliente);
}

async function create(data) {
  const prisma = getPrisma();
  const allowedCreate = ['nome', 'cpf', 'telefone', 'email', 'tipo'];
  const createData = pick(data, allowedCreate);
  if (createData.cpf) {
    createData.cpf = stripCpf(createData.cpf);
  }
  const created = await prisma.clientes.create({ data: createData });
  return mapCliente(created);
}

async function update(id, data) {
  const prisma = getPrisma();
  const allowedUpdate = ['nome', 'telefone', 'email', 'tipo']; // cpf não deve ser alterado em regra
  const updateData = pick(data, allowedUpdate);
  const updated = await prisma.clientes.update({ where: { id }, data: updateData });
  return mapCliente(updated);
}

async function remove(id) {
  const prisma = getPrisma();
  await prisma.clientes.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
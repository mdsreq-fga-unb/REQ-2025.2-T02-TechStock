const { getPrisma } = require('../database/prisma');

function getClient(tx) {
  return tx || getPrisma();
}

function buildWhere(q, filters = {}) {
  const AND = [];

  if (q && q.trim()) {
    const contains = q.trim();
    AND.push({
      OR: [
        { modelo: { contains, mode: 'insensitive' } },
        { imei: { contains, mode: 'insensitive' } },
        { cor: { contains, mode: 'insensitive' } },
        { capacidade: { contains, mode: 'insensitive' } },
        { nome_fornecedor: { contains, mode: 'insensitive' } },
      ],
    });
  }

  if (filters && typeof filters === 'object') {
    if (filters.status) AND.push({ status: { equals: filters.status } });
    if (filters.tipo) AND.push({ tipo: { equals: filters.tipo } });
    if (filters.fornecedor) AND.push({ nome_fornecedor: { contains: filters.fornecedor, mode: 'insensitive' } });
    if (filters.capacidade) AND.push({ capacidade: { contains: filters.capacidade, mode: 'insensitive' } });
  }

  return AND.length ? { AND } : undefined;
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

async function list({ page = 1, pageSize = 20, q, filters } = {}) {
  const prisma = getClient();
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

async function getById(id, tx) {
  const prisma = getClient(tx);
  return prisma.celulares.findUnique({ where: { id } });
}

async function create(data, userId, tx) {
  const prisma = getClient(tx);
  const allowedCreateFields = [
    'modelo',
    'imei',
    'cor',
    'capacidade',
    'valor_compra',
    'garantia_padrao_dias',
    'defeitos_identificados',
    'tipo',
    'status',
    'nome_fornecedor',
    'usuario_cadastro_id',
  ];
  const dataToCreate = pick(data, allowedCreateFields);
  return prisma.celulares.create({ data: { ...dataToCreate, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId, tx) {
  const prisma = getClient(tx);
  const allowedUpdateFields = [
    'modelo',
    'imei',
    'cor',
    'capacidade',
    'valor_compra',
    'garantia_padrao_dias',
    'defeitos_identificados',
    'tipo',
    'status',
    'nome_fornecedor',
  ];
  const dataToUpdate = pick(data, allowedUpdateFields);
  return prisma.celulares.update({ where: { id }, data: { ...dataToUpdate, updated_by: userId } });
}

async function remove(id, tx) {
  const prisma = getClient(tx);
  await prisma.celulares.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };

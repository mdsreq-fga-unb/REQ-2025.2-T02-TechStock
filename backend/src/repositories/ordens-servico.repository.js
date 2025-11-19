const { getPrisma } = require('../database/prisma');

const LIST_INCLUDE = { cliente: true, celular: true };
const DETAIL_INCLUDE = {
  cliente: true,
  celular: true,
  historico: { orderBy: { data_evento: 'desc' } },
  pecas_utilizadas: {
    include: { peca: { select: { id: true, nome: true, codigo_interno: true } } },
    orderBy: { data_uso: 'desc' },
  },
};

function getClient(tx) {
  return tx || getPrisma();
}

function mapPecasUtilizadas(entries = []) {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({
    id: entry.id,
    quantidade: entry.quantidade,
    data_uso: entry.data_uso,
    peca: entry.peca
      ? {
          id: entry.peca.id,
          nome: entry.peca.nome,
          codigo_interno: entry.peca.codigo_interno,
        }
      : null,
  }));
}

function mapOrdemDetalhe(ordem) {
  if (!ordem) return ordem;
  return {
    ...ordem,
    pecas_utilizadas: mapPecasUtilizadas(ordem.pecas_utilizadas),
  };
}

function buildWhere(q, filters = {}) {
  const AND = [];

  if (q && q.trim()) {
    const contains = q.trim();
    AND.push({
      OR: [
        { descricao: { contains, mode: 'insensitive' } },
        { observacoes: { contains, mode: 'insensitive' } },
      ],
    });
  }

  if (filters && typeof filters === 'object') {
    if (filters.status) AND.push({ status: { equals: filters.status } });
    if (filters.cliente_id) AND.push({ cliente_id: { equals: filters.cliente_id } });
    if (filters.celular_id) AND.push({ celular_id: { equals: filters.celular_id } });
  }

  return AND.length ? { AND } : undefined;
}

function pick(obj, keys) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      out[key] = obj[key];
    }
  }
  return out;
}

async function list({ page = 1, pageSize = 20, q, filters } = {}) {
  const prisma = getClient();
  const where = buildWhere(q, filters);
  const [total, items] = await Promise.all([
    prisma.ordens_servico.count({ where }),
    prisma.ordens_servico.findMany({
      where,
      include: LIST_INCLUDE,
      orderBy: { id: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { meta: { page, pageSize, total }, items };
}

async function getById(id) {
  const prisma = getClient();
  const ordem = await prisma.ordens_servico.findUnique({ where: { id }, include: DETAIL_INCLUDE });
  return mapOrdemDetalhe(ordem);
}

async function create(data, userId, tx) {
  const prisma = getClient(tx);
  const allowedFields = [
    'cliente_id',
    'celular_id',
    'descricao',
    'status',
    'observacoes',
    'garantia_dias',
    'garantia_validade',
    'data_abertura',
    'data_conclusao',
  ];
  const payload = pick(data, allowedFields);
  return prisma.ordens_servico.create({ data: { ...payload, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId, tx) {
  const prisma = getClient(tx);
  const allowedFields = [
    'descricao',
    'status',
    'observacoes',
    'garantia_dias',
    'garantia_validade',
    'data_conclusao',
  ];
  const payload = pick(data, allowedFields);
  return prisma.ordens_servico.update({ where: { id }, data: { ...payload, updated_by: userId } });
}

module.exports = { list, getById, create, update };

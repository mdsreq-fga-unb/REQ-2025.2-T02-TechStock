const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

const LIST_INCLUDE = {
  usuario: { select: { id: true, nome: true, email: true } },
  celular: { select: { id: true, modelo: true, status: true } },
  peca: { select: { id: true, nome: true, quantidade: true } },
};

function getClient(tx) {
  return tx || getPrisma();
}

function buildWhere(filters = {}) {
  const AND = [];
  if (filters.tipo_item) AND.push({ tipo_item: filters.tipo_item });
  if (filters.tipo_operacao) AND.push({ tipo_operacao: filters.tipo_operacao });
  if (filters.usuario_id) AND.push({ usuario_id: filters.usuario_id });
  if (filters.celular_id) AND.push({ celular_id: filters.celular_id });
  if (filters.peca_id) AND.push({ peca_id: filters.peca_id });
  if (filters.dataInicio) AND.push({ data_movimentacao: { gte: filters.dataInicio } });
  if (filters.dataFim) AND.push({ data_movimentacao: { lte: filters.dataFim } });
  return AND.length ? { AND } : undefined;
}

async function list({ page = 1, pageSize = 20, filters = {} } = {}) {
  const prisma = getClient();
  const where = buildWhere(filters);
  const [total, items] = await Promise.all([
    prisma.movimentacoes_estoque.count({ where }),
    prisma.movimentacoes_estoque.findMany({
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
  return prisma.movimentacoes_estoque.findUnique({ where: { id }, include: LIST_INCLUDE });
}

async function create(data, tx) {
  const prisma = getClient(tx);
  const allowed = [
    'tipo_item',
    'tipo_operacao',
    'celular_id',
    'peca_id',
    'quantidade',
    'saldo_resultante',
    'observacoes',
    'data_movimentacao',
    'usuario_id',
  ];
  const payload = pick(data, allowed);
  return prisma.movimentacoes_estoque.create({ data: payload, include: LIST_INCLUDE });
}

module.exports = { list, getById, create };

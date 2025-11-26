const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

const LIST_INCLUDE = {
    cliente: { select: { id: true, nome: true, telefone: true, email: true } },
    celular: { select: { id: true, modelo: true, imei: true, status: true } },
};

function getClient(tx) {
    return tx || getPrisma();
}

function buildWhere(q, filters = {}) {
    const AND = [];
    if (q && q.trim()) {
        const contains = q.trim();
        AND.push({
            OR: [
                { cliente: { nome: { contains, mode: 'insensitive' } } },
                { cliente: { telefone: { contains, mode: 'insensitive' } } },
                { celular: { modelo: { contains, mode: 'insensitive' } } },
                { celular: { imei: { contains, mode: 'insensitive' } } },
            ],
        });
    }

    if (filters.cliente_id) AND.push({ cliente_id: { equals: filters.cliente_id } });
    if (filters.celular_id) AND.push({ celular_id: { equals: filters.celular_id } });
    if (filters.dataInicio) AND.push({ data_venda: { gte: filters.dataInicio } });
    if (filters.dataFim) AND.push({ data_venda: { lte: filters.dataFim } });

    return AND.length ? { AND } : undefined;
}

async function list({ page = 1, pageSize = 20, q, filters = {} } = {}) {
    const prisma = getClient();
    const where = buildWhere(q, filters);
    const [total, items] = await Promise.all([
        prisma.vendas.count({ where }),
        prisma.vendas.findMany({
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
    return prisma.vendas.findUnique({ where: { id }, include: LIST_INCLUDE });
}

async function create(data, userId, tx) {
    const prisma = getClient(tx);
    const allowed = [
        'cliente_id',
        'celular_id',
        'data_venda',
        'valor_venda',
        'garantia_dias',
        'garantia_validade',
        'observacoes',
    ];
    const payload = pick(data, allowed);
    return prisma.vendas.create({ data: { ...payload, created_by: userId, updated_by: userId } });
}

async function update(id, data, userId, tx) {
    const prisma = getClient(tx);
    const allowed = [
        'cliente_id',
        'celular_id',
        'data_venda',
        'valor_venda',
        'garantia_dias',
        'garantia_validade',
        'observacoes',
    ];
    const payload = pick(data, allowed);
    if (!Object.keys(payload).length) {
        return prisma.vendas.findUnique({ where: { id }, include: LIST_INCLUDE });
    }
    return prisma.vendas.update({
        where: { id },
        data: { ...payload, updated_by: userId },
        include: LIST_INCLUDE,
    });
}

async function remove(id, tx) {
    const prisma = getClient(tx);
    return prisma.vendas.delete({ where: { id }, include: LIST_INCLUDE });
}

module.exports = { list, getById, create, update, remove };
const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

function buildWhere(q, filters = {}) {
    const AND = [];
    if (q && q.trim()) {
        const contains = q.trim();
        AND.push({
            OR: [
                { comprador_nome: { contains, mode: 'insensitive' } },
                { comprador_contato: { contains, mode: 'insensitive' } },
                { garantia_dias: { contains, mode: 'insensitive' } },
                { cliente: { nome: { contains, mode: 'insensitive' } } },
                { celular: { modelo: { contains, mode: 'insensitive' } } },
            ],
        });
    }
    if (filters.cliente_id) AND.push({ cliente_id: filters.cliente_id });
    if (filters.celular_id) AND.push({ celular_id: filters.celular_id });
    return AND.length ? { AND } : undefined;
}

async function list({ page = 1, pageSize = 20, q, cliente_id, celular_id } = {}) {
    const prisma = getPrisma();
    const where = buildWhere(q, { cliente_id, celular_id });
    const [total, items] = await Promise.all([
        prisma.vendas.count({ where }),
        prisma.vendas.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: { cliente: true, celular: true },
        }),
    ]);
    return { meta: { page, pageSize, total }, items };
}

async function getById(id) {
    const prisma = getPrisma();
    return prisma.vendas.findUnique({
        where: { id },
        include: { cliente: true, celular: true },
    });
}

async function create(data, usuarioId) {
    const prisma = getPrisma();
    const allowedCreate = [
        'data_venda',
        'cliente_id',
        'celular_id',
        'garantia_dias',
        'comprador_nome',
        'comprador_contato',
    ];
    const createData = pick(data, allowedCreate);
    createData.usuario_cadastro_id = usuarioId;
    return prisma.vendas.create({ data: createData });
}

async function update(id, data, usuarioId) {
    const prisma = getPrisma();
    const allowedUpdate = [
        'data_venda',
        'cliente_id',
        'celular_id',
        'garantia_dias',
        'comprador_nome',
        'comprador_contato',
    ];
    const updateData = pick(data, allowedUpdate);
    updateData.usuario_cadastro_id = usuarioId;
    return prisma.vendas.update({
        where: { id },
        data: updateData,
        include: { cliente: true, celular: true },
    });
}

async function remove(id) {
    const prisma = getPrisma();
    await prisma.vendas.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
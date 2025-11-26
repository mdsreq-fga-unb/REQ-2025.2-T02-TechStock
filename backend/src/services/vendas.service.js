const vendasRepository = require('../repositories/vendas.repository');
const celularesRepository = require('../repositories/celulares.repository');
const { getPrisma } = require('../database/prisma');

const StatusCelular = {
    EM_ESTOQUE: 'EmEstoque',
    VENDIDO: 'Vendido',
};

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function normalizeDate(value, field = 'data') {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw httpError(400, `Data inválida para ${field}`);
    }
    return date;
}

function normalizeValor(valor, required = false) {
    if (valor == null) {
        if (required) {
            throw httpError(400, 'Valor da venda é obrigatório');
        }
        return undefined;
    }
    const num = Number(valor);
    if (!Number.isFinite(num) || num <= 0) {
        throw httpError(400, 'Valor da venda deve ser maior que zero');
    }
    return Number(num.toFixed(2));
}

function assertGarantiaDias(value) {
    if (value == null) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        throw httpError(400, 'garantia_dias deve ser um inteiro maior ou igual a zero');
    }
    return parsed;
}

function addDays(base, days) {
    const date = new Date(base);
    date.setDate(date.getDate() + Number(days));
    return date;
}

function resolveGarantia({ garantia_dias, garantia_validade, fallbackDias, dataVenda, current }) {
    const updates = {};

    if (garantia_validade) {
        updates.garantia_validade = normalizeDate(garantia_validade, 'garantia_validade');
        if (garantia_dias !== undefined) {
            updates.garantia_dias = assertGarantiaDias(garantia_dias);
        } else if (current?.garantia_dias != null) {
            updates.garantia_dias = current.garantia_dias;
        } else if (fallbackDias != null) {
            updates.garantia_dias = fallbackDias;
        }
        return updates;
    }

    if (garantia_dias !== undefined) {
        const dias = garantia_dias === null ? null : assertGarantiaDias(garantia_dias);
        updates.garantia_dias = dias;
        updates.garantia_validade = dias != null ? addDays(dataVenda, dias) : null;
        return updates;
    }

    if (current?.garantia_dias != null && dataVenda && current.data_venda && dataVenda.getTime() !== new Date(current.data_venda).getTime()) {
        updates.garantia_dias = current.garantia_dias;
        updates.garantia_validade = addDays(dataVenda, current.garantia_dias);
        return updates;
    }

    if (fallbackDias != null && current?.garantia_dias == null) {
        updates.garantia_dias = fallbackDias;
        updates.garantia_validade = addDays(dataVenda, fallbackDias);
        return updates;
    }

    return updates;
}

async function ensureCliente(tx, clienteId) {
    if (!clienteId) {
        throw httpError(400, 'cliente_id é obrigatório');
    }
    const cliente = await tx.clientes.findUnique({ where: { id: clienteId } });
    if (!cliente) {
        throw httpError(404, 'Cliente não encontrado');
    }
    return cliente;
}

async function ensureCelularDisponivel(tx, celularId) {
    if (!celularId) {
        throw httpError(400, 'celular_id é obrigatório');
    }
    const celular = await tx.celulares.findUnique({ where: { id: celularId } });
    if (!celular) {
        throw httpError(404, 'Celular não encontrado');
    }
    if (celular.status !== StatusCelular.EM_ESTOQUE) {
        throw httpError(400, 'Celular indisponível para venda');
    }
    return celular;
}

async function list({ page = 1, pageSize = 20, q, cliente_id, celular_id, dataInicio, dataFim } = {}) {
    const startDate = dataInicio ? normalizeDate(dataInicio, 'data_inicio') : undefined;
    const endDate = dataFim ? normalizeDate(dataFim, 'data_fim') : undefined;
    return vendasRepository.list({
        page,
        pageSize,
        q,
        filters: {
            cliente_id,
            celular_id,
            dataInicio: startDate,
            dataFim: endDate,
        },
    });
}

async function getById(id) {
    return vendasRepository.getById(id);
}

async function create(data, user) {
    const prisma = getPrisma();
    const userId = user?.id || 1;
    const dataVenda = normalizeDate(data.data_venda, 'data_venda') || new Date();
    const valorVenda = normalizeValor(data.valor_venda, true);

    const created = await prisma.$transaction(async (tx) => {
        await ensureCliente(tx, data.cliente_id);
        const celular = await ensureCelularDisponivel(tx, data.celular_id);

        const garantiaPayload = resolveGarantia({
            garantia_dias: data.garantia_dias,
            garantia_validade: data.garantia_validade,
            fallbackDias: celular.garantia_padrao_dias,
            dataVenda,
        });

        const payload = {
            cliente_id: data.cliente_id,
            celular_id: celular.id,
            data_venda: dataVenda,
            valor_venda: valorVenda,
            observacoes: data.observacoes,
            ...garantiaPayload,
        };

        const venda = await vendasRepository.create(payload, userId, tx);
        await celularesRepository.update(celular.id, { status: StatusCelular.VENDIDO }, userId, tx);
        return venda;
    });

    return vendasRepository.getById(created.id);
}

async function update(id, data, user) {
    const atual = await vendasRepository.getById(id);
    if (!atual) {
        return null;
    }

    const prisma = getPrisma();
    const userId = user?.id || 1;

    const updated = await prisma.$transaction(async (tx) => {
        let novoCelular = null;
        let targetCelularId = atual.celular_id;
        if (data.celular_id && data.celular_id !== atual.celular_id) {
            novoCelular = await ensureCelularDisponivel(tx, data.celular_id);
            targetCelularId = novoCelular.id;
        }

        if (data.cliente_id && data.cliente_id !== atual.cliente_id) {
            await ensureCliente(tx, data.cliente_id);
        }

        const dataVenda = data.data_venda ? normalizeDate(data.data_venda, 'data_venda') : undefined;
        const valorVenda = data.valor_venda !== undefined ? normalizeValor(data.valor_venda) : undefined;

        const garantiaPayload = resolveGarantia({
            garantia_dias: data.garantia_dias,
            garantia_validade: data.garantia_validade,
            fallbackDias: novoCelular?.garantia_padrao_dias,
            dataVenda: dataVenda || new Date(atual.data_venda),
            current: atual,
        });

        const payload = {
            ...(data.cliente_id ? { cliente_id: data.cliente_id } : {}),
            ...(targetCelularId !== atual.celular_id ? { celular_id: targetCelularId } : {}),
            ...(dataVenda ? { data_venda: dataVenda } : {}),
            ...(valorVenda !== undefined ? { valor_venda: valorVenda } : {}),
            ...(data.observacoes !== undefined ? { observacoes: data.observacoes } : {}),
            ...garantiaPayload,
        };

        const venda = await vendasRepository.update(id, payload, userId, tx);

        if (targetCelularId !== atual.celular_id) {
            await celularesRepository.update(atual.celular_id, { status: StatusCelular.EM_ESTOQUE }, userId, tx);
            await celularesRepository.update(targetCelularId, { status: StatusCelular.VENDIDO }, userId, tx);
        }

        return venda;
    });

    return updated;
}

async function remove(id, user) {
    const atual = await vendasRepository.getById(id);
    if (!atual) {
        return null;
    }

    const prisma = getPrisma();
    const userId = user?.id || 1;

    await prisma.$transaction(async (tx) => {
        await vendasRepository.remove(id, tx);
        await celularesRepository.update(atual.celular_id, { status: StatusCelular.EM_ESTOQUE }, userId, tx);
    });

    return atual;
}

module.exports = { list, getById, create, update, remove };

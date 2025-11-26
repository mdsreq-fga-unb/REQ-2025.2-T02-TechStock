const vendasService = require('../services/vendas.service');
const { serializeVenda, serializeVendaList } = require('../utils/serialization');

async function list(req, res, next) {
    try {
        const { page = 1, pageSize = 20, q, cliente_id, celular_id, data_inicio, data_fim } = req.query;
        const data = await vendasService.list({
            page: Number(page),
            pageSize: Number(pageSize),
            q,
            cliente_id: cliente_id != null ? Number(cliente_id) : undefined,
            celular_id: celular_id != null ? Number(celular_id) : undefined,
            dataInicio: data_inicio,
            dataFim: data_fim,
        });
        res.json({ meta: data.meta, items: serializeVendaList(data.items) });
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const venda = await vendasService.getById(id);
        if (!venda) return res.status(404).json({ message: 'Venda não encontrada' });
        res.json(serializeVenda(venda));
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const venda = await vendasService.create(req.body, req.user);
        res.status(201).json(serializeVenda(venda));
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = Number(req.params.id);
        const venda = await vendasService.update(id, req.body, req.user);
        if (!venda) return res.status(404).json({ message: 'Venda não encontrada' });
        res.json(serializeVenda(venda));
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const id = Number(req.params.id);
        const venda = await vendasService.remove(id, req.user);
        if (!venda) return res.status(404).json({ message: 'Venda não encontrada' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { list, getById, create, update, remove };

const vendasService = require('../services/vendas.service');

async function list(req, res, next) {
    try {
        const { page = 1, pageSize = 20, q } = req.query;
        const data = await vendasService.list({ page: Number(page), pageSize: Number(pageSize), q });
        res.json(data);
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const venda = await vendasService.getById(id);
        if (!venda) return res.status(404).json({ message: 'Venda não encontrada' });
        res.json(venda);
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const venda = await vendasService.create(req.body, req.user);
        res.status(201).json(venda);
    } catch (err) {
        if (err && err.code === 'P2002' && err.meta?.target?.includes('codigo_interno')) {
            return res.status(409).json({ message: 'Código interno já cadastrado' });
        }
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = Number(req.params.id);
        const venda = await vendasService.update(id, req.body, req.user);
        res.json(venda);
    } catch (err) {
        if (err && err.code === 'P2002' && err.meta?.target?.includes('codigo_interno')) {
            return res.status(409).json({ message: 'Código interno já cadastrado' });
        }
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const id = Number(req.params.id);
        await vendasService.remove(id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { list, getById, create, update, remove };

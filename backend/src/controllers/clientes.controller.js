const clientesService = require('../services/clientes.service');
const clientesHistoricoService = require('../services/clientes-historico.service');

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, q, cpf, tipo } = req.query;
    const data = await clientesService.list({ page: Number(page), pageSize: Number(pageSize), q, cpf, tipo });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const c = await clientesService.getById(id);
    if (!c) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json(c);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await clientesService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta?.target?.includes('cpf')) {
      return res.status(409).json({ message: 'CPF já cadastrado' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await clientesService.update(id, req.body);
    res.json(updated);
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta?.target?.includes('cpf')) {
      return res.status(409).json({ message: 'CPF já cadastrado' });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await clientesService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function historico(req, res, next) {
  try {
    const { page = 1, pageSize = 20, cliente_id, tipo } = req.query;
    const data = await clientesHistoricoService.listHistorico({
      page: Number(page),
      pageSize: Number(pageSize),
      cliente_id: cliente_id != null ? Number(cliente_id) : undefined,
      tipo,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, historico };

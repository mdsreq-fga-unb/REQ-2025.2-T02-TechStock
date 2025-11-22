const ordensService = require('../services/ordens-servico.service');

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, q, status, cliente_id, celular_id } = req.query;
    const clienteId = cliente_id !== undefined ? Number(cliente_id) : undefined;
    const celularId = celular_id !== undefined ? Number(celular_id) : undefined;
    const data = await ordensService.list({
      page: Number(page),
      pageSize: Number(pageSize),
      q,
      status,
      cliente_id: clienteId,
      celular_id: celularId,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const ordem = await ordensService.getById(id);
    if (!ordem) return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    res.json(ordem);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await ordensService.create(req.body, req.user);
    res.status(201).json(created);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ message: 'Cliente ou celular inválido' });
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await ordensService.update(id, req.body, req.user);
    if (!updated) return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    res.json(updated);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    next(err);
  }
}

async function registrarPecas(req, res, next) {
  try {
    const id = Number(req.params.id);
    const updated = await ordensService.registrarPecas(id, req.body.itens, req.user);
    res.status(200).json(updated);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const removed = await ordensService.remove(id, req.user);
    if (!removed) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, registrarPecas, remove };

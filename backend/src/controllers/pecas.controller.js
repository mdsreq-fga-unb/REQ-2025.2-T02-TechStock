const pecasService = require('../services/pecas.service');

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, q } = req.query;
    const data = await pecasService.list({ page: Number(page), pageSize: Number(pageSize), q });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const p = await pecasService.getById(id);
    if (!p) return res.status(404).json({ message: 'Peça não encontrada' });
    res.json(p);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const p = await pecasService.create(req.body, req.user);
    res.status(201).json(p);
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
    const p = await pecasService.update(id, req.body, req.user);
    res.json(p);
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
    await pecasService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };

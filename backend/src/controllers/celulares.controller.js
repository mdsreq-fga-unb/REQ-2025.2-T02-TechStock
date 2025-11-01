const celularesService = require('../services/celulares.service');
const { serializeCelular, serializeList } = require('../utils/serialization');

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, q } = req.query;
    const data = await celularesService.list({ page: Number(page), pageSize: Number(pageSize), q });
    res.json({
      meta: data.meta,
      items: serializeList(data.items),
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const c = await celularesService.getById(id);
    if (!c) return res.status(404).json({ message: 'Celular não encontrado' });
    res.json(serializeCelular(c));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const celular = await celularesService.create(req.body);
    res.status(201).json(serializeCelular(celular));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const celular = await celularesService.update(id, req.body);
    res.json(serializeCelular(celular));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await celularesService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };

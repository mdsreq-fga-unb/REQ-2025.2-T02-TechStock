const usuariosService = require('../services/usuarios.service');

async function list(req, res, next) {
  try {
    const data = await usuariosService.list();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    const user = await usuariosService.create({ nome, email, senha });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };

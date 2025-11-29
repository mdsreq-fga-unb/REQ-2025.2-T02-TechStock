const testesService = require('../services/ordens-servico-testes.service');

async function create(req, res, next) {
  try {
    const ordemId = Number(req.params.id);
    const created = await testesService.registrarTeste(ordemId, req.body, req.user);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function listByOrdem(req, res, next) {
  try {
    const ordemId = Number(req.params.id);
    const { page = 1, pageSize = 20 } = req.query;
    const historico = await testesService.listarHistorico(ordemId, {
      page: Number(page),
      pageSize: Number(pageSize),
    });
    res.json(historico);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listByOrdem };

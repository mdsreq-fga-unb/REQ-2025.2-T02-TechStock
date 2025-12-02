const garantiasService = require('../services/garantias.service');

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, cliente_id, celular_id, tipo, status } = req.query;
    const data = await garantiasService.listGarantias({
      page: Number(page),
      pageSize: Number(pageSize),
      cliente_id: cliente_id != null ? Number(cliente_id) : undefined,
      celular_id: celular_id != null ? Number(celular_id) : undefined,
      tipo,
      status,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const garantia = await garantiasService.getGarantiaById(id);
    if (!garantia) return res.status(404).json({ message: 'Garantia não encontrada' });
    res.json(garantia);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const payload = await garantiasService.registrarGarantia(
      {
        origemTipo: req.body.origem_tipo,
        origemId: req.body.origem_id != null ? Number(req.body.origem_id) : undefined,
        clienteId: Number(req.body.cliente_id),
        celularId: Number(req.body.celular_id),
        tipoGarantia: req.body.tipo,
        prazoDias: req.body.prazo_dias,
        dataInicio: req.body.data_inicio,
        observacoes: req.body.observacoes,
      },
      { userId: req.user?.id || 1 },
    );
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const garantia = await garantiasService.updateGarantia(id, req.body, { userId: req.user?.id || 1 });
    if (!garantia) return res.status(404).json({ message: 'Garantia não encontrada' });
    res.json(garantia);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const garantia = await garantiasService.removeGarantia(id);
    if (!garantia) return res.status(404).json({ message: 'Garantia não encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function processarAlertas(req, res, next) {
  try {
    const resultado = await garantiasService.processarAlertas({ userId: req.user?.id || 1 });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, processarAlertas };

const celularesHistoricoService = require('../services/celulares-historico.service');

function parseId(value) {
  if (!value && value !== 0) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

async function list(req, res, next) {
  try {
    const { page = 1, pageSize = 20, celular_id, ordem_servico_id, tipo_evento, q } = req.query;
    const filters = {
      celular_id: parseId(celular_id),
      ordem_servico_id: parseId(ordem_servico_id),
      tipo_evento: tipo_evento || undefined,
      q,
    };
    const data = await celularesHistoricoService.list({
      page: Number(page),
      pageSize: Number(pageSize),
      filters,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };

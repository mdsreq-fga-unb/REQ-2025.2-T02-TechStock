const dashboardsService = require('../services/dashboards.service');

async function getResumo(req, res, next) {
  try {
    const data = await dashboardsService.getResumo();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getResumo };

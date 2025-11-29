const historicoRepository = require('../repositories/celulares-historico.repository');

async function list({ page = 1, pageSize = 20, filters = {} } = {}) {
  return historicoRepository.list({ page, pageSize, filters });
}

module.exports = { list };

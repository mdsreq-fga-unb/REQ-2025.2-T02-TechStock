const pecasRepository = require('../repositories/pecas.repository');

async function list({ page = 1, pageSize = 20, q } = {}) {
  return pecasRepository.list({ page, pageSize, q });
}

async function getById(id) {
  return pecasRepository.getById(id);
}

async function create(data, user) {
  return pecasRepository.create(data, user?.id || 1);
}

async function update(id, data, user) {
  return pecasRepository.update(id, data, user?.id || 1);
}

async function remove(id) {
  return pecasRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };

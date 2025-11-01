const celularesRepository = require('../repositories/celulares.repository');

async function list({ page = 1, pageSize = 20, q } = {}) {
  return celularesRepository.list({ page, pageSize, q });
}

async function getById(id) {
  return celularesRepository.getById(id);
}

async function create(data) {
  return celularesRepository.create(data);
}

async function update(id, data) {
  return celularesRepository.update(id, data);
}

async function remove(id) {
  return celularesRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };

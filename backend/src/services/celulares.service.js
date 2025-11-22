const celularesRepository = require('../repositories/celulares.repository');

async function list({ page = 1, pageSize = 20, q, status, tipo, fornecedor, capacidade } = {}) {
  return celularesRepository.list({ page, pageSize, q, filters: { status, tipo, fornecedor, capacidade } });
}

async function getById(id) {
  return celularesRepository.getById(id);
}

async function create(data, user) {
  return celularesRepository.create(data, user?.id || 1);
}

async function update(id, data, user) {
  return celularesRepository.update(id, data, user?.id || 1);
}

async function remove(id) {
  return celularesRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };

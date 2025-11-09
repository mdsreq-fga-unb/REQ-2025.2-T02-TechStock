const clientesRepository = require('../repositories/clientes.repository');

async function list({ page = 1, pageSize = 20, q, cpf, tipo } = {}) {
  return clientesRepository.list({ page, pageSize, q, cpf, tipo });
}

async function getById(id) {
  return clientesRepository.getById(id);
}

async function create(data) {
  return clientesRepository.create(data);
}

async function update(id, data) {
  return clientesRepository.update(id, data);
}

async function remove(id) {
  return clientesRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };
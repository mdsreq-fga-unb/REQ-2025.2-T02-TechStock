const vendasRepository = require('../repositories/celulares.repository');

async function list({ page = 1, pageSize = 20, q, status, tipo, fornecedor, capacidade } = {}) {
    return vendasRepository.list({ page, pageSize, q, filters: { status, tipo, fornecedor, capacidade } });
}

async function getById(id) {
    return vendasRepository.getById(id);
}

async function create(data, user) {
    return vendasRepository.create(data, user?.id || 1);
}

async function update(id, data, user) {
    return vendasRepository.update(id, data, user?.id || 1);
}

async function remove(id) {
    return vendasRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };

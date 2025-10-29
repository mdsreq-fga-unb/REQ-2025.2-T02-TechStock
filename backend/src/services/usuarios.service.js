const usuariosRepository = require('../repositories/usuarios.repository');

async function list() {
  return usuariosRepository.list();
}

async function create(data) {
  return usuariosRepository.create(data);
}

module.exports = { list, create };

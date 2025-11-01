const bcrypt = require('bcryptjs');
const usuariosRepository = require('../repositories/usuarios.repository');

async function list() {
  return usuariosRepository.list();
}

async function create({ nome, email, senha }) {
  const saltRounds = 10;
  const senha_hash = await bcrypt.hash(senha, saltRounds);
  return usuariosRepository.create({ nome, email, senha_hash });
}

module.exports = { list, create };

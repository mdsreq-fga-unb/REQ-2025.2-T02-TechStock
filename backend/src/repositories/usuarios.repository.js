const { getPrisma } = require('../database/prisma');

async function list() {
  const prisma = getPrisma();
  return prisma.usuarios.findMany({ orderBy: { id: 'asc' }, select: { id: true, nome: true, email: true, created_at: true } });
}

async function create({ nome, email, senha_hash }) {
  const prisma = getPrisma();
  return prisma.usuarios.create({ data: { nome, email, senha_hash } });
}

module.exports = { list, create };

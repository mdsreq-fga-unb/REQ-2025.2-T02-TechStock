const { getPrisma } = require('../database/prisma');

const DEFAULT_SELECT = { id: true, nome: true, email: true, created_at: true };

async function list() {
  const prisma = getPrisma();
  return prisma.usuarios.findMany({ orderBy: { id: 'asc' }, select: DEFAULT_SELECT });
}

async function create({ nome, email, senha_hash }) {
  const prisma = getPrisma();
  return prisma.usuarios.create({ data: { nome, email, senha_hash }, select: DEFAULT_SELECT });
}

async function findByEmail(email) {
  const prisma = getPrisma();
  if (!email) return null;
  return prisma.usuarios.findUnique({ where: { email }, select: { id: true, nome: true, email: true, senha_hash: true } });
}

module.exports = { list, create, findByEmail };

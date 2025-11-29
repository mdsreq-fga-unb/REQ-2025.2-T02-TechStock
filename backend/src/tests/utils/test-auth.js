const request = require('supertest');
const bcrypt = require('bcryptjs');
const { getPrisma } = require('../../database/prisma');
const sessionStore = require('../../services/session-store');

const TEST_USER = {
  nome: 'Tester Integração',
  email: 'integration+tester@techstock.local',
  senha: 'SenhaForte123',
};

async function ensureTestUser() {
  const prisma = getPrisma();
  const senha_hash = await bcrypt.hash(TEST_USER.senha, 10);
  await prisma.usuarios.upsert({
    where: { email: TEST_USER.email },
    update: { nome: TEST_USER.nome, senha_hash },
    create: { nome: TEST_USER.nome, email: TEST_USER.email, senha_hash },
  });
}

async function getAuthToken(app) {
  await ensureTestUser();
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_USER.email, senha: TEST_USER.senha })
    .expect(200);

  return response.body.token;
}

function resetSessions() {
  sessionStore.clearSessions();
}

module.exports = { ensureTestUser, getAuthToken, resetSessions, TEST_USER_EMAIL: TEST_USER.email };

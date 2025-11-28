const request = require('supertest');
const bcrypt = require('bcryptjs');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';
process.env.JWT_SECRET = 'test-secret';

const { getPrisma } = require('../../database/prisma');
const { buildTestApp } = require('../utils/test-app');

const app = buildTestApp();

const TEST_EMAIL = 'auth+teste@login.local';
const TEST_SENHA = 'SenhaForte123';

async function cleanupUser() {
  const prisma = getPrisma();
  await prisma.usuarios.deleteMany({ where: { email: TEST_EMAIL } });
}

async function seedUser() {
  const prisma = getPrisma();
  const senha_hash = await bcrypt.hash(TEST_SENHA, 10);
  return prisma.usuarios.create({ data: { nome: 'Usuário Auth', email: TEST_EMAIL, senha_hash } });
}

describe('API /api/auth/login', () => {
  beforeAll(async () => {
    await cleanupUser();
    await seedUser();
  });

  afterAll(async () => {
    await cleanupUser();
  });

  test('retorna token e dados do usuário com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, senha: TEST_SENHA })
      .expect(200);

    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toMatchObject({ email: TEST_EMAIL, nome: 'Usuário Auth' });
  });

  test('retorna 401 quando senha incorreta', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, senha: 'errada' })
      .expect(401);
  });

  test('nega acesso a rotas sem token', async () => {
    await request(app).get('/api/clientes').expect(401);
  });
});

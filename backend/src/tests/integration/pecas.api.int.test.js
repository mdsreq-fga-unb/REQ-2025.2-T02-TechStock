const request = require('supertest');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';

const { getPrisma } = require('../../database/prisma');
const { buildTestApp } = require('../utils/test-app');
const { getAuthToken } = require('../utils/test-auth');

const app = buildTestApp();
let authToken;
const withAuth = (req) => req.set('Authorization', `Bearer ${authToken}`);

async function resetDB() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe('DELETE FROM pecas');
}

async function ensureUsuario() {
  const prisma = getPrisma();
  const count = await prisma.usuarios.count();
  if (count === 0) {
    await prisma.usuarios.create({ data: { nome: 'Admin', email: `admin+${Date.now()}@test.local`, senha_hash: 'x' } });
  }
}

describe('API /api/pecas', () => {
  beforeAll(async () => {
    await resetDB();
    await ensureUsuario();
    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await resetDB();
  });

  test('POST cria e GET lista', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Tela iPhone', codigo_interno: 'P-TELA-001', nome_fornecedor: 'Fornecedor X' })
      .expect(201);
    expect(createRes.body.id).toBeDefined();

    const listRes = await withAuth(request(app).get('/api/pecas')).expect(200);
    expect(listRes.body.items.length).toBeGreaterThanOrEqual(1);
  });

  test('POST codigo_interno duplicado retorna 409', async () => {
    await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Bateria', codigo_interno: 'DUP-P-001', nome_fornecedor: 'F' })
      .expect(201);
    await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Bateria 2', codigo_interno: 'DUP-P-001', nome_fornecedor: 'F' })
      .expect(409);
  });

  test('GET by id 404 quando não existe', async () => {
    await withAuth(request(app).get('/api/pecas/99999')).expect(404);
  });

  test('PUT atualiza quantidade', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Conector', codigo_interno: 'P-CON-001', nome_fornecedor: 'F' })
      .expect(201);

    const id = createRes.body.id;
    const updateRes = await withAuth(request(app)
      .put(`/api/pecas/${id}`))
      .send({ quantidade: 10 })
      .expect(200);

    expect(updateRes.body.quantidade).toBe(10);
  });

  test('PUT validação falha (quantidade negativa)', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Câmera', codigo_interno: 'P-CAM-001', nome_fornecedor: 'F' })
      .expect(201);

    const id = createRes.body.id;
    await withAuth(request(app)
      .put(`/api/pecas/${id}`))
      .send({ quantidade: -1 })
      .expect(400);
  });

  test('DELETE remove', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/pecas'))
      .send({ nome: 'Frame', codigo_interno: 'P-FRM-001', nome_fornecedor: 'F' })
      .expect(201);

    const id = createRes.body.id;
    await withAuth(request(app).delete(`/api/pecas/${id}`)).expect(204);
    await withAuth(request(app).get(`/api/pecas/${id}`)).expect(404);
  });

  test('POST validação falha', async () => {
    await withAuth(request(app).post('/api/pecas')).send({ nome: '' }).expect(400);
  });
});

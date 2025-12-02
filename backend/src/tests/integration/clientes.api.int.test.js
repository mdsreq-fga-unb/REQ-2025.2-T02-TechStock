const request = require('supertest');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';

const { getPrisma } = require('../../database/prisma');
const { buildTestApp } = require('../utils/test-app');
const { getAuthToken } = require('../utils/test-auth');

const app = buildTestApp();
let authToken;

async function resetDB() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe('DELETE FROM garantias');
  await prisma.$executeRawUnsafe('DELETE FROM clientes');
}

describe('API /api/clientes', () => {
  beforeAll(async () => {
    await resetDB();
    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await resetDB();
  });

  const withAuth = (req) => req.set('Authorization', `Bearer ${authToken}`);

  test('POST rejeita CPF inválido (400)', async () => {
    await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Inv', cpf: '12345678900', tipo: 'CONSUMIDOR' })
      .expect(400);
  });

  test('POST cria e GET lista com filtro cpf/tipo', async () => {
    const c1 = await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'João', cpf: '52998224725', tipo: 'CONSUMIDOR' })
      .expect(201);
    const c2 = await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Loja X', cpf: '13424131300', tipo: 'REVENDEDOR' })
      .expect(201);

    const listCpf = await withAuth(request(app).get('/api/clientes?cpf=52998224725')).expect(200);
    expect(listCpf.body.items.length).toBeGreaterThanOrEqual(1);

    const listTipo = await withAuth(request(app).get('/api/clientes?tipo=REVENDEDOR')).expect(200);
    expect(listTipo.body.items.find((i) => i.id === c2.body.id)).toBeTruthy();
  });

  test('POST CPF duplicado 409', async () => {
    await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Ana', cpf: '11144477735', tipo: 'CONSUMIDOR' })
      .expect(201);
    await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Ana2', cpf: '11144477735', tipo: 'CONSUMIDOR' })
      .expect(409);
  });

  test('GET by id 404 quando inexistente', async () => {
    await withAuth(request(app).get('/api/clientes/999999')).expect(404);
  });

  test('PUT atualiza tipo e rejeita CPF inválido', async () => {
    const created = await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Carlos', cpf: '39053344705', tipo: 'CONSUMIDOR' })
      .expect(201);
    const id = created.body.id;

    const updated = await withAuth(request(app).put(`/api/clientes/${id}`))
      .send({ tipo: 'MANUTENCAO' })
      .expect(200);
    expect(updated.body.tipo).toBe('MANUTENCAO');

    await withAuth(request(app).put(`/api/clientes/${id}`))
      .send({ cpf: '12345678900' })
      .expect(400);
  });

  test('DELETE remove', async () => {
    const createRes = await withAuth(request(app).post('/api/clientes'))
      .send({ nome: 'Rita', cpf: '98765432100', tipo: 'REVENDEDOR' })
      .expect(201);
    const id = createRes.body.id;
    await withAuth(request(app).delete(`/api/clientes/${id}`)).expect(204);
    await withAuth(request(app).get(`/api/clientes/${id}`)).expect(404);
  });
});

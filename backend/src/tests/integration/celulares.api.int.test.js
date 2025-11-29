const request = require('supertest');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';

const { getPrisma } = require('../../database/prisma');
const { buildTestApp } = require('../utils/test-app');
const { getAuthToken } = require('../utils/test-auth');

const app = buildTestApp();
let authToken;
const withAuth = (req) => req.set('Authorization', `Bearer ${authToken}`);

// Helpers
async function resetDB() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe('DELETE FROM celulares_historico');
  await prisma.$executeRawUnsafe('DELETE FROM movimentacoes_estoque');
  await prisma.$executeRawUnsafe('DELETE FROM vendas');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_testes');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico');
  await prisma.$executeRawUnsafe('DELETE FROM garantias');
  await prisma.$executeRawUnsafe('DELETE FROM celulares');
}

async function ensureUsuario() {
  const prisma = getPrisma();
  const count = await prisma.usuarios.count();
  if (count === 0) {
    const email = `admin+${Date.now()}@test.local`;
    await prisma.usuarios.create({ data: { nome: 'Admin', email, senha_hash: 'x' } });
  }
}

describe('API /api/celulares', () => {
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
      .post('/api/celulares'))
      .send({ modelo: 'iPhone 12', imei: '123456789012345', nome_fornecedor: 'Fornecedor X', tipo: 'Novo', finalidade: 'REVENDA' })
      .expect(201);
    expect(createRes.body.id).toBeDefined();

    const listRes = await withAuth(request(app).get('/api/celulares')).expect(200);
    expect(listRes.body.items.length).toBeGreaterThanOrEqual(1);
  });

  test('POST IMEI duplicado retorna 409', async () => {
    await withAuth(request(app)
      .post('/api/celulares'))
      .send({ modelo: 'A', imei: 'DUPL123', nome_fornecedor: 'F', tipo: 'Novo', finalidade: 'REVENDA' })
      .expect(201);
    await withAuth(request(app)
      .post('/api/celulares'))
      .send({ modelo: 'B', imei: 'DUPL123', nome_fornecedor: 'F', tipo: 'Novo', finalidade: 'REVENDA' })
      .expect(409);
  });

  test('GET by id 404 quando não existe', async () => {
    await withAuth(request(app).get('/api/celulares/9999')).expect(404);
  });

  test('PUT atualiza', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/celulares'))
      .send({ modelo: 'Galaxy S20', imei: '999999999999999', nome_fornecedor: 'Fornecedor Y', tipo: 'Novo', finalidade: 'MANUTENCAO' })
      .expect(201);

    const id = createRes.body.id;
    const updateRes = await withAuth(request(app)
      .put(`/api/celulares/${id}`))
      .send({ status: 'Vendido' })
      .expect(200);

    expect(updateRes.body.status).toBe('Vendido');
  });

  test('PUT validação falha (valor_compra negativo)', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/celulares'))
      .send({ modelo: 'Moto Z', imei: 'VAL123', nome_fornecedor: 'F', tipo: 'Novo', finalidade: 'REVENDA' })
      .expect(201);

    const id = createRes.body.id;
    await withAuth(request(app)
      .put(`/api/celulares/${id}`))
      .send({ valor_compra: -10 })
      .expect(400);
  });

  test('DELETE remove', async () => {
    const createRes = await withAuth(request(app)
      .post('/api/celulares'))
      .send({ modelo: 'Moto G', imei: '111111111111111', nome_fornecedor: 'Fornecedor Z', tipo: 'Novo', finalidade: 'MANUTENCAO' })
      .expect(201);

    const id = createRes.body.id;
    await withAuth(request(app).delete(`/api/celulares/${id}`)).expect(204);
    await withAuth(request(app).get(`/api/celulares/${id}`)).expect(404);
  });

  test('POST validação falha', async () => {
    await withAuth(request(app).post('/api/celulares')).send({ modelo: '' }).expect(400);
  });
});

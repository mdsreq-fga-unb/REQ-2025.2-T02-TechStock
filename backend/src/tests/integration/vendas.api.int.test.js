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
  await prisma.$executeRawUnsafe('DELETE FROM celulares_historico');
  await prisma.$executeRawUnsafe('DELETE FROM movimentacoes_estoque');
  await prisma.$executeRawUnsafe('DELETE FROM vendas');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_testes');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico');
  await prisma.$executeRawUnsafe('DELETE FROM garantias');
  await prisma.$executeRawUnsafe('DELETE FROM celulares');
  await prisma.$executeRawUnsafe('DELETE FROM clientes');
}

async function ensureUsuario() {
  const prisma = getPrisma();
  const count = await prisma.usuarios.count();
  if (count === 0) {
    const email = `admin+${Date.now()}@test.local`;
    await prisma.usuarios.create({ data: { nome: 'Admin', email, senha_hash: 'secret' } });
  }
}

function uniqueDigits(size) {
  const base = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return base.padEnd(size, '0').slice(0, size);
}

async function createCliente(nome = 'Cliente Teste') {
  const prisma = getPrisma();
  return prisma.clientes.create({
    data: {
      nome,
      cpf: uniqueDigits(11),
      telefone: '61999990000',
      email: 'cliente@test.local',
      tipo: 'CONSUMIDOR',
    },
  });
}

async function createCelular(modelo = 'Modelo Teste') {
  const prisma = getPrisma();
  return prisma.celulares.create({
    data: {
      modelo,
      imei: uniqueDigits(15),
      nome_fornecedor: 'Fornecedor Teste',
      tipo: 'Novo',
      status: 'EmEstoque',
    },
  });
}

describe('API /api/vendas', () => {
  beforeAll(async () => {
    await resetDB();
    await ensureUsuario();
    authToken = await getAuthToken(app);
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await resetDB();
  });

  test('POST cria venda e atualiza status do celular', async () => {
    const cliente = await createCliente();
    const celular = await createCelular();
    const payload = {
      data_venda: new Date().toISOString(),
      cliente_id: cliente.id,
      celular_id: celular.id,
      valor_venda: 1500,
      garantia_dias: 90,
    };

    const res = await withAuth(request(app).post('/api/vendas')).send(payload).expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.valor_venda).toBe(1500);
    expect(typeof res.body.garantia_validade).toBe('string');

    const prisma = getPrisma();
    const atualizado = await prisma.celulares.findUnique({ where: { id: celular.id } });
    expect(atualizado.status).toBe('Vendido');
  });

  test('GET lista vendas com filtros', async () => {
    const cliente = await createCliente('Cliente Lista');
    const celular = await createCelular('Modelo Lista');
    await withAuth(request(app)
      .post('/api/vendas'))
      .send({ data_venda: new Date().toISOString(), cliente_id: cliente.id, celular_id: celular.id, valor_venda: 999 })
      .expect(201);

    const res = await withAuth(request(app)
      .get('/api/vendas'))
      .query({ cliente_id: cliente.id })
      .expect(200);

    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta).toEqual(expect.objectContaining({ page: 1 }));
  });

  test('PUT troca celular e recalcula garantia', async () => {
    const cliente = await createCliente('Cliente Update');
    const celularOriginal = await createCelular('Modelo Original');
    const celularNovo = await createCelular('Modelo Novo');
    const createRes = await withAuth(request(app)
      .post('/api/vendas'))
      .send({ data_venda: new Date().toISOString(), cliente_id: cliente.id, celular_id: celularOriginal.id, valor_venda: 800 })
      .expect(201);

    const id = createRes.body.id;
    const updateRes = await withAuth(request(app)
      .put(`/api/vendas/${id}`))
      .send({ celular_id: celularNovo.id, valor_venda: 900, garantia_dias: 120 })
      .expect(200);

    expect(updateRes.body.celular_id).toBe(celularNovo.id);
    expect(updateRes.body.valor_venda).toBe(900);
    expect(updateRes.body.garantia_validade).toBeTruthy();

    const prisma = getPrisma();
    const original = await prisma.celulares.findUnique({ where: { id: celularOriginal.id } });
    const novo = await prisma.celulares.findUnique({ where: { id: celularNovo.id } });
    expect(original.status).toBe('EmEstoque');
    expect(novo.status).toBe('Vendido');
  });

  test('DELETE remove venda e libera celular', async () => {
    const cliente = await createCliente('Cliente Delete');
    const celular = await createCelular('Modelo Delete');
    const createRes = await withAuth(request(app)
      .post('/api/vendas'))
      .send({ data_venda: new Date().toISOString(), cliente_id: cliente.id, celular_id: celular.id, valor_venda: 700 })
      .expect(201);

    await withAuth(request(app).delete(`/api/vendas/${createRes.body.id}`)).expect(204);
    await withAuth(request(app).get(`/api/vendas/${createRes.body.id}`)).expect(404);

    const prisma = getPrisma();
    const atualizado = await prisma.celulares.findUnique({ where: { id: celular.id } });
    expect(atualizado.status).toBe('EmEstoque');
  });

  test('POST falha quando celular já vendido', async () => {
    const cliente1 = await createCliente('Cliente 1');
    const cliente2 = await createCliente('Cliente 2');
    const celular = await createCelular('Modelo Unico');
    const payload = {
      data_venda: new Date().toISOString(),
      cliente_id: cliente1.id,
      celular_id: celular.id,
      valor_venda: 1000,
    };
    await withAuth(request(app).post('/api/vendas')).send(payload).expect(201);
    await withAuth(request(app)
      .post('/api/vendas'))
      .send({ ...payload, cliente_id: cliente2.id })
      .expect(400);
  });
});

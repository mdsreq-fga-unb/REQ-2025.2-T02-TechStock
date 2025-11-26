const request = require('supertest');
const express = require('express');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';

const apiRouter = require('../../routes');
const { getPrisma } = require('../../database/prisma');

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

async function resetDB() {
  const prisma = getPrisma();
  await prisma.movimentacoes_estoque.deleteMany();
  await prisma.vendas.deleteMany();
  await prisma.ordens_servico.deleteMany();
  await prisma.pecas.deleteMany();
  await prisma.celulares.deleteMany();
  await prisma.clientes.deleteMany();
}

async function ensureUsuario() {
  const prisma = getPrisma();
  const count = await prisma.usuarios.count();
  if (count === 0) {
    const email = `admin+${Date.now()}@test.local`;
    await prisma.usuarios.create({ data: { nome: 'Admin', email, senha_hash: 'secret' } });
  }
}

function uniqueString(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function createPeca(overrides = {}) {
  const prisma = getPrisma();
  return prisma.pecas.create({
    data: {
      nome: overrides.nome || 'Peca Teste',
      codigo_interno: overrides.codigo_interno || uniqueString('PC'),
      quantidade: overrides.quantidade ?? 5,
      nome_fornecedor: 'Fornecedor',
    },
  });
}

async function createCelular(overrides = {}) {
  const prisma = getPrisma();
  return prisma.celulares.create({
    data: {
      modelo: overrides.modelo || 'Modelo Teste',
      imei: overrides.imei || uniqueString('IMEI').padEnd(15, '0').slice(0, 15),
      nome_fornecedor: 'Fornecedor',
      tipo: 'Novo',
      status: overrides.status || 'EmEstoque',
    },
  });
}

describe('API /api/movimentacoes-estoque', () => {
  beforeAll(async () => {
    await resetDB();
    await ensureUsuario();
  });

  beforeEach(async () => {
    await resetDB();
    await ensureUsuario();
  });

  afterAll(async () => {
    await resetDB();
  });

  test('POST registra entrada de peça e atualiza saldo', async () => {
    const peca = await createPeca({ quantidade: 2 });
    const payload = {
      tipo_item: 'PECA',
      tipo_operacao: 'COMPRA',
      peca_id: peca.id,
      quantidade: 5,
    };

    const res = await request(app).post('/api/movimentacoes-estoque').send(payload).expect(201);

    expect(res.body.message).toMatch(/sucesso/i);
    expect(res.body.movimento.tipo_item).toBe('PECA');
    expect(res.body.movimento.peca.quantidade).toBe(7);
  });

  test('POST saída de peça falha quando estoque insuficiente', async () => {
    const peca = await createPeca({ quantidade: 1 });
    await request(app)
      .post('/api/movimentacoes-estoque')
      .send({ tipo_item: 'PECA', tipo_operacao: 'VENDA', peca_id: peca.id, quantidade: 3 })
      .expect(400);
  });

  test('POST movimentação de celular altera status', async () => {
    const celular = await createCelular();
    const res = await request(app)
      .post('/api/movimentacoes-estoque')
      .send({ tipo_item: 'CELULAR', tipo_operacao: 'CONSERTO', celular_id: celular.id })
      .expect(201);

    expect(res.body.movimento.celular.status).toBe('EmReparo');
    const prisma = getPrisma();
    const atualizado = await prisma.celulares.findUnique({ where: { id: celular.id } });
    expect(atualizado.status).toBe('EmReparo');
  });

  test('GET lista movimentações com filtros', async () => {
    const peca = await createPeca({ quantidade: 10 });
    await request(app)
      .post('/api/movimentacoes-estoque')
      .send({ tipo_item: 'PECA', tipo_operacao: 'COMPRA', peca_id: peca.id, quantidade: 2 })
      .expect(201);

    const res = await request(app)
      .get('/api/movimentacoes-estoque')
      .query({ tipo_item: 'PECA' })
      .expect(200);

    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].tipo_item).toBe('PECA');
  });
});

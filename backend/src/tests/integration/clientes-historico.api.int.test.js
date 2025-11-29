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
  await prisma.$executeRawUnsafe('DELETE FROM garantias');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_pecas');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_testes');
  await prisma.$executeRawUnsafe('DELETE FROM vendas');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico');
  await prisma.$executeRawUnsafe('DELETE FROM movimentacoes_estoque');
  await prisma.$executeRawUnsafe('DELETE FROM celulares');
  await prisma.$executeRawUnsafe('DELETE FROM clientes');
}

async function ensureUsuario() {
  const prisma = getPrisma();
  await prisma.usuarios.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nome: 'Admin Historico', email: `historico+${Date.now()}@test.local`, senha_hash: 'x' },
  });
}

let cpfSeq = 987654320;
function generateCPF() {
  cpfSeq += 1;
  const base = cpfSeq.toString().padStart(9, '0').slice(-9);
  const digits = base.split('').map(Number);

  const calcDigit = (nums, factor) => {
    let total = 0;
    nums.forEach((num) => {
      total += num * factor;
      factor -= 1;
    });
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcDigit(digits, 10);
  const d2 = calcDigit([...digits, d1], 11);
  return `${digits.join('')}${d1}${d2}`;
}

async function seedCliente(nome) {
  const prisma = getPrisma();
  return prisma.clientes.create({ data: { nome, cpf: generateCPF(), tipo: 'CONSUMIDOR' } });
}

async function seedCelular(modelo) {
  const prisma = getPrisma();
  return prisma.celulares.create({
    data: {
      modelo,
      imei: `${modelo}-${Date.now()}-${Math.random()}`.replace(/[^A-Za-z0-9]/g, ''),
      nome_fornecedor: 'Fornecedor Test',
      tipo: 'Novo',
      created_by: 1,
      updated_by: 1,
    },
  });
}

describe('API /api/clientes/historico', () => {
  beforeAll(async () => {
    await ensureUsuario();
    await resetDB();
    authToken = await getAuthToken(app);
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await resetDB();
  });

  test('lista compras e reparos de um cliente ordenados por data', async () => {
    const prisma = getPrisma();
    const cliente = await seedCliente('Cliente Histórico');
    const celularCompra = await seedCelular('Modelo-Compra');
    const celularReparo = await seedCelular('Modelo-Reparo');

    await prisma.vendas.create({
      data: {
        cliente_id: cliente.id,
        celular_id: celularCompra.id,
        data_venda: new Date('2025-01-15T10:00:00Z'),
        valor_venda: 1999.9,
        garantia_dias: 365,
        garantia_validade: new Date('2026-01-15T10:00:00Z'),
      },
    });

    await prisma.ordens_servico.create({
      data: {
        cliente_id: cliente.id,
        celular_id: celularReparo.id,
        descricao: 'Troca de tela',
        status: 'Concluido',
        data_abertura: new Date('2025-01-05T09:00:00Z'),
        data_conclusao: new Date('2025-01-20T09:00:00Z'),
        garantia_dias: 90,
        garantia_validade: new Date('2025-04-20T09:00:00Z'),
      },
    });

    const response = await withAuth(request(app)
      .get(`/api/clientes/historico?cliente_id=${cliente.id}`))
      .expect(200);

    expect(response.body.meta.total).toBe(2);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].tipo).toBe('reparo');
    expect(response.body.items[1].tipo).toBe('compra');
    expect(response.body.items[0].cliente.id).toBe(cliente.id);
    expect(response.body.items[0].celular.modelo).toBe('Modelo-Reparo');
  });

  test('filtra somente compras quando tipo=compra', async () => {
    const prisma = getPrisma();
    const cliente = await seedCliente('Cliente Compras');
    const celularCompra = await seedCelular('Modelo-Only-Compra');
    const outroCliente = await seedCliente('Cliente Sem Historico');
    const outroCelular = await seedCelular('Modelo-Outro');

    await prisma.vendas.create({
      data: {
        cliente_id: cliente.id,
        celular_id: celularCompra.id,
        data_venda: new Date('2025-02-01T12:00:00Z'),
        valor_venda: 2500,
      },
    });

    await prisma.ordens_servico.create({
      data: {
        cliente_id: outroCliente.id,
        celular_id: outroCelular.id,
        status: 'Concluido',
        data_abertura: new Date('2025-02-02T10:00:00Z'),
        data_conclusao: new Date('2025-02-05T10:00:00Z'),
      },
    });

    const response = await withAuth(request(app)
      .get(`/api/clientes/historico?tipo=compra&cliente_id=${cliente.id}`))
      .expect(200);

    expect(response.body.meta.total).toBe(1);
    expect(response.body.items[0].tipo).toBe('compra');
    expect(response.body.items[0].cliente.id).toBe(cliente.id);
  });

  test('inclui garantias e permite filtrar por tipo', async () => {
    const prisma = getPrisma();
    const cliente = await seedCliente('Cliente Garantia');
    const celular = await seedCelular('Modelo-Garantia');

    await prisma.garantias.create({
      data: {
        cliente_id: cliente.id,
        celular_id: celular.id,
        origem_tipo: 'MANUAL',
        origem_id: 123,
        tipo: 'SERVICO',
        prazo_dias: 365,
        data_inicio: new Date('2025-03-01T12:00:00Z'),
        data_fim: new Date('2099-03-01T12:00:00Z'),
      },
    });

    const response = await withAuth(request(app)
      .get(`/api/clientes/historico?tipo=garantia&cliente_id=${cliente.id}`))
      .expect(200);

    expect(response.body.meta.total).toBe(1);
    expect(response.body.items[0].tipo).toBe('garantia');
    expect(response.body.items[0].detalhes.status).toBe('ativa');
    expect(response.body.items[0].celular.modelo).toBe('Modelo-Garantia');
  });
});

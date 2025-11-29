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
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_pecas');
  await prisma.$executeRawUnsafe('DELETE FROM garantias');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico_testes');
  await prisma.$executeRawUnsafe('DELETE FROM ordens_servico');
  await prisma.$executeRawUnsafe('DELETE FROM celulares');
  await prisma.$executeRawUnsafe('DELETE FROM clientes');
}

async function ensureUsuario() {
  const prisma = getPrisma();
  await prisma.usuarios.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nome: 'Admin Testes', email: `qa+${Date.now()}@test.local`, senha_hash: 'hash' },
  });
}

let cpfSeq = 400000000;
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

async function seedOrdem() {
  const prisma = getPrisma();
  const cliente = await prisma.clientes.create({ data: { nome: `Cliente QA ${Date.now()}`, cpf: generateCPF(), tipo: 'CONSUMIDOR' } });
  const celular = await prisma.celulares.create({
    data: {
      modelo: `Modelo QA ${Date.now()}`,
      imei: `QA-${Date.now()}-${Math.random()}`.replace(/[^A-Za-z0-9]/g, ''),
      nome_fornecedor: 'Fornecedor QA',
      tipo: 'Novo',
      created_by: 1,
      updated_by: 1,
    },
  });
  const ordem = await prisma.ordens_servico.create({
    data: {
      cliente_id: cliente.id,
      celular_id: celular.id,
      descricao: 'Diagnóstico QA',
      status: 'EmAndamento',
      created_by: 1,
      updated_by: 1,
    },
  });
  return ordem;
}

describe('API /api/ordens-servico/:id/testes', () => {
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

  test('POST registra teste e retorna resultado calculado', async () => {
    const ordem = await seedOrdem();
    const payload = {
      criterios: [
        { nome: 'Tela / Touch', status: 'APROVADO' },
        { nome: 'Bateria / Carregamento', status: 'REPROVADO' },
      ],
      observacoes: 'Bateria precisa carregamento completo',
      etapa: 'INICIAL',
      midia_urls: ['https://exemplo.com/foto.jpg'],
    };

    const res = await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.id}/testes`))
      .send(payload)
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.ordem_servico_id).toBe(ordem.id);
    expect(res.body.aprovado).toBe(false);
    expect(res.body.executor).toBeTruthy();
    expect(res.body.criterios.tela_touch.status).toBe('APROVADO');
    expect(res.body.criterios.bateria_carregamento.status).toBe('REPROVADO');
    expect(res.body.midia_urls).toHaveLength(1);
    expect(res.body.resultado).toBe('REPROVADO');
  });

  test('GET lista histórico de testes na ordem', async () => {
    const ordem = await seedOrdem();
    await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.id}/testes`))
      .send({
        criterios: [
          { nome: 'Tela / Touch', status: 'APROVADO' },
          { nome: 'Bateria / Carregamento', status: 'APROVADO' },
        ],
        observacoes: 'Tudo ok',
        resultado: 'APROVADO',
      })
      .expect(201);

    const list = await withAuth(request(app)
      .get(`/api/ordens-servico/${ordem.id}/testes`))
      .expect(200);

    expect(list.body.meta.total).toBe(1);
    expect(list.body.items[0].aprovado).toBe(true);
    expect(list.body.items[0].criterios.tela_touch.status).toBe('APROVADO');
  });

  test('POST exige ao menos um critério', async () => {
    const ordem = await seedOrdem();
    await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.id}/testes`))
      .send({ observacoes: 'Sem critérios' })
      .expect(400);
  });
});

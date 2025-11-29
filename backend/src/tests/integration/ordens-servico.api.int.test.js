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
  await prisma.$executeRawUnsafe("DELETE FROM pecas WHERE codigo_interno LIKE 'OS-TEST-%'");
  await prisma.$executeRawUnsafe("DELETE FROM celulares WHERE modelo LIKE 'Modelo-%'");
  await prisma.$executeRawUnsafe("DELETE FROM clientes WHERE nome LIKE 'Cliente %'");
}

async function ensureUsuario() {
  const prisma = getPrisma();
  await prisma.usuarios.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nome: 'Admin Ordem', email: `ordens+${Date.now()}@test.local`, senha_hash: 'x' },
  });
  return 1;
}

let cpfSeq = 123456789;
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

async function seedClienteCelular() {
  const prisma = getPrisma();
  const cliente = await prisma.clientes.create({ data: { nome: `Cliente ${Date.now()}`, cpf: generateCPF(), tipo: 'CONSUMIDOR' } });
  const celular = await prisma.celulares.create({
    data: {
      modelo: `Modelo-${Date.now()}`,
      imei: `IMEI-${Date.now()}-${Math.random()}`.replace(/\./g, ''),
      nome_fornecedor: 'Fornecedor Test',
      tipo: 'Novo',
      created_by: 1,
      updated_by: 1,
    },
  });
  return { cliente, celular };
}

function buildTestesPayload(overrides = {}) {
  return [
    {
      etapa: 'INICIAL',
      criterios: [
        { nome: 'Tela / Touch', status: 'APROVADO' },
        { nome: 'Bateria / Carregamento', status: 'REPROVADO', observacao: 'Não liga' },
      ],
      observacoes: 'Checklist inicial automatizado',
      midia_urls: ['https://example.com/foto-inicial.jpg'],
      ...overrides,
    },
  ];
}

async function seedPeca(quantidade = 5) {
  const prisma = getPrisma();
  const codigo = `OS-TEST-${Date.now()}-${Math.random()}`.replace(/[^A-Za-z0-9]/g, '');
  return prisma.pecas.create({
    data: {
      nome: `Peça ${Date.now()}`,
      codigo_interno: codigo,
      nome_fornecedor: 'Fornecedor Test',
      quantidade,
      created_by: 1,
      updated_by: 1,
    },
  });
}

describe('API /api/ordens-servico', () => {
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

  test('POST cria OS vinculada e adiciona histórico', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const response = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca de tela', testes: buildTestesPayload() })
      .expect(201);

    expect(response.body.status).toBe('EmAndamento');
    expect(Array.isArray(response.body.historico)).toBe(true);
    const eventos = response.body.historico.map((event) => event.tipo_evento);
    expect(eventos).toContain('OrdemServicoCriada');
    expect(eventos).toContain('TesteTecnicoRegistrado');
    expect(response.body.testes.length).toBeGreaterThan(0);
    expect(response.body.testes[0].resultado).toBeDefined();
  });

  test('POST cria OS já vinculando peças e baixa estoque', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(4);
    const response = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({
        cliente_id: cliente.id,
        celular_id: celular.id,
        descricao: 'Troca com peças',
        testes: buildTestesPayload(),
        pecas: [
          { peca_id: peca.id, quantidade: 2 },
          { peca_id: peca.id, quantidade: 1 },
        ],
      })
      .expect(201);

    const uso = response.body.pecas_utilizadas.find((item) => item.peca.id === peca.id);
    expect(uso).toBeTruthy();
    expect(uso.quantidade).toBe(3);
    expect(response.body.historico.some((h) => h.tipo_evento === 'OrdemServicoPecaRegistrada')).toBe(true);

    const prisma = getPrisma();
    const estoque = await prisma.pecas.findUnique({ where: { id: peca.id } });
    expect(estoque.quantidade).toBe(1);
  });

  test('PUT /ordens-servico/:id/pecas sincroniza quantidades e devolve estoque', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(8);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca parcial', testes: buildTestesPayload(), pecas: [{ peca_id: peca.id, quantidade: 3 }] })
      .expect(201);

    const sincronizado = await withAuth(request(app)
      .put(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({ itens: [{ peca_id: peca.id, quantidade: 1 }] })
      .expect(200);

    const uso = sincronizado.body.pecas_utilizadas.find((item) => item.peca.id === peca.id);
    expect(uso).toBeTruthy();
    expect(uso.quantidade).toBe(1);

    const prisma = getPrisma();
    const estoque = await prisma.pecas.findUnique({ where: { id: peca.id } });
    expect(estoque.quantidade).toBe(7); // 8 - 3 + 2 devolvidos = 7
  });

  test('PUT /ordens-servico/:id/pecas remove todas as peças quando lista vazia', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(4);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Remover peças', testes: buildTestesPayload(), pecas: [{ peca_id: peca.id, quantidade: 2 }] })
      .expect(201);

    const resposta = await withAuth(request(app)
      .put(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({ itens: [] })
      .expect(200);

    expect(resposta.body.pecas_utilizadas.length).toBe(0);
    const prisma = getPrisma();
    const estoque = await prisma.pecas.findUnique({ where: { id: peca.id } });
    expect(estoque.quantidade).toBe(4);
  });

  test('PUT /ordens-servico/:id/pecas impede aumento acima do estoque atual', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(2);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Capacidade limite', testes: buildTestesPayload(), pecas: [{ peca_id: peca.id, quantidade: 1 }] })
      .expect(201);

    await withAuth(request(app)
      .put(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({ itens: [{ peca_id: peca.id, quantidade: 5 }] })
      .expect(400);
  });

  test('POST rejeita OS com peças acima do estoque', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(1);
    await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({
        cliente_id: cliente.id,
        celular_id: celular.id,
        descricao: 'Troca peça sem estoque',
        testes: buildTestesPayload(),
        pecas: [{ peca_id: peca.id, quantidade: 2 }],
      })
      .expect(400);
  });

  test('POST rejeita criação sem testes iniciais', async () => {
    const { cliente, celular } = await seedClienteCelular();
    await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca de placa' })
      .expect(400);
  });

  test('GET lista com filtros por status e cliente', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const aberta = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Bateria', testes: buildTestesPayload() })
      .expect(201);

    const concluida = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Tela', testes: buildTestesPayload() })
      .expect(201);

    await withAuth(request(app)
      .patch(`/api/ordens-servico/${concluida.body.id}`))
      .send({ status: 'Concluido', garantia_dias: 30 })
      .expect(200);

    const listStatus = await withAuth(request(app).get('/api/ordens-servico?status=Concluido')).expect(200);
    expect(listStatus.body.items.find((item) => item.id === concluida.body.id)).toBeTruthy();
    expect(listStatus.body.items.find((item) => item.id === aberta.body.id)).toBeFalsy();

    const listCliente = await withAuth(request(app).get(`/api/ordens-servico?cliente_id=${cliente.id}`)).expect(200);
    expect(listCliente.body.items.length).toBeGreaterThanOrEqual(2);
  });

  test('PATCH conclui ordem, registra garantia e histórico', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Placa', testes: buildTestesPayload({ criterios: [{ nome: 'Microfone', status: 'APROVADO' }] }) })
      .expect(201);

    const patch = await withAuth(request(app)
      .patch(`/api/ordens-servico/${ordem.body.id}`))
      .send({ status: 'Concluido', garantia_dias: 45 })
      .expect(200);

    expect(patch.body.status).toBe('Concluido');
    expect(patch.body.garantia_dias).toBe(45);
    expect(patch.body.data_conclusao).toBeTruthy();
    expect(patch.body.historico.some((h) => h.tipo_evento === 'OrdemServicoConcluida')).toBe(true);

    const prisma = getPrisma();
    const historicoCount = await prisma.celulares_historico.count({ where: { ordem_servico_id: ordem.body.id } });
    expect(historicoCount).toBe(4);
  });

  test('PATCH impede garantia sem concluir', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Limpeza', testes: buildTestesPayload() })
      .expect(201);

    await withAuth(request(app).patch(`/api/ordens-servico/${ordem.body.id}`)).send({ garantia_dias: 10 }).expect(400);
  });

  test('POST rejeita cliente inexistente', async () => {
    const { celular } = await seedClienteCelular();
    const inexistente = 999999;
    await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: inexistente, celular_id: celular.id, descricao: 'Bateria', testes: buildTestesPayload() })
      .expect(404);
  });

  test('POST /ordens-servico/:id/pecas registra peças e desconta estoque', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(5);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca de bateria', testes: buildTestesPayload() })
      .expect(201);

    const registro = await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({ itens: [{ peca_id: peca.id, quantidade: 2 }] })
      .expect(200);

    const uso = registro.body.pecas_utilizadas.find((item) => item.peca.id === peca.id);
    expect(uso).toBeTruthy();
    expect(uso.quantidade).toBe(2);
    expect(uso.data_uso).toBeTruthy();
    expect(new Date(uso.data_uso).getTime()).toBeGreaterThan(0);
    expect(uso.peca.codigo_interno).toBeTruthy();
    expect(registro.body.historico.some((h) => h.tipo_evento === 'OrdemServicoPecaRegistrada')).toBe(true);

    const prisma = getPrisma();
    const estoque = await prisma.pecas.findUnique({ where: { id: peca.id } });
    expect(estoque.quantidade).toBe(3);
  });

  test('POST /ordens-servico/:id/pecas agrega itens repetidos e valida estoque', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(10);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca completa', testes: buildTestesPayload() })
      .expect(201);

    const registro = await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({
        itens: [
          { peca_id: peca.id, quantidade: 1 },
          { peca_id: peca.id, quantidade: 2 },
        ],
      })
      .expect(200);

    const uso = registro.body.pecas_utilizadas.find((item) => item.peca.id === peca.id);
    expect(uso).toBeTruthy();
    expect(uso.quantidade).toBe(3);
    expect(uso.data_uso).toBeTruthy();

    const prisma = getPrisma();
    const estoque = await prisma.pecas.findUnique({ where: { id: peca.id } });
    expect(estoque.quantidade).toBe(7);
  });

  test('POST /ordens-servico/:id/pecas retorna 400 quando estoque é insuficiente', async () => {
    const { cliente, celular } = await seedClienteCelular();
    const peca = await seedPeca(1);
    const ordem = await withAuth(request(app)
      .post('/api/ordens-servico'))
      .send({ cliente_id: cliente.id, celular_id: celular.id, descricao: 'Troca de conector', testes: buildTestesPayload() })
      .expect(201);

    await withAuth(request(app)
      .post(`/api/ordens-servico/${ordem.body.id}/pecas`))
      .send({ itens: [{ peca_id: peca.id, quantidade: 5 }] })
      .expect(400);
  });
});

jest.mock('../../repositories/ordens-servico.repository', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));
jest.mock('../../repositories/clientes.repository', () => ({ getById: jest.fn() }));
jest.mock('../../repositories/celulares.repository', () => ({ getById: jest.fn() }));
jest.mock('../../repositories/celulares-historico.repository', () => ({ addEvent: jest.fn() }));
jest.mock('../../database/prisma', () => ({ getPrisma: jest.fn() }));
jest.mock('../../services/garantias.service', () => ({
  registrarGarantia: jest.fn().mockResolvedValue({}),
  cancelarPorOrigem: jest.fn().mockResolvedValue(null),
  DEFAULT_PRAZOS: { PRODUTO: 365, SERVICO: 90 },
  TipoGarantia: { PRODUTO: 'PRODUTO', SERVICO: 'SERVICO' },
  GarantiaOrigem: { VENDA: 'VENDA', ORDEM_SERVICO: 'ORDEM_SERVICO' },
}));

const service = require('../../services/ordens-servico.service');
const ordensRepo = require('../../repositories/ordens-servico.repository');
const clientesRepo = require('../../repositories/clientes.repository');
const celularesRepo = require('../../repositories/celulares.repository');
const historicoRepo = require('../../repositories/celulares-historico.repository');
const { getPrisma } = require('../../database/prisma');
const garantiasService = require('../../services/garantias.service');

describe('ordens-servico.service', () => {
  let prisma;
  let tx;

  beforeEach(() => {
    tx = Symbol('tx');
    prisma = { $transaction: jest.fn((cb) => cb(tx)) };
    getPrisma.mockReturnValue(prisma);
    clientesRepo.getById.mockResolvedValue({ id: 1 });
    celularesRepo.getById.mockResolvedValue({ id: 2 });
    ordensRepo.list.mockResolvedValue({ meta: {}, items: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('create valida relacionamentos e registra histórico', async () => {
    ordensRepo.create.mockResolvedValue({ id: 11, celular_id: 2, status: service.STATUS.EM_ANDAMENTO });
    ordensRepo.getById.mockResolvedValue({ id: 11, historico: [{ tipo_evento: 'OrdemServicoCriada' }] });

    const created = await service.create({ cliente_id: 1, celular_id: 2, descricao: 'Troca' }, { id: 5 });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(ordensRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: service.STATUS.EM_ANDAMENTO, descricao: 'Troca' }),
      5,
      tx,
    );
    expect(historicoRepo.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_evento: 'OrdemServicoCriada', ordem_servico_id: 11 }),
      tx,
    );
    expect(created.id).toBe(11);
  });

  test('update conclui ordem, define garantia e registra histórico', async () => {
    ordensRepo.getById
      .mockResolvedValueOnce({ id: 20, status: service.STATUS.EM_ANDAMENTO, celular_id: 9, cliente_id: 4 })
      .mockResolvedValueOnce({ id: 20, status: service.STATUS.CONCLUIDO, historico: [] });
    ordensRepo.update.mockResolvedValue({ id: 20 });

    const result = await service.update(20, { status: service.STATUS.CONCLUIDO, garantia_dias: 60 }, { id: 2 });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(ordensRepo.update).toHaveBeenCalledWith(
      20,
      expect.objectContaining({ status: service.STATUS.CONCLUIDO, garantia_dias: 60, data_conclusao: expect.any(Date), garantia_validade: expect.any(Date) }),
      2,
      tx,
    );
    expect(historicoRepo.addEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_evento: 'OrdemServicoConcluida', ordem_servico_id: 20 }),
      tx,
    );
    expect(result.status).toBe(service.STATUS.CONCLUIDO);
    expect(garantiasService.registrarGarantia).toHaveBeenCalledWith(
      expect.objectContaining({ origemTipo: garantiasService.GarantiaOrigem.ORDEM_SERVICO, origemId: 20, clienteId: 4, celularId: 9 }),
      expect.objectContaining({ tx }),
    );
  });

  test('update rejeita garantia sem concluir', async () => {
    ordensRepo.getById.mockResolvedValue({ id: 5, status: service.STATUS.EM_ANDAMENTO, celular_id: 1, cliente_id: 7 });
    await expect(service.update(5, { garantia_dias: 10 }, { id: 1 })).rejects.toThrow('Garantia só pode ser registrada ao concluir a ordem');
    expect(garantiasService.registrarGarantia).not.toHaveBeenCalled();
  });

  test('registrarPecas debita estoque e define data_uso', async () => {
    const txMocks = {
      ordens_servico: { findUnique: jest.fn().mockResolvedValue({ id: 3, celular_id: 8 }) },
      pecas: {
        findMany: jest.fn().mockResolvedValue([{ id: 15, nome: 'Bateria', codigo_interno: 'BAT-01', quantidade: 5 }]),
        update: jest.fn().mockResolvedValue({ id: 15 }),
      },
      ordens_servico_pecas: { upsert: jest.fn().mockResolvedValue({ id: 1 }) },
    };

    prisma.$transaction.mockImplementation(async (cb) => cb(txMocks));
    ordensRepo.getById.mockResolvedValue({ id: 3, pecas_utilizadas: [] });

    await service.registrarPecas(3, [{ peca_id: 15, quantidade: 2 }], { id: 99 });

    expect(txMocks.pecas.update).toHaveBeenCalledWith({ where: { id: 15 }, data: { quantidade: { decrement: 2 }, updated_by: 99 } });
    expect(txMocks.ordens_servico_pecas.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ordem_servico_peca_unique: { ordem_servico_id: 3, peca_id: 15 } },
        update: expect.objectContaining({ quantidade: { increment: 2 }, data_uso: expect.any(Date) }),
        create: expect.objectContaining({ ordem_servico_id: 3, peca_id: 15, quantidade: 2, data_uso: expect.any(Date) }),
      }),
    );
  });
});

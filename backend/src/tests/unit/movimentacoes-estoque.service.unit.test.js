jest.mock('../../repositories/movimentacoes-estoque.repository', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../repositories/celulares.repository', () => ({
  update: jest.fn(),
}));
jest.mock('../../repositories/pecas.repository', () => ({
  update: jest.fn(),
}));
jest.mock('../../database/prisma', () => ({ getPrisma: jest.fn() }));

const service = require('../../services/movimentacoes-estoque.service');
const movimentacoesRepo = require('../../repositories/movimentacoes-estoque.repository');
const celularesRepo = require('../../repositories/celulares.repository');
const pecasRepo = require('../../repositories/pecas.repository');
const { getPrisma } = require('../../database/prisma');

describe('movimentacoes-estoque.service', () => {
  let tx;
  let prisma;

  beforeEach(() => {
    tx = {
      celulares: { findUnique: jest.fn() },
      pecas: { findUnique: jest.fn() },
      usuarios: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    prisma = { $transaction: jest.fn((cb) => cb(tx)) };
    getPrisma.mockReturnValue(prisma);
    movimentacoesRepo.list.mockResolvedValue({ meta: {}, items: [] });
    movimentacoesRepo.getById.mockResolvedValue({ id: 1 });
    movimentacoesRepo.create.mockResolvedValue({ id: 1, tipo_item: 'PECA' });
    tx.celulares.findUnique.mockResolvedValue({ id: 10, status: 'EmEstoque' });
    tx.pecas.findUnique.mockResolvedValue({ id: 20, quantidade: 5 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('list aplica filtros normalizados', async () => {
    await service.list({ tipo_item: 'celular', tipo_operacao: 'venda', usuario_id: '3' });
    expect(movimentacoesRepo.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      filters: expect.objectContaining({ tipo_item: 'CELULAR', tipo_operacao: 'VENDA', usuario_id: 3 }),
    });
  });

  test('create registra movimentação de peça somando estoque', async () => {
    const movimento = await service.create(
      { tipo_item: 'PECA', tipo_operacao: 'COMPRA', peca_id: 20, quantidade: 3 },
      { id: 7 },
    );

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(pecasRepo.update).toHaveBeenCalledWith(20, { quantidade: 8 }, 7, tx);
    expect(movimentacoesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_item: 'PECA', tipo_operacao: 'COMPRA', saldo_resultante: 8, usuario_id: 7 }),
      tx,
    );
    expect(movimento.id).toBe(1);
  });

  test('create movimentação de celular ajusta status conforme operação', async () => {
    tx.celulares.findUnique.mockResolvedValueOnce({ id: 11, status: 'EmEstoque' });
    movimentacoesRepo.create.mockResolvedValueOnce({ id: 2, tipo_item: 'CELULAR' });

    const movimento = await service.create(
      { tipo_item: 'CELULAR', tipo_operacao: 'VENDA', celular_id: 11 },
      { id: 5 },
    );

    expect(celularesRepo.update).toHaveBeenCalledWith(11, { status: 'Vendido' }, 5, tx);
    expect(movimentacoesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipo_item: 'CELULAR', quantidade: 1, celular_id: 11 }),
      tx,
    );
    expect(movimento.id).toBe(2);
  });

  test('lança erro quando estoque de peça é insuficiente', async () => {
    tx.pecas.findUnique.mockResolvedValueOnce({ id: 21, quantidade: 1 });
    await expect(
      service.create({ tipo_item: 'PECA', tipo_operacao: 'VENDA', peca_id: 21, quantidade: 5 }),
    ).rejects.toThrow('Quantidade solicitada excede o estoque disponível');
    expect(pecasRepo.update).not.toHaveBeenCalled();
  });

  test('celular indisponível para venda gera erro', async () => {
    tx.celulares.findUnique.mockResolvedValueOnce({ id: 15, status: 'Vendido' });
    await expect(
      service.create({ tipo_item: 'CELULAR', tipo_operacao: 'VENDA', celular_id: 15 }),
    ).rejects.toThrow('Celular indisponível para venda');
  });
});

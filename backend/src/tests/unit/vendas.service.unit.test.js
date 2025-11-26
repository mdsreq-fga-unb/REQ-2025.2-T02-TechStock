jest.mock('../../repositories/vendas.repository', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));
jest.mock('../../repositories/celulares.repository', () => ({
  update: jest.fn(),
}));
jest.mock('../../database/prisma', () => ({ getPrisma: jest.fn() }));

const service = require('../../services/vendas.service');
const vendasRepo = require('../../repositories/vendas.repository');
const celularesRepo = require('../../repositories/celulares.repository');
const { getPrisma } = require('../../database/prisma');

describe('vendas.service', () => {
  let prisma;
  let tx;

  beforeEach(() => {
    tx = {
      clientes: { findUnique: jest.fn() },
      celulares: { findUnique: jest.fn() },
    };
    prisma = { $transaction: jest.fn((cb) => cb(tx)) };
    getPrisma.mockReturnValue(prisma);
    tx.clientes.findUnique.mockResolvedValue({ id: 1 });
    tx.celulares.findUnique.mockResolvedValue({ id: 2, status: 'EmEstoque', garantia_padrao_dias: 45 });
    vendasRepo.list.mockResolvedValue({ meta: {}, items: [] });
    vendasRepo.getById.mockResolvedValue({
      id: 1,
      cliente_id: 1,
      celular_id: 2,
      data_venda: new Date('2024-01-01T00:00:00.000Z'),
      garantia_dias: 30,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('list delega filtros normalizados', async () => {
    await service.list({ q: 'joao', cliente_id: 1, dataInicio: '2024-01-01', dataFim: '2024-01-31' });

    expect(vendasRepo.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      q: 'joao',
      filters: expect.objectContaining({
        cliente_id: 1,
        dataInicio: expect.any(Date),
        dataFim: expect.any(Date),
      }),
    });
  });

  test('create registra venda e atualiza status do celular', async () => {
    const dataVenda = '2024-02-10T10:00:00.000Z';
    vendasRepo.create.mockResolvedValue({ id: 55 });
    vendasRepo.getById.mockResolvedValue({ id: 55, valor_venda: 1200 });

    const venda = await service.create(
      { cliente_id: 1, celular_id: 2, valor_venda: 1200, data_venda: dataVenda },
      { id: 9 },
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(vendasRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cliente_id: 1,
        celular_id: 2,
        valor_venda: 1200,
        garantia_dias: 45,
        garantia_validade: expect.any(Date),
      }),
      9,
      tx,
    );
    expect(celularesRepo.update).toHaveBeenCalledWith(2, { status: 'Vendido' }, 9, tx);
    expect(venda.id).toBe(55);
  });

  test('create rejeita celular indisponível', async () => {
    tx.celulares.findUnique.mockResolvedValueOnce({ id: 2, status: 'Vendido' });
    await expect(
      service.create({ cliente_id: 1, celular_id: 2, valor_venda: 1000, data_venda: '2024-01-01T00:00:00.000Z' }),
    ).rejects.toThrow('Celular indisponível para venda');
  });

  test('update troca celular e ajusta garantias', async () => {
    const atual = {
      id: 7,
      cliente_id: 1,
      celular_id: 2,
      data_venda: new Date('2024-01-01T00:00:00.000Z'),
      garantia_dias: 30,
    };
    vendasRepo.getById.mockResolvedValueOnce(atual);
    const novoCelular = { id: 3, status: 'EmEstoque', garantia_padrao_dias: 60 };
    tx.celulares.findUnique.mockResolvedValueOnce(novoCelular);
    vendasRepo.update.mockResolvedValue({ id: 7, celular_id: 3 });

    const result = await service.update(7, { celular_id: 3 }, { id: 4 });

    expect(vendasRepo.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ celular_id: 3 }),
      4,
      tx,
    );
    expect(celularesRepo.update).toHaveBeenNthCalledWith(1, 2, { status: 'EmEstoque' }, 4, tx);
    expect(celularesRepo.update).toHaveBeenNthCalledWith(2, 3, { status: 'Vendido' }, 4, tx);
    expect(result).toEqual({ id: 7, celular_id: 3 });
  });

  test('update retorna null quando venda não existe', async () => {
    vendasRepo.getById.mockResolvedValueOnce(null);
    const result = await service.update(999, {}, { id: 1 });
    expect(result).toBeNull();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('remove restaura celular e retorna venda atual', async () => {
    vendasRepo.getById.mockResolvedValueOnce({ id: 8, celular_id: 2 });
    vendasRepo.remove.mockResolvedValue({ id: 8 });

    const result = await service.remove(8, { id: 3 });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(vendasRepo.remove).toHaveBeenCalledWith(8, tx);
    expect(celularesRepo.update).toHaveBeenCalledWith(2, { status: 'EmEstoque' }, 3, tx);
    expect(result).toEqual({ id: 8, celular_id: 2 });
  });

  test('remove retorna null se venda não existe', async () => {
    vendasRepo.getById.mockResolvedValueOnce(null);
    const result = await service.remove(123);
    expect(result).toBeNull();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

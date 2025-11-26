const repo = require('../../repositories/vendas.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const client = {
    vendas: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { getPrisma: () => client };
});

describe('vendas.repository', () => {
  afterEach(() => {
    const prisma = prismaModule.getPrisma();
    Object.values(prisma.vendas).forEach((fn) => fn.mockReset());
  });

  test('list retorna meta e aplica filtros', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.vendas.count.mockResolvedValue(2);
    prisma.vendas.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await repo.list({ page: 2, pageSize: 5, q: 'iphone', filters: { cliente_id: 10 } });

    expect(prisma.vendas.count).toHaveBeenCalledWith(expect.any(Object));
    expect(prisma.vendas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.any(Object), skip: 5, take: 5 }),
    );
    expect(result.meta).toEqual({ page: 2, pageSize: 5, total: 2 });
    expect(result.items).toHaveLength(2);
  });

  test('getById inclui relacionamentos', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.vendas.findUnique.mockResolvedValue({ id: 33 });
    const venda = await repo.getById(33);
    expect(prisma.vendas.findUnique).toHaveBeenCalledWith({ where: { id: 33 }, include: expect.any(Object) });
    expect(venda.id).toBe(33);
  });

  test('create adiciona metadados de auditoria', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.vendas.create.mockResolvedValue({ id: 99 });
    await repo.create({ cliente_id: 1, celular_id: 2, valor_venda: 1000 }, 7);
    expect(prisma.vendas.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ cliente_id: 1, celular_id: 2, created_by: 7, updated_by: 7 }),
    });
  });

  test('update usa include padrão', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.vendas.update.mockResolvedValue({ id: 1 });
    await repo.update(1, { garantia_dias: 30 }, 9);
    expect(prisma.vendas.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ garantia_dias: 30, updated_by: 9 }),
      include: expect.any(Object),
    });
  });

  test('remove retorna venda removida com include', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.vendas.delete.mockResolvedValue({ id: 5 });
    await repo.remove(5);
    expect(prisma.vendas.delete).toHaveBeenCalledWith({ where: { id: 5 }, include: expect.any(Object) });
  });
});

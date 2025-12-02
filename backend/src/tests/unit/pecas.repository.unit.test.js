const repo = require('../../repositories/pecas.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const m = { pecas: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
  return { getPrisma: () => m };
});

describe('pecas.repository', () => {
  test('list retorna meta e items', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.pecas.count.mockResolvedValue(2);
    prisma.pecas.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await repo.list({ page: 1, pageSize: 2, q: 'abc' });

    expect(prisma.pecas.count).toHaveBeenCalled();
    expect(prisma.pecas.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 2 }));
    expect(result.meta).toEqual({ page: 1, pageSize: 2, total: 2 });
    expect(result.items).toHaveLength(2);
  });

  test('getById retorna item', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.pecas.findUnique.mockResolvedValue({ id: 10 });
    const item = await repo.getById(10);
    expect(prisma.pecas.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(item).toEqual({ id: 10 });
  });

  test('create adiciona created_by/updated_by', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.pecas.create.mockResolvedValue({ id: 5, created_by: 1, updated_by: 1 });
    const created = await repo.create({ nome: 'Tela', codigo_interno: 'T-001', nome_fornecedor: 'F' }, 1);
    expect(prisma.pecas.create).toHaveBeenCalledWith({ data: expect.objectContaining({ created_by: 1, updated_by: 1 }) });
    expect(created.id).toBe(5);
  });

  test('update adiciona updated_by', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.pecas.update.mockResolvedValue({ id: 5, updated_by: 2 });
    const updated = await repo.update(5, { quantidade: 3 }, 2);
    expect(prisma.pecas.update).toHaveBeenCalledWith({ where: { id: 5 }, data: expect.objectContaining({ updated_by: 2 }) });
    expect(updated.updated_by).toBe(2);
  });

  test('remove deleta por id', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.pecas.delete.mockResolvedValue({});
    await repo.remove(7);
    expect(prisma.pecas.delete).toHaveBeenCalledWith({ where: { id: 7 } });
  });
});

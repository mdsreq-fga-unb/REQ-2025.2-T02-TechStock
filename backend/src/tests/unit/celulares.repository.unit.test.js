const repo = require('../../repositories/celulares.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const m = { celulares: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
  return { getPrisma: () => m };
});

describe('celulares.repository', () => {
  test('list retorna meta e items', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.celulares.count.mockResolvedValue(1);
    prisma.celulares.findMany.mockResolvedValue([{ id: 1, modelo: 'A', imei: '123' }]);

    const result = await repo.list({ page: 2, pageSize: 10, q: 'A' });

    expect(prisma.celulares.count).toHaveBeenCalled();
    expect(prisma.celulares.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
    expect(result.meta).toEqual({ page: 2, pageSize: 10, total: 1 });
    expect(result.items.length).toBe(1);
  });

  test('getById retorna item', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.celulares.findUnique.mockResolvedValue({ id: 1 });
    const item = await repo.getById(1);
    expect(prisma.celulares.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(item).toEqual({ id: 1 });
  });

  test('create repassa data', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.celulares.create.mockResolvedValue({ id: 10 });
    const created = await repo.create({ modelo: 'X' });
    expect(prisma.celulares.create).toHaveBeenCalledWith({ data: { modelo: 'X' } });
    expect(created.id).toBe(10);
  });

  test('update repassa id e data', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.celulares.update.mockResolvedValue({ id: 10, modelo: 'Y' });
    const updated = await repo.update(10, { modelo: 'Y' });
    expect(prisma.celulares.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { modelo: 'Y' } });
    expect(updated.modelo).toBe('Y');
  });

  test('remove deleta por id', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.celulares.delete.mockResolvedValue({});
    await repo.remove(10);
    expect(prisma.celulares.delete).toHaveBeenCalledWith({ where: { id: 10 } });
  });
});

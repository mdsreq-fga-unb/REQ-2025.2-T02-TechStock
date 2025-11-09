const repo = require('../../repositories/clientes.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const m = { clientes: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
  return { getPrisma: () => m };
});

describe('clientes.repository', () => {
  test('list retorna meta e items', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.clientes.count.mockResolvedValue(1);
    prisma.clientes.findMany.mockResolvedValue([{ id: 1, nome: 'João' }]);
    const res = await repo.list({ page: 1, pageSize: 10, q: 'Jo' });
    expect(prisma.clientes.count).toHaveBeenCalled();
    expect(prisma.clientes.findMany).toHaveBeenCalled();
    expect(res.items.length).toBe(1);
  });

  test('getById retorna item', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.clientes.findUnique.mockResolvedValue({ id: 2 });
    const item = await repo.getById(2);
    expect(item.id).toBe(2);
  });

  test('create filtra campos permitidos', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.clientes.create.mockResolvedValue({ id: 3 });
    const created = await repo.create({ nome: 'Ana', cpf: '123', email: 'a@a.com', tipo: 'PF', malicioso: 'x' });
    expect(prisma.clientes.create).toHaveBeenCalledWith({ data: { nome: 'Ana', cpf: '123', email: 'a@a.com', tipo: 'PF' } });
    expect(created.id).toBe(3);
  });

  test('update filtra campos permitidos e ignora cpf', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.clientes.update.mockResolvedValue({ id: 4, nome: 'Ana B' });
    const updated = await repo.update(4, { nome: 'Ana B', cpf: '999' });
    expect(prisma.clientes.update).toHaveBeenCalledWith({ where: { id: 4 }, data: { nome: 'Ana B' } });
    expect(updated.id).toBe(4);
  });

  test('remove deleta id', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.clientes.delete.mockResolvedValue({});
    await repo.remove(5);
    expect(prisma.clientes.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  test('buildWhere combina q + cpf + tipo', () => {
    // acessar função interna indiretamente via list chamando prisma mocks
    const prisma = prismaModule.getPrisma();
    prisma.clientes.count.mockResolvedValue(0);
    prisma.clientes.findMany.mockResolvedValue([]);
    return repo.list({ page: 1, pageSize: 10, q: 'jo', cpf: '111', tipo: 'CONSUMIDOR' }).then(() => {
      expect(prisma.clientes.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
    });
  });
});

const repo = require('../../repositories/movimentacoes-estoque.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const client = {
    movimentacoes_estoque: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { getPrisma: () => client };
});

describe('movimentacoes-estoque.repository', () => {
  afterEach(() => {
    const prisma = prismaModule.getPrisma();
    Object.values(prisma.movimentacoes_estoque).forEach((fn) => fn.mockReset());
  });

  test('list retorna meta e items', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.movimentacoes_estoque.count.mockResolvedValue(1);
    prisma.movimentacoes_estoque.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await repo.list({ page: 2, pageSize: 5, filters: { tipo_item: 'PECA' } });

    expect(prisma.movimentacoes_estoque.count).toHaveBeenCalledWith(expect.any(Object));
    expect(prisma.movimentacoes_estoque.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5, include: expect.any(Object) }),
    );
    expect(result.meta).toEqual({ page: 2, pageSize: 5, total: 1 });
  });

  test('getById inclui relacionamentos', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.movimentacoes_estoque.findUnique.mockResolvedValue({ id: 10 });
    const movimento = await repo.getById(10);
    expect(prisma.movimentacoes_estoque.findUnique).toHaveBeenCalledWith({ where: { id: 10 }, include: expect.any(Object) });
    expect(movimento.id).toBe(10);
  });

  test('create persiste payload permitido', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.movimentacoes_estoque.create.mockResolvedValue({ id: 3 });
    await repo.create({ tipo_item: 'PECA', tipo_operacao: 'COMPRA', usuario_id: 1, quantidade: 2 });
    expect(prisma.movimentacoes_estoque.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tipo_item: 'PECA', tipo_operacao: 'COMPRA', usuario_id: 1, quantidade: 2 }),
      include: expect.any(Object),
    });
  });
});

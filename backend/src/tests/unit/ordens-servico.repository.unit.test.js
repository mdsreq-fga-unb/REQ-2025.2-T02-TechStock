jest.mock('../../database/prisma', () => ({ getPrisma: jest.fn() }));

const { getPrisma } = require('../../database/prisma');
const repository = require('../../repositories/ordens-servico.repository');

describe('ordens-servico.repository', () => {
  let prisma;

  beforeEach(() => {
    prisma = {
      ordens_servico: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    getPrisma.mockReturnValue(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('list aplica filtros e inclui relações', async () => {
    prisma.ordens_servico.count.mockResolvedValue(1);
    prisma.ordens_servico.findMany.mockResolvedValue([{ id: 5 }]);

    const res = await repository.list({ page: 2, pageSize: 10, q: 'troca', filters: { status: 'EmAndamento', cliente_id: 3 } });

    expect(prisma.ordens_servico.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
    expect(prisma.ordens_servico.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ cliente: true, celular: true }),
        skip: 10,
        take: 10,
      }),
    );
    expect(res.meta.total).toBe(1);
  });

  test('getById retorna com include detalhado e normaliza peças', async () => {
    prisma.ordens_servico.findUnique.mockResolvedValue({
      id: 9,
      historico: [],
      pecas_utilizadas: [
        {
          id: 1,
          quantidade: 2,
          data_uso: new Date('2025-01-01T00:00:00Z'),
          peca: { id: 4, nome: 'Tela', codigo_interno: 'TELA-01', extra: 'ignore' },
        },
      ],
    });
    const ordem = await repository.getById(9);
    expect(prisma.ordens_servico.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 9 }, include: expect.objectContaining({ historico: expect.any(Object) }) }),
    );
    expect(ordem.id).toBe(9);
    expect(ordem.pecas_utilizadas[0]).toEqual({
      id: 1,
      quantidade: 2,
      data_uso: new Date('2025-01-01T00:00:00Z'),
      peca: { id: 4, nome: 'Tela', codigo_interno: 'TELA-01' },
    });
  });

  test('create define created_by e updated_by', async () => {
    await repository.create({ cliente_id: 1, celular_id: 2, descricao: 'Teste' }, 7);
    expect(prisma.ordens_servico.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ cliente_id: 1, created_by: 7, updated_by: 7 }) }),
    );
  });

  test('update define updated_by', async () => {
    await repository.update(10, { status: 'Concluido' }, 3);
    expect(prisma.ordens_servico.update).toHaveBeenCalledWith({ where: { id: 10 }, data: expect.objectContaining({ status: 'Concluido', updated_by: 3 }) });
  });
});

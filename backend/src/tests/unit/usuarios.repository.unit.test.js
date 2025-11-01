const repo = require('../../repositories/usuarios.repository');
const prismaModule = require('../../database/prisma');

jest.mock('../../database/prisma', () => {
  const m = { usuarios: { findMany: jest.fn(), create: jest.fn() } };
  return { getPrisma: () => m };
});

describe('usuarios.repository', () => {
  test('list retorna usuários ordenados', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.usuarios.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const users = await repo.list();
    expect(prisma.usuarios.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' }, select: { id: true, nome: true, email: true, created_at: true } });
    expect(users).toHaveLength(2);
  });

  test('create insere com nome/email/senha_hash', async () => {
    const prisma = prismaModule.getPrisma();
    prisma.usuarios.create.mockResolvedValue({ id: 3 });
    const created = await repo.create({ nome: 'Ana', email: 'a@a.com', senha_hash: 'x' });
    expect(prisma.usuarios.create).toHaveBeenCalledWith({ data: { nome: 'Ana', email: 'a@a.com', senha_hash: 'x' } });
    expect(created.id).toBe(3);
  });
});

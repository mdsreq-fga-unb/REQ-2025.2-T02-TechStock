const service = require('../../services/clientes.service');
const repo = require('../../repositories/clientes.repository');

jest.mock('../../repositories/clientes.repository', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

describe('clientes.service', () => {
  test('list delega', async () => {
    repo.list.mockResolvedValue({ meta: {}, items: [] });
    const res = await service.list({ page: 2, pageSize: 5, q: 'jo' });
    expect(repo.list).toHaveBeenCalledWith({ page: 2, pageSize: 5, q: 'jo' });
    expect(res.items).toEqual([]);
  });

  test('getById delega', async () => {
    repo.getById.mockResolvedValue({ id: 1 });
    const item = await service.getById(1);
    expect(item.id).toBe(1);
  });

  test('create delega sem user', async () => {
    repo.create.mockResolvedValue({ id: 2 });
    const created = await service.create({ nome: 'A' });
    expect(repo.create).toHaveBeenCalledWith({ nome: 'A' });
    expect(created.id).toBe(2);
  });

  test('update delega sem user', async () => {
    repo.update.mockResolvedValue({ id: 3 });
    const updated = await service.update(3, { nome: 'B' });
    expect(repo.update).toHaveBeenCalledWith(3, { nome: 'B' });
    expect(updated.id).toBe(3);
  });

  test('remove delega', async () => {
    repo.remove.mockResolvedValue({});
    await service.remove(5);
    expect(repo.remove).toHaveBeenCalledWith(5);
  });
});

const service = require('../../services/pecas.service');
const repo = require('../../repositories/pecas.repository');

jest.mock('../../repositories/pecas.repository', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

describe('pecas.service', () => {
  test('list repassa filtros', async () => {
    repo.list.mockResolvedValue({ meta: {}, items: [] });
    const result = await service.list({ page: 2, pageSize: 10, q: 'x' });
    expect(repo.list).toHaveBeenCalledWith({ page: 2, pageSize: 10, q: 'x' });
    expect(result.items).toEqual([]);
  });

  test('getById repassa id', async () => {
    repo.getById.mockResolvedValue({ id: 1 });
    const item = await service.getById(1);
    expect(item.id).toBe(1);
  });

  test('create usa user.id', async () => {
    repo.create.mockResolvedValue({ id: 1, created_by: 1 });
    const created = await service.create({ nome: 'Tela' }, { id: 1 });
    expect(repo.create).toHaveBeenCalledWith({ nome: 'Tela' }, 1);
    expect(created.id).toBe(1);
  });

  test('update usa user.id', async () => {
    repo.update.mockResolvedValue({ id: 1, updated_by: 2 });
    const updated = await service.update(1, { nome: 'Vidro' }, { id: 2 });
    expect(repo.update).toHaveBeenCalledWith(1, { nome: 'Vidro' }, 2);
    expect(updated.updated_by).toBe(2);
  });

  test('remove repassa id', async () => {
    repo.remove.mockResolvedValue({});
    await service.remove(1);
    expect(repo.remove).toHaveBeenCalledWith(1);
  });
});

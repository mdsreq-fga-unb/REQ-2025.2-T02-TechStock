const service = require('../../services/usuarios.service');
const repo = require('../../repositories/usuarios.repository');
const bcrypt = require('bcryptjs');

jest.mock('../../repositories/usuarios.repository', () => ({
  list: jest.fn(),
  create: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pwd) => `hashed:${pwd}`),
}));

describe('usuarios.service', () => {
  test('list delega ao repositório', async () => {
    repo.list.mockResolvedValue([{ id: 1 }]);
    const result = await service.list();
    expect(result).toEqual([{ id: 1 }]);
    expect(repo.list).toHaveBeenCalled();
  });

  test('create faz hash e chama repo.create com senha_hash', async () => {
    repo.create.mockResolvedValue({ id: 10 });
    const user = await service.create({ nome: 'Bob', email: 'b@b.com', senha: '123' });
    expect(bcrypt.hash).toHaveBeenCalledWith('123', expect.any(Number));
    expect(repo.create).toHaveBeenCalledWith({ nome: 'Bob', email: 'b@b.com', senha_hash: 'hashed:123' });
    expect(user).toEqual({ id: 10 });
  });
});

const controller = require('../../controllers/usuarios.controller');
const service = require('../../services/usuarios.service');

jest.mock('../../services/usuarios.service', () => ({
  list: jest.fn(),
  create: jest.fn(),
}));

function createMocks() {
  const req = { params: {}, query: {}, body: {} };
  const res = { status: jest.fn(() => res), json: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('usuarios.controller', () => {
  test('list retorna JSON', async () => {
    service.list.mockResolvedValue([]);
    const { req, res, next } = createMocks();
    await controller.list(req, res, next);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('create 201 com retorno', async () => {
    service.create.mockResolvedValue({ id: 1 });
    const { req, res, next } = createMocks();
    req.body = { nome: 'Alice', email: 'a@a.com', senha: 'x' };
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });
});

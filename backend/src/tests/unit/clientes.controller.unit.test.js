const controller = require('../../controllers/clientes.controller');
const service = require('../../services/clientes.service');

jest.mock('../../services/clientes.service', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

function mocks() {
  const req = { params: {}, query: {}, body: {}, user: { id: 1 } };
  const res = { status: jest.fn(() => res), json: jest.fn(), send: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('clientes.controller', () => {
  test('list retorna json', async () => {
    service.list.mockResolvedValue({ meta: {}, items: [] });
    const { req, res, next } = mocks();
    await controller.list(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ meta: {}, items: [] });
  });

  test('getById 404 quando não encontra', async () => {
    service.getById.mockResolvedValue(null);
    const { req, res, next } = mocks();
    req.params.id = '1';
    await controller.getById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create 201', async () => {
    service.create.mockResolvedValue({ id: 10 });
    const { req, res, next } = mocks();
    req.body = { nome: 'Cliente', cpf: '123', tipo: 'PF' };
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 10 });
  });

  test('update retorna atualizado', async () => {
    service.update.mockResolvedValue({ id: 10, nome: 'Novo' });
    const { req, res, next } = mocks();
    req.params.id = '10';
    req.body = { nome: 'Novo' };
    await controller.update(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ id: 10, nome: 'Novo' });
  });

  test('remove 204', async () => {
    const { req, res, next } = mocks();
    req.params.id = '5';
    await controller.remove(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

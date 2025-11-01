const controller = require('../../controllers/celulares.controller');
const service = require('../../services/celulares.service');

jest.mock('../../services/celulares.service', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

function createMocks() {
  const req = { params: {}, query: {}, body: {} };
  const res = { status: jest.fn(() => res), json: jest.fn(), send: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('celulares.controller', () => {
  test('list retorna JSON', async () => {
    service.list.mockResolvedValue({ meta: { page: 1, pageSize: 20, total: 0 }, items: [] });
    const { req, res, next } = createMocks();
    await controller.list(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ meta: { page: 1, pageSize: 20, total: 0 }, items: [] });
  });

  test('getById 404 quando não encontrado', async () => {
    service.getById.mockResolvedValue(null);
    const { req, res, next } = createMocks();
    req.params.id = '1';
    await controller.getById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('create 201 com retorno', async () => {
    service.create.mockResolvedValue({ id: 1 });
    const { req, res, next } = createMocks();
    req.body = { modelo: 'A', imei: '123', nome_fornecedor: 'F', tipo: 'Compra' };
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  test('update retorna atualizado', async () => {
    service.update.mockResolvedValue({ id: 1, modelo: 'B' });
    const { req, res, next } = createMocks();
    req.params.id = '1';
    req.body = { modelo: 'B' };
    await controller.update(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ id: 1, modelo: 'B' });
  });

  test('remove 204', async () => {
    const { req, res, next } = createMocks();
    req.params.id = '1';
    await controller.remove(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

const controller = require('../../controllers/pecas.controller');
const service = require('../../services/pecas.service');

jest.mock('../../services/pecas.service', () => ({
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

function createMocks() {
  const req = { params: {}, query: {}, body: {}, user: { id: 1 } };
  const res = { status: jest.fn(() => res), json: jest.fn(), send: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe('pecas.controller', () => {
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
    req.body = { nome: 'Tela', codigo_interno: 'T-001', nome_fornecedor: 'F' };
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  test('update retorna atualizado', async () => {
    service.update.mockResolvedValue({ id: 1, quantidade: 5 });
    const { req, res, next } = createMocks();
    req.params.id = '1';
    req.body = { quantidade: 5 };
    await controller.update(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ id: 1, quantidade: 5 });
  });

  test('remove 204', async () => {
    const { req, res, next } = createMocks();
    req.params.id = '1';
    await controller.remove(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

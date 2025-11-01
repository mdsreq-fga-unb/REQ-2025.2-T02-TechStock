const { validate } = require('../../middlewares/validate');

describe('middleware validate', () => {
  function buildRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  }

  test('retorna 400 quando body inválido', () => {
    const req = { body: null };
    const res = buildRes();
    const next = jest.fn();
    validate(['nome'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid JSON body' });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 400 quando campos obrigatórios faltam', () => {
    const req = { body: { nome: '  ' } };
    const res = buildRes();
    const next = jest.fn();
    validate(['nome', 'email'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error', missing: expect.arrayContaining(['nome','email']) }));
  });

  test('chama next quando válido', () => {
    const req = { body: { nome: 'Alice', email: 'a@a.com' } };
    const res = buildRes();
    const next = jest.fn();
    validate(['nome','email'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

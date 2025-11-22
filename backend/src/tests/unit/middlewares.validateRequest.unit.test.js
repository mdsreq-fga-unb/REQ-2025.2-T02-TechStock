const { validateRequest } = require('../../middlewares/validateRequest');
const { validationResult } = require('express-validator');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('middleware validateRequest', () => {
  function buildRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  }

  test('retorna 400 quando há erros de validação', () => {
    validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: 'error' }] });
    const req = {};
    const res = buildRes();
    const next = jest.fn();
    validateRequest(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Validation error', errors: [{ msg: 'error' }] });
    expect(next).not.toHaveBeenCalled();
  });

  test('segue para next quando sem erros', () => {
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
    const req = {};
    const res = buildRes();
    const next = jest.fn();
    validateRequest(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

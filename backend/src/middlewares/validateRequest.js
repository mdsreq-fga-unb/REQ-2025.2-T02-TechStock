const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array();
    const firstError = list[0];
    const field = firstError?.path || firstError?.param;
    const detailedMessage = field
      ? `Erro de validação no campo "${field}": ${firstError.msg}`
      : `Erro de validação: ${firstError?.msg || 'dados inválidos'}`;

    return res.status(400).json({ message: detailedMessage, errors: list });
  }
  return next();
}

module.exports = { validateRequest };

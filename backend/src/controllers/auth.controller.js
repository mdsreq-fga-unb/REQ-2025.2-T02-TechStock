const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const result = await authService.authenticate({ email, senha });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };

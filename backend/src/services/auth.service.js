const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuariosRepository = require('../repositories/usuarios.repository');
const sessionStore = require('./session-store');

const JWT_SECRET = process.env.JWT_SECRET || 'techstock-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function buildAuthError() {
  const err = new Error('Credenciais inválidas');
  err.status = 401;
  return err;
}

function buildTokenPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    nome: user.nome,
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, nome: user.nome, email: user.email };
}

async function authenticate({ email, senha } = {}) {
  if (!email || !senha) {
    const err = new Error('Informe email e senha');
    err.status = 400;
    throw err;
  }

  const usuario = await usuariosRepository.findByEmail(String(email).trim());
  if (!usuario || !usuario.senha_hash) {
    throw buildAuthError();
  }

  const senhaOk = await bcrypt.compare(String(senha), usuario.senha_hash);
  if (!senhaOk) {
    throw buildAuthError();
  }

  const user = sanitizeUser(usuario);
  const { sessionId, inactivityMs } = sessionStore.startSession(user);
  const token = jwt.sign(buildTokenPayload(usuario), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, jwtid: sessionId });
  return { token, user, inactivityTimeoutMs: inactivityMs };
}

module.exports = { authenticate, sanitizeUser };

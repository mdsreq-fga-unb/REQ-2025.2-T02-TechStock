const jwt = require('jsonwebtoken');
const sessionStore = require('../services/session-store');

const JWT_SECRET = process.env.JWT_SECRET || 'techstock-secret';

function extractToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

function resolveUser(req) {
  const token = extractToken(req);
  if (!token) {
    return { ok: false, code: 'missing' };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const sessionId = payload.jti;
    const sessionResult = sessionStore.touchSession(sessionId);
    if (!sessionResult.ok) {
      return { ok: false, code: sessionResult.reason };
    }

    return {
      ok: true,
      user: sessionResult.user || {
        id: payload.sub || payload.id,
        nome: payload.nome,
        email: payload.email,
      },
      sessionId,
    };
  } catch (err) {
    return { ok: false, code: 'invalid', error: err };
  }
}

function attachUser(req, _res, next) {
  const result = resolveUser(req);
  if (result.ok) {
    req.user = result.user;
    req.sessionId = result.sessionId;
  } else if (result.code === 'expired') {
    req.sessionExpired = true;
  }
  next();
}

function ensureAuthenticated(req, _res, next) {
  if (req.user) {
    return next();
  }

  const result = resolveUser(req);
  if (result.ok) {
    req.user = result.user;
    req.sessionId = result.sessionId;
    return next();
  }

  const err = new Error(result.code === 'expired' ? 'Sessão expirada por inatividade' : 'Autenticação necessária');
  err.status = 401;
  return next(err);
}

module.exports = { attachUser, ensureAuthenticated };

const crypto = require('crypto');

const DEFAULT_INACTIVITY_MS = Number(process.env.SESSION_INACTIVITY_MS || 2 * 60 * 60 * 1000);
const sessions = new Map();

function getInactivityTimeout() {
  return DEFAULT_INACTIVITY_MS;
}

function startSession(user) {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const storedUser = user ? { ...user } : null;
  sessions.set(sessionId, { user: storedUser, lastActivity: now });
  return { sessionId, lastActivity: now, inactivityMs: DEFAULT_INACTIVITY_MS };
}

function touchSession(sessionId) {
  if (!sessionId) {
    return { ok: false, reason: 'invalid' };
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return { ok: false, reason: 'missing' };
  }

  const now = Date.now();
  if (now - session.lastActivity > DEFAULT_INACTIVITY_MS) {
    sessions.delete(sessionId);
    return { ok: false, reason: 'expired' };
  }

  session.lastActivity = now;
  return { ok: true, user: session.user, lastActivity: now };
}

function endSession(sessionId) {
  if (sessionId) {
    sessions.delete(sessionId);
  }
}

function clearSessions() {
  sessions.clear();
}

module.exports = {
  startSession,
  touchSession,
  endSession,
  clearSessions,
  getInactivityTimeout,
};

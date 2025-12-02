import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setApiAuthHandlers } from '../services/api';

const DEFAULT_INACTIVITY_MS = 2 * 60 * 60 * 1000;
const browserStorage = typeof window !== 'undefined' ? window.localStorage : null;

function readStoredJSON(key) {
  if (!browserStorage) return null;
  const raw = browserStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function readStoredNumber(key, fallback = null) {
  if (!browserStorage) return fallback;
  const raw = browserStorage.getItem(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function writeAuthState(token, user, inactivityMs) {
  if (!browserStorage) return;
  if (token) {
    browserStorage.setItem('authToken', token);
  } else {
    browserStorage.removeItem('authToken');
  }
  if (user) {
    browserStorage.setItem('authUser', JSON.stringify(user));
  } else {
    browserStorage.removeItem('authUser');
  }
  if (inactivityMs) {
    browserStorage.setItem('authInactivityMs', String(inactivityMs));
  } else {
    browserStorage.removeItem('authInactivityMs');
  }
}

function writeLastActivity(timestamp) {
  if (!browserStorage) return;
  if (timestamp) {
    browserStorage.setItem('authLastActivity', String(timestamp));
  } else {
    browserStorage.removeItem('authLastActivity');
  }
}

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => undefined,
  logout: () => undefined,
  authMessage: null,
  clearAuthMessage: () => undefined,
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => (browserStorage ? browserStorage.getItem('authToken') : null));
  const [user, setUser] = useState(() => readStoredJSON('authUser'));
  const [lastActivity, setLastActivity] = useState(() => readStoredNumber('authLastActivity'));
  const [inactivityMs, setInactivityMs] = useState(() => readStoredNumber('authInactivityMs', DEFAULT_INACTIVITY_MS));
  const [authMessage, setAuthMessage] = useState(null);

  const isAuthenticated = Boolean(token && user);

  const clearStorage = useCallback(() => {
    writeAuthState(null, null, null);
    writeLastActivity(null);
  }, []);

  const logout = useCallback(
    (message) => {
      clearStorage();
      setToken(null);
      setUser(null);
      setLastActivity(null);
      setAuthMessage(message || null);
    },
    [clearStorage],
  );

  const updateActivity = useCallback(() => {
    if (!token) return;
    const now = Date.now();
    setLastActivity(now);
    writeLastActivity(now);
  }, [token]);

  const login = useCallback(
    async ({ email, senha }) => {
      const result = await authApi.login({ email, senha });
      const nextInactivity = Number(result.inactivityTimeoutMs) || DEFAULT_INACTIVITY_MS;
      setToken(result.token);
      setUser(result.user);
      setInactivityMs(nextInactivity);
      writeAuthState(result.token, result.user, nextInactivity);
      const now = Date.now();
      setLastActivity(now);
      writeLastActivity(now);
      setAuthMessage(null);
      return result.user;
    },
    [],
  );

  const clearAuthMessage = useCallback(() => setAuthMessage(null), []);

  useEffect(() => {
    setApiAuthHandlers({
      tokenProvider: () => token,
      onUnauthorized: (error) => {
        const message = error?.message || 'Sessão expirada, faça login novamente.';
        logout(message);
      },
    });
  }, [token, logout]);

  useEffect(() => {
    if (!token || !lastActivity) return;
    if (Date.now() - lastActivity > inactivityMs) {
      logout('Sessão expirada por inatividade');
    }
  }, [token, lastActivity, inactivityMs, logout]);

  useEffect(() => {
    if (!token) return undefined;
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    const handler = () => updateActivity();
    events.forEach((evt) => window.addEventListener(evt, handler));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handler));
    };
  }, [token, updateActivity]);

  useEffect(() => {
    if (!token) return undefined;
    const interval = setInterval(() => {
      const currentActivity = readStoredNumber('authLastActivity', lastActivity || Date.now());
      if (Date.now() - currentActivity > inactivityMs) {
        logout('Sessão expirada por inatividade');
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token, inactivityMs, lastActivity, logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      login,
      logout,
      authMessage,
      clearAuthMessage,
      inactivityMs,
    }),
    [user, token, isAuthenticated, login, logout, authMessage, clearAuthMessage, inactivityMs],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

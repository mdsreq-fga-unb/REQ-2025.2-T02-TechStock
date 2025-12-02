const sessionStore = require('../../services/session-store');

describe('session-store', () => {
  afterEach(() => {
    sessionStore.clearSessions();
    jest.useRealTimers();
  });

  test('startSession registra e touch atualiza atividade', () => {
    const user = { id: 1, nome: 'Tester' };
    const { sessionId } = sessionStore.startSession(user);
    const firstTouch = sessionStore.touchSession(sessionId);
    expect(firstTouch.ok).toBe(true);
    expect(firstTouch.user).toEqual(user);
  });

  test('expira sessão após período configurado', () => {
    jest.useFakeTimers({ advanceTimers: true });
    const user = { id: 2, nome: 'Expira' };
    const { sessionId, inactivityMs } = sessionStore.startSession(user);
    jest.advanceTimersByTime(inactivityMs + 1);
    const touch = sessionStore.touchSession(sessionId);
    expect(touch.ok).toBe(false);
    expect(touch.reason).toBe('expired');
  });
});

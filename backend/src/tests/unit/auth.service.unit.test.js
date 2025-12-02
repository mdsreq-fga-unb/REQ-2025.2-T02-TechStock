jest.mock('../../repositories/usuarios.repository', () => ({
  findByEmail: jest.fn(),
}));

jest.mock('../../services/session-store', () => ({
  startSession: jest.fn(() => ({ sessionId: 'session-1', inactivityMs: 7_200_000 })),
}));

process.env.JWT_SECRET = 'unit-secret';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../services/auth.service');
const usuariosRepository = require('../../repositories/usuarios.repository');
const sessionStore = require('../../services/session-store');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('gera token quando credenciais corretas', async () => {
    const senha = 'Secreta!';
    const senha_hash = await bcrypt.hash(senha, 10);
    usuariosRepository.findByEmail.mockResolvedValue({ id: 10, nome: 'Tester', email: 'tester@example.com', senha_hash });

    const result = await authService.authenticate({ email: 'tester@example.com', senha });

    expect(sessionStore.startSession).toHaveBeenCalledWith({ id: 10, nome: 'Tester', email: 'tester@example.com' });
    expect(result.user).toEqual({ id: 10, nome: 'Tester', email: 'tester@example.com' });
    expect(result.inactivityTimeoutMs).toBe(7_200_000);
    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe(10);
    expect(decoded.jti).toBe('session-1');
  });

  test('lança erro quando usuário não existe', async () => {
    usuariosRepository.findByEmail.mockResolvedValue(null);
    await expect(authService.authenticate({ email: 'nada', senha: '123' })).rejects.toThrow('Credenciais inválidas');
  });

  test('lança erro quando senha inválida', async () => {
    const senha_hash = await bcrypt.hash('correta', 10);
    usuariosRepository.findByEmail.mockResolvedValue({ id: 5, nome: 'User', email: 'user@test', senha_hash });
    await expect(authService.authenticate({ email: 'user@test', senha: 'errada' })).rejects.toThrow('Credenciais inválidas');
  });
});

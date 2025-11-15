const { isValidCPF } = require('../../validators/cpf');

describe('validators/cpf', () => {
  test('retorna false para CPF inválido curto', () => {
    expect(isValidCPF('123')).toBe(false);
  });
  test('retorna false para repetidos', () => {
    expect(isValidCPF('11111111111')).toBe(false);
  });
  test('retorna false para dígitos incorretos', () => {
    expect(isValidCPF('12345678900')).toBe(false);
  });
  test('retorna true para CPF válido conhecido', () => {
    // CPF válido de exemplo (gerado por algoritmo): 52998224725
    expect(isValidCPF('52998224725')).toBe(true);
  });
});

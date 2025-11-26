const { serializeCelular, serializeList, serializeVenda, serializeVendaList } = require('../../utils/serialization');

describe('utils/serialization', () => {
  test('serializeCelular converte Decimal para number e data para ISO', () => {
    const decimal = { toNumber: () => 123.45 };
    const data = { valor_compra: decimal, data_cadastro: '2020-01-01T00:00:00.000Z' };
    const result = serializeCelular(data);
    expect(result.valor_compra).toBe(123.45);
    expect(result.data_cadastro).toBe('2020-01-01T00:00:00.000Z');
  });

  test('serializeList mapeia lista', () => {
    const items = [{ valor_compra: { toNumber: () => 1 } }, { valor_compra: { toNumber: () => 2 } }];
    const res = serializeList(items);
    expect(res[0].valor_compra).toBe(1);
    expect(res[1].valor_compra).toBe(2);
  });

  test('serializeVenda converte decimal e datas', () => {
    const venda = {
      valor_venda: { toNumber: () => 999.9 },
      data_venda: '2024-01-01T00:00:00.000Z',
      garantia_validade: '2024-02-01T00:00:00.000Z',
    };
    const result = serializeVenda(venda);
    expect(result.valor_venda).toBe(999.9);
    expect(result.data_venda).toBe('2024-01-01T00:00:00.000Z');
    expect(result.garantia_validade).toBe('2024-02-01T00:00:00.000Z');
  });

  test('serializeVendaList mapeia vendas', () => {
    const list = [{ valor_venda: { toNumber: () => 1 } }, { valor_venda: { toNumber: () => 2 } }];
    const result = serializeVendaList(list);
    expect(result.map((v) => v.valor_venda)).toEqual([1, 2]);
  });
});

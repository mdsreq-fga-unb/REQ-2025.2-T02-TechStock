function toPlainDecimal(value) {
  if (value == null) return value;
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    try {
      return value.toNumber();
    } catch (e) {
      return Number(value); // fallback
    }
  }
  return value;
}

function toISODate(value) {
  if (!value) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function serializeCelular(c) {
  if (!c) return c;
  return {
    ...c,
    valor_compra: toPlainDecimal(c.valor_compra),
    data_cadastro: toISODate(c.data_cadastro),
  };
}

function serializeList(list = []) {
  return list.map(serializeCelular);
}

function serializeVenda(venda) {
  if (!venda) return venda;
  return {
    ...venda,
    valor_venda: toPlainDecimal(venda.valor_venda),
    data_venda: toISODate(venda.data_venda),
    garantia_validade: toISODate(venda.garantia_validade),
  };
}

function serializeVendaList(list = []) {
  return list.map(serializeVenda);
}

module.exports = { serializeCelular, serializeList, serializeVenda, serializeVendaList, toPlainDecimal };

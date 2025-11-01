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

function serializeCelular(c) {
  if (!c) return c;
  return {
    ...c,
    valor_compra: toPlainDecimal(c.valor_compra),
    data_cadastro: c.data_cadastro ? new Date(c.data_cadastro).toISOString() : c.data_cadastro,
  };
}

function serializeList(list = []) {
  return list.map(serializeCelular);
}

module.exports = { serializeCelular, serializeList };

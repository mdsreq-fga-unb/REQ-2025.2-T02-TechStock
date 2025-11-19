const { getPrisma } = require('../database/prisma');

function getClient(tx) {
  return tx || getPrisma();
}

async function addEvent(data, tx) {
  const prisma = getClient(tx);
  const allowedFields = ['celular_id', 'ordem_servico_id', 'tipo_evento', 'descricao', 'data_evento'];
  const payload = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
      payload[key] = data[key];
    }
  }
  return prisma.celulares_historico.create({ data: payload });
}

module.exports = { addEvent };

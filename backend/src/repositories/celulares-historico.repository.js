const { getPrisma } = require('../database/prisma');
const { pick } = require('../utils/pick');

function getClient(tx) {
  return tx || getPrisma();
}

async function addEvent(data, tx) {
  const prisma = getClient(tx);
  const allowedFields = ['celular_id', 'ordem_servico_id', 'tipo_evento', 'descricao', 'data_evento'];
  const payload = pick(data, allowedFields);
  return prisma.celulares_historico.create({ data: payload });
}

module.exports = { addEvent };

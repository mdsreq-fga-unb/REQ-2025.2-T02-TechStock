const celularesRepository = require('../repositories/celulares.repository');
const historicoRepository = require('../repositories/celulares-historico.repository');
const { getPrisma } = require('../database/prisma');

const EVENTOS = {
  CADASTRO: 'CelularCadastrado',
};

function buildDescricaoCadastro(celular) {
  const partes = [];
  if (celular.modelo) partes.push(celular.modelo);
  if (celular.imei) partes.push(`IMEI ${celular.imei}`);
  if (celular.nome_fornecedor) partes.push(`Fornecedor ${celular.nome_fornecedor}`);
  const contexto = partes.length ? ` (${partes.join(' • ')})` : '';
  return `Celular cadastrado no estoque${contexto}.`;
}

async function list({ page = 1, pageSize = 20, q, status, tipo, fornecedor, capacidade, id, finalidade } = {}) {
  return celularesRepository.list({ page, pageSize, q, filters: { status, tipo, fornecedor, capacidade, id, finalidade } });
}

async function getById(id) {
  return celularesRepository.getById(id);
}

async function create(data, user) {
  const prisma = getPrisma();
  const userId = user?.id || 1;

  const created = await prisma.$transaction(async (tx) => {
    const celular = await celularesRepository.create(data, userId, tx);
    await historicoRepository.addEvent(
      {
        celular_id: celular.id,
        tipo_evento: EVENTOS.CADASTRO,
        descricao: buildDescricaoCadastro(celular),
        data_evento: celular.data_cadastro || new Date(),
      },
      tx,
    );
    return celular;
  });

  return created;
}

async function update(id, data, user) {
  return celularesRepository.update(id, data, user?.id || 1);
}

async function remove(id) {
  return celularesRepository.remove(id);
}

module.exports = { list, getById, create, update, remove };

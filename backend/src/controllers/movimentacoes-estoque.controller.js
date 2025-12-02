const movimentacoesService = require('../services/movimentacoes-estoque.service');
const { serializeMovimentacao, serializeMovimentacaoList } = require('../utils/serialization');

async function list(req, res, next) {
  try {
    const {
      page = 1,
      pageSize = 20,
      tipo_item,
      tipo_operacao,
      usuario_id,
      data_inicio,
      data_fim,
      celular_id,
      peca_id,
    } = req.query;

    const data = await movimentacoesService.list({
      page: Number(page),
      pageSize: Number(pageSize),
      tipo_item,
      tipo_operacao,
      usuario_id,
      dataInicio: data_inicio,
      dataFim: data_fim,
      celular_id,
      peca_id,
    });

    res.json({ meta: data.meta, items: serializeMovimentacaoList(data.items) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const movimento = await movimentacoesService.getById(id);
    if (!movimento) {
      return res.status(404).json({ message: 'Movimentação não encontrada' });
    }
    res.json(serializeMovimentacao(movimento));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const movimento = await movimentacoesService.create(req.body, req.user);
    res.status(201).json({ message: 'Movimentação registrada com sucesso', movimento: serializeMovimentacao(movimento) });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create };

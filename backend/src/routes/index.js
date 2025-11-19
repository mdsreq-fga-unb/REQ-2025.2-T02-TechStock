const { Router } = require('express');
const { getPrisma } = require('../database/prisma');
const usuariosController = require('../controllers/usuarios.controller');
const celularesController = require('../controllers/celulares.controller');
const pecasController = require('../controllers/pecas.controller');
const clientesController = require('../controllers/clientes.controller');
const ordensServicoController = require('../controllers/ordens-servico.controller');
const { validate } = require('../middlewares/validate');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');
const { isValidCPF } = require('../validators/cpf');

const router = Router();

// Example route
router.get('/', async (req, res) => {
  const prisma = getPrisma();
  const [u, c, p] = await Promise.all([
    prisma.usuarios.count(),
    prisma.celulares.count(),
    prisma.pecas.count(),
  ]);
  res.json({ name: 'TechStock API', version: 'v1', counts: { usuarios: u, celulares: c, pecas: p } });
});

// Usuarios
router.get('/usuarios', usuariosController.list);
router.post('/usuarios', validate(['nome', 'email', 'senha']), usuariosController.create);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Lista clientes
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: cpf
 *         schema: { type: string }
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [CONSUMIDOR, REVENDEDOR, MANUTENCAO] }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             example:
 *               meta: { page: 1, pageSize: 20, total: 1 }
 *               items:
 *                 - id: 1
 *                   nome: "João da Silva"
 *                   cpf: "11122233344"
 *                   telefone: "11999990000"
 *                   email: "joao@exemplo.com"
 *                   tipo: "CONSUMIDOR"
 *                   data_cadastro: "2025-01-10T00:00:00.000Z"
 *   post:
 *     summary: Cria um cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, cpf, tipo]
 *             properties:
 *               nome: { type: string }
 *               cpf: { type: string }
 *               telefone: { type: string }
 *               email: { type: string }
 *               tipo: { type: string }
 *     responses:
 *       201: { description: Criado }
 *       409: { description: CPF já cadastrado }
 */
router.get(
  '/clientes',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString(),
    query('cpf').optional().isString(),
    query('tipo').optional().isIn(['CONSUMIDOR', 'REVENDEDOR', 'MANUTENCAO']),
  ],
  validateRequest,
  clientesController.list,
);
router.post(
  '/clientes',
  [
    body('nome').isString().notEmpty(),
    body('cpf').isString().notEmpty().custom(isValidCPF).withMessage('CPF inválido'),
    body('tipo').isIn(['CONSUMIDOR', 'REVENDEDOR', 'MANUTENCAO']),
    body('telefone').optional().isString(),
    body('email').optional().isEmail(),
  ],
  validateRequest,
  clientesController.create,
);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Detalha um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               nome: "João da Silva"
 *               cpf: "11122233344"
 *               telefone: "11999990000"
 *               email: "joao@exemplo.com"
 *               tipo: "CONSUMIDOR"
 *               data_cadastro: "2025-01-10T00:00:00.000Z"
 *       404:
 *         description: Não encontrado
 *         content:
 *           application/json:
 *             example: { message: "Cliente não encontrado" }
 *   put:
 *     summary: Atualiza um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Não encontrado }
 *       409: { description: CPF já cadastrado }
 *   delete:
 *     summary: Remove um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Sem conteúdo }
 *       404: { description: Não encontrado }
 */
router.get('/clientes/:id', [param('id').isInt().toInt()], validateRequest, clientesController.getById);
router.put(
  '/clientes/:id',
  [
    param('id').isInt().toInt(),
    body('nome').optional().isString(),
    body('telefone').optional().isString(),
    body('email').optional().isEmail(),
    body('tipo').optional().isIn(['CONSUMIDOR', 'REVENDEDOR', 'MANUTENCAO']),
    body('cpf').optional().custom(isValidCPF).withMessage('CPF inválido'),
  ],
  validateRequest,
  clientesController.update,
);
router.delete('/clientes/:id', [param('id').isInt().toInt()], validateRequest, clientesController.remove);

/**
 * @swagger
 * /api/celulares:
 *   get:
 *     summary: Lista celulares
 *     tags: [Celulares]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *       - in: query
 *         name: fornecedor
 *         schema: { type: string }
 *       - in: query
 *         name: capacidade
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             example:
 *               meta: { page: 1, pageSize: 20, total: 1 }
 *               items:
 *                 - id: 1
 *                   modelo: "iPhone 12"
 *                   imei: "123456789012345"
 *                   cor: "Preto"
 *                   capacidade: "128GB"
 *                   valor_compra: 3500.00
 *                   garantia_padrao_dias: 365
 *                   defeitos_identificados: null
 *                   tipo: "Compra"
 *                   status: "EmEstoque"
 *                   data_cadastro: "2025-01-01T00:00:00.000Z"
 *                   nome_fornecedor: "Fornecedor X"
 *                   usuario_cadastro_id: 1
 *                   created_by: 1
 *                   updated_by: 1
 *                   updated_at: "2025-01-02T00:00:00.000Z"
 *   post:
 *     summary: Cria um celular
 *     tags: [Celulares]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [modelo, imei, nome_fornecedor, tipo]
 *             properties:
 *               modelo: { type: string }
 *               imei: { type: string }
 *               nome_fornecedor: { type: string }
 *               tipo: { type: string }
 *               cor: { type: string }
 *               capacidade: { type: string }
 *               valor_compra: { type: number }
 *               garantia_padrao_dias: { type: integer }
 *               defeitos_identificados: { type: string }
 *               status: { type: string }
 *               usuario_cadastro_id: { type: integer }
 *     responses:
 *       201: { description: Criado }
 *       409: { description: IMEI já cadastrado }
 */
/**
 * @swagger
 * /api/celulares/{id}:
 *   get:
 *     summary: Detalha um celular
 *     tags: [Celulares]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               modelo: "iPhone 12"
 *               imei: "123456789012345"
 *               cor: "Preto"
 *               capacidade: "128GB"
 *               valor_compra: 3500.00
 *               garantia_padrao_dias: 365
 *               defeitos_identificados: null
 *               tipo: "Compra"
 *               status: "EmEstoque"
 *               data_cadastro: "2025-01-01T00:00:00.000Z"
 *               nome_fornecedor: "Fornecedor X"
 *               usuario_cadastro_id: 1
 *               created_by: 1
 *               updated_by: 1
 *               updated_at: "2025-01-02T00:00:00.000Z"
 *       404:
 *         description: Não encontrado
 *         content:
 *           application/json:
 *             example: { message: "Celular não encontrado" }
 *   put:
 *     summary: Atualiza um celular
 *     tags: [Celulares]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Não encontrado }
 *   delete:
 *     summary: Remove um celular
 *     tags: [Celulares]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Sem conteúdo }
 *       404: { description: Não encontrado }
 */
/**
 * @swagger
 * /api/pecas:
 *   get:
 *     summary: Lista peças
 *     tags: [Pecas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             example:
 *               meta: { page: 1, pageSize: 20, total: 1 }
 *               items:
 *                 - id: 1
 *                   nome: "Tela iPhone"
 *                   codigo_interno: "P-TELA-001"
 *                   compatibilidade: "iPhone 12"
 *                   quantidade: 5
 *                   garantia_padrao_dias: 90
 *                   data_cadastro: "2025-01-10T00:00:00.000Z"
 *                   nome_fornecedor: "Fornecedor X"
 *                   usuario_cadastro_id: 1
 *                   created_by: 1
 *                   updated_by: 1
 *                   updated_at: "2025-01-11T00:00:00.000Z"
 *   post:
 *     summary: Cria uma peça
 *     tags: [Pecas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, codigo_interno, nome_fornecedor]
 *             properties:
 *               nome: { type: string }
 *               codigo_interno: { type: string }
 *               nome_fornecedor: { type: string }
 *               compatibilidade: { type: string }
 *               quantidade: { type: integer }
 *               garantia_padrao_dias: { type: integer }
 *     responses:
 *       201: { description: Criado }
 *       409: { description: Código interno já cadastrado }
 */
/**
 * @swagger
 * /api/pecas/{id}:
 *   get:
 *     summary: Detalha uma peça
 *     tags: [Pecas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               nome: "Tela iPhone"
 *               codigo_interno: "P-TELA-001"
 *               compatibilidade: "iPhone 12"
 *               quantidade: 5
 *               garantia_padrao_dias: 90
 *               data_cadastro: "2025-01-10T00:00:00.000Z"
 *               nome_fornecedor: "Fornecedor X"
 *               usuario_cadastro_id: 1
 *               created_by: 1
 *               updated_by: 1
 *               updated_at: "2025-01-11T00:00:00.000Z"
 *       404:
 *         description: Não encontrada
 *         content:
 *           application/json:
 *             example: { message: "Peça não encontrada" }
 *   put:
 *     summary: Atualiza uma peça
 *     tags: [Pecas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Não encontrada }
 *       409: { description: Código interno já cadastrado }
 *   delete:
 *     summary: Remove uma peça
 *     tags: [Pecas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Sem conteúdo }
 *       404: { description: Não encontrada }
 */

router.get(
  '/celulares',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString(),
    query('status').optional().isString(),
    query('tipo').optional().isString(),
    query('fornecedor').optional().isString(),
    query('capacidade').optional().isString(),
  ],
  validateRequest,
  celularesController.list,
);
router.post(
  '/celulares',
  [
    body('modelo').isString().notEmpty(),
    body('imei').isString().notEmpty(),
    body('nome_fornecedor').isString().notEmpty(),
    body('tipo').isString().notEmpty(),
    body('valor_compra').optional().isFloat({ min: 0 }),
    body('garantia_padrao_dias').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  celularesController.create,
);
router.put(
  '/celulares/:id',
  [
    param('id').isInt().toInt(),
    body('status').optional().isString(),
    body('tipo').optional().isString(),
    body('valor_compra').optional().isFloat({ min: 0 }),
    body('garantia_padrao_dias').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  celularesController.update,
);
router.get('/celulares/:id', [param('id').isInt().toInt()], validateRequest, celularesController.getById);
router.delete('/celulares/:id', [param('id').isInt().toInt()], validateRequest, celularesController.remove);
router.get(
  '/pecas',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString(),
  ],
  validateRequest,
  pecasController.list,
);
router.get('/pecas/:id', [param('id').isInt().toInt()], validateRequest, pecasController.getById);
router.post(
  '/pecas',
  [
    body('nome').isString().notEmpty(),
    body('codigo_interno').isString().notEmpty(),
    body('nome_fornecedor').isString().notEmpty(),
    body('quantidade').optional().isInt({ min: 0 }),
    body('garantia_padrao_dias').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  pecasController.create,
);
router.put(
  '/pecas/:id',
  [
    param('id').isInt().toInt(),
    body('quantidade').optional().isInt({ min: 0 }),
    body('garantia_padrao_dias').optional().isInt({ min: 0 }),
  ],
  validateRequest,
  pecasController.update,
);
router.delete('/pecas/:id', [param('id').isInt().toInt()], validateRequest, pecasController.remove);

/**
 * @swagger
 * /api/ordens-servico:
 *   get:
 *     summary: Lista ordens de serviço
 *     tags: [OrdensServico]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [EmAndamento, Concluido] }
 *       - in: query
 *         name: cliente_id
 *         schema: { type: integer }
 *       - in: query
 *         name: celular_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista paginada de ordens de serviço
 *         content:
 *           application/json:
 *             example:
 *               meta: { page: 1, pageSize: 20, total: 1 }
 *               items:
 *                 - id: 10
 *                   cliente_id: 1
 *                   celular_id: 2
 *                   status: "EmAndamento"
 *                   descricao: "Troca de tela"
 *                   data_abertura: "2025-01-20T10:00:00.000Z"
 *                   cliente: { id: 1, nome: "João" }
 *                   celular: { id: 2, modelo: "iPhone 12" }
 *   post:
 *     summary: Cria uma ordem de serviço
 *     tags: [OrdensServico]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente_id, celular_id]
 *             properties:
 *               cliente_id: { type: integer }
 *               celular_id: { type: integer }
 *               descricao: { type: string }
 *               observacoes: { type: string }
 *               garantia_dias: { type: integer }
 *     responses:
 *       201:
 *         description: Criado
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               status: "EmAndamento"
 *               cliente_id: 1
 *               celular_id: 2
 *               historico:
 *                 - id: 33
 *                   tipo_evento: "OrdemServicoCriada"
 *                   descricao: "Ordem de serviço #10 criada (status EmAndamento)."
 */
/**
 * @swagger
 * /api/ordens-servico/{id}:
 *   get:
 *     summary: Detalha uma ordem de serviço
 *     tags: [OrdensServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               status: "EmAndamento"
 *               descricao: "Troca de tela"
 *               cliente: { id: 1, nome: "João" }
 *               celular: { id: 2, modelo: "iPhone 12" }
 *               pecas_utilizadas:
 *                 - peca: { id: 7, nome: "Tela iPhone", codigo_interno: "TELA-01" }
 *                   quantidade: 2
 *                   data_uso: "2025-01-21T10:00:00.000Z"
 *               historico:
 *                 - id: 33
 *                   tipo_evento: "OrdemServicoCriada"
 *                   descricao: "Ordem de serviço #10 criada (status EmAndamento)."
 *       404: { description: Não encontrada }
 *   patch:
 *     summary: Atualiza uma ordem de serviço (status, garantia, observações)
 *     tags: [OrdensServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [EmAndamento, Concluido] }
 *               garantia_dias: { type: integer }
 *               garantia_validade: { type: string, format: date-time }
 *               observacoes: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Não encontrada }
 */

/**
 * @swagger
 * /api/ordens-servico/{id}/pecas:
 *   post:
 *     summary: Registra peças utilizadas em uma ordem de serviço
 *     tags: [OrdensServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itens]
 *             properties:
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [peca_id, quantidade]
 *                   properties:
 *                     peca_id: { type: integer }
 *                     quantidade: { type: integer, minimum: 1 }
 *           example:
 *             itens:
 *               - peca_id: 1
 *                 quantidade: 2
 *               - peca_id: 2
 *                 quantidade: 1
 *     responses:
 *       200:
 *         description: Ordem atualizada com as peças utilizadas
 *         content:
 *           application/json:
 *             example:
 *               id: 10
 *               pecas_utilizadas:
 *                 - peca: { id: 7, nome: "Tela iPhone", codigo_interno: "TELA-01" }
 *                   quantidade: 2
 *                   data_uso: "2025-01-21T10:00:00.000Z"
 *       400:
 *         description: Estoque insuficiente ou dados inválidos
 *       404:
 *         description: Ordem de serviço ou peça não encontrada
 */

router.get(
  '/ordens-servico',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('q').optional().isString(),
    query('status').optional().isIn(['EmAndamento', 'Concluido']),
    query('cliente_id').optional().isInt({ min: 1 }).toInt(),
    query('celular_id').optional().isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  ordensServicoController.list,
);
router.post(
  '/ordens-servico',
  [
    body('cliente_id').isInt({ min: 1 }).toInt(),
    body('celular_id').isInt({ min: 1 }).toInt(),
    body('descricao').optional().isString(),
    body('observacoes').optional().isString(),
    body('garantia_dias').optional().isInt({ min: 0 }).toInt(),
    body('garantia_validade').optional().isISO8601().toDate(),
  ],
  validateRequest,
  ordensServicoController.create,
);
router.get('/ordens-servico/:id', [param('id').isInt().toInt()], validateRequest, ordensServicoController.getById);
router.patch(
  '/ordens-servico/:id',
  [
    param('id').isInt().toInt(),
    body('status').optional().isIn(['EmAndamento', 'Concluido']),
    body('descricao').optional().isString(),
    body('observacoes').optional().isString(),
    body('garantia_dias').optional().isInt({ min: 0 }).toInt(),
    body('garantia_validade').optional().isISO8601().toDate(),
    body('data_conclusao').optional().isISO8601().toDate(),
  ],
  validateRequest,
  ordensServicoController.update,
);
router.post(
  '/ordens-servico/:id/pecas',
  [
    param('id').isInt().toInt(),
    body('itens').isArray({ min: 1 }),
    body('itens.*.peca_id').isInt({ min: 1 }).toInt(),
    body('itens.*.quantidade').isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  ordensServicoController.registrarPecas,
);

module.exports = router;

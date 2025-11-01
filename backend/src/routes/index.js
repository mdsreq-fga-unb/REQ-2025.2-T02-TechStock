const { Router } = require('express');
const { getPrisma } = require('../database/prisma');
const usuariosController = require('../controllers/usuarios.controller');
const celularesController = require('../controllers/celulares.controller');
const pecasController = require('../controllers/pecas.controller');
const { validate } = require('../middlewares/validate');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

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
  async (req, res, next) => {
    try {
      await celularesController.create(req, res, next);
    } catch (e) {
      if (e && e.code === 'P2002' && e.meta && e.meta.target && e.meta.target.includes('imei')) {
        return res.status(409).json({ message: 'IMEI já cadastrado' });
      }
      return next(e);
    }
  },
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
  async (req, res, next) => {
    try {
      await celularesController.update(req, res, next);
    } catch (e) {
      if (e && e.code === 'P2002' && e.meta && e.meta.target && e.meta.target.includes('imei')) {
        return res.status(409).json({ message: 'IMEI já cadastrado' });
      }
      return next(e);
    }
  },
);
router.get('/celulares/:id', celularesController.getById);
router.delete('/celulares/:id', celularesController.remove);
router.get(
  '/pecas',
  [query('page').optional().isInt({ min: 1 }).toInt(), query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(), query('q').optional().isString()],
  validateRequest,
  pecasController.list,
);
router.get('/pecas/:id', pecasController.getById);
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
  async (req, res, next) => {
    try {
      await pecasController.create(req, res, next);
    } catch (e) {
      if (e && e.code === 'P2002' && e.meta && e.meta.target && e.meta.target.includes('codigo_interno')) {
        return res.status(409).json({ message: 'Código interno já cadastrado' });
      }
      return next(e);
    }
  },
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
router.delete('/pecas/:id', pecasController.remove);

module.exports = router;

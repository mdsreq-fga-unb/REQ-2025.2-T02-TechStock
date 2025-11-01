const { Router } = require('express');
const { getPrisma } = require('../database/prisma');
const usuariosController = require('../controllers/usuarios.controller');
const celularesController = require('../controllers/celulares.controller');
const { validate } = require('../middlewares/validate');

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
 *     responses:
 *       200:
 *         description: Lista paginada
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
 *       201:
 *         description: Criado
 */
router.get('/celulares', celularesController.list);
router.post(
  '/celulares',
  validate(['modelo', 'imei', 'nome_fornecedor', 'tipo']),
  celularesController.create,
);

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
 *       200: { description: OK }
 *       404: { description: Não encontrado }
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
router.get('/celulares/:id', celularesController.getById);
router.put('/celulares/:id', celularesController.update);
router.delete('/celulares/:id', celularesController.remove);

// TODO
router.use('/pecas', (req, res) => res.status(501).json({ message: 'TODO pecas' }));

module.exports = router;

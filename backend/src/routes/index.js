const { Router } = require('express');
const { getPrisma } = require('../database/prisma');
const usuariosController = require('../controllers/usuarios.controller');
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

router.get('/usuarios', usuariosController.list);
router.post('/usuarios', validate(['nome', 'email', 'senha']), usuariosController.create);

router.use('/pecas', (req, res) => res.status(501).json({ message: 'TODO pecas' }));
router.use('/celulares', (req, res) => res.status(501).json({ message: 'TODO celulares' }));

module.exports = router;

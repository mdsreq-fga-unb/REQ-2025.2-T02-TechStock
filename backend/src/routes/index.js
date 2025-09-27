const { Router } = require('express');

const router = Router();

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'TechStock API v1' });
});

module.exports = router;

const express = require('express');
const apiRouter = require('../../routes');
const { attachUser, ensureAuthenticated } = require('../../middlewares/auth');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use(attachUser);
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth')) {
      return next();
    }
    return ensureAuthenticated(req, res, next);
  });
  app.use('/api', apiRouter);
  return app;
}

module.exports = { buildTestApp };

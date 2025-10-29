require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { pingDB } = require('./database/prisma');

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Simple request log for visibility
app.use((req, _res, next) => {
  if (req.path !== '/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    await pingDB();
    res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', db: 'up' });
  } catch (e) {
    res.status(503).json({ status: 'degraded', env: process.env.NODE_ENV || 'development', db: 'down' });
  }
});

// API routes
const apiRouter = require('./routes');
app.use('/api', apiRouter);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

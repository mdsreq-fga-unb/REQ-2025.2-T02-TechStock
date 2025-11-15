const request = require('supertest');
const express = require('express');

process.env.USE_SQLITE = '1';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./dev-test.db';

const apiRouter = require('../../routes');
const { getPrisma } = require('../../database/prisma');

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

async function resetDB() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe('DELETE FROM usuarios');
}

describe('API /api/usuarios', () => {
  beforeAll(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await resetDB();
  });

  test('GET lista vazia e POST cria', async () => {
    const listRes = await request(app).get('/api/usuarios').expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const createRes = await request(app)
      .post('/api/usuarios')
      .send({ nome: 'Admin', email: `admin+${Date.now()}@test.local`, senha: 'x' })
      .expect(201);
    expect(createRes.body.id).toBeDefined();
  });

  test('POST validação falha', async () => {
    await request(app).post('/api/usuarios').send({ nome: ' ', email: '', senha: '' }).expect(400);
  });
});

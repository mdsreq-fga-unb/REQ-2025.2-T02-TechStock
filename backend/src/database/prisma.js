const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

async function pingDB() {
  const client = getPrisma();
  await client.$queryRaw`SELECT 1`;
  return true;
}

module.exports = { getPrisma, pingDB };

let PrismaClient;
if (process.env.USE_SQLITE === '1') {
  // Prisma client generated from prisma/schema.test.prisma with output set to @prisma/client-test
  ({ PrismaClient } = require('@prisma/client-test'));
} else {
  ({ PrismaClient } = require('@prisma/client'));
}

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

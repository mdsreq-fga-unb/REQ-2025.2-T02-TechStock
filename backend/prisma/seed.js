// Minimal seed to ensure a user exists for FKs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.usuarios.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@example.com',
      senha_hash: 'dummy-hash',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

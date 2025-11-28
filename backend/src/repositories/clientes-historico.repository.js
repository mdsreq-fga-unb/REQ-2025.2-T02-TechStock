const { getPrisma } = require('../database/prisma');

function buildClienteFilter(clienteId) {
  if (!clienteId) return undefined;
  const parsed = Number(clienteId);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

async function fetchCompras({ cliente_id } = {}) {
  const prisma = getPrisma();
  const where = {};
  const clienteFilter = buildClienteFilter(cliente_id);
  if (clienteFilter) where.cliente_id = clienteFilter;

  return prisma.vendas.findMany({
    where,
    include: {
      cliente: { select: { id: true, nome: true } },
      celular: { select: { id: true, modelo: true, imei: true } },
    },
  });
}

async function fetchReparos({ cliente_id } = {}) {
  const prisma = getPrisma();
  const where = {};
  const clienteFilter = buildClienteFilter(cliente_id);
  if (clienteFilter) where.cliente_id = clienteFilter;

  return prisma.ordens_servico.findMany({
    where,
    include: {
      cliente: { select: { id: true, nome: true } },
      celular: { select: { id: true, modelo: true, imei: true } },
    },
  });
}

async function fetchGarantias({ cliente_id } = {}) {
  const prisma = getPrisma();
  const where = {};
  const clienteFilter = buildClienteFilter(cliente_id);
  if (clienteFilter) where.cliente_id = clienteFilter;

  return prisma.garantias.findMany({
    where,
    include: {
      cliente: { select: { id: true, nome: true } },
      celular: { select: { id: true, modelo: true, imei: true } },
    },
  });
}

module.exports = { fetchCompras, fetchReparos, fetchGarantias };

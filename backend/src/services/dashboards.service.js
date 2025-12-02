const { getPrisma } = require('../database/prisma');

const STATUS_LABELS = {
  EmAndamento: 'Em Andamento',
  Concluido: 'Concluído',
};

const DEFAULT_STOCK_TARGET = 10;
const GARANTIA_ALERT_WINDOW_DAYS = 60;
const GARANTIA_URGENT_THRESHOLD_DAYS = 7;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

function hasVendasDelegate(prisma) {
  const delegate = prisma?.vendas;
  return Boolean(delegate && typeof delegate.count === 'function' && typeof delegate.findMany === 'function');
}

function hasGarantiasDelegate(prisma) {
  const delegate = prisma?.garantias;
  return Boolean(delegate && typeof delegate.findMany === 'function');
}

function getMonthBounds(reference = new Date()) {
  const startCurrent = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const startPrevious = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  return { startCurrent, startPrevious };
}

function formatCurrencyBRL(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

function mapStatus(status) {
  return STATUS_LABELS[status] || status || 'Em Andamento';
}

function formatOsId(id) {
  if (!id && id !== 0) return 'OS-000';
  return `OS-${String(id).padStart(3, '0')}`;
}

function buildGrowth(current, previous) {
  const diff = current - (previous ?? 0);
  if (!previous && previous !== 0) {
    return { text: diff >= 0 ? '+100%' : '-100%', status: diff >= 0 ? 'positivo' : 'negativo' };
  }
  if (previous === 0) {
    if (current === 0) {
      return { text: '0%', status: 'positivo' };
    }
    return { text: '+100%', status: 'positivo' };
  }
  const percent = Math.round((diff / Math.abs(previous)) * 100);
  const prefix = percent > 0 ? '+' : '';
  return {
    text: `${prefix}${percent}%`,
    status: diff >= 0 ? 'positivo' : 'negativo',
  };
}

function diffInDays(target, reference = new Date()) {
  if (!target) return 0;
  const targetDate = target instanceof Date ? target : new Date(target);
  if (Number.isNaN(targetDate.getTime())) return 0;
  const diff = targetDate.getTime() - reference.getTime();
  return Math.max(0, Math.ceil(diff / MS_IN_DAY));
}

function computeGarantiaProgress(prazoDias, diasRestantes) {
  const total = prazoDias && prazoDias > 0 ? prazoDias : GARANTIA_ALERT_WINDOW_DAYS;
  if (total <= 0) return 0;
  const consumido = Math.max(0, total - diasRestantes);
  return Math.min(100, Math.max(0, Math.round((consumido / total) * 100)));
}

async function getMetricas(prisma, bounds) {
  const { startCurrent, startPrevious } = bounds;
  const supportsVendas = hasVendasDelegate(prisma);
  const [
    produtosAtivos,
    produtosPrev,
    clientesAtivos,
    clientesPrev,
    manutencoesAbertas,
    manutencoesPrev,
    vendasMes,
    vendasMesAnterior,
  ] = await Promise.all([
    prisma.celulares.count({ where: { status: 'EmEstoque' } }),
    prisma.celulares.count({ where: { status: 'EmEstoque', data_cadastro: { lt: startCurrent } } }),
    prisma.clientes.count(),
    prisma.clientes.count({ where: { data_cadastro: { lt: startCurrent } } }),
    prisma.ordens_servico.count({ where: { status: 'EmAndamento' } }),
    prisma.ordens_servico.count({ where: { status: 'EmAndamento', data_abertura: { lt: startCurrent } } }),
    supportsVendas
      ? prisma.vendas.count({ where: { data_venda: { gte: startCurrent } } })
      : Promise.resolve(0),
    supportsVendas
      ? prisma.vendas.count({ where: { data_venda: { gte: startPrevious, lt: startCurrent } } })
      : Promise.resolve(0),
  ]);

  return [
    (() => {
      const growth = buildGrowth(produtosAtivos, produtosPrev);
      return {
        id: 1,
        titulo: 'Produtos em Estoque',
        valor: produtosAtivos,
        crescimeto: growth.text,
        status: growth.status,
        icone: 'package',
      };
    })(),
    (() => {
      const growth = buildGrowth(clientesAtivos, clientesPrev);
      return {
        id: 2,
        titulo: 'Clientes Ativos',
        valor: clientesAtivos,
        crescimeto: growth.text,
        status: growth.status,
        icone: 'users',
      };
    })(),
    (() => {
      const growth = buildGrowth(manutencoesAbertas, manutencoesPrev);
      return {
        id: 3,
        titulo: 'Manutenções Abertas',
        valor: manutencoesAbertas,
        crescimeto: growth.text,
        status: growth.status,
        icone: 'wrench',
      };
    })(),
    (() => {
      const growth = buildGrowth(vendasMes, vendasMesAnterior);
      return {
        id: 4,
        titulo: 'Vendas do Mês',
        valor: vendasMes,
        crescimeto: growth.text,
        status: growth.status,
        icone: 'trending-up',
      };
    })(),
  ];
}

async function getVendasRecentes(prisma) {
  if (!hasVendasDelegate(prisma)) {
    return [];
  }
  const vendas = await prisma.vendas.findMany({
    include: {
      cliente: { select: { nome: true } },
      celular: { select: { modelo: true } },
    },
    orderBy: { data_venda: 'desc' },
    take: 5,
  });

  return vendas.map((venda) => ({
    id: venda.id,
    cliente: venda.cliente?.nome || 'Cliente não informado',
    produto: venda.celular?.modelo || 'Produto não informado',
    valor: formatCurrencyBRL(venda.valor_venda),
    status: 'Concluído',
  }));
}

async function getFilaManutencao(prisma) {
  const ordens = await prisma.ordens_servico.findMany({
    where: { status: 'EmAndamento' },
    include: {
      cliente: { select: { nome: true } },
      celular: { select: { modelo: true } },
    },
    orderBy: { data_abertura: 'asc' },
    take: 5,
  });

  return ordens.map((ordem) => ({
    id: ordem.id,
    modelo: ordem.celular?.modelo || 'Aparelho não informado',
    servico: ordem.descricao || 'Serviço não informado',
    cliente: ordem.cliente?.nome || 'Cliente não informado',
    valor: formatCurrencyBRL(0),
    status: mapStatus(ordem.status),
  }));
}

async function getOrdensRecentes(prisma) {
  const ordens = await prisma.ordens_servico.findMany({
    include: {
      cliente: { select: { nome: true } },
      celular: { select: { modelo: true } },
    },
    orderBy: { data_abertura: 'desc' },
    take: 5,
  });

  return ordens.map((ordem) => ({
    id: formatOsId(ordem.id),
    cliente: ordem.cliente?.nome || 'Cliente não informado',
    aparelho: ordem.celular?.modelo || 'Aparelho não informado',
    status: mapStatus(ordem.status),
  }));
}

async function getEstoqueBaixo(prisma) {
  const pecas = await prisma.pecas.findMany({
    where: { quantidade: { lte: DEFAULT_STOCK_TARGET } },
    orderBy: { quantidade: 'asc' },
    take: 5,
  });

  const itens = pecas.length
    ? pecas
    : await prisma.pecas.findMany({ orderBy: { quantidade: 'asc' }, take: 5 });

  return itens.map((peca) => {
    const totalEstimado = Math.max(DEFAULT_STOCK_TARGET, peca.quantidade || 0);
    const porcentagem = totalEstimado === 0 ? 0 : Math.round(((peca.quantidade || 0) / totalEstimado) * 100);
    return {
      item: peca.nome,
      atual: peca.quantidade || 0,
      total: totalEstimado,
      porcentagem,
    };
  });
}

async function getAlertasGarantia(prisma, reference = new Date()) {
  if (!hasGarantiasDelegate(prisma)) {
    return [];
  }

  const limite = new Date(reference);
  limite.setDate(limite.getDate() + GARANTIA_ALERT_WINDOW_DAYS);

  const garantias = await prisma.garantias.findMany({
    where: { data_fim: { gte: reference, lte: limite } },
    include: {
      cliente: { select: { nome: true } },
      celular: { select: { modelo: true, imei: true } },
    },
    orderBy: { data_fim: 'asc' },
  });

  return garantias.map((garantia) => {
    const diasRestantes = diffInDays(garantia.data_fim, reference);
    const status = diasRestantes <= GARANTIA_URGENT_THRESHOLD_DAYS ? 'Urgente' : 'Ativa';
    return {
      id: garantia.id,
      cliente: garantia.cliente?.nome || 'Cliente não informado',
      produto: garantia.celular?.modelo || 'Produto não informado',
      imei: garantia.celular?.imei || null,
      diasRestantes,
      status,
      venceEm: garantia.data_fim instanceof Date ? garantia.data_fim.toISOString() : garantia.data_fim,
      progresso: computeGarantiaProgress(garantia.prazo_dias, diasRestantes),
    };
  });
}

async function getResumo() {
  const prisma = getPrisma();
  const bounds = getMonthBounds();

  const [metricas, vendasRecentes, filaManutencao, ordensServico, estoqueBaixo, alertasGarantia] = await Promise.all([
    getMetricas(prisma, bounds),
    getVendasRecentes(prisma),
    getFilaManutencao(prisma),
    getOrdensRecentes(prisma),
    getEstoqueBaixo(prisma),
    getAlertasGarantia(prisma),
  ]);

  return { metricas, vendasRecentes, filaManutencao, ordensServico, estoqueBaixo, alertasGarantia };
}

module.exports = { getResumo };

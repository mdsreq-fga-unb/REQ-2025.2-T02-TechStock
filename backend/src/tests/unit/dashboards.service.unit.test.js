const { getResumo } = require('../../services/dashboards.service');
const { getPrisma } = require('../../database/prisma');

jest.mock('../../database/prisma', () => ({
  getPrisma: jest.fn(),
}));

describe('dashboards.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('monta o resumo agregando os dados do banco', async () => {
    const mockPrisma = {
      celulares: { count: jest.fn() },
      clientes: { count: jest.fn() },
      ordens_servico: { count: jest.fn(), findMany: jest.fn() },
      vendas: { count: jest.fn(), findMany: jest.fn() },
      pecas: { findMany: jest.fn() },
      garantias: { findMany: jest.fn() },
    };
    getPrisma.mockReturnValue(mockPrisma);

    mockPrisma.celulares.count.mockResolvedValueOnce(12).mockResolvedValueOnce(10);
    mockPrisma.clientes.count.mockResolvedValueOnce(30).mockResolvedValueOnce(25);
    mockPrisma.ordens_servico.count.mockResolvedValueOnce(7).mockResolvedValueOnce(6);
    mockPrisma.vendas.count.mockResolvedValueOnce(15).mockResolvedValueOnce(12);

    mockPrisma.vendas.findMany.mockResolvedValue([
      { id: 1, valor_venda: 2500, cliente: { nome: 'Alice' }, celular: { modelo: 'iPhone 14' } },
    ]);

    mockPrisma.ordens_servico.findMany
      .mockResolvedValueOnce([
        {
          id: 11,
          descricao: 'Troca de bateria',
          status: 'EmAndamento',
          cliente: { nome: 'João' },
          celular: { modelo: 'iPhone 11' },
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 9,
          status: 'Concluido',
          cliente: { nome: 'Julia' },
          celular: { modelo: 'Galaxy S22' },
        },
      ]);

    mockPrisma.pecas.findMany.mockResolvedValueOnce([
      { nome: 'Tela iPhone 14', quantidade: 2 },
      { nome: 'Bateria iPhone 11', quantidade: 4 },
    ]);

    mockPrisma.garantias.findMany.mockResolvedValue([
      {
        id: 5,
        data_fim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        prazo_dias: 30,
        cliente: { nome: 'Marcos' },
        celular: { modelo: 'iPhone 14', imei: '123' },
      },
    ]);

    const resumo = await getResumo();

    expect(getPrisma).toHaveBeenCalledTimes(1);
    expect(resumo.metricas).toHaveLength(4);
    expect(resumo.metricas[0]).toMatchObject({ titulo: 'Produtos em Estoque', valor: 12 });
    expect(resumo.vendasRecentes[0]).toMatchObject({ cliente: 'Alice', produto: 'iPhone 14' });
    expect(resumo.filaManutencao[0]).toMatchObject({ servico: 'Troca de bateria', cliente: 'João' });
    expect(resumo.ordensServico[0]).toMatchObject({ id: 'OS-009', aparelho: 'Galaxy S22' });
    expect(resumo.estoqueBaixo[0]).toMatchObject({ item: 'Tela iPhone 14', atual: 2 });
    expect(resumo.alertasGarantia[0]).toMatchObject({ produto: 'iPhone 14', status: 'Urgente' });
  });

  it('retorna dados neutros quando o delegate de vendas não existe', async () => {
    const mockPrisma = {
      celulares: { count: jest.fn() },
      clientes: { count: jest.fn() },
      ordens_servico: { count: jest.fn(), findMany: jest.fn() },
      pecas: { findMany: jest.fn() },
    };
    getPrisma.mockReturnValue(mockPrisma);

    mockPrisma.celulares.count.mockResolvedValueOnce(5).mockResolvedValueOnce(4);
    mockPrisma.clientes.count.mockResolvedValueOnce(12).mockResolvedValueOnce(10);
    mockPrisma.ordens_servico.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2);

    mockPrisma.ordens_servico.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    mockPrisma.pecas.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const resumo = await getResumo();

    expect(resumo.vendasRecentes).toEqual([]);
    expect(resumo.metricas[3]).toMatchObject({ titulo: 'Vendas do Mês', valor: 0, crescimeto: '0%' });
    expect(resumo.alertasGarantia).toEqual([]);
  });
});

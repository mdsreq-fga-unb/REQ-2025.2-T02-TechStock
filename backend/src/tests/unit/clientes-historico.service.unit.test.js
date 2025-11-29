jest.mock('../../repositories/clientes-historico.repository', () => ({
  fetchCompras: jest.fn(),
  fetchReparos: jest.fn(),
  fetchGarantias: jest.fn(),
}));

const historicoRepository = require('../../repositories/clientes-historico.repository');
const service = require('../../services/clientes-historico.service');

function buildVenda(overrides = {}) {
  return {
    id: overrides.id ?? 1,
    data_venda: overrides.data_venda ?? new Date('2025-01-02T10:00:00Z'),
    valor_venda: overrides.valor_venda ?? 2500,
    garantia_dias: overrides.garantia_dias ?? 365,
    garantia_validade: overrides.garantia_validade ?? new Date('2026-01-02T10:00:00Z'),
    cliente: overrides.cliente ?? { id: 1, nome: 'Cliente Compra' },
    celular: overrides.celular ?? { id: 2, modelo: 'Modelo Compra', imei: 'IMEI-1' },
  };
}

function buildOrdem(overrides = {}) {
  return {
    id: overrides.id ?? 11,
    data_abertura: overrides.data_abertura ?? new Date('2025-01-01T09:00:00Z'),
    data_conclusao: overrides.data_conclusao ?? new Date('2025-01-03T18:00:00Z'),
    status: overrides.status ?? 'Concluido',
    descricao: overrides.descricao ?? 'Troca de tela',
    garantia_dias: overrides.garantia_dias ?? 90,
    garantia_validade: overrides.garantia_validade ?? new Date('2025-04-03T18:00:00Z'),
    cliente: overrides.cliente ?? { id: 2, nome: 'Cliente Reparo' },
    celular: overrides.celular ?? { id: 3, modelo: 'Modelo Reparo', imei: 'IMEI-2' },
  };
}

function buildGarantia(overrides = {}) {
  return {
    id: overrides.id ?? 30,
    cliente: overrides.cliente ?? { id: 3, nome: 'Cliente Garantia' },
    celular: overrides.celular ?? { id: 4, modelo: 'Modelo Garantia', imei: 'IMEI-3' },
    origem_tipo: overrides.origem_tipo ?? 'VENDA',
    tipo: overrides.tipo ?? 'PRODUTO',
    prazo_dias: overrides.prazo_dias ?? 365,
    data_inicio: overrides.data_inicio ?? new Date('2025-01-10T12:00:00Z'),
    data_fim: overrides.data_fim ?? new Date('2026-01-10T12:00:00Z'),
    alerta_enviado_em: overrides.alerta_enviado_em ?? null,
  };
}

describe('clientes-historico.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    historicoRepository.fetchCompras.mockResolvedValue([]);
    historicoRepository.fetchReparos.mockResolvedValue([]);
    historicoRepository.fetchGarantias.mockResolvedValue([]);
  });

  test('combina compras e reparos ordenando por data', async () => {
    historicoRepository.fetchCompras.mockResolvedValue([
      buildVenda({ id: 1, data_venda: new Date('2025-01-02T12:00:00Z'), cliente: { id: 5, nome: 'A' } }),
    ]);
    historicoRepository.fetchReparos.mockResolvedValue([
      buildOrdem({ id: 2, data_conclusao: new Date('2025-01-04T12:00:00Z'), cliente: { id: 5, nome: 'A' } }),
    ]);

    const result = await service.listHistorico({ page: 1, pageSize: 10, cliente_id: 5 });

    expect(result.meta.total).toBe(2);
    expect(result.items[0].tipo).toBe('reparo');
    expect(result.items[1].tipo).toBe('compra');
    expect(result.items[0].cliente.id).toBe(5);
  });

  test('aplica filtro por tipo=compra', async () => {
    historicoRepository.fetchCompras.mockResolvedValue([buildVenda({ id: 7 })]);

    const result = await service.listHistorico({ tipo: 'compra' });

    expect(result.meta.total).toBe(1);
    expect(result.items[0].tipo).toBe('compra');
    expect(historicoRepository.fetchReparos).not.toHaveBeenCalled();
  });

  test('aplica filtro por tipo=reparado', async () => {
    historicoRepository.fetchReparos.mockResolvedValue([buildOrdem({ id: 9 })]);

    const result = await service.listHistorico({ tipo: 'reparado' });

    expect(result.meta.total).toBe(1);
    expect(result.items[0].tipo).toBe('reparo');
    expect(historicoRepository.fetchCompras).not.toHaveBeenCalled();
  });

  test('paginacao retorna subconjunto correto', async () => {
    historicoRepository.fetchCompras.mockResolvedValue([
      buildVenda({ id: 10, data_venda: new Date('2025-01-01T10:00:00Z') }),
      buildVenda({ id: 11, data_venda: new Date('2025-01-02T10:00:00Z') }),
      buildVenda({ id: 12, data_venda: new Date('2025-01-03T10:00:00Z') }),
    ]);
    historicoRepository.fetchReparos.mockResolvedValue([]);

    const result = await service.listHistorico({ page: 2, pageSize: 1 });

    expect(result.meta.total).toBe(3);
    expect(result.meta.page).toBe(2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].origem_id).toBe(11);
  });

  test('inclui garantias com status calculado', async () => {
    historicoRepository.fetchGarantias.mockResolvedValue([
      buildGarantia({
        id: 50,
        data_inicio: new Date('2025-01-10T12:00:00Z'),
        data_fim: new Date('2025-02-15T12:00:00Z'),
        cliente: { id: 8, nome: 'Cliente Garantia' },
      }),
    ]);
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-20T00:00:00Z').getTime());

    const result = await service.listHistorico({ tipo: 'garantia' });

    expect(result.meta.total).toBe(1);
    expect(result.items[0].tipo).toBe('garantia');
    expect(result.items[0].detalhes.status).toBe('proxima_do_vencimento');
    expect(historicoRepository.fetchCompras).not.toHaveBeenCalled();
    expect(historicoRepository.fetchReparos).not.toHaveBeenCalled();

    dateSpy.mockRestore();
  });
});

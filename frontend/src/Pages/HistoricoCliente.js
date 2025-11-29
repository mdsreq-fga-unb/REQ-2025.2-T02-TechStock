import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HistoricoCliente.css';
import { clientesHistoricoApi } from '../services/api';

const TIPO_LABELS = {
  compra: 'Compra',
  reparo: 'Reparo',
  garantia: 'Garantia',
};

const TIPO_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'compra', label: 'Compras' },
  { value: 'reparo', label: 'Reparos' },
  { value: 'garantia', label: 'Garantias' },
];

const HistoricoClientesTable = () => {
  const [historico, setHistorico] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, tipoFiltro]);

  const { filters } = useMemo(() => {
    const base = { page, pageSize };
    const trimmed = search.trim();
    if (trimmed) {
      if (/^\d+$/.test(trimmed)) {
        base.cliente_id = Number(trimmed);
      } else if (!tipoFiltro) {
        const normalized = trimmed.toLowerCase();
        if (normalized.includes('compra')) base.tipo = 'compra';
        else if (normalized.includes('repar')) base.tipo = 'reparo';
        else if (normalized.includes('garant')) base.tipo = 'garantia';
      }
    }
    if (tipoFiltro) {
      base.tipo = tipoFiltro;
    }
    return { filters: base };
  }, [page, pageSize, search, tipoFiltro]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    clientesHistoricoApi
      .list(filters)
      .then((data) => {
        if (!active) return;
        setHistorico(data?.items || []);
        const nextMeta = data?.meta || { page, pageSize, total: data?.items?.length || 0 };
        setMeta({
          page: nextMeta.page || page,
          pageSize: nextMeta.pageSize || pageSize,
          total: typeof nextMeta.total === 'number' ? nextMeta.total : data?.items?.length || 0,
        });
        if (nextMeta.page && nextMeta.page !== page) {
          setPage(nextMeta.page);
        }
        if (nextMeta.pageSize && nextMeta.pageSize !== pageSize) {
          setPageSize(nextMeta.pageSize);
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar o histórico de clientes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [filters, reloadKey]);

  const handleReload = () => setReloadKey((prev) => prev + 1);
  const handlePageSizeChange = (event) => {
    const value = Number(event.target.value);
    setPageSize(value);
    setPage(1);
  };
  const handleTipoChange = (event) => {
    setTipoFiltro(event.target.value);
  };

  const goToPage = (targetPage) => {
    setPage(() => {
      const requested = Number(targetPage) || 1;
      const totalRecords = meta?.total || 0;
      const limit = totalRecords ? Math.ceil(totalRecords / (meta?.pageSize || pageSize)) : 1;
      if (requested < 1) return 1;
      if (requested > limit) return limit;
      return requested;
    });
  };

  const currentPage = meta?.page || page;
  const currentPageSize = meta?.pageSize || pageSize;
  const totalRecords = meta?.total ?? historico.length;
  const totalPages = totalRecords ? Math.max(1, Math.ceil(totalRecords / currentPageSize)) : 1;
  const firstItemIndex = historico.length ? (currentPage - 1) * currentPageSize + 1 : 0;
  const lastItemIndex = historico.length ? firstItemIndex + historico.length - 1 : 0;

  const formatBadgeClass = (tipo) => {
    const normalized = tipo?.toLowerCase();
    if (normalized?.includes('compra')) return 'text-green-600 bg-green-100';
    if (normalized?.includes('reparo') || normalized?.includes('ordem')) return 'text-blue-600 bg-blue-100';
    if (normalized?.includes('garant')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatTipoLabel = (tipo) => TIPO_LABELS[tipo?.toLowerCase()] || (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : '-');

  const formatDateTime = (value) => (value ? new Date(value).toLocaleString('pt-BR') : '-');

  const formatDateOnly = (value) => (value ? new Date(value).toLocaleDateString('pt-BR') : null);

  const formatCliente = (entry) => {
    const id = entry?.cliente?.id;
    const nome = entry?.cliente?.nome;
    if (!id && !nome) return '-';
    if (id && nome) return `#${id} - ${nome}`;
    return id ? `#${id}` : nome;
  };

  const formatCelular = (entry) => {
    const celular = entry?.celular;
    if (!celular) return '-';
    const parts = [];
    if (celular.id) parts.push(`#${celular.id}`);
    if (celular.modelo) parts.push(celular.modelo);
    const imei = celular.imei ? ` (IMEI ${celular.imei})` : '';
    return `${parts.join(' - ')}${imei}`.trim();
  };

  const formatGarantiaResumo = (detalhes) => {
    const parts = [];
    if (detalhes?.tipo_garantia) parts.push(`Tipo: ${detalhes.tipo_garantia}`);
    if (detalhes?.prazo_dias) parts.push(`Prazo ${detalhes.prazo_dias} dias`);
    if (detalhes?.status) parts.push(`Status ${detalhes.status}`);
    const validade = detalhes?.data_fim || detalhes?.garantia_validade;
    const validadeFmt = formatDateOnly(validade);
    if (validadeFmt) parts.push(`Validade ${validadeFmt}`);
    return parts;
  };

  const formatPecasResumo = (pecas) => {
    if (!Array.isArray(pecas) || pecas.length === 0) return null;
    const tokens = pecas
      .map((peca) => {
        if (!peca) return null;
        const nome = peca.nome || (peca.id ? `Peça #${peca.id}` : null);
        const quantidade = typeof peca.quantidade === 'number' && peca.quantidade > 0 ? `x${peca.quantidade}` : null;
        if (!nome && !quantidade) return null;
        return [nome, quantidade].filter(Boolean).join(' ');
      })
      .filter(Boolean);
    if (tokens.length === 0) return null;
    return tokens.join(', ');
  };

  const formatDetalhes = (entry) => {
    const detalhes = entry?.detalhes;
    if (!detalhes) return '-';
    const parts = [];
    if (entry?.tipo === 'compra') {
      if (detalhes.valor_venda != null) parts.push(currencyFormatter.format(detalhes.valor_venda));
      if (detalhes.garantia_dias) parts.push(`Garantia ${detalhes.garantia_dias} dias`);
      const validade = formatDateOnly(detalhes.garantia_validade);
      if (validade) parts.push(`Validade ${validade}`);
    } else if (entry?.tipo === 'reparo') {
      if (detalhes.status) parts.push(`Status: ${detalhes.status}`);
      if (detalhes.descricao) parts.push(detalhes.descricao);
      if (detalhes.garantia_dias) parts.push(`Garantia ${detalhes.garantia_dias} dias`);
      const validade = formatDateOnly(detalhes.garantia_validade);
      if (validade) parts.push(`Validade ${validade}`);
      const pecasResumo = formatPecasResumo(detalhes.pecas);
      if (pecasResumo) parts.push(`Peças: ${pecasResumo}`);
    } else if (entry?.tipo === 'garantia') {
      parts.push(...formatGarantiaResumo(detalhes));
    }
    return parts.filter(Boolean).join(' • ') || '-';
  };

  return (
    <div className='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

        <Link to="/vendas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Vendas</Link>
        <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
        <Link to="/dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Manutenção</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
      </div>

      <h2 className="Clientes">Histórico</h2>
      <h2 className="gerencie-1">Histórico de clientes</h2>

      <div className='Gestao'>
        <h2 className="titulo">Histórico de Clientes</h2>
        <h2 className="gerencie-2">Registro de ações relacionadas aos clientes</h2>

        <div className="barra-acoes">
          <input
            type="text"
            placeholder="Buscar por ID do cliente..."
            className="campo-busca"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="acoes-direita">
            <select className="filtro-select" value={tipoFiltro} onChange={handleTipoChange} disabled={loading}>
              {TIPO_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button className="botao-primario" onClick={handleReload} disabled={loading} title="Atualizar lista">Atualizar</button>
          </div>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            {totalRecords
              ? `Mostrando ${firstItemIndex}-${lastItemIndex} de ${totalRecords} registros`
              : loading
                ? 'Carregando histórico...'
                : 'Nenhum registro encontrado.'}
          </div>
          <div className="pagination-controls">
            <label className="page-size-label">
              Itens por página
              <select value={currentPageSize} onChange={handlePageSizeChange} disabled={loading}>
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <button className="btn-secondary" onClick={() => goToPage(currentPage - 1)} disabled={loading || currentPage <= 1}>
              Anterior
            </button>
            <span className="pagination-status">Página {currentPage} de {totalPages}</span>
            <button className="btn-secondary" onClick={() => goToPage(currentPage + 1)} disabled={loading || currentPage >= totalPages}>
              Próxima
            </button>
          </div>
        </div>

        <div className="container-tabela" style={{ marginTop: 18 }}>
          <table className="tabela-historico">
            <thead>
              <tr>
                <th>Origem</th>
                <th>Data/Hora</th>
                <th>Cliente</th>
                <th>Celular</th>
                <th>Tipo</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={6} className="linha-erro">{error}</td>
                </tr>
              )}

              {loading && !error && (
                <tr>
                  <td colSpan={6}>Carregando histórico...</td>
                </tr>
              )}

              {!loading && !error && historico.length === 0 && (
                <tr>
                  <td colSpan={6}>Nenhum registro encontrado.</td>
                </tr>
              )}

              {!loading && !error && historico.map((item, index) => (
                <tr key={`${item.tipo || 'item'}-${item.origem_id ?? index}`}>
                  <td>{item.origem_id ?? '-'}</td>
                  <td>{formatDateTime(item.data_evento)}</td>
                  <td>{formatCliente(item)}</td>
                  <td>{formatCelular(item)}</td>
                  <td>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formatBadgeClass(item.tipo)}`}>
                      {formatTipoLabel(item.tipo)}
                    </span>
                  </td>
                  <td>{formatDetalhes(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function HistoricoCliente() {
  return (
    <div className="font-sans antialiased bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <HistoricoClientesTable />
      </div>
    </div>
  );
}

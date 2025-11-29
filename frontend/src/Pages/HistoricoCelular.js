import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HistoricoCelular.css';
import { celularesHistoricoApi } from '../services/api';

const EVENT_LABELS = {
    OrdemServicoCriada: 'OS aberta',
    OrdemServicoAtualizada: 'OS atualizada',
    OrdemServicoConcluida: 'OS concluída',
    OrdemServicoPecaRegistrada: 'Peças registradas',
    GarantiaRegistrada: 'Garantia registrada',
    GarantiaAlerta: 'Alerta de garantia',
    TesteTecnicoRegistrado: 'Teste técnico',
    CelularCadastrado: 'Entrada no estoque',
    CelularVendido: 'Venda registrada',
};

const EVENT_COLORS = {
    OrdemServicoCriada: 'text-indigo-600 bg-indigo-100',
    OrdemServicoAtualizada: 'text-blue-600 bg-blue-100',
    OrdemServicoConcluida: 'text-green-600 bg-green-100',
    OrdemServicoPecaRegistrada: 'text-yellow-600 bg-yellow-100',
    GarantiaRegistrada: 'text-purple-600 bg-purple-100',
    GarantiaAlerta: 'text-red-600 bg-red-100',
    TesteTecnicoRegistrado: 'text-gray-700 bg-gray-200',
    CelularCadastrado: 'text-emerald-700 bg-emerald-100',
    CelularVendido: 'text-orange-700 bg-orange-100',
};

const KEYWORD_EVENT = {
    abertura: 'OrdemServicoCriada',
    aberta: 'OrdemServicoCriada',
    concluida: 'OrdemServicoConcluida',
    concluída: 'OrdemServicoConcluida',
    finalizada: 'OrdemServicoConcluida',
    garantia: 'GarantiaRegistrada',
    alerta: 'GarantiaAlerta',
    teste: 'TesteTecnicoRegistrado',
    entrada: 'CelularCadastrado',
    cadastro: 'CelularCadastrado',
    estoque: 'CelularCadastrado',
    venda: 'CelularVendido',
    vendido: 'CelularVendido',
};

const HistoricoCelularesTable = () => {
    const [historico, setHistorico] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [reloadKey, setReloadKey] = useState(0);
    const [eventFilter, setEventFilter] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [search, eventFilter]);

    const { filters } = useMemo(() => {
        const base = { page, pageSize };
        if (eventFilter) {
            base.tipo_evento = eventFilter;
        }
        const trimmed = search.trim();
        if (trimmed) {
            const osMatch = trimmed.match(/os\s*#?(\d+)/i);
            if (osMatch) {
                base.ordem_servico_id = Number(osMatch[1]);
                return { filters: base };
            }
            const celularMatch = trimmed.match(/(?:celular|id)\s*#?(\d+)/i);
            if (celularMatch) {
                base.celular_id = Number(celularMatch[1]);
                return { filters: base };
            }
            const numericMatch = trimmed.match(/^#?(\d+)$/);
            if (numericMatch) {
                base.celular_id = Number(numericMatch[1]);
                return { filters: base };
            }
            if (!eventFilter) {
                const keyword = Object.keys(KEYWORD_EVENT).find((key) => trimmed.toLowerCase().includes(key));
                if (keyword) {
                    base.tipo_evento = KEYWORD_EVENT[keyword];
                } else {
                    base.q = trimmed;
                }
            } else {
                base.q = trimmed;
            }
        }
        return { filters: base };
    }, [page, pageSize, search, eventFilter]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        celularesHistoricoApi
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
                setError(err.message || 'Não foi possível carregar o histórico de celulares.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [filters, reloadKey]);

    const handleReload = () => {
        setReloadKey((prev) => prev + 1);
    };

    const handlePageSizeChange = (event) => {
        const value = Number(event.target.value);
        setPageSize(value);
        setPage(1);
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

    const formatEvento = (tipoEvento) => EVENT_LABELS[tipoEvento] || tipoEvento || '-';

    const getEventoColor = (tipoEvento) => EVENT_COLORS[tipoEvento] || 'text-gray-600 bg-gray-100';

    const formatDescricao = (descricao) => descricao || '-';

    const formatCelular = (entry) => {
        if (!entry?.celular) return '-';
        const { id, modelo, imei } = entry.celular;
        const parts = [];
        if (modelo) parts.push(modelo);
        if (id) parts.push(`ID ${id}`);
        if (imei) parts.push(`IMEI ${imei}`);
        return parts.join(' • ');
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
                <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Manutenção</Link>
                <div className='BotoesNavegacao'>Relatórios</div>
            </div>

            <h2 className="Clientes">Histórico</h2>
            <h2 className="gerencie-1">Histórico de movimentações</h2>

            <div className='Gestao'>
                <h2 className="titulo">Histórico de Celulares</h2>
                <h2 className="gerencie-2">Registro de todas as movimentações de aparelhos</h2>

                <div className="barra-acoes">
                    <input
                        type="text"
                        placeholder="Busque por ID do celular, OS ou palavra-chave (ex: venda)"
                        className="campo-busca"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />

                    <select
                        className="select-evento"
                        value={eventFilter}
                        onChange={(event) => setEventFilter(event.target.value)}
                    >
                        <option value="">Todos os eventos</option>
                        {Object.entries(EVENT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>

                    <button className="botao-primario" onClick={handleReload} disabled={loading} title="Atualizar lista">
                        Atualizar
                    </button>
                </div>

                <div className="pagination-bar">
                    <div className="pagination-info">
                        {totalRecords
                            ? `Mostrando ${firstItemIndex}-${lastItemIndex} de ${totalRecords} movimentações`
                            : 'Nenhuma movimentação encontrada.'}
                    </div>
                    <div className="pagination-controls">
                        <label className="page-size-label">
                            Itens por página
                            <select value={pageSize} onChange={handlePageSizeChange} disabled={loading}>
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
                                <th>ID Hist.</th>
                                <th>Data/Hora</th>
                                <th>Celular</th>
                                <th>Evento</th>
                                <th>OS</th>
                                <th>Descrição</th>
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
                                    <td colSpan={6}>Carregando Histórico...</td>
                                </tr>
                            )}

                            {!loading && !error && historico.length === 0 && (
                                <tr>
                                    <td colSpan={6}>Nenhum evento encontrado.</td>
                                </tr>
                            )}

                            {!loading && !error && historico.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.data_evento ? new Date(item.data_evento).toLocaleString('pt-BR') : '-'}</td>
                                    <td>{formatCelular(item)}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventoColor(item.tipo_evento)}`}>
                                            {formatEvento(item.tipo_evento)}
                                        </span>
                                    </td>
                                    <td>{item.ordem_servico?.id ?? '-'}</td>
                                    <td>{formatDescricao(item.descricao)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// =========================================================
// COMPONENTE PRINCIPAL (App) - Apenas renderiza a tabela isolada
// =========================================================
export default function HistoricoCelular() {
    return (
        <div className="font-sans antialiased bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <HistoricoCelularesTable />
            </div>
        </div>
    );
}
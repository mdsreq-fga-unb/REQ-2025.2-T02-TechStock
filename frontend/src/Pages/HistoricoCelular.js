import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HistoricoCelular.css';
import { movimentacoesEstoqueApi } from '../services/api';

const OPERACAO_LABELS = {
    COMPRA: 'Entrada em Estoque',
    VENDA: 'Venda',
    DEVOLUCAO: 'Devolução/Estoque',
    CONSERTO: 'Conserto / Manutenção',
};

const OPERACAO_KEYWORDS = {
    venda: 'VENDA',
    vendido: 'VENDA',
    compra: 'COMPRA',
    entrada: 'COMPRA',
    devolucao: 'DEVOLUCAO',
    devolução: 'DEVOLUCAO',
    retorno: 'DEVOLUCAO',
    conserto: 'CONSERTO',
    reparo: 'CONSERTO',
};

const STATUS_COLOR = {
    COMPRA: 'text-green-600 bg-green-100',
    VENDA: 'text-red-600 bg-red-100',
    DEVOLUCAO: 'text-blue-600 bg-blue-100',
    CONSERTO: 'text-yellow-600 bg-yellow-100',
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

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const { filters } = useMemo(() => {
        const base = { page, pageSize, tipo_item: 'CELULAR' };
        const trimmed = search.trim();
        if (trimmed) {
            if (/^\d+$/.test(trimmed)) {
                base.celular_id = Number(trimmed);
            } else {
                const normalized = trimmed.toLowerCase();
                const matchKey = Object.keys(OPERACAO_KEYWORDS).find((key) => normalized.includes(key));
                if (matchKey) {
                    base.tipo_operacao = OPERACAO_KEYWORDS[matchKey];
                }
            }
        }
        return { filters: base };
    }, [page, pageSize, search]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        movimentacoesEstoqueApi
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

    const formatTipoMovimentacao = (tipoOperacao) => OPERACAO_LABELS[tipoOperacao] || tipoOperacao || '-';

    const getStatusColor = (tipoOperacao) => STATUS_COLOR[tipoOperacao] || 'text-gray-600 bg-gray-100';

    const formatDetalhes = (item) => {
        const detalhes = [];
        if (item.quantidade != null) detalhes.push(`Qtd: ${item.quantidade}`);
        if (item.saldo_resultante != null) detalhes.push(`Saldo: ${item.saldo_resultante}`);
        if (item.observacoes) detalhes.push(item.observacoes);
        return detalhes.join(' • ') || '-';
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
                        placeholder="Busque por ID do celular ou tipo (ex: venda, devolução)"
                        className="campo-busca"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />

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
                                <th>ID Mov.</th>
                                <th>Data/Hora</th>
                                <th>ID Celular</th>
                                <th>Modelo</th>
                                <th>Tipo Movimentação</th>
                                <th>Usuário Resp.</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {error && (
                                <tr>
                                    <td colSpan={7} className="linha-erro">{error}</td>
                                </tr>
                            )}

                            {loading && !error && (
                                <tr>
                                    <td colSpan={7}>Carregando Histórico...</td>
                                </tr>
                            )}

                            {!loading && !error && historico.length === 0 && (
                                <tr>
                                    <td colSpan={7}>Nenhuma movimentação histórica encontrada.</td>
                                </tr>
                            )}

                            {!loading && !error && historico.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.data_movimentacao ? new Date(item.data_movimentacao).toLocaleString('pt-BR') : '-'}</td>
                                    <td>{item.celular?.id ?? '-'}</td>
                                    <td>{item.celular?.modelo ?? '-'}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.tipo_operacao)}`}>
                                            {formatTipoMovimentacao(item.tipo_operacao)}
                                        </span>
                                    </td>
                                    <td>{item.usuario?.nome ?? '-'}</td>
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
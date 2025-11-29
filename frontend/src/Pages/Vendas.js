import React, { useState, useEffect } from 'react';
import '../styles/vendas.css';
import { Link, useNavigate } from 'react-router-dom';
import { vendasApi } from '../services/api';

function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const filters = { page, pageSize };
    if (search) filters.q = search;
    vendasApi
      .list(filters)
      .then((data) => {
        if (!active) return;
        setVendas(data?.items || []);
        const nextMeta = data?.meta || {
          page,
          pageSize,
          total: (data?.items || []).length,
        };
        setMeta({
          page: nextMeta.page || page,
          pageSize: nextMeta.pageSize || pageSize,
          total: typeof nextMeta.total === 'number' ? nextMeta.total : (data?.items || []).length,
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
        setError(err.message || 'Não foi possível carregar as vendas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, page, pageSize, reloadKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover esta venda?')) return;
    try {
      await vendasApi.remove(id);
      let removedLastItem = false;
      setVendas((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        removedLastItem = prev.length === 1 && page > 1;
        return updated;
      });
      setMeta((prev) => ({
        page: prev.page,
        pageSize: prev.pageSize,
        total: Math.max(0, (prev.total || 0) - 1),
      }));
      if (removedLastItem) {
        setPage((current) => Math.max(1, current - 1));
      }
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Erro ao remover venda.');
    }
  };

  const handleEdit = (id) => {
    navigate('/vendas/novo', { state: { editId: id } });
  };

  const handlePageSizeChange = (event) => {
    const value = Number(event.target.value);
    setPageSize(value);
    setPage(1);
  };

  const goToPage = (targetPage) => {
    setPage(() => {
      const requested = Number(targetPage) || 1;
      const totalRecordsValue = meta?.total || 0;
      const limit = totalRecordsValue ? Math.ceil(totalRecordsValue / (meta?.pageSize || pageSize)) : 1;
      if (requested < 1) return 1;
      if (requested > limit) return limit;
      return requested;
    });
  };

  const currentPage = meta?.page || page;
  const totalRecords = meta?.total ?? vendas.length;
  const totalPages = totalRecords ? Math.max(1, Math.ceil(totalRecords / pageSize)) : 1;
  const firstItemIndex = vendas.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItemIndex = vendas.length ? firstItemIndex + vendas.length - 1 : 0;


 
  return (
    <div className ='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>
                <Link to="/vendas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Vendas</Link>
                <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
                <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
                <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celulares</Link>
                <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
                <div className='BotoesNavegacao'>Fornecedores</div>
                <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
                <div className='BotoesNavegacao'>Relatórios</div>
                <Link to="/" style={{ textDecoration: 'none' }} className='BotaoLogout'>Sair</Link> 
          </div>


      <h2 className="Clientes">Vendas</h2>
      <h2 className="gerencie-1">Gestão de Vendas</h2> 

      <div className='Gestao' > 
        <h2 className="title">Registro e Controle de Vendas</h2>
        <h2 className="gerencie-2">Gerencie todas as Vendas</h2> 

        <div className="actions-bar">
                   <input
                     type="text"
                     placeholder="Buscar vendas..."
                     className="search-input"
                     value={searchInput}
                     onChange={(event) => setSearchInput(event.target.value)}
                   /> 
                   

                   <button className="btn-primary" onClick={() => navigate("/novavenda")}>
                     + Novas Vendas
                   </button>

                   <button
                     className="btn-primary"
                     onClick={() => navigate("/movimentacoes")}
                   >
                     + Movimentações
                   </button>
                     <button
                     className="btn-primary"
                     onClick={() => navigate("/estoque")}
                   >
                     + Estoque
                   </button>
              </div>

          <div className="pagination-bar">
            <div className="pagination-info">
              {totalRecords
                ? `Mostrando ${firstItemIndex}-${lastItemIndex} de ${totalRecords} registros`
                : 'Nenhuma venda cadastrada.'}
            </div>
            <div className="pagination-controls">
              <label className="page-size-label">
                Itens por página
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  disabled={loading}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn-secondary"
                onClick={() => goToPage(currentPage - 1)}
                disabled={loading || currentPage <= 1}
              >
                Anterior
              </button>
              <span className="pagination-status">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => goToPage(currentPage + 1)}
                disabled={loading || currentPage >= totalPages}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>Data de cadastro</th>
            <th>celular</th>
            <th>cliente</th>
            <th>Valor de Compra</th>
            <th>Garantia padrão (dias)</th>
            <th>Garantia validade</th>
            <th> Observaçoes</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={11} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={11}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && vendas.length === 0 && (
            <tr>
              <td colSpan={11}>Nenhuma venda encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            vendas.map((item) => (
              <tr key={item.id}>
                <td>{item.data_venda ? new Date(item.data_venda).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{item.celular?.modelo || '-'}</td>
                <td>{item.cliente?.nome || '-'}</td>
                <td>{item.valor_venda != null ? `R$ ${Number(item.valor_venda).toFixed(2).replace('.', ',')}` : '-'}</td>
                <td>{item.garantia_dias ?? '-'}</td>
                <td>{item.garantia_validade ? new Date(item.garantia_validade).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{item.observacoes || '-'}</td>
                <td className="actions">
                  <span onClick={() => handleEdit(item.id)}>✏️</span>
                  <span onClick={() => handleDelete(item.id)}>🗑️</span>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
}

export default Vendas;
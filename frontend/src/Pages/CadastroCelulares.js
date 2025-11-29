import React, { useState, useEffect } from 'react';
import '../styles/CadastroCelulares.css';
import { Link, useNavigate } from 'react-router-dom';
import { celularesApi } from '../services/api';
import LogoutButton from '../components/LogoutButton';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os estados' },
  { value: 'EmEstoque', label: 'Em estoque' },
  { value: 'Vendido', label: 'Vendido' },
  { value: 'EmReparo', label: 'Em reparo' },
  { value: 'Descartado', label: 'Descartado' },
];

const FINALIDADE_OPTIONS = [
  { value: '', label: 'Todas as finalidades' },
  { value: 'REVENDA', label: 'Revenda' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
];

function CadastroCelulares() {
  const navigate = useNavigate();
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [debouncedSupplier, setDebouncedSupplier] = useState('');
  const [idInput, setIdInput] = useState('');
  const [debouncedId, setDebouncedId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [finalidadeFilter, setFinalidadeFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSupplier(supplierInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [supplierInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = idInput.trim();
      setDebouncedId(trimmed && Number(trimmed) > 0 ? trimmed : '');
    }, 300);
    return () => clearTimeout(timer);
  }, [idInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const params = {};
    if (search) params.q = search;
    if (debouncedSupplier) params.fornecedor = debouncedSupplier;
    if (statusFilter) params.status = statusFilter;
    if (finalidadeFilter) params.finalidade = finalidadeFilter;
    if (debouncedId) {
      const parsed = Number(debouncedId);
      if (!Number.isNaN(parsed)) params.id = parsed;
    }

    celularesApi
      .list(params)
      .then((data) => {
        if (!active) return;
        setCelulares(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar os celulares.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, debouncedSupplier, debouncedId, statusFilter, finalidadeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover este aparelho?')) return;
    try {
      await celularesApi.remove(id);
      setCelulares((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover celular.');
    }
  };

  const handleEdit = (id) => {
    navigate('/celulares/novo', { state: { editId: id } });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSupplierInput('');
    setIdInput('');
    setStatusFilter('');
    setFinalidadeFilter('');
  };
 
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
          <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celualres</Link>
          <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
          <div className='BotoesNavegacao'>Fornecedores</div>
          <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
          <div className='BotoesNavegacao'>Relatórios</div>
          <LogoutButton className='BotaoLogout' /> 
          </div>
        


      <h2 className="Clientes">Celulares</h2>
      <h2 className="gerencie-1">Gestão de celulares</h2> 

      <div className='Gestao' > 
        <h2 className="title">Registro e Controle de Celulares</h2>
        <h2 className="gerencie-2">Gerencie todos os Celulares</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar por modelo, IMEI..."
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <div className="actions-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate('/historicocelular')}
              title="Ver histórico de movimentações"
            >
              + Histórico de Celulares
            </button>
            <button className="btn-primary" onClick={() => navigate('/celulares/novo')}>
              + Novo Celular
            </button>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-field">
            <label htmlFor="filter-id">ID</label>
            <input
              id="filter-id"
              type="number"
              min="1"
              placeholder="Ex: 102"
              value={idInput}
              onChange={(event) => setIdInput(event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="filter-fornecedor">Fornecedor</label>
            <input
              id="filter-fornecedor"
              type="text"
              placeholder="Nome do fornecedor"
              value={supplierInput}
              onChange={(event) => setSupplierInput(event.target.value)}
            />
          </div>
          <div className="filter-field">
            <label htmlFor="filter-status">Estado</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="filter-finalidade">Finalidade</label>
            <select
              id="filter-finalidade"
              value={finalidadeFilter}
              onChange={(event) => setFinalidadeFilter(event.target.value)}
            >
              {FINALIDADE_OPTIONS.map((option) => (
                <option key={option.value || 'all-finalidade'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-outline" onClick={handleClearFilters}>
            Limpar filtros
          </button>
        </div>
      </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Modelo</th>
            <th>Fornecedor</th>
            <th>Data de cadastro</th>
            <th>IMEI</th>
            <th>Cor</th>
            <th>Capacidade</th>
            <th>Status</th>
            <th>Finalidade</th>
            <th>Valor de Compra</th>
            <th>Garantia padrão (dias)</th>
            <th>Defeitos Identificados</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={13} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={13}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && celulares.length === 0 && (
            <tr>
              <td colSpan={13}>Nenhum aparelho encontrado.</td>
            </tr>
          )}
          {!loading && !error &&
            celulares.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.modelo}</td>
                <td>{item.nome_fornecedor || '-'}</td>
                <td>
                  {item.data_cadastro
                    ? new Date(item.data_cadastro).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{item.imei}</td>
                <td>{item.cor || '-'}</td>
                <td>{item.capacidade || '-'}</td>
                <td>{item.status}</td>
                <td>{item.finalidade === 'MANUTENCAO' ? 'Manutenção' : 'Revenda'}</td>
                <td>
                  {item.valor_compra
                    ? `R$ ${Number(item.valor_compra).toFixed(2).replace('.', ',')}`
                    : '-'}
                </td>
                <td>{item.garantia_padrao_dias ?? '-'}</td>
                <td>{item.defeitos_identificados || '-'}</td>
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

export default CadastroCelulares;



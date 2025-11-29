
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, Wrench, TrendingUp } from 'lucide-react';
import '../styles/OrdemDeServiço.css';
import { dashboardsApi, ordensServicoApi } from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluídas' },
];

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

const OrdensServico = () => {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [metricas, setMetricas] = useState([]);
  const [metricasLoading, setMetricasLoading] = useState(true);
  useEffect(() => {
    let active = true;
    dashboardsApi
      .getResumo()
      .then((payload) => {
        if (!active) return;
        setMetricas(payload?.metricas || []);
      })
      .catch(() => {
        if (!active) return;
        setMetricas([]);
      })
      .finally(() => {
        if (active) setMetricasLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    ordensServicoApi
      .list({ q: search || undefined, status: statusFilter || undefined, pageSize: 50 })
      .then((data) => {
        if (!active) return;
        setOrdens(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar as ordens de serviço.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, statusFilter]);

  const handleEdit = (id) => {
    navigate('/novaOS', { state: { editId: id } });
  };

  const handleToggleStatus = async (ordem) => {
    const nextStatus = ordem.status === 'EmAndamento' ? 'Concluido' : 'EmAndamento';
    const confirmMessage =
      nextStatus === 'Concluido'
        ? 'Deseja marcar esta ordem como concluída?'
        : 'Deseja reabrir esta ordem?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await ordensServicoApi.update(ordem.id, {
        status: nextStatus,
        data_conclusao: nextStatus === 'Concluido' ? new Date().toISOString() : undefined,
      });
      setOrdens((prev) => prev.map((item) => (item.id === ordem.id ? { ...item, status: nextStatus } : item)));
    } catch (err) {
      alert(err.message || 'Não foi possível atualizar a ordem.');
    }
  };

  const handleDelete = async (ordem) => {
    const confirmMessage = `Excluir a OS #${ordem.id}? Essa ação não pode ser desfeita.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await ordensServicoApi.remove(ordem.id);
      setOrdens((prev) => prev.filter((item) => item.id !== ordem.id));
    } catch (err) {
      alert(err.message || 'Não foi possível excluir a ordem.');
    }
  };

  const renderIcone = (nome) => {
    switch(nome) {
      case 'package': return <Package size={24} color="white" />;
      case 'users': return <Users size={24} color="white" />;
      case 'wrench': return <Wrench size={24} color="white" />;
      case 'trending-up': return <TrendingUp size={24} color="white" />;
      default: return <Package size={24} color="white" />;
    }
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
        <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celulares</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotaoLogout'>Sair</Link> 
        </div>
        

      <div className='ConteudoDashboard'>
        <div className='GradeMetricas'>
          {metricas.map((metrica) => (
            <div key={metrica.id} className='CartaoMetrica'>
              <div className='CabecalhoCartao'>
                <span>{metrica.titulo}</span>
                <div className='IconeFundoRoxo'>{renderIcone(metrica.icone)}</div>
              </div>
              <div className='ValorGrande'>{metrica.valor}</div>
              <div className={`TextoCrescimento ${metrica.status}`}>
                {metrica.crescimeto || metrica.crescimento || ''} <span className='TextoCinza'>em relação ao mês anterior</span>
              </div>
            </div>
          ))}
          {!metricasLoading && !metricas.length && (
            <div className='CartaoMetrica'>Indicadores indisponíveis.</div>
          )}
        </div>
      </div>

      <div className='Gestao' >
        <h2 className="title">Lista de Ordens de Serviço</h2>
        <h2 className="gerencie-2">Gerencie todas as ordens</h2>

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar por descrição ou observações..."
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <select
            className="search-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn-primary" onClick={() => navigate("/novaOS")}>+ Nova OS</button>
          <button className="btn-secondary-os" onClick={() => navigate("/testesordemservico")}>Testes OS</button>
        </div>
      </div>

      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Celular</th>
            <th>Data de abertura</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Garantia (dias)</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={8} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={8}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && ordens.length === 0 && (
            <tr>
              <td colSpan={8}>Nenhuma ordem encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            ordens.map((ordem) => (
              <tr key={ordem.id}>
                <td>{ordem.id}</td>
                <td>{ordem.cliente?.nome || '-'}</td>
                <td>{ordem.celular?.modelo || '-'}</td>
                <td>{formatDate(ordem.data_abertura)}</td>
                <td>{ordem.descricao || '-'}</td>
                <td>{ordem.status === 'Concluido' ? 'Concluída' : 'Em andamento'}</td>
                <td>{ordem.garantia_dias ?? '-'}</td>
                <td className="actions">
                  <span title="Editar" onClick={() => handleEdit(ordem.id)}>✏️</span>
                  <span
                    title={ordem.status === 'EmAndamento' ? 'Concluir ordem' : 'Reabrir ordem'}
                    onClick={() => handleToggleStatus(ordem)}
                  >
                    {ordem.status === 'EmAndamento' ? '✅' : '↩️'}
                  </span>
                  <span title="Excluir" onClick={() => handleDelete(ordem)}>🗑️</span>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
}
export default OrdensServico;
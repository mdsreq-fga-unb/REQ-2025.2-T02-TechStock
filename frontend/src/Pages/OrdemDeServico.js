
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, Wrench, TrendingUp } from 'lucide-react';
import '../styles/OrdemDeServiço.css';
import { dashboardsApi, ordensServicoApi } from '../services/api';
import LogoutButton from '../components/LogoutButton';
import { INPUT_LIMITS } from '../constants/inputLimits';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluídas' },
];

const getTodayInputValue = () => new Date().toISOString().split('T')[0];

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}

const DEFAULT_GARANTIA_DIAS = 90;

const buildIsoDateAtNoon = (dateOnly) => {
  if (!dateOnly) return null;
  return new Date(`${dateOnly}T12:00:00`).toISOString();
};

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
  const [concludeModalOpen, setConcludeModalOpen] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState(null);
  const [concludeDate, setConcludeDate] = useState('');
  const [concludeGarantia, setConcludeGarantia] = useState(String(DEFAULT_GARANTIA_DIAS));
  const [concludeError, setConcludeError] = useState('');
  const [concludeSaving, setConcludeSaving] = useState(false);
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

  const openConcludeModal = (ordem) => {
    setOrdemSelecionada(ordem);
    setConcludeDate(getTodayInputValue());
    setConcludeGarantia(
      ordem.garantia_dias != null ? String(ordem.garantia_dias) : String(DEFAULT_GARANTIA_DIAS)
    );
    setConcludeError('');
    setConcludeModalOpen(true);
  };

  const closeConcludeModal = () => {
    setConcludeModalOpen(false);
    setOrdemSelecionada(null);
    setConcludeError('');
    setConcludeSaving(false);
    setConcludeGarantia(String(DEFAULT_GARANTIA_DIAS));
  };

  const handleConfirmConclude = async () => {
    if (!ordemSelecionada) return;
    if (!concludeDate) {
      setConcludeError('Informe a data de conclusão.');
      return;
    }

    const garantiaValue = concludeGarantia.trim();
    let parsedGarantia;
    if (garantiaValue !== '') {
      parsedGarantia = Number(garantiaValue);
      if (Number.isNaN(parsedGarantia)) {
        setConcludeError('Informe um número válido para a garantia.');
        return;
      }
      if (parsedGarantia < 0) {
        setConcludeError('A garantia deve ser maior ou igual a zero.');
        return;
      }
    }

    setConcludeSaving(true);
    try {
      const payload = {
        status: 'Concluido',
        data_conclusao: buildIsoDateAtNoon(concludeDate),
      };
      if (garantiaValue !== '') {
        payload.garantia_dias = parsedGarantia;
      }
      const updated = await ordensServicoApi.update(ordemSelecionada.id, payload);
      setOrdens((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      closeConcludeModal();
    } catch (err) {
      setConcludeError(err.message || 'Não foi possível concluir a ordem.');
    } finally {
      setConcludeSaving(false);
    }
  };

  const handleReopen = async (ordem) => {
    const confirmMessage = 'Deseja reabrir esta ordem?';
    if (!window.confirm(confirmMessage)) return;
    try {
      const updated = await ordensServicoApi.update(ordem.id, { status: 'EmAndamento' });
      setOrdens((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      alert(err.message || 'Não foi possível reabrir a ordem.');
    }
  };

  const handleToggleStatus = (ordem) => {
    if (ordem.status === 'EmAndamento') {
      openConcludeModal(ordem);
    } else {
      handleReopen(ordem);
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
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
        <LogoutButton className='BotaoLogout' /> 
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
            maxLength={INPUT_LIMITS.SEARCH}
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
            <th>Data de conclusão</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Garantia (dias)</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={9} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={9}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && ordens.length === 0 && (
            <tr>
              <td colSpan={9}>Nenhuma ordem encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            ordens.map((ordem) => (
              <tr key={ordem.id}>
                <td>{ordem.id}</td>
                <td>{ordem.cliente?.nome || '-'}</td>
                <td>{ordem.celular?.modelo || '-'}</td>
                <td>{formatDate(ordem.data_abertura)}</td>
                <td>{formatDate(ordem.data_conclusao)}</td>
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

      {concludeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Concluir OS #{ordemSelecionada?.id}</h3>
            <p>Informe a data de conclusão e, se desejar, o prazo de garantia.</p>
            <label>Data de conclusão</label>
            <div className="modal-input-row">
              <input
                type="date"
                value={concludeDate}
                onChange={(event) => setConcludeDate(event.target.value)}
              />
              <button type="button" onClick={() => setConcludeDate(getTodayInputValue())}>
                Hoje
              </button>
            </div>

            <label>Garantia (dias)</label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 90"
              value={concludeGarantia}
              onChange={(event) => setConcludeGarantia(event.target.value)}
            />
            {concludeError && <div className="modal-error">{concludeError}</div>}

            <div className="modal-actions">
              <button className="btn-secondary" type="button" onClick={closeConcludeModal} disabled={concludeSaving}>
                Cancelar
              </button>
              <button className="btn-primary" type="button" onClick={handleConfirmConclude} disabled={concludeSaving}>
                {concludeSaving ? 'Salvando...' : 'Concluir' }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default OrdensServico;
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordensServicoApi, ordensServicoTestesApi } from '../services/api';
import { INPUT_LIMITS } from '../constants/inputLimits';

const TEST_CRITERIA = [
  { key: 'tela_touch', label: 'Tela / Touch' },
  { key: 'bateria_carregamento', label: 'Bateria / Carregamento' },
  { key: 'camera_traseira', label: 'Câmera Traseira' },
  { key: 'camera_frontal', label: 'Câmera Frontal' },
  { key: 'microfone', label: 'Microfone' },
  { key: 'alto_falante', label: 'Alto-falante' },
  { key: 'conectividade', label: 'Wi-Fi / Bluetooth' },
  { key: 'botoes_fisicos', label: 'Botões Físicos' },
  { key: 'sensores', label: 'Sensores (Proximidade/Luz)' },
];

const RESULT_OPTIONS = [
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'NAO_TESTADO', label: 'Não testado' },
];

const TEST_STAGE_OPTIONS = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'INTERMEDIARIA', label: 'Intermediária' },
  { value: 'FINAL', label: 'Final' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluídas' },
  { value: 'Todos', label: 'Todas' },
];

const buildInitialResults = () => TEST_CRITERIA.reduce((acc, criterio) => {
  acc[criterio.key] = 'NAO_TESTADO';
  return acc;
}, {});

const styles = {
  container: { maxWidth: '720px', margin: '2rem auto', fontFamily: 'Poppins, Arial, sans-serif' },
  card: { border: '1px solid #e0e0e0', padding: '1.25rem', borderRadius: '12px', background: '#fff' },
  list: { listStyle: 'none', padding: 0, marginTop: '0.75rem', maxHeight: '260px', overflowY: 'auto' },
  listItem: { padding: '12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  buttonPrimary: {
    marginTop: '20px', width: '100%', padding: '12px', background: '#5C2D91', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer',
  },
  buttonLink: { background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', textDecoration: 'underline' },
  successCard: {
    padding: '2rem', textAlign: 'center', background: '#d4edda', color: '#155724', borderRadius: '12px',
    border: '1px solid #a3d5a1',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #5C2D91',
    background: '#fff',
    color: '#5C2D91',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('pt-BR') : '-');

const TesteCelulares = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('EmAndamento');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [testResults, setTestResults] = useState(() => buildInitialResults());
  const [observations, setObservations] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testStage, setTestStage] = useState('FINAL');
  const [testError, setTestError] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;
    setLoadingOrders(true);
    setOrdersError('');

    const params = { pageSize: 10 };
    if (statusFilter !== 'Todos') {
      params.status = statusFilter;
    }
    if (debouncedSearch) params.q = debouncedSearch;

    ordensServicoApi
      .list(params)
      .then((data) => {
        if (!active) return;
        setOrders(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setOrdersError(err.message || 'Não foi possível carregar as ordens de serviço.');
      })
      .finally(() => {
        if (active) setLoadingOrders(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, reloadKey, statusFilter]);

  const resetSelection = () => {
    setSelectedOrder(null);
    setTestResults(buildInitialResults());
    setObservations('');
    setSubmitted(false);
    setSubmitError('');
    setHistory(null);
    setHistoryError('');
    setSearchTerm('');
    setDebouncedSearch('');
    setTestStage('FINAL');
    setTestError('');
    setLastResult(null);
  };

  const loadHistory = (ordemId) => {
    setHistory(null);
    setHistoryError('');
    setHistoryLoading(true);
    ordensServicoTestesApi
      .listByOrdem(ordemId, { pageSize: 10 })
      .then((data) => {
        setHistory(data?.items || []);
      })
      .catch((err) => {
        setHistoryError(err.message || 'Não foi possível obter o último teste.');
      })
      .finally(() => setHistoryLoading(false));
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setTestResults(buildInitialResults());
    setObservations('');
    setSubmitted(false);
    setSubmitError('');
    setTestStage('FINAL');
    setLastResult(null);
    loadHistory(order.id);
  };

  const handleResultChange = (key, value) => {
    setTestResults((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;
    const algumCriterioRegistrado = Object.values(testResults).some((value) => value !== 'NAO_TESTADO');
    if (!algumCriterioRegistrado) {
      setTestError('Informe o resultado de ao menos um critério.');
      return;
    }
    setSubmitError('');
    setTestError('');
    setSubmitting(true);
    try {
      const criteriosPayload = TEST_CRITERIA.map(({ label, key }) => ({ nome: label, status: testResults[key] || 'NAO_TESTADO' }));
      const payload = {
        criterios: criteriosPayload,
        observacoes: observations,
        etapa: testStage,
      };
      const response = await ordensServicoTestesApi.create(selectedOrder.id, payload);
      setSubmitted(true);
      setLastResult(response);
      loadHistory(selectedOrder.id);
    } catch (err) {
      setSubmitError(err.message || 'Não foi possível registrar o teste.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderedOrders = useMemo(() => orders, [orders]);

  const renderSearchCard = () => (
    <div style={styles.card}>
      <label htmlFor="busca">Buscar Aparelho (Modelo, IMEI ou Cliente)</label>
      <input
        id="busca"
        type="text"
        placeholder="Ex: iPhone, 123456..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #d4d4d4' }}
        maxLength={INPUT_LIMITS.SEARCH}
      />
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 220px' }}>
          <label htmlFor="statusFilter" style={{ fontSize: '0.85rem', color: '#4b5563' }}>Filtrar por status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginTop: '4px', padding: '8px', borderRadius: '8px', border: '1px solid #d4d4d4' }}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1 1 160px' }}>
          <small style={{ color: '#6b7280' }}>
            {statusFilter === 'Todos' ? 'Mostrando OS em qualquer status.' : `Mostrando apenas status: ${statusFilter}.`}
          </small>
          <button type="button" onClick={() => setReloadKey((prev) => prev + 1)} style={{ border: 'none', background: 'transparent', color: '#5C2D91', cursor: 'pointer', marginTop: '4px' }}>
            Atualizar
          </button>
        </div>
      </div>
      <ul style={styles.list}>
        {ordersError && <li style={{ padding: '12px', color: '#b91c1c' }}>{ordersError}</li>}
        {loadingOrders && !ordersError && <li style={{ padding: '12px' }}>Carregando ordens...</li>}
        {!loadingOrders && !ordersError && renderedOrders.length === 0 && (
          <li style={{ padding: '12px' }}>Nenhuma ordem disponível para testes.</li>
        )}
        {!loadingOrders && !ordersError && renderedOrders.map((order) => (
          <li
            key={order.id}
            onClick={() => handleSelectOrder(order)}
            style={{
              ...styles.listItem,
              background: '#f9f9f9',
            }}
          >
            <strong>OS #{order.id} · {order.celular?.modelo || 'Sem modelo'}</strong>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              IMEI: {order.celular?.imei || '-'} · Cliente: {order.cliente?.nome || '-'} · Status: {order.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderHistory = () => {
    if (historyLoading) {
      return <p style={{ color: '#6b7280' }}>Carregando último teste...</p>;
    }
    if (historyError) {
      return <p style={{ color: '#b91c1c' }}>{historyError}</p>;
    }
    if (!history || history.length === 0) return null;
    return (
      <div style={{ background: '#F3EAFF', padding: '12px', borderRadius: '10px', marginTop: '12px' }}>
        <strong>Histórico de testes ({history.length})</strong>
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', maxHeight: '240px', overflowY: 'auto' }}>
          {history.map((item) => (
            <li key={item.id} style={{ borderBottom: '1px solid #e9d8fd', padding: '8px 0' }}>
              <div style={{ fontWeight: 600 }}>
                {item.resultado} · {item.etapa} · {formatDateTime(item.data_execucao)} {item.executor ? `· ${item.executor.nome}` : ''}
              </div>
              {item.observacoes && <p style={{ margin: '4px 0', color: '#4b5563' }}>{item.observacoes}</p>}
              <small style={{ color: '#6b7280' }}>
                {Object.entries(item.criterios)
                  .map(([key, value]) => `${value.label || key}: ${value.status}`)
                  .join(' · ')}
              </small>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderForm = () => {
    const isConcluded = selectedOrder.status === 'Concluido';
    if (isConcluded) {
      return (
        <div style={{ ...styles.card, marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Histórico: {selectedOrder.celular?.modelo || 'Dispositivo'}</h3>
              <small style={{ color: '#6b7280' }}>
                OS #{selectedOrder.id} · IMEI {selectedOrder.celular?.imei || '-'} · Cliente {selectedOrder.cliente?.nome || '-'}
              </small>
            </div>
            <button type="button" onClick={resetSelection} style={styles.buttonLink}>
              Voltar
            </button>
          </div>
          {renderHistory()}
          <p style={{ marginTop: '1rem', color: '#4b5563' }}>
            Esta ordem já foi concluída. Utilize a lista para consultar outra OS em andamento caso precise registrar um novo teste.
          </p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} style={{ ...styles.card, marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>Avaliando: {selectedOrder.celular?.modelo || 'Dispositivo'}</h3>
          <small style={{ color: '#6b7280' }}>
            OS #{selectedOrder.id} · IMEI {selectedOrder.celular?.imei || '-'} · Cliente {selectedOrder.cliente?.nome || '-'}
          </small>
        </div>
        <button type="button" onClick={resetSelection} style={styles.buttonLink}>
          Trocar Aparelho
        </button>
      </div>

      {renderHistory()}

      <p style={{ color: '#4b5563', marginTop: '1rem' }}>
        Defina o resultado para cada critério avaliado nesta etapa.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {TEST_CRITERIA.map((criteria) => (
          <div key={criteria.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>{criteria.label}</label>
            <select value={testResults[criteria.key]} onChange={(e) => handleResultChange(criteria.key, e.target.value)}>
              {RESULT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div>
          <label>Etapa do teste</label>
          <select value={testStage} onChange={(e) => setTestStage(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '8px' }}>
            {TEST_STAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Observações gerais</label>
          <textarea
            rows="3"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Aparelho voltou a apresentar falha intermitente."
            style={{ width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', border: '1px solid #d4d4d4' }}
            maxLength={INPUT_LIMITS.LONG_TEXT}
          />
        </div>
      </div>

      {(submitError || testError) && <p style={{ color: '#b91c1c', marginTop: '10px' }}>{submitError || testError}</p>}

      <button type="submit" style={{ ...styles.buttonPrimary, opacity: submitting ? 0.8 : 1 }} disabled={submitting}>
        {submitting ? 'Registrando teste...' : 'Finalizar Teste'}
      </button>
    </form>
    );
  };

  const renderSuccess = () => {
    const resultado = lastResult?.resultado || (lastResult?.aprovado ? 'APROVADO' : null) || 'APROVADO';
    return (
      <div style={{ ...styles.successCard, marginTop: '1.5rem' }}>
        <h3>✅ Teste registrado com sucesso!</h3>
        <p>
          O aparelho <strong>{selectedOrder?.celular?.modelo || 'dispositivo'}</strong> recebeu o status
          {' '}
          <strong>{resultado}</strong>.
        </p>
        <p style={{ marginTop: '0.5rem' }}>Registrado em {formatDateTime(lastResult?.data_execucao)}.</p>
        <button type="button" onClick={resetSelection} style={{ marginTop: '12px', padding: '10px 24px', borderRadius: '8px', border: '1px solid #5C2D91', background: '#fff', color: '#5C2D91', cursor: 'pointer' }}>
          Testar Novo Aparelho
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <button type="button" onClick={() => navigate('/ordemdeservico')} style={styles.backButton}>
        ← Voltar para Ordens de Serviço
      </button>
      <h2 style={{ margin: '1rem 0' }}>Controle de Qualidade - Gerência</h2>
      {!selectedOrder && renderSearchCard()}
      {selectedOrder && !submitted && renderForm()}
      {submitted && renderSuccess()}
    </div>
  );
};

export default TesteCelulares;
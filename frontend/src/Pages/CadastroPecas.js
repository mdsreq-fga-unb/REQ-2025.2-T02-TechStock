import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '../styles/NovoCadastroPecas.css';
import { Link, useNavigate } from 'react-router-dom';
import { pecasApi, movimentacoesEstoqueApi } from '../services/api';
import LogoutButton from '../components/LogoutButton';
import { INPUT_LIMITS } from '../constants/inputLimits';

const MOVEMENT_OPTIONS = [
  { value: 'COMPRA', label: 'Compra (Entrada)' },
  { value: 'VENDA', label: 'Venda (Saída)' },
  { value: 'DEVOLUCAO', label: 'Devolução (Entrada)' },
  { value: 'CONSERTO', label: 'Conserto (Saída)' },
];

const OPERACAO_LABELS = MOVEMENT_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const SAIDA_OPERACOES = new Set(['VENDA', 'CONSERTO']);
const HISTORY_PAGE_SIZE = 8;

const createMovementForm = (defaults = {}) => ({
  tipo_operacao: '',
  peca_id: '',
  quantidade: '1',
  data_movimentacao: buildLocalDateTimeValue(),
  observacoes: '',
  ...defaults,
});

function buildLocalDateTimeValue(date = new Date()) {
  const clone = new Date(date);
  clone.setSeconds(0, 0);
  const offset = clone.getTimezoneOffset();
  const local = new Date(clone.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toISODateTime(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

function CadastroPecas() {
  const navigate = useNavigate();
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [movementForm, setMovementForm] = useState(() => createMovementForm());
  const [movementFeedback, setMovementFeedback] = useState({ success: '', error: '' });
  const [movementSubmitting, setMovementSubmitting] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, pageSize: HISTORY_PAGE_SIZE, total: 0 });
  const [historyFilters, setHistoryFilters] = useState({ tipo_operacao: '', usuario_id: '', data_inicio: '', data_fim: '', peca_id: '' });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const historyFiltersRef = useRef(historyFilters);
  const selectedPiece = useMemo(() => {
    if (!movementForm.peca_id) return null;
    return pecas.find((item) => String(item.id) === String(movementForm.peca_id)) || null;
  }, [movementForm.peca_id, pecas]);
  const isSaidaOperation = movementForm.tipo_operacao && SAIDA_OPERACOES.has(movementForm.tipo_operacao);
  const totalHistoryPages = useMemo(() => {
    if (!historyMeta.pageSize) return 1;
    return Math.max(1, Math.ceil((historyMeta.total || 0) / historyMeta.pageSize));
  }, [historyMeta]);

  const loadHistory = useCallback((page = 1, customFilters) => {
    const filters = customFilters || historyFiltersRef.current;
    setHistoryLoading(true);
    setHistoryError('');
    movimentacoesEstoqueApi
      .list({
        page,
        pageSize: HISTORY_PAGE_SIZE,
        tipo_item: 'PECA',
        tipo_operacao: filters.tipo_operacao || undefined,
        usuario_id: filters.usuario_id || undefined,
        data_inicio: filters.data_inicio || undefined,
        data_fim: filters.data_fim || undefined,
        peca_id: filters.peca_id || undefined,
      })
      .then((data) => {
        setHistoryItems(data?.items || []);
        setHistoryMeta({
          page: data?.meta?.page || page,
          pageSize: data?.meta?.pageSize || HISTORY_PAGE_SIZE,
          total: data?.meta?.total ?? (data?.items?.length || 0),
        });
      })
      .catch((err) => {
        setHistoryError(err.message || 'Não foi possível carregar o histórico.');
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    historyFiltersRef.current = historyFilters;
  }, [historyFilters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    pecasApi
      .list({ q: search || undefined, pageSize: 100 })
      .then((data) => {
        if (!active) return;
        setPecas(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar as peças.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, reloadKey]);

  useEffect(() => {
    if (historyModalOpen) {
      loadHistory(1);
    }
  }, [historyModalOpen, loadHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover esta peça?')) return;
    try {
      await pecasApi.remove(id);
      setPecas((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover peça.');
    }
  };

  const handleEdit = (id) => {
    navigate('/pecas/novo', { state: { editId: id } });
  };

  const handleOpenMovementModal = (pecaId) => {
    setMovementForm(createMovementForm(pecaId ? { peca_id: String(pecaId) } : {}));
    setMovementFeedback({ success: '', error: '' });
    setMovementModalOpen(true);
  };

  const closeMovementModal = () => {
    setMovementModalOpen(false);
  };

  const handleMovementFieldChange = (field, value) => {
    setMovementForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMovementSubmit = async (event) => {
    event.preventDefault();
    if (!movementForm.tipo_operacao || !movementForm.peca_id) {
      setMovementFeedback({ error: 'Selecione uma operação e uma peça.', success: '' });
      return;
    }
    const quantityNumber = Number(movementForm.quantidade);
    if (!Number.isFinite(quantityNumber) || quantityNumber < 1 || !Number.isInteger(quantityNumber)) {
      setMovementFeedback({ error: 'Informe uma quantidade válida.', success: '' });
      return;
    }
    if (isSaidaOperation && selectedPiece && quantityNumber > selectedPiece.quantidade) {
      setMovementFeedback({ error: 'Quantidade solicitada maior que o saldo disponível.', success: '' });
      return;
    }
    setMovementSubmitting(true);
    setMovementFeedback({ success: '', error: '' });
    try {
      await movimentacoesEstoqueApi.create({
        tipo_item: 'PECA',
        tipo_operacao: movementForm.tipo_operacao,
        peca_id: Number(movementForm.peca_id),
        quantidade: quantityNumber,
        observacoes: movementForm.observacoes || undefined,
        data_movimentacao: toISODateTime(movementForm.data_movimentacao),
      });
      setMovementFeedback({ success: 'Movimentação registrada com sucesso!', error: '' });
      setMovementForm((prev) => ({ ...prev, quantidade: '1', observacoes: '' }));
      setReloadKey((prev) => prev + 1);
      if (historyModalOpen) {
        loadHistory(historyMeta.page || 1);
      }
    } catch (err) {
      setMovementFeedback({ error: err.message || 'Não foi possível registrar a movimentação.', success: '' });
    } finally {
      setMovementSubmitting(false);
    }
  };

  const openHistoryModal = (pecaId) => {
    if (typeof pecaId !== 'undefined') {
      setHistoryFilters((prev) => ({ ...prev, peca_id: pecaId ? String(pecaId) : '' }));
    } else {
      setHistoryFilters((prev) => ({ ...prev, peca_id: '' }));
    }
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
  };

  const handleHistoryFilterChange = (field, value) => {
    setHistoryFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyHistoryFilters = (event) => {
    event.preventDefault();
    loadHistory(1, historyFilters);
  };

  const handleResetHistoryFilters = () => {
    const cleared = { tipo_operacao: '', usuario_id: '', data_inicio: '', data_fim: '', peca_id: '' };
    setHistoryFilters(cleared);
    loadHistory(1, cleared);
  };

  const handleHistoryPageChange = (direction) => {
    const nextPage = (historyMeta.page || 1) + direction;
    if (nextPage < 1 || nextPage > totalHistoryPages) return;
    loadHistory(nextPage);
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
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celulares</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
        <LogoutButton className='BotaoLogout' /> 
        </div>
       


      <h2 className="Clientes">Peças</h2>
      <h2 className="gerencie-1">Controle de peças para manutenção</h2> 

      <div className='Gestao' > 
        <h2 className="title">Controle De Peças para Manutenção</h2>
        <h2 className="gerencie-2">Gerencie todos os produtos</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar por nome, código, fornecedor ou compatibilidade"
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={INPUT_LIMITS.SEARCH}
          />
          <div className="actions-bar-buttons">
            <button className="btn-secondary" type="button" onClick={() => handleOpenMovementModal()}>
              Registrar movimentação
            </button>
            <button className="btn-secondary" type="button" onClick={() => openHistoryModal()}>
              Histórico de movimentações
            </button>
            <button className="btn-primary" type="button" onClick={() => navigate('/pecas/novo')}>
              + Nova Peça
            </button>
          </div>
        </div>
      </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Data de cadastro</th>
            <th>Código Interno</th>
            <th>Compatibilidade</th>
            <th>Nome do Fornecedor</th>
            <th>Quantidade</th>
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
          {!loading && !error && pecas.length === 0 && (
            <tr>
              <td colSpan={9}>Nenhuma peça encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            pecas.map((peca) => (
              <tr key={peca.id}>
                <td>{peca.id}</td>
                <td>{peca.nome}</td>
                <td>
                  {peca.data_cadastro
                    ? new Date(peca.data_cadastro).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{peca.codigo_interno}</td>
                <td>{peca.compatibilidade || '-'}</td>
                <td>{peca.nome_fornecedor}</td>
                <td>{peca.quantidade}</td>
                <td>{peca.garantia_padrao_dias ?? '-'}</td>
                <td className="actions pecas-actions">
                  <button type="button" className="link-button" onClick={() => handleOpenMovementModal(peca.id)}>
                    Movimentar
                  </button>
                  <button type="button" className="link-button" onClick={() => openHistoryModal(peca.id)}>
                    Histórico
                  </button>
                  <button type="button" className="link-button" onClick={() => handleEdit(peca.id)}>
                    Editar
                  </button>
                  <button type="button" className="link-button danger" onClick={() => handleDelete(peca.id)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
        </tbody>

      </table>

      {movementModalOpen && (
        <div className="pecas-modal-overlay" onClick={closeMovementModal}>
          <div className="pecas-modal-content pecas-movement-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pecas-modal-header">
              <h3>Registrar movimentação</h3>
              <button type="button" className="pecas-modal-close" onClick={closeMovementModal} aria-label="Fechar">
                ×
              </button>
            </div>
            <form className="pecas-modal-form" onSubmit={handleMovementSubmit}>
              <label>
                Tipo de operação
                <select value={movementForm.tipo_operacao} onChange={(event) => handleMovementFieldChange('tipo_operacao', event.target.value)} required>
                  <option value="">Selecione</option>
                  {MOVEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Peça
                <select value={movementForm.peca_id} onChange={(event) => handleMovementFieldChange('peca_id', event.target.value)} required>
                  <option value="">Selecione a peça</option>
                  {pecas.map((peca) => (
                    <option key={peca.id} value={peca.id}>
                      #{peca.id} - {peca.nome} (Saldo: {peca.quantidade})
                    </option>
                  ))}
                </select>
              </label>

              {selectedPiece && (
                <div className="selected-piece-info">
                  <strong>{selectedPiece.nome}</strong>
                  <span>Código: {selectedPiece.codigo_interno || '-'}</span>
                  <span>Saldo atual: {selectedPiece.quantidade}</span>
                </div>
              )}

              <label>
                Quantidade
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={INPUT_LIMITS.STOCK_QUANTITY}
                  value={movementForm.quantidade}
                  onChange={(event) => handleMovementFieldChange('quantidade', event.target.value)}
                  required
                />
              </label>

              <label>
                Data da movimentação
                <input
                  type="datetime-local"
                  value={movementForm.data_movimentacao}
                  onChange={(event) => handleMovementFieldChange('data_movimentacao', event.target.value)}
                />
              </label>

              <label>
                Observações (opcional)
                <textarea
                  rows={3}
                  value={movementForm.observacoes}
                  onChange={(event) => handleMovementFieldChange('observacoes', event.target.value)}
                  maxLength={INPUT_LIMITS.LONG_TEXT}
                />
              </label>

              {isSaidaOperation && selectedPiece && (
                <div className="info-box warning">Saldo disponível: {selectedPiece.quantidade}</div>
              )}

              {movementFeedback.error && <div className="feedback error">{movementFeedback.error}</div>}
              {movementFeedback.success && <div className="feedback success">{movementFeedback.success}</div>}

              <div className="pecas-modal-actions">
                <button type="button" className="btn-secondary" onClick={closeMovementModal} disabled={movementSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={movementSubmitting}>
                  {movementSubmitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyModalOpen && (
        <div className="pecas-modal-overlay" onClick={closeHistoryModal}>
          <div className="pecas-modal-content pecas-history-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pecas-modal-header">
              <h3>Histórico de movimentações</h3>
              <button type="button" className="pecas-modal-close" onClick={closeHistoryModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <form className="pecas-history-filters" onSubmit={handleApplyHistoryFilters}>
              <label>
                Tipo de operação
                <select value={historyFilters.tipo_operacao} onChange={(event) => handleHistoryFilterChange('tipo_operacao', event.target.value)}>
                  <option value="">Todas</option>
                  {MOVEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Peça
                <select value={historyFilters.peca_id} onChange={(event) => handleHistoryFilterChange('peca_id', event.target.value)}>
                  <option value="">Todas</option>
                  {pecas.map((peca) => (
                    <option key={peca.id} value={peca.id}>
                      #{peca.id} - {peca.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Usuário (ID)
                <input
                  type="number"
                  min="1"
                  max={INPUT_LIMITS.USER_ID}
                  value={historyFilters.usuario_id}
                  onChange={(event) => handleHistoryFilterChange('usuario_id', event.target.value)}
                />
              </label>
              <label>
                Data inicial
                <input type="date" value={historyFilters.data_inicio} onChange={(event) => handleHistoryFilterChange('data_inicio', event.target.value)} />
              </label>
              <label>
                Data final
                <input type="date" value={historyFilters.data_fim} onChange={(event) => handleHistoryFilterChange('data_fim', event.target.value)} />
              </label>

              <div className="pecas-history-filter-actions">
                <button type="button" className="btn-secondary" onClick={handleResetHistoryFilters}>
                  Limpar
                </button>
                <button type="submit" className="btn-primary">
                  Aplicar
                </button>
              </div>
            </form>

            {historyError && <div className="feedback error">{historyError}</div>}

            <div className="pecas-history-table-wrapper">
              {historyLoading ? (
                <p>Carregando...</p>
              ) : historyItems.length === 0 ? (
                <p>Nenhuma movimentação encontrada.</p>
              ) : (
                <table className="pecas-history-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Operação</th>
                      <th>Peça</th>
                      <th>Quantidade</th>
                      <th>Saldo após</th>
                      <th>Usuário</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{formatDateTime(item.data_movimentacao)}</td>
                        <td>{OPERACAO_LABELS[item.tipo_operacao] || item.tipo_operacao}</td>
                        <td>{item.peca?.nome ? `${item.peca.nome} (#${item.peca.id})` : '-'}</td>
                        <td>{item.quantidade}</td>
                        <td>{item.saldo_resultante ?? '-'}</td>
                        <td>{item.usuario?.nome ? `${item.usuario.nome} (#${item.usuario.id})` : '-'}</td>
                        <td>{item.observacoes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pecas-history-pagination">
              <button type="button" className="btn-secondary" onClick={() => handleHistoryPageChange(-1)} disabled={historyLoading || historyMeta.page <= 1}>
                Anterior
              </button>
              <span>
                Página {historyMeta.page || 1} de {totalHistoryPages}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleHistoryPageChange(1)}
                disabled={historyLoading || historyMeta.page >= totalHistoryPages}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroPecas;
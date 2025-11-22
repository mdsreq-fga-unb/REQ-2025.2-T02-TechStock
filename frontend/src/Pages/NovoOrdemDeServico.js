import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../styles/NovoOrdemDeSevico.css';
import { ordensServicoApi, clientesApi, celularesApi } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluída' },
];

function NovoOS() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [celularId, setCelularId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('EmAndamento');
  const [garantiaDias, setGarantiaDias] = useState('');
  const [garantiaValidade, setGarantiaValidade] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    let active = true;
    Promise.all([clientesApi.list({ pageSize: 100 }), celularesApi.list({ pageSize: 100 })])
      .then(([clientesRes, celularesRes]) => {
        if (!active) return;
        setClientes(clientesRes?.items || []);
        setCelulares(celularesRes?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setMessage(err.message || 'Não foi possível carregar clientes e celulares.');
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) return;
    setEditingId(editId);
    setLoading(true);
    ordensServicoApi
      .getById(editId)
      .then((ordem) => {
        setClienteId(String(ordem.cliente_id));
        setCelularId(String(ordem.celular_id));
        setDescricao(ordem.descricao || '');
        setObservacoes(ordem.observacoes || '');
        setStatus(ordem.status || 'EmAndamento');
        setGarantiaDias(ordem.garantia_dias != null ? String(ordem.garantia_dias) : '');
        setGarantiaValidade(ordem.garantia_validade ? ordem.garantia_validade.substring(0, 10) : '');
        setDataConclusao(ordem.data_conclusao ? ordem.data_conclusao.substring(0, 10) : '');
      })
      .catch((err) => {
        setMessage(err.message || 'Não foi possível carregar a ordem.');
      })
      .finally(() => setLoading(false));
  }, [location]);

  const handleSave = async () => {
    if (!clienteId || !celularId) {
      setMessage('Selecione um cliente e um celular.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      if (isEditing) {
        const payload = {
          descricao: descricao || undefined,
          observacoes: observacoes || undefined,
          status,
        };
        if (garantiaDias !== '') payload.garantia_dias = Number(garantiaDias);
        if (garantiaValidade) payload.garantia_validade = new Date(garantiaValidade).toISOString();
        if (status === 'Concluido') {
          payload.data_conclusao = dataConclusao
            ? new Date(dataConclusao).toISOString()
            : new Date().toISOString();
        }
        await ordensServicoApi.update(editingId, payload);
        setMessage('Ordem atualizada com sucesso!');
      } else {
        const payload = {
          cliente_id: Number(clienteId),
          celular_id: Number(celularId),
          descricao: descricao || undefined,
          observacoes: observacoes || undefined,
          garantia_dias: garantiaDias ? Number(garantiaDias) : undefined,
          garantia_validade: garantiaValidade ? new Date(garantiaValidade).toISOString() : undefined,
        };
        await ordensServicoApi.create(payload);
        setMessage('Ordem criada com sucesso!');
      }
      setTimeout(() => navigate('/ordemdeservico'), 800);
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar a ordem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novo-container-OS">

      <h2>Nova Ordem De Serviço</h2>

      <div className="form-box-OS">
        {message && (
          <div className={`message-box ${message.includes('sucesso') ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center`}>
            <span>{message}</span>
            <button className="font-bold text-lg leading-none" onClick={() => setMessage('')}>&times;</button>
          </div>
        )}

        <label>Cliente:</label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          disabled={isEditing}
        >
          <option value="">Selecione um cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome} - {cliente.cpf}
            </option>
          ))}
        </select>

        <label>Celular:</label>
        <select
          value={celularId}
          onChange={(e) => setCelularId(e.target.value)}
          disabled={isEditing}
        >
          <option value="">Selecione um celular</option>
          {celulares.map((celular) => (
            <option key={celular.id} value={celular.id}>
              {celular.modelo} - {celular.imei}
            </option>
          ))}
        </select>

        <label>Descrição:</label>
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label>Observações:</label>
        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label>Garantia (dias):</label>
        <input
          type="number"
          min="0"
          value={garantiaDias}
          onChange={(e) => setGarantiaDias(e.target.value)}
        />

        <label>Garantia válida até:</label>
        <input
          type="date"
          value={garantiaValidade}
          onChange={(e) => setGarantiaValidade(e.target.value)}
        />

        {status === 'Concluido' && (
          <>
            <label>Data de conclusão:</label>
            <input
              type="date"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
            />
          </>
        )}

        <button className="btn-primary" onClick={handleSave} disabled={loading || loadingOptions}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar OS'}
        </button>

        <button className="btn-secondary" onClick={() => navigate("/ordemdeservico")}>Cancelar</button>

      </div>

    </div>
  );
}

export default NovoOS;
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import '../styles/NovoOrdemDeSevico.css';
import { ordensServicoApi, clientesApi, celularesApi } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluída' },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '45px',
    marginBottom: '15px',
    borderRadius: '8px',
    borderColor: '#ccc'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

// --- COMPONENTE MODAL (Mantido igual) ---
function ModalCelular({ isOpen, onClose, onSave, loading }) {
  const [modelo, setModelo] = useState('');
  const [imei, setImei] = useState('');
  const [marca, setMarca] = useState('');

  if (!isOpen) return null;
}

// --- COMPONENTE PRINCIPAL ---
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
  const [showModalCelular, setShowModalCelular] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const isEditing = Boolean(editingId);

  // 1. Opções de Clientes
  const opcoesClientes = useMemo(() => 
    clientes.map(c => ({ value: c.id, label: `${c.nome} - CPF: ${c.cpf}` })), 
  [clientes]);

  // 2. Opções de Celulares (AGORA INDEPENDENTE)
  // Não filtramos mais pelo clienteId. Mostramos todos.
  const opcoesCelulares = useMemo(() => {
    return celulares.map(c => {
      // Tenta achar o nome do dono na lista de clientes para ajudar visualmente
      // Assumindo que o objeto celular tem 'cliente_id'
      const dono = clientes.find(cli => cli.id === c.cliente_id);
      const labelDono = dono ? ` [Dono: ${dono.nome}]` : ' [Sem dono vinculado]';
      
      return { 
        value: c.id, 
        label: `${c.modelo} - IMEI: ${c.imei}${labelDono}` 
      };
    });
  }, [celulares, clientes]);

  useEffect(() => {
    let active = true;
    Promise.all([clientesApi.list({ pageSize: 100 }), celularesApi.list({ pageSize: 100 })])
      .then(([clientesRes, celularesRes]) => {
        if (!active) return;
        setClientes(clientesRes?.items || []);
        setCelulares(celularesRes?.items || []);
      })
      .catch((err) => { if (active) setMessage(err.message || 'Erro ao carregar dados.'); })
      .finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) return;
    setEditingId(editId);
    setLoading(true);
    ordensServicoApi.getById(editId)
      .then((ordem) => {
        setClienteId(ordem.cliente_id);
        setCelularId(ordem.celular_id);
        setDescricao(ordem.descricao || '');
        setObservacoes(ordem.observacoes || '');
        setStatus(ordem.status || 'EmAndamento');
        setGarantiaDias(ordem.garantia_dias != null ? String(ordem.garantia_dias) : '');
        setGarantiaValidade(ordem.garantia_validade ? ordem.garantia_validade.substring(0, 10) : '');
        setDataConclusao(ordem.data_conclusao ? ordem.data_conclusao.substring(0, 10) : '');
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [location]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (newStatus === 'Concluido' && !dataConclusao) {
      setDataConclusao(getTodayDate());
    } else if (newStatus !== 'Concluido') {
      setDataConclusao('');
    }
  };

  const handleDataConclusaoChange = (e) => {
    const newData = e.target.value;
    setDataConclusao(newData);
    if (newData) setStatus('Concluido');
  };

  const handleSaveNewCelular = async (dadosCelular) => {
    setLoadingModal(true);
    try {
      // Como são independentes, se tiver cliente selecionado, vinculamos.
      // Se não, enviamos null ou undefined (depende da sua API aceitar celular sem dono)
      const payload = { 
        ...dadosCelular, 
        cliente_id: clienteId ? Number(clienteId) : null 
      };
      
      const novoCelular = await celularesApi.create(payload);
      setCelulares((prev) => [...prev, novoCelular]);
      setCelularId(novoCelular.id);
      setShowModalCelular(false);
      setMessage(`Celular cadastrado com sucesso!`);
    } catch (error) {
      alert("Erro ao criar celular: " + error.message);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSave = async () => {
    if (!clienteId || !celularId) {
      setMessage('Selecione um cliente e um celular.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        descricao: descricao || undefined,
        observacoes: observacoes || undefined,
        status,
        garantia_dias: garantiaDias ? Number(garantiaDias) : undefined,
        garantia_validade: garantiaValidade ? new Date(garantiaValidade).toISOString() : undefined,
      };
      
      if (status === 'Concluido') {
        payload.data_conclusao = dataConclusao 
          ? new Date(dataConclusao).toISOString() 
          : new Date().toISOString();
      } else {
        payload.data_conclusao = null; 
      }

      if (isEditing) {
        await ordensServicoApi.update(editingId, payload);
        setMessage('Ordem atualizada com sucesso!');
      } else {
        payload.cliente_id = Number(clienteId);
        payload.celular_id = Number(celularId);
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

  const getSelectedCliente = () => opcoesClientes.find(c => c.value === Number(clienteId));
  const getSelectedCelular = () => opcoesCelulares.find(c => c.value === Number(celularId));

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
        <Select
          isDisabled={isEditing || loadingOptions}
          isLoading={loadingOptions}
          value={getSelectedCliente()}
          onChange={(opt) => setClienteId(opt ? opt.value : '')} // NÃO reseta mais o celular
          options={opcoesClientes}
          placeholder="Busque por nome ou CPF..."
          isClearable
          isSearchable
          styles={customStyles}
        />

        <label>Celular:</label>
        <div className="input-group-row">
          <div style={{ flex: 1 }}>
            <Select
              // NÃO depende mais do clienteId para ser habilitado
              isDisabled={loadingOptions} 
              value={getSelectedCelular()}
              onChange={(opt) => setCelularId(opt ? opt.value : '')}
              options={opcoesCelulares}
              placeholder="Busque o celular (Modelo ou IMEI)..."
              isClearable
              isSearchable
              styles={customStyles}
              noOptionsMessage={() => "Nenhum celular encontrado"}
            />
          </div>
        </div>

        <label>Descrição:</label>
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label>Observações:</label>
        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

        <label>Status:</label>
        <select value={status} onChange={handleStatusChange}>
          {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        {status === 'Concluido' && (
          <div style={{animation: 'fadeIn 0.3s'}}>
            <label>Data de conclusão:</label>
            <input 
              type="date" 
              value={dataConclusao} 
              onChange={handleDataConclusaoChange} 
            />
          </div>
        )}

        <label>Garantia (dias):</label>
        <input type="number" min="0" value={garantiaDias} onChange={(e) => setGarantiaDias(e.target.value)} />

        <label>Garantia válida até:</label>
        <input type="date" value={garantiaValidade} onChange={(e) => setGarantiaValidade(e.target.value)} />

        <button className="btn-primary" onClick={handleSave} disabled={loading || loadingOptions}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar OS'}
        </button>
        <button className="btn-secondary" onClick={() => navigate("/ordemdeservico")}>Cancelar</button>
      </div>

      <ModalCelular 
        isOpen={showModalCelular} 
        onClose={() => setShowModalCelular(false)} 
        onSave={handleSaveNewCelular}
        loading={loadingModal}
      />
    </div>
  );
}

export default NovoOS;
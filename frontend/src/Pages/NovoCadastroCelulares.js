import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NovoCadastroCelulares.css';
import { celularesApi } from '../services/api';

function NovoCadastroCelulares() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  const [modelo, setModelo] = useState('');
  const [imei, setIMEI] = useState('');
  const [cor, setCor] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [status, setStatus] = useState('EmEstoque');
  const [tipo, setTipo] = useState('Novo');
  const [fornecedor, setFornecedor] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [garantiaDias, setGarantiaDias] = useState('365');
  const [defeito, setDefeito] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) {
      setEditingId(null);
      setModelo('');
      setIMEI('');
      setCor('');
      setCapacidade('');
      setStatus('EmEstoque');
      setTipo('Novo');
      setFornecedor('');
      setValorCompra('');
      setGarantiaDias('365');
      setDefeito('');
      return;
    }
    setEditingId(editId);
    setInitialLoading(true);
    setMessage('');
    celularesApi
      .getById(editId)
      .then((celular) => {
        if (!celular) {
          setMessage('Celular não encontrado.');
          return;
        }
        setModelo(celular.modelo || '');
        setIMEI(celular.imei || '');
        setCor(celular.cor || '');
        setCapacidade(celular.capacidade || '');
        setStatus(celular.status || 'EmEstoque');
        setTipo(celular.tipo || 'Novo');
        setFornecedor(celular.nome_fornecedor || '');
        setValorCompra(
          celular.valor_compra !== null && celular.valor_compra !== undefined
            ? String(celular.valor_compra)
            : ''
        );
        setGarantiaDias(
          celular.garantia_padrao_dias !== null && celular.garantia_padrao_dias !== undefined
            ? String(celular.garantia_padrao_dias)
            : '365'
        );
        setDefeito(celular.defeitos_identificados || '');
      })
      .catch((err) => {
        setMessage(err.message || 'Não foi possível carregar o celular.');
      })
      .finally(() => setInitialLoading(false));
  }, [location]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!modelo || !imei || !fornecedor || !tipo) {
      setMessage('Preencha os campos obrigatórios (modelo, IMEI, fornecedor e tipo).');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const payload = {
        modelo,
        imei,
        cor: cor || undefined,
        capacidade: capacidade || undefined,
        status,
        tipo,
        nome_fornecedor: fornecedor,
        valor_compra: valorCompra !== '' ? Number(valorCompra) : undefined,
        garantia_padrao_dias: garantiaDias !== '' ? Number(garantiaDias) : undefined,
        defeitos_identificados: defeito || undefined,
      };
      if (isEditing) {
        await celularesApi.update(editingId, payload);
      } else {
        await celularesApi.create(payload);
      }
      navigate('/celulares');
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar o celular.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novo-container">

      <h2>Novo Celular</h2>

      <form className="form-box" onSubmit={handleSave}>
        {message && (
          <div className="error-row">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage('')}>
              &times;
            </button>
          </div>
        )}

        <label>Modelo:</label>
        <input type="text" value={modelo} onChange={(event) => setModelo(event.target.value)} required />

        <label>IMEI:</label>
        <input type="text" value={imei} onChange={(event) => setIMEI(event.target.value)} required />

        <label>Cor:</label>
        <input type="text" value={cor} onChange={(event) => setCor(event.target.value)} />

        <label>Capacidade:</label>
        <input type="text" value={capacidade} onChange={(event) => setCapacidade(event.target.value)} />

        <label>Status:</label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="EmEstoque">Em estoque</option>
          <option value="Vendido">Vendido</option>
          <option value="EmReparo">Em reparo</option>
          <option value="Descartado">Descartado</option>
        </select>

        <label>Tipo:</label>
        <select value={tipo} onChange={(event) => setTipo(event.target.value)} required>
          <option value="Novo">Novo</option>
          <option value="Usado">Usado</option>
          <option value="Recondicionado">Recondicionado</option>
        </select>

        <label>Fornecedor:</label>
        <input type="text" value={fornecedor} onChange={(event) => setFornecedor(event.target.value)} required />

        <label>Valor de Compra:</label>
        <input type="number" min="0" step="0.01" value={valorCompra} onChange={(event) => setValorCompra(event.target.value)} />

        <label>Garantia padrão (dias):</label>
        <input type="number" min="0" value={garantiaDias} onChange={(event) => setGarantiaDias(event.target.value)} />

        <label>Defeitos Identificados:</label>
        <input type="text" value={defeito} onChange={(event) => setDefeito(event.target.value)} />

        <button className="btn-primary" type="submit" disabled={loading || initialLoading}>
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Celular'}
        </button>

        <button className="btn-secondary" type="button" onClick={() => navigate('/celulares')}>
          Cancelar
        </button>
      </form>

    </div>
  );
}

export default NovoCadastroCelulares;
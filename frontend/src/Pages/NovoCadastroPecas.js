import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NovoCadastroPecas.css';
import { pecasApi } from '../services/api';

function NovoCadastroPecas() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [compatibilidade, setCompatibilidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [garantiaDias, setGarantiaDias] = useState('90');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) {
      setEditingId(null);
      setName('');
      setCodigoInterno('');
      setCompatibilidade('');
      setFornecedor('');
      setQuantidade('');
      setGarantiaDias('90');
      return;
    }
    setEditingId(editId);
    setInitialLoading(true);
    setMessage('');
    pecasApi
      .getById(editId)
      .then((peca) => {
        if (!peca) {
          setMessage('Peça não encontrada.');
          return;
        }
        setName(peca.nome || '');
        setCodigoInterno(peca.codigo_interno || '');
        setCompatibilidade(peca.compatibilidade || '');
        setFornecedor(peca.nome_fornecedor || '');
        setQuantidade(
          peca.quantidade !== null && peca.quantidade !== undefined ? String(peca.quantidade) : ''
        );
        setGarantiaDias(
          peca.garantia_padrao_dias !== null && peca.garantia_padrao_dias !== undefined
            ? String(peca.garantia_padrao_dias)
            : '90'
        );
      })
      .catch((err) => {
        setMessage(err.message || 'Não foi possível carregar a peça.');
      })
      .finally(() => setInitialLoading(false));
  }, [location]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!name || !codigoInterno || !fornecedor) {
      setMessage('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const payload = {
        nome: name,
        codigo_interno: codigoInterno,
        compatibilidade: compatibilidade || undefined,
        nome_fornecedor: fornecedor,
        quantidade: quantidade !== '' ? Number(quantidade) : undefined,
        garantia_padrao_dias: garantiaDias !== '' ? Number(garantiaDias) : undefined,
      };
      if (isEditing) {
        await pecasApi.update(editingId, payload);
      } else {
        await pecasApi.create(payload);
      }
      navigate('/pecas');
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar a peça.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novo-container-pecas">

      <h2>Nova Peça</h2>

      <form className="form-box-pecas" onSubmit={handleSave}>
        {message && (
          <div className="error-row">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage('')}>
              &times;
            </button>
          </div>
        )}

        <label>Nome:</label>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />

        <label>Código Interno:</label>
        <input type="text" value={codigoInterno} onChange={(event) => setCodigoInterno(event.target.value)} required />

        <label>Compatibilidade:</label>
        <input type="text" value={compatibilidade} onChange={(event) => setCompatibilidade(event.target.value)} />

        <label>Quantidade:</label>
        <input type="number" min="0" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} />

        <label>Nome do Fornecedor:</label>
        <input type="text" value={fornecedor} onChange={(event) => setFornecedor(event.target.value)} required />

        <label>Garantia padrão (dias):</label>
        <input type="number" min="0" value={garantiaDias} onChange={(event) => setGarantiaDias(event.target.value)} />

        <button className="btn-primary" type="submit" disabled={loading || initialLoading}>
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Peça'}
        </button>

        <button className="btn-secondary" type="button" onClick={() => navigate('/pecas')}>
          Cancelar
        </button>
      </form>

    </div>
  );
}

export default NovoCadastroPecas;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NovoCadastro.css';
import { clientesApi } from '../services/api';

function NovoCadastro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('CONSUMIDOR');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isEditing = Boolean(editingId);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) {
      setEditingId(null);
      setName('');
      setCpf('');
      setPhone('');
      setEmail('');
      setType('CONSUMIDOR');
      return;
    }
    setEditingId(editId);
    setInitialLoading(true);
    setMessage('');
    clientesApi
      .getById(editId)
      .then((cliente) => {
        if (!cliente) {
          setMessage('Cliente não encontrado.');
          return;
        }
        setName(cliente.nome || '');
        setCpf(cliente.cpf || '');
        setPhone(cliente.telefone || '');
        setEmail(cliente.email || '');
        setType(cliente.tipo || 'CONSUMIDOR');
      })
      .catch((err) => {
        setMessage(err.message || 'Não foi possível carregar o cliente.');
      })
      .finally(() => setInitialLoading(false));
  }, [location]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!name || (!cpf && !isEditing)) {
      setMessage('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const payload = {
        nome: name,
        telefone: phone || undefined,
        email: email || undefined,
        tipo: type,
      };
      if (isEditing) {
        await clientesApi.update(editingId, payload);
      } else {
        await clientesApi.create({ ...payload, cpf });
      }
      navigate('/');
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar o cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="novo-container-clientes">
      <h2>Adicionar Cliente</h2>

      <form className="form-box-clientes" onSubmit={handleSave}>
        {message && <div className="error-row">{message}</div>}

        <label>Nome Completo:</label>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />

        <label>CPF:</label>
        <input
          type="text"
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
          required={!isEditing}
          disabled={isEditing || initialLoading}
        />

        <label>Telefone:</label>
        <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />

        <label>Email:</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />

        <label>Tipo de Cliente:</label>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="CONSUMIDOR">Consumidor</option>
          <option value="REVENDEDOR">Revendedor</option>
          <option value="MANUTENCAO">Manutenção/Parceiro</option>
        </select>

        <button className="btn-primary" type="submit" disabled={loading || initialLoading}>
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar Cliente'}
        </button>

        <button className="btn-secondary" type="button" onClick={() => navigate('/')}>Cancelar</button>
      </form>
    </div>
  );
}

export default NovoCadastro;
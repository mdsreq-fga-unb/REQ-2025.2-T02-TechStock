import React, { useState, useEffect } from 'react';
import '../styles/CadastroClientes.css';
import { Link, useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';

function CadastroClientes() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    clientesApi
      .list(search ? { q: search } : {})
      .then((data) => {
        if (!active) return;
        setClients(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar os clientes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente remover este cliente?')) return;
    try {
      await clientesApi.remove(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover cliente.');
    }
  };

    const handleEdit = (id) => {
    navigate('/clientes/novo', { state: { editId: id } });
  };
  
  return (
    <div className ='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

        <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
        <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Manutenção</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
        </div>

      <h2 className="Clientes">Clientes</h2>
      <h2 className="gerencie-1">Gestão de clientes e histórico</h2> 

      <div className='Gestao' > 
        <h2 className="title">Lista de Clientes</h2>
        <h2 className="gerencie-2">Gerencie todos os produtos</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          
          {/*botão agora navega para tela de cadastro */}
          <button className="btn-primary" onClick={() => navigate("/clientes/novo")}>
            + Novo Cliente
          </button>
        </div>
      </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Data de cadastro</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>E-mail</th>
            <th>Tipo de Cliente</th>
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
          {!loading && !error && clients.length === 0 && (
            <tr>
              <td colSpan={8}>Nenhum cliente encontrado.</td>
            </tr>
          )}
          {!loading && !error &&
            clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.nome}</td>
                <td>
                  {client.data_cadastro
                    ? new Date(client.data_cadastro).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{client.cpf}</td>
                <td>{client.telefone || '-'}</td>
                <td>{client.email || '-'}</td>
                <td>{client.tipo}</td>
                <td className="actions">
                  <span onClick={() => handleEdit(client.id)}>✏️</span>
                  <span onClick={() => handleDelete(client.id)}>🗑️</span>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
}

export default CadastroClientes;
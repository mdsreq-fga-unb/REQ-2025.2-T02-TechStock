import React, { useState, useEffect } from 'react';
import '../styles/CadastroClientes.css';
import { Link, useNavigate } from 'react-router-dom';

// Funções para salvar e buscar no LocalStorage
const getItensBD = () => JSON.parse(localStorage.getItem('dbclientes')) ?? [];
const setItensBD = itens => localStorage.setItem('dbclientes', JSON.stringify(itens));

function CadastroClientes() {

  const navigate = useNavigate();

  // Lista visível na tabela
  const [clients, setClients] = useState([]);

  // Carrega dados ao abrir a página
  useEffect(() => {
    setClients(getItensBD());
  }, []);

    const handleEdit = (id) => {
    navigate('/clientes/novo', { state: { editId: id } });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Confirma exclusão deste Cliente?')) return;
    const db = getItensBD();
    const novo = db.filter(item => item.id !== id);
    setClients(novo);
    setItensBD(novo);
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
          <input type="text" placeholder="Buscar por nome, telefone ou email..." className="search-input" />
          
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
            <th>Garantia</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((c, index) => (
            <tr key={c.id || index }>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.date}</td>
              <td>{c.cpf}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.type}</td>
              <td>{c.warranty}</td>

              {/* Ações */}
              <td className="actions">
                <span onClick={() => handleEdit(c.id)}>✏️</span>
                <span onClick={() => handleDelete(c.id)}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default CadastroClientes;
import React, { useState, useEffect } from 'react';
import '../styles.css/CadastroClientes.css';
import { useNavigate } from 'react-router-dom';

// Funções para salvar e buscar no LocalStorage
const getItensBD = () => JSON.parse(localStorage.getItem('dbfunc')) ?? [];
const setItensBD = itens => localStorage.setItem('dbfunc', JSON.stringify(itens));

function CadastroClientes() {

  const navigate = useNavigate();

  // Lista visível na tabela
  const [clients, setClients] = useState([]);

  // Carrega dados ao abrir a página
  useEffect(() => {
    setClients(getItensBD());
  }, []);

  // Função para deletar um cliente
  const handleDelete = (index) => {
    const novosItens = [...clients];
    novosItens.splice(index, 1);
    setClients(novosItens);
    setItensBD(novosItens);
  };

  // (Se quiser editar, depois criamos)
  const handleEdit = (index) => {
    alert("Editar cliente ID: " + clients[index].id);
  };

  return (
    <div className ='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

        <div className='BotoesNavegacao'>Dashboard</div>
        <div className='BotoesNavegacao'>Produtos</div>
        <div className='BotoesNavegacao'>Clientes</div>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <div className='BotoesNavegacao'>Manutenção</div>
        <div className='BotoesNavegacao'>Relatórios</div>
      </div>


      <h2 className="Clientes">Clientes</h2>
      <h2 className="gerencie-1">Gestão de clientes e histórico</h2> 

      <div className='Gestao' > 
        <h2 className="title">Lista de Clientes</h2>
        <h2 className="gerencie-2">Gerencie todos os produtos</h2> 

        <div className="actions-bar">
          <input type="text" placeholder="Buscar por nome, telefone ou email..." className="search-input" />
          
          {/* ✅ botão agora navega para tela de cadastro */}
          <button className="btn-primary" onClick={() => navigate("/NovoCadastro")}>
            + Novo Cliente
          </button>
        </div>
      </div>

      {/* ✅ TABELA */}
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
            <tr key={c.id}>
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
                <span onClick={() => handleEdit(index)}>✏️</span>
                <span onClick={() => handleDelete(index)}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default CadastroClientes;
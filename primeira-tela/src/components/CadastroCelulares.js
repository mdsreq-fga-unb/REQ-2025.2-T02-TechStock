import React, { useState, useEffect } from 'react';
import '../styles/CadastroCelulares.css';
import { useNavigate } from 'react-router-dom';

// Funções para salvar e buscar no LocalStorage
const getItensBD = () => JSON.parse(localStorage.getItem('dbcelulares')) ?? [];
const setItensBD = itens => localStorage.setItem('dbcelulares', JSON.stringify(itens));

function CadastroCelulares() {

  const navigate = useNavigate();

  // Lista visível na tabela
  const [celular, setCelular] = useState([]);

  // Carrega dados ao abrir a página
  useEffect(() => {
    setCelular(getItensBD());
  }, []);

  // Função para deletar um cliente
  const handleDelete = (index) => {
    const novosItens = [...celular];
    novosItens.splice(index, 1);
    setCelular(novosItens);
    setItensBD(novosItens);
  };

  // (Se quiser editar, depois criamos)
  const handleEdit = (index) => {
    alert("Editar celulares ID: " + celular[index].id);
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


      <h2 className="Clientes">Celulares</h2>
      <h2 className="gerencie-1">Gestão de celulares</h2> 

      <div className='Gestao' > 
        <h2 className="title">Registro e Controle de Celulares</h2>
        <h2 className="gerencie-2">Gerencie todos os Celulares</h2> 

        <div className="actions-bar">
          <input type="text" placeholder="Buscar Celulares..." className="search-input" />
          
          {/*botão agora navega para tela de cadastro */}
          <button className="btn-primary" onClick={() => navigate("/celulares/novo")}>
            + Novo Celulares
          </button>
        </div>
      </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Modelo</th>
            <th>Data de cadastro</th>
            <th>IMEI</th>
            <th>Cor</th>
            <th>Capacidade</th>
            <th>Estado</th>
            <th>Valor de Compra</th>
            <th>Garantia</th>
            <th>Defeitos Identificados</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {celular.map((c, index) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.modelo}</td>
              <td>{c.datacadastro}</td>
              <td>{c.imei}</td>
              <td>{c.cor}</td>
              <td>{c.capacidade}</td>
              <td>{c.estado}</td>
              <td>R${c.valorcompra ? parseFloat(c.valorcompra).toFixed(2).replace('.', ','):'0,00' }</td>
              <td>{c.warranty}</td>
              <td>{c.defeito}</td>
              

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

export default CadastroCelulares;
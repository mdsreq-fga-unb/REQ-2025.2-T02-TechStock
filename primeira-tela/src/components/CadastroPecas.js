import React, { useState, useEffect } from 'react';
import '../styles/NovoCadastroPecas.css';
import { useNavigate } from 'react-router-dom';

// Funções para salvar e buscar no LocalStorage
const getItensBD = () => JSON.parse(localStorage.getItem('dbpecas')) ?? [];
const setItensBD = itens => localStorage.setItem('dbpecas', JSON.stringify(itens));

function CadastroPecas() {

  const navigate = useNavigate();

  // Lista visível na tabela
  const [Pecas, setPecas] = useState([]);

  // Carrega dados ao abrir a página
  useEffect(() => {
    setPecas(getItensBD());
  }, []);

  // Função para deletar um cliente
  const handleDelete = (index) => {
    const novosItens = [...Pecas];
    novosItens.splice(index, 1);
    setPecas(novosItens);
    setItensBD(novosItens);
  };

  // (Se quiser editar, depois criamos)
  const handleEdit = (pecaId) => {
    alert("Editar peça ID: " + Pecas[pecaId].id);
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


      <h2 className="Clientes">Peças</h2>
      <h2 className="gerencie-1">Controle de peças para manutenção</h2> 

      <div className='Gestao' > 
        <h2 className="title">Controle De Peças para Manutenção</h2>
        <h2 className="gerencie-2">Gerencie todos os produtos</h2> 

        <div className="actions-bar">
          <input type="text" placeholder="Buscar Produtos" className="search-input" />
          
          {/*botão agora navega para tela de cadastro */}
          <button className="btn-primary" onClick={() => navigate("/pecas/novo")}>
            + Nova Peça
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
            <th>Código Interno</th>
            <th>Compatibilidade</th>
            <th>Nome Do Fornecedor</th>
            <th>Quantidade</th>
            <th>Garantia</th>
            <th> Preço </th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {Pecas.map((c, index) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.dataCadastro}</td>
              <td>{c.codigoInterno}</td>
              <td>{c.compatibilidade}</td>
              <td>{c.fornecedor}</td>
              <td>{c.quantidade}</td>
              <td>{c.warranty}</td>
              <td> R${c.preco ? parseFloat(c.preco).toFixed(2).replace('.', ','):'0,00' }</td>

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

export default CadastroPecas;
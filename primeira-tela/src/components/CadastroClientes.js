import React, { useState, useEffect } from 'react';
import '../styles.css/CadastroClientes.css';

const getItensBD = () => JSON.parse(localStorage.getItem('dbfunc')) ?? [];
const setItensBD = itens => localStorage.setItem('dbfunc', JSON.stringify(itens));

const Nome = () => {
  const [itens, setItens] = useState([]);
  const [clients] = useState([]); // Add this line
  const [editId, setEditId] = useState(undefined);
  const [form, setForm] = useState({ nome: '', funcao: '', salario: '' });

  useEffect(() => {
    setItens(getItensBD());
  }, []);

  useEffect(() => {
    setItensBD(itens);
  }, [itens]);

  const openModal = (edit = false, index = 0) => {
    if (edit) {
      setForm({
        nome: itens[index].nome,
        funcao: itens[index].funcao,
        salario: itens[index].salario,
      });
      setEditId(index);
    } else {
      setForm({ nome: '', funcao: '', salario: '' });
      setEditId(undefined);
    }
  };

  const handleEdit = index => {
    openModal(true, index);
  };

  const handleDelete = index => {
    const newItens = [...itens];
    newItens.splice(index, 1);
    setItens(newItens);
  };

  const handleSave = e => {
    e.preventDefault();
    if (!form.nome || !form.funcao || !form.salario) return;
    if (editId !== undefined) {
      const newItens = [...itens];
      newItens[editId] = { ...form };
      setItens(newItens);
    } else {
      setItens([...itens, { ...form }]);
    }
    setEditId(undefined);
    setForm({ nome: '', funcao: '', salario: '' });
  };

  return (
    <div className ='Container'>
      <li className='BarraSuperior'>
        <div className='LogoCellVex' >
          CellVex <p className='SistemaDeGestao'>
            Sistema De Gestão</p></div>
        <div className='BotoesNavegacao'>
          Dashboard</div>
        <div className='BotoesNavegacao' >Produtos</div>
        <div className='BotoesNavegacao' >Clientes</div>
        <div className='BotoesNavegacao' >Fornecedores</div>
        <div className='BotoesNavegacao' >Manutenção</div>
        <div className='BotoesNavegacao' >Relatórios</div>
      </li>

        <div className='Clientes' > </div>
      <h2 className="Clientes">Clientes</h2>
            <h2 className="gerencie">Gestão de clientes e histórico</h2> 
        <div className='Gestao' > </div>

      <h2 className="title">Lista de Clientes</h2>
            <h2 className="gerencie">Gerencie todos os produtos</h2> 

      <div className="actions-bar">
        <input type="text" placeholder="Buscar por nome, telefone ou email..." className="search-input" />
        <button className="btn-primary" onClick={handleSave}>+ Novo Cliente</button>
      </div>

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
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.date}</td>
              <td>{c.cpf}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
              <td>{c.type}</td>
              <td>{c.warranty}</td>
              <td className="actions">⚙️ ✏️ 🗑️</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table >
        <tbody>
          {itens.map((item, index) => (
            <tr key={index}>
              <td>{item.nome}</td>
              <td>{item.funcao}</td>
              <td>R$ {item.salario}</td>
              <td className="acao" >
                <button
                  onClick={() => handleEdit(index)}>
                  Edit
                </button>
              </td>
              <td className="acao">
                <button  onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Nome;

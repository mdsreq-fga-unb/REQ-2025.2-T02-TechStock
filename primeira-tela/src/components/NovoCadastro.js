import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/NovoCadastro.css';

const getItensBD = () => JSON.parse(localStorage.getItem('dbclientes')) ?? [];
const setItensBD = itens => localStorage.setItem('dbclientes', JSON.stringify(itens));

function NovoCadastro() {

  const navigate = useNavigate();
  

  // Estados dos campos
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Cliente Comum");
  const [warranty, setWarranty] = useState("Sem Garantia");

  const handleSave = () => {
    const db = getItensBD();
    
    const newClient = {
      id: db.length + 1,
      name,
      cpf,
      phone,
      email,
      type,
      warranty,
      date: new Date().toLocaleDateString(),
    };

    setItensBD([...db, newClient]);

    alert("Cliente cadastrado com sucesso!");
    navigate("/"); // volta para lista
  };

  return (
    <div className="novo-container">

      <h2>Adicionar Cliente</h2>

      <div className="form-box">

        <label>Nome Completo:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <label>CPF:</label>
        <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} />

        <label>Telefone:</label>
        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />

        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

        <label>Tipo de Cliente:</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option>Cliente Comum</option>
          <option>Cliente Fiel</option>
          <option>Revendedor</option>
        </select>

        <label>Garantia:</label>
        <select value={warranty} onChange={e => setWarranty(e.target.value)}>
          <option>Sem Garantia</option>
          <option>90 dias</option>
          <option>1 ano</option>
        </select>

        <button className="btn-primary" onClick={handleSave}>Salvar Cliente</button>

        <button className="btn-secondary" onClick={() => navigate("/clientes")}>Cancelar</button>

      </div>

    </div>
  );
}

export default NovoCadastro;
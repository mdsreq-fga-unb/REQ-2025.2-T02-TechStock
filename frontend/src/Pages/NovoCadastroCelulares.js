import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/NovoCadastroCelulares.css';

const getItensBD = () => JSON.parse(localStorage.getItem('dbcelulares')) ?? [];
const setItensBD = itens => localStorage.setItem('dbcelulares', JSON.stringify(itens));

function NovoCadastroCelulares() {

  const navigate = useNavigate();
  

  // Estados dos campos
    const [modelo, setModelo] = useState("");
    const [imei, setIMEI] = useState("");
    const [cor, setCor] = useState("");
    const [capacidade, setCapacidade] = useState("");
    const [estado, setEstado] = useState("");
    const [valorcompra, setValorCompra] = useState("");
    const [warranty, setWarranty] = useState("Sem Garantia");
    const [defeito, setDefeito] = useState("");
    const [message, setMessage] = useState("");

   const handleSave = () => {
        // Validação simples
        if (!modelo || !imei || !cor || !capacidade || !estado  || !valorcompra || !defeito ) {
            setMessage("Erro: Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        const db = getItensBD();
        
        const novoCelular = {
            id: db.length + 1,
            modelo,
            imei, 
            cor, 
            capacidade, 
            estado,
            valorcompra: parseFloat(String(valorcompra).replace(',', '.')) || 0, 
            warranty,
            defeito,
            datacadastro: new Date().toLocaleDateString('pt-BR'), 
        };

        setItensBD([...db, novoCelular]);

        setMessage("celular cadastrado com sucesso!");
        
        // Navegar de volta à lista após um pequeno delay para que a mensagem seja vista
        setTimeout(() => {
            navigate("/celulares");
        }, 1500); 
    };

  return (
    <div className="novo-container">

      <h2>Novo Celular</h2>

      <div className="form-box">
        {/* Caixa de Mensagem Customizada (Substituindo alert) */}
            {message && (
                <div className={`message-box ${message.includes("sucesso") ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center`}>
                    <span>{message}</span>
                    <button className="font-bold text-lg leading-none" onClick={() => setMessage("")}>&times;</button>
                </div>
            )}

        <label>Modelo:</label>
        <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} />

        <label>IMEI:</label>
        <input type="text" value={imei} onChange={e => setIMEI(e.target.value)} />

        <label>Cor:</label>
        <input type="text" value={cor} onChange={e => setCor(e.target.value)} />

        <label>Capacidade:</label>
        <input type="text" value={capacidade} onChange={e => setCapacidade(e.target.value)} />

        <label>Estado:</label>
        <input type="text" value={estado} onChange={e => setEstado(e.target.value)} />

        <label>Valor de Compra:</label>
        <input type="text" value={valorcompra} onChange={e => setValorCompra(e.target.value)} />

        <label>Garantia:</label>
        <select value={warranty} onChange={e => setWarranty(e.target.value)}>
          <option>Sem Garantia</option>
          <option>90 dias</option>
          <option>1 ano</option>
        </select>

        <label>Defeitos Indentificados:</label>
        <input type="text" value={defeito} onChange={e => setDefeito(e.target.value)} />

        <button className="btn-primary" onClick={handleSave}>Salvar Celular</button>

        <button className="btn-secondary" onClick={() => navigate("/celulares/novo")}>Cancelar</button>

      </div>

    </div>
  );
}

export default NovoCadastroCelulares;
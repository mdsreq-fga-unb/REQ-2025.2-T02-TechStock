import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/NovoCadastroPecas.css';

const getItensBD = () => JSON.parse(localStorage.getItem('dbpecas')) ?? [];
const setItensBD = itens => localStorage.setItem('dbpecas', JSON.stringify(itens));

function NovoCadastroPecas() {

  const navigate = useNavigate();
  

  // Estados dos campos
    const [name, setName] = useState("");
    const [codigoInterno, setCodigoInterno] = useState("");
    const [compatibilidade, setCompatibilidade] = useState("");
    const [fornecedor, setFornecedor] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [warranty, setWarranty] = useState("Sem Garantia");
    const [preco, setPreco] = useState("");
    const [message, setMessage] = useState("");

   const handleSave = () => {
        // Validação simples
        if (!name || !codigoInterno || !quantidade || !fornecedor || !preco) {
            setMessage("Erro: Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        const db = getItensBD();
        
        const novaPeca = {
            id: db.length + 1,
            name,
            codigoInterno, 
            compatibilidade, 
            fornecedor, 
            quantidade: parseInt(quantidade) || 0, 
            warranty,
            preco: parseFloat(String(preco).replace(',', '.')) || 0,
            dataCadastro: new Date().toLocaleDateString('pt-BR'), 
        };

        setItensBD([...db, novaPeca]);

        setMessage("Peça cadastrada com sucesso!");
        
        // Navegar de volta à lista após um pequeno delay para que a mensagem seja vista
        setTimeout(() => {
            navigate("/pecas");
        }, 1500); 
    };

  return (
    <div className="novo-container-pecas">

      <h2>Nova Peça</h2>

      <div className="form-box-pecas">
        {/* Caixa de Mensagem Customizada (Substituindo alert) */}
            {message && (
                <div className={`message-box ${message.includes("sucesso") ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center`}>
                    <span>{message}</span>
                    <button className="font-bold text-lg leading-none" onClick={() => setMessage("")}>&times;</button>
                </div>
            )}

        <label>Nome:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <label>Código Interno:</label>
        <input type="text" value={codigoInterno} onChange={e => setCodigoInterno(e.target.value)} />

        <label>Compatibilidade:</label>
        <input type="text" value={compatibilidade} onChange={e => setCompatibilidade(e.target.value)} />

        <label>Quantidade:</label>
        <input type="text" value={quantidade} onChange={e => setQuantidade(e.target.value)} />

        <label>Nome Do Fornecedor:</label>
        <input type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)} />

        <label>Preco:</label>
        <input type="text" value={preco} onChange={e => setPreco(e.target.value)} />

        <label>Garantia:</label>
        <select value={warranty} onChange={e => setWarranty(e.target.value)}>
          <option>Sem Garantia</option>
          <option>90 dias</option>
          <option>1 ano</option>
        </select>

        <button className="btn-primary" onClick={handleSave}>Salvar Peça</button>

        <button className="btn-secondary" onClick={() => navigate("/pecas")}>Cancelar</button>

      </div>

    </div>
  );
}

export default NovoCadastroPecas;
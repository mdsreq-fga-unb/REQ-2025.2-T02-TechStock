import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../styles/NovoOrdemDeSevico.css';

const getItensBD = () => JSON.parse(localStorage.getItem('dbOS')) ?? [];
const setItensBD = itens => localStorage.setItem('dbOS', JSON.stringify(itens));

function NovoOS() {

  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  

  // Estados dos campos
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [status, setStatus] = useState('');
    const [teste, setTeste] = useState('');
    const [message, setMessage] = useState("");

     const handleSave = () => {
        // Validação simples
        if (!nome || !descricao || !valor || !status || !teste) {
            setMessage("Erro: Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        
        const db = getItensBD();
      // Se estiver editando, atualiza o registro existente
      if (editingId) {
        const atualizado = db.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              nome,
              descricao,
              valor,
              status,
              teste,
              preco: parseFloat(String(valor).replace(',', '.')) || 0,
            };
          }
          return item;
        });
        setItensBD(atualizado);
        setMessage("OS atualizada com sucesso!");
        setTimeout(() => navigate("/ordemdeservico"), 1200);
        return;
      }

      const novaOS = {
        id: db.length + 1,
        nome,
        descricao,
        valor,
        status,
        teste,
        preco: parseFloat(String(valor).replace(',', '.')) || 0,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
      };

      setItensBD([...db, novaOS]);

      setMessage("OS cadastrada com sucesso!");
        
      // Navegar de volta à lista após um pequeno delay para que a mensagem seja vista
      setTimeout(() => {
        navigate("/ordemdeservico");
      }, 1500); 
    };

    // Se vier com editId via state, pré-preenche o formulário
    useEffect(() => {
    const editId = location?.state?.editId;
    if (editId) {
      const db = getItensBD();
      const item = db.find(i => i.id === editId);
      if (item) {
      setEditingId(item.id);
      setNome(item.nome || '');
      setDescricao(item.descricao || '');
      setValor(item.valor || '');
      setStatus(item.status || '');
      setTeste(item.teste || '');
      }
    }
    }, [location]);

  return (
    <div className="novo-container-OS">

      <h2>Nova Ordem De Serviço</h2>

      <div className="form-box-OS">
        {/* Caixa de Mensagem Customizada (Substituindo alert) */}
            {message && (
                <div className={`message-box ${message.includes("sucesso") ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center`}>
                    <span>{message}</span>
                    <button className="font-bold text-lg leading-none" onClick={() => setMessage("")}>&times;</button>
                </div>
            )}

        <label>Nome:</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)} />

        <label>Descrição:</label>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} />

        <label>Valor:</label>
        <input type="text" value={valor} onChange={e => setValor(e.target.value)} />

        <label>Status:</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option>Em Andamento</option>
          <option>Concluido</option>
            <option>Pendente</option>
        </select>

        <label>Teste:</label>
        <select value={teste} onChange={e => setTeste(e.target.value)} >
        <option >Concluido</option>
        <option >Inacapado</option>
        </select>

        <button className="btn-primary" onClick={handleSave}>{editingId ? 'Salvar Alterações' : 'Cadastrar OS'}</button>

        <button className="btn-secondary" onClick={() => navigate("/ordemdeservico")}>Cancelar</button>

      </div>

    </div>
  );
}

export default NovoOS;
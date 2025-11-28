import React, { useState, useEffect } from 'react';
import '../styles/vendas.css';
import { Link, useNavigate } from 'react-router-dom';
import { vendasApi } from '../services/api';

function Vendas() {
  const navigate = useNavigate();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    vendasApi
      .list(search ? { q: search } : {})
      .then((data) => {
        if (!active) return;
        setVendas(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar as vendas.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover esta venda?')) return;
    try {
      await vendasApi.remove(id);
      setVendas((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover venda.');
    }
  };

  const handleEdit = (id) => {
    // Navegar para edição (rota não implementada aqui, ajustar se existir)
    navigate('/vendas/novo', { state: { editId: id } });
  };


 
  return (
    <div className ='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>
                <Link to="/vendas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Vendas</Link>
                <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
                <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
                <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
                <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
                <div className='BotoesNavegacao'>Fornecedores</div>
                <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Manutenção</Link>
                <div className='BotoesNavegacao'>Relatórios</div>
          </div>


      <h2 className="Clientes">Vendas</h2>
      <h2 className="gerencie-1">Gestão de Vendas</h2> 

      <div className='Gestao' > 
        <h2 className="title">Registro e Controle de Vendas</h2>
        <h2 className="gerencie-2">Gerencie todas as Vendas</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar vendas..."
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          
          {/*botão agora navega para tela de cadastro */}
          <button className="btn-primary" onClick={() => navigate("/vendas/novo")}>
            + Novas Vendas
          </button>
        </div>
      </div>

      {/*TABELA */}
      <table className="client-table">
        <thead>
          <tr>
            <th>Data de cadastro</th>
            <th>celular</th>
            <th>cliente</th>
            <th>Valor de Compra</th>
            <th>Garantia padrão (dias)</th>
            <th>Garantia validade</th>
            <th> Observaçoes</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={11} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={11}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && vendas.length === 0 && (
            <tr>
              <td colSpan={11}>Nenhuma venda encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            vendas.map((item) => (
              <tr key={item.id}>
                <td>{item.data_venda ? new Date(item.data_venda).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{item.celular?.modelo || '-'}</td>
                <td>{item.cliente?.nome || '-'}</td>
                <td>{item.valor_venda != null ? `R$ ${Number(item.valor_venda).toFixed(2).replace('.', ',')}` : '-'}</td>
                <td>{item.garantia_dias ?? '-'}</td>
                <td>{item.garantia_validade ? new Date(item.garantia_validade).toLocaleDateString('pt-BR') : '-'}</td>
                <td>{item.observacoes || '-'}</td>
                <td className="actions">
                  <span onClick={() => handleEdit(item.id)}>✏️</span>
                  <span onClick={() => handleDelete(item.id)}>🗑️</span>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
}

export default Vendas;
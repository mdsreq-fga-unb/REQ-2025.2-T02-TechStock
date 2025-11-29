import React, { useState, useEffect } from 'react';
import '../styles/NovoCadastroPecas.css';
import { Link, useNavigate } from 'react-router-dom';
import { pecasApi } from '../services/api';

function CadastroPecas() {
  const navigate = useNavigate();
  const [pecas, setPecas] = useState([]);
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
    pecasApi
      .list(search ? { q: search } : {})
      .then((data) => {
        if (!active) return;
        setPecas(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar as peças.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover esta peça?')) return;
    try {
      await pecasApi.remove(id);
      setPecas((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover peça.');
    }
  };

  const handleEdit = (id) => {
    navigate('/pecas/novo', { state: { editId: id } });
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
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celulares</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotaoLogout'>Sair</Link> 
        </div>
       


      <h2 className="Clientes">Peças</h2>
      <h2 className="gerencie-1">Controle de peças para manutenção</h2> 

      <div className='Gestao' > 
        <h2 className="title">Controle De Peças para Manutenção</h2>
        <h2 className="gerencie-2">Gerencie todos os produtos</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar por nome ou código"
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          
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
            <th>Nome do Fornecedor</th>
            <th>Quantidade</th>
            <th>Garantia (dias)</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {error && (
            <tr>
              <td colSpan={8} className="error-row">{error}</td>
            </tr>
          )}
          {loading && !error && (
            <tr>
              <td colSpan={8}>Carregando...</td>
            </tr>
          )}
          {!loading && !error && pecas.length === 0 && (
            <tr>
              <td colSpan={8}>Nenhuma peça encontrada.</td>
            </tr>
          )}
          {!loading && !error &&
            pecas.map((peca) => (
              <tr key={peca.id}>
                <td>{peca.id}</td>
                <td>{peca.nome}</td>
                <td>
                  {peca.data_cadastro
                    ? new Date(peca.data_cadastro).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{peca.codigo_interno}</td>
                <td>{peca.compatibilidade || '-'}</td>
                <td>{peca.nome_fornecedor}</td>
                <td>{peca.quantidade}</td>
                <td>{peca.garantia_padrao_dias ?? '-'}</td>
                <td className="actions">
                  <span onClick={() => handleEdit(peca.id)}>✏️</span>
                  <span onClick={() => handleDelete(peca.id)}>🗑️</span>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
}

export default CadastroPecas;
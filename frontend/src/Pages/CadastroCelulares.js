import React, { useState, useEffect } from 'react';
import '../styles/CadastroCelulares.css';
import { Link, useNavigate } from 'react-router-dom';
import { celularesApi } from '../services/api';

function CadastroCelulares() {
  const navigate = useNavigate();
  const [celulares, setCelulares] = useState([]);
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
    celularesApi
      .list(search ? { q: search } : {})
      .then((data) => {
        if (!active) return;
        setCelulares(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar os celulares.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover este aparelho?')) return;
    try {
      await celularesApi.remove(id);
      setCelulares((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Erro ao remover celular.');
    }
  };


   const handleEdit = (id) => {
    navigate('/celulares/novo', { state: { editId: id } });
  };
 
  return (
    <div className ='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

                <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
                <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
                <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
                <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
                <div className='BotoesNavegacao'>Fornecedores</div>
                <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Manutenção</Link>
                <div className='BotoesNavegacao'>Relatórios</div>
          </div>


      <h2 className="Clientes">Celulares</h2>
      <h2 className="gerencie-1">Gestão de celulares</h2> 

      <div className='Gestao' > 
        <h2 className="title">Registro e Controle de Celulares</h2>
        <h2 className="gerencie-2">Gerencie todos os Celulares</h2> 

        <div className="actions-bar">
          <input
            type="text"
            placeholder="Buscar celulares..."
            className="search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          
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
            <th>Status</th>
            <th>Valor de Compra</th>
            <th>Garantia padrão (dias)</th>
            <th>Defeitos Identificados</th>
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
          {!loading && !error && celulares.length === 0 && (
            <tr>
              <td colSpan={11}>Nenhum aparelho encontrado.</td>
            </tr>
          )}
          {!loading && !error &&
            celulares.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.modelo}</td>
                <td>
                  {item.data_cadastro
                    ? new Date(item.data_cadastro).toLocaleDateString('pt-BR')
                    : '-'}
                </td>
                <td>{item.imei}</td>
                <td>{item.cor || '-'}</td>
                <td>{item.capacidade || '-'}</td>
                <td>{item.status}</td>
                <td>
                  {item.valor_compra
                    ? `R$ ${Number(item.valor_compra).toFixed(2).replace('.', ',')}`
                    : '-'}
                </td>
                <td>{item.garantia_padrao_dias ?? '-'}</td>
                <td>{item.defeitos_identificados || '-'}</td>
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

export default CadastroCelulares;
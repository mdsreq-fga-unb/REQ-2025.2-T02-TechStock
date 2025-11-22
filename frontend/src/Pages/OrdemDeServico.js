
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Users, Wrench, TrendingUp } from 'lucide-react';
import '../styles/OrdemDeServiço.css';
import { dadosDoSistema } from './dados';

const getItensBD = () => JSON.parse(localStorage.getItem('dbOS')) ?? [];
const setItensBD = itens => localStorage.setItem('dbOS', JSON.stringify(itens));

const OrdensServico = () => {
  const navigate = useNavigate();
  const [ordemdeservico, setOrdemDeServico] = useState([]);

  useEffect(() => {
    setOrdemDeServico(getItensBD());
  }, []);

  const handleEdit = (id) => {
    navigate('/novaOS', { state: { editId: id } });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Confirma exclusão desta Ordem de Serviço?')) return;
    const db = getItensBD();
    const novo = db.filter(item => item.id !== id);
    setItensBD(novo);
    setOrdemDeServico(novo);
  };

  const renderIcone = (nome) => {
    switch(nome) {
      case 'package': return <Package size={24} color="white" />;
      case 'users': return <Users size={24} color="white" />;
      case 'wrench': return <Wrench size={24} color="white" />;
      case 'trending-up': return <TrendingUp size={24} color="white" />;
      default: return <Package size={24} color="white" />;
    }
  };

  return (
    <div className='Container'>
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

      <div className='ConteudoDashboard'>
        <div className='GradeMetricas'>
          {dadosDoSistema.metricas.map((metrica) => (
            <div key={metrica.id} className='CartaoMetrica'>
              <div className='CabecalhoCartao'>
                <span>{metrica.titulo}</span>
                <div className='IconeFundoRoxo'>{renderIcone(metrica.icone)}</div>
              </div>
              <div className='ValorGrande'>{metrica.valor}</div>
              <div className={`TextoCrescimento ${metrica.status}`}>
                {metrica.crescimeto || metrica.crescimento || ''} <span className='TextoCinza'>em relação ao mês anterior</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='Gestao' >
        <h2 className="title">Lista de Ordens de Serviço</h2>
        <h2 className="gerencie-2">Gerencie todas as ordens</h2>

        <div className="actions-bar">
          <input type="text" placeholder="Buscar por nome, telefone ou email..." className="search-input" />

          <button className="btn-primary" onClick={() => navigate("/novaOS")}>+ Nova OS</button>
        </div>
      </div>

      <table className="client-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Data de cadastro</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Teste</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {ordemdeservico.map((c, index) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
              <td>{c.dataCadastro}</td>
              <td>{c.descricao}</td>
              <td>{c.valor}</td>
              <td>{c.status}</td>
              <td>{c.teste}</td>
              
              <td className="actions">
                <span onClick={() => handleEdit(c.id)}>✏️</span>
                <span onClick={() => handleDelete(c.id)}>🗑️</span>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
export default OrdensServico;
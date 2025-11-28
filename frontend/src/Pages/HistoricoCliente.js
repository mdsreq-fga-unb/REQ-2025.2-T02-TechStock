import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HistoricoCliente.css';

// Mock de histórico relacionado a clientes (movimentações como cadastro, atualização, venda associada, devolução)
const mockHistoricoClientes = [
  { id: 201, clienteId: 1, nome: 'João da Silva', data_movimentacao: new Date(Date.now() - 86400000 * 20).toISOString(), tipo_movimentacao: 'Cadastro', usuario: 'Admin', detalhes: 'Cliente cadastrado via loja' },
  { id: 202, clienteId: 2, nome: 'Maria Souza', data_movimentacao: new Date(Date.now() - 86400000 * 10).toISOString(), tipo_movimentacao: 'Atualização Cadastro', usuario: 'Atendimento', detalhes: 'Atualizou telefone e email' },
  { id: 203, clienteId: 1, nome: 'João da Silva', data_movimentacao: new Date(Date.now() - 86400000 * 5).toISOString(), tipo_movimentacao: 'Venda', usuario: 'Vendedor A', detalhes: 'Venda de iPhone 13' },
  { id: 204, clienteId: 3, nome: 'Carlos Lima', data_movimentacao: new Date(Date.now() - 86400000 * 3).toISOString(), tipo_movimentacao: 'Devolução', usuario: 'Operações', detalhes: 'Devolução por defeito' },
  { id: 205, clienteId: 2, nome: 'Maria Souza', data_movimentacao: new Date(Date.now() - 86400000 * 1).toISOString(), tipo_movimentacao: 'Contato Suporte', usuario: 'Suporte', detalhes: 'Orientação sobre garantia' },
];

// API simulada para histórico de clientes
const clientesHistoricoApi = {
  list: (params) => new Promise((resolve) => {
    setTimeout(() => {
      const q = (params.q || '').toLowerCase();
      const filtered = mockHistoricoClientes.filter(h =>
        h.nome.toLowerCase().includes(q) ||
        (h.detalhes || '').toLowerCase().includes(q) ||
        h.clienteId.toString().includes(q)
      );
      const sorted = filtered.sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao));
      resolve({ items: sorted });
    }, 400);
  }),
};

const HistoricoClientesTable = () => {
  const [historico, setHistorico] = useState([]);
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
    clientesHistoricoApi
      .list(search ? { q: search } : {})
      .then((data) => {
        if (!active) return;
        setHistorico(data?.items || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar o histórico de clientes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [search]);

  const getStatusColor = (tipo) => {
    switch (tipo) {
      case 'Cadastro': return 'text-green-600 bg-green-100';
      case 'Venda': return 'text-red-600 bg-red-100';
      case 'Atualização Cadastro': return 'text-yellow-600 bg-yellow-100';
      case 'Devolução': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

        <Link to="/vendas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Vendas</Link>
        <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
        <Link to="/dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Manutenção</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
      </div>

      <h2 className="Clientes">Histórico</h2>
      <h2 className="gerencie-1">Histórico de clientes</h2>

      <div className='Gestao'>
        <h2 className="titulo">Histórico de Clientes</h2>
        <h2 className="gerencie-2">Registro de ações relacionadas aos clientes</h2>

        <div className="barra-acoes">
          <input
            type="text"
            placeholder="Buscar no histórico de clientes..."
            className="campo-busca"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <button className="botao-primario" onClick={() => window.location.reload()} title="Atualizar lista">Atualizar</button>
        </div>

        <div className="container-tabela" style={{ marginTop: 18 }}>
          <table className="tabela-historico">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data/Hora</th>
                <th>ID Cliente</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Usuário</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={7} className="linha-erro">{error}</td>
                </tr>
              )}

              {loading && !error && (
                <tr>
                  <td colSpan={7}>Carregando Histórico...</td>
                </tr>
              )}

              {!loading && !error && historico.length === 0 && (
                <tr>
                  <td colSpan={7}>Nenhuma movimentação encontrada.</td>
                </tr>
              )}

              {!loading && !error && historico.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.data_movimentacao ? new Date(item.data_movimentacao).toLocaleString('pt-BR') : '-'}</td>
                  <td>{item.clienteId}</td>
                  <td>{item.nome}</td>
                  <td><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.tipo_movimentacao)}`}>{item.tipo_movimentacao}</span></td>
                  <td>{item.usuario}</td>
                  <td>{item.detalhes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function HistoricoCliente() {
  return (
    <div className="font-sans antialiased bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <HistoricoClientesTable />
      </div>
    </div>
  );
}

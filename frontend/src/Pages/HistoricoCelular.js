import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HistoricoCelular.css';

// =========================================================
// MOCKS E API SIMULADA - Definição dos dados
// =========================================================

// Dados simulados para o Histórico de Celulares (Movimentações)
const mockHistorico = [
    { id: 101, celularId: 1, modelo: 'iPhone 13 Pro', data_movimentacao: new Date(Date.now() - 86400000 * 30).toISOString(), tipo_movimentacao: 'Entrada Estoque', usuario: 'João Silva', detalhes: 'Lote inicial' },
    { id: 102, celularId: 2, modelo: 'Samsung Galaxy S21', data_movimentacao: new Date(Date.now() - 86400000 * 15).toISOString(), tipo_movimentacao: 'Reparo Interno', usuario: 'Pedro Técnico', detalhes: 'Troca de bateria' },
    { id: 103, celularId: 1, modelo: 'iPhone 13 Pro', data_movimentacao: new Date(Date.now() - 86400000 * 5).toISOString(), tipo_movimentacao: 'Venda', usuario: 'Maria Souza', detalhes: 'Venda para Cliente X' },
    { id: 104, celularId: 3, modelo: 'Motorola G9', data_movimentacao: new Date(Date.now() - 86400000 * 2).toISOString(), tipo_movimentacao: 'Devolução/Estoque', usuario: 'João Silva', detalhes: 'Devolução por arrependimento' },
    { id: 105, celularId: 2, modelo: 'Samsung Galaxy S21', data_movimentacao: new Date(Date.now() - 86400000 * 1).toISOString(), tipo_movimentacao: 'Transferência', usuario: 'Ana Logística', detalhes: 'Movido para filial B' },
];

// Mock da API para Histórico
const celularesHistoricoApi = {
    list: (params) => new Promise((resolve) => {
      setTimeout(() => {
        // Lógica de filtro: verifica se a query está contida no modelo, usuário ou ID do celular
        const q = (params.q || '').toLowerCase();
        const filteredItems = mockHistorico.filter(h => 
          h.modelo.toLowerCase().includes(q) || 
          h.usuario.toLowerCase().includes(q) ||
          h.celularId.toString().includes(q)
        );
        // Ordena por data de movimentação decrescente (mais recente primeiro)
        const sortedItems = filteredItems.sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao));
        resolve({ items: sortedItems });
      }, 500); // Simula o atraso da rede
    }),
};

// =========================================================
// COMPONENTE DE TABELA DE HISTÓRICO
// =========================================================

const HistoricoCelularesTable = () => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
  
    // Efeito para criar um 'debounce' na busca, esperando o usuário terminar de digitar
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Efeito para buscar os dados sempre que o termo de busca (search) mudar
    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        
        celularesHistoricoApi
            .list(search ? { q: search } : {})
            .then((data) => {
                if (!active) return;
                setHistorico(data?.items || []);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.message || 'Não foi possível carregar o histórico de celulares.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });
            
        // Cleanup function para evitar a atualização de estado em componente desmontado
        return () => {
            active = false;
        };
    }, [search]);

    // Função auxiliar para determinar a cor do badge de status
    const getStatusColor = (tipo) => {
        switch (tipo) {
            case 'Entrada Estoque': return 'text-green-600 bg-green-100';
            case 'Venda': return 'text-red-600 bg-red-100';
            case 'Reparo Interno': return 'text-yellow-600 bg-yellow-100';
            case 'Devolução/Estoque': return 'text-blue-600 bg-blue-100';
            case 'Transferência': return 'text-indigo-600 bg-indigo-100';
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
            <h2 className="gerencie-1">Histórico de movimentações</h2>

            <div className='Gestao'>
                <h2 className="titulo">Histórico de Celulares</h2>
                <h2 className="gerencie-2">Registro de todas as movimentações de aparelhos</h2>

                <div className="barra-acoes">
                    <input
                        type="text"
                        placeholder="Buscar no histórico..."
                        className="campo-busca"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                    />

                    <button className="botao-primario" onClick={() => window.location.reload()} title="Atualizar lista">Atualizar</button>
                </div>

                <div className="container-tabela" style={{ marginTop: 18 }}>
                    <table className="tabela-historico">
                        <thead>
                            <tr>
                                <th>ID Mov.</th>
                                <th>Data/Hora</th>
                                <th>ID Celular</th>
                                <th>Modelo</th>
                                <th>Tipo Movimentação</th>
                                <th>Usuário Resp.</th>
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
                                    <td colSpan={7}>Nenhuma movimentação histórica encontrada.</td>
                                </tr>
                            )}

                            {!loading && !error && historico.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.data_movimentacao ? new Date(item.data_movimentacao).toLocaleString('pt-BR') : '-'}</td>
                                    <td>{item.celularId}</td>
                                    <td>{item.modelo}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.tipo_movimentacao)}`}>{item.tipo_movimentacao}</span>
                                    </td>
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


// =========================================================
// COMPONENTE PRINCIPAL (App) - Apenas renderiza a tabela isolada
// =========================================================
export default function HistoricoCelular() {
    return (
        <div className="font-sans antialiased bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <HistoricoCelularesTable />
            </div>
        </div>
    );
}
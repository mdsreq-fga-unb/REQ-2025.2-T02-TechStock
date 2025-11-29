import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vendasApi } from '../services/api'; 
import "../styles/NovaVenda.css";

function NovaVenda() {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = location.state?.editId; // ID para edição
    const isEditing = !!editId;

    // Estado inicial dos campos do formulário
    const [formData, setFormData] = useState({
        clienteId: '', // ID do cliente
        celularId: '', // ID do celular/produto vendido
        data_venda: new Date().toISOString().substring(0, 10), // Data padrão
        valor_venda: '',
        garantia_dias: 90, 
        observacoes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Efeito para carregar dados para edição
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            vendasApi.getById(editId)
                .then(data => {
                    setFormData({
                        clienteId: data.clienteId || '',
                        celularId: data.celularId || '',
                        // Formato 'YYYY-MM-DD' para o input type="date"
                        data_venda: data.data_venda ? new Date(data.data_venda).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                        valor_venda: data.valor_venda || '',
                        garantia_dias: data.garantia_dias || 90,
                        observacoes: data.observacoes || '',
                    });
                })
                .catch(err => {
                    setError('Erro ao carregar dados da venda para edição.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [editId, isEditing]);


    // Função genérica para atualizar o estado ao mudar o campo
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função de submissão do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepara os dados: substitui vírgula por ponto no valor de venda para garantir que seja um número
        const dataToSave = {
            ...formData,
            valor_venda: parseFloat(String(formData.valor_venda).replace(',', '.'))
        };
        
        try {
            if (isEditing) {
                await vendasApi.update(editId, dataToSave);
                alert('Venda atualizada com sucesso!');
            } else {
                await vendasApi.create(dataToSave);
                alert('Venda cadastrada com sucesso!');
            }
            // Navega de volta para a lista de vendas
            navigate('/vendas'); 
        } catch (err) {
            console.error('Erro ao salvar venda:', err);
            setError(err.message || 'Erro ao salvar a venda. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div>Carregando dados para edição...</div>;

    return (
        <div className='novo-container-venda'>
            <h2>{isEditing ? 'Editar Venda' : 'Nova Venda'}</h2>
            
            <div className="form-box-venda">
                {error && <p className="error-message">{error}</p>}
                
                <div>
                    <label htmlFor="clienteId">ID do Cliente:</label>
                    <input
                        type="text"
                        id="clienteId"
                        name="clienteId"
                        value={formData.clienteId}
                        onChange={handleChange}
                        placeholder="Insira o ID do Cliente"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="celularId">ID do Celular/Produto:</label>
                    <input
                        type="text"
                        id="celularId"
                        name="celularId"
                        value={formData.celularId}
                        onChange={handleChange}
                        placeholder="Insira o ID do Celular"
                        required
                    />
                </div>

                {/* Data da Venda */}
                <div>
                    <label htmlFor="data_venda">Data da Venda:</label>
                    <input
                        type="date"
                        id="data_venda"
                        name="data_venda"
                        value={formData.data_venda}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Valor da Venda */}
                <div>
                    <label htmlFor="valor_venda">Valor da Venda (R$):</label>
                    <input
                        type="number"
                        id="valor_venda"
                        name="valor_venda"
                        value={formData.valor_venda}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0,00"
                        required
                    />
                </div>

                {/* Garantia (Dias) */}
                <div>
                    <label htmlFor="garantia_dias">Garantia Padrão (Dias):</label>
                    <input
                        type="number"
                        id="garantia_dias"
                        name="garantia_dias"
                        value={formData.garantia_dias}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>
                
                {/* Observações */}
                <div>
                    <label htmlFor="observacoes">Observações:</label>
                    <textarea
                        id="observacoes"
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows="4"
                    ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={loading}>
                        {loading ? 'Salvando...' : (isEditing ? 'Atualizar Venda' : 'Cadastrar Venda')}
                    </button>
                    <button type="button" onClick={() => navigate('/vendas')} className="btn-secondary">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NovaVenda;
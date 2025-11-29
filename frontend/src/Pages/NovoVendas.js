import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { vendasApi, clientesApi, celularesApi } from '../services/api';
import "../styles/NovaVenda.css";

const DEFAULT_GARANTIA = 90;
const TODAY = new Date().toISOString().substring(0, 10);

const selectStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: '45px',
        marginBottom: '15px',
        borderRadius: '8px',
        borderColor: '#ccc',
        boxShadow: 'none',
        '&:hover': { borderColor: '#888' },
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

function NovaVenda() {
    const navigate = useNavigate();
    const location = useLocation();
    const editId = location.state?.editId;
    const isEditing = Boolean(editId);

    const [formData, setFormData] = useState({
        cliente_id: '',
        celular_id: '',
        data_venda: TODAY,
        valor_venda: '',
        garantia_dias: DEFAULT_GARANTIA,
        observacoes: '',
    });
    const [clientes, setClientes] = useState([]);
    const [celulares, setCelulares] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [initialLoading, setInitialLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        setLoadingOptions(true);
        Promise.all([
            clientesApi.list({ pageSize: 100 }),
            celularesApi.list({ pageSize: 100, status: 'EmEstoque' }),
        ])
            .then(([clientesRes, celularesRes]) => {
                if (!active) return;
                setClientes(clientesRes?.items || []);
                setCelulares(celularesRes?.items || []);
            })
            .catch((err) => {
                if (active) setError(err.message || 'Erro ao carregar clientes e celulares.');
            })
            .finally(() => {
                if (active) setLoadingOptions(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isEditing) return;
        setInitialLoading(true);
        vendasApi.getById(editId)
            .then((data) => {
                setFormData({
                    cliente_id: data.cliente_id ?? data.cliente?.id ?? '',
                    celular_id: data.celular_id ?? data.celular?.id ?? '',
                    data_venda: data.data_venda ? new Date(data.data_venda).toISOString().substring(0, 10) : TODAY,
                    valor_venda: data.valor_venda != null ? String(Number(data.valor_venda).toFixed(2)) : '',
                    garantia_dias: data.garantia_dias ?? DEFAULT_GARANTIA,
                    observacoes: data.observacoes || '',
                });
                if (data.cliente) {
                    setClientes((prev) => (prev.some((item) => item.id === data.cliente.id)
                        ? prev
                        : [...prev, data.cliente]));
                }
                if (data.celular) {
                    setCelulares((prev) => (prev.some((item) => item.id === data.celular.id)
                        ? prev
                        : [...prev, data.celular]));
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Erro ao carregar dados da venda.');
            })
            .finally(() => setInitialLoading(false));
    }, [editId, isEditing]);

    const opcoesClientes = useMemo(() => (
        clientes.map((cliente) => ({
            value: cliente.id,
            label: `${cliente.nome}${cliente.cpf ? ` - CPF: ${cliente.cpf}` : ''}`,
        }))
    ), [clientes]);

    const opcoesCelulares = useMemo(() => (
        celulares.map((celular) => {
            const modelo = celular.modelo || 'Celular';
            const imei = celular.imei ? ` (IMEI ${celular.imei})` : '';
            const statusLabel = celular.status ? ` • ${celular.status}` : '';
            return {
                value: celular.id,
                label: `#${celular.id} - ${modelo}${imei}${statusLabel}`,
            };
        })
    ), [celulares]);

    const selectedClienteOption = useMemo(() => (
        opcoesClientes.find((opt) => opt.value === Number(formData.cliente_id)) || null
    ), [opcoesClientes, formData.cliente_id]);

    const selectedCelularOption = useMemo(() => (
        opcoesCelulares.find((opt) => opt.value === Number(formData.celular_id)) || null
    ), [opcoesCelulares, formData.celular_id]);

    const clienteSelecionado = useMemo(() => (
        clientes.find((cliente) => cliente.id === Number(formData.cliente_id)) || null
    ), [clientes, formData.cliente_id]);

    const celularSelecionado = useMemo(() => (
        celulares.find((celular) => celular.id === Number(formData.celular_id)) || null
    ), [celulares, formData.celular_id]);

    const garantiaValidade = useMemo(() => {
        const dias = Number(formData.garantia_dias);
        if (!formData.data_venda || Number.isNaN(dias)) return '';
        const base = new Date(formData.data_venda);
        if (Number.isNaN(base.getTime())) return '';
        const future = new Date(base);
        future.setDate(future.getDate() + dias);
        return future.toISOString().substring(0, 10);
    }, [formData.data_venda, formData.garantia_dias]);

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClienteChange = (option) => {
        setFormData((prev) => ({ ...prev, cliente_id: option ? option.value : '' }));
    };

    const handleCelularChange = (option) => {
        setFormData((prev) => ({ ...prev, celular_id: option ? option.value : '' }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        if (!formData.cliente_id || !formData.celular_id) {
            setError('Selecione um cliente e um celular.');
            return;
        }
        const valor = Number(String(formData.valor_venda).replace(',', '.'));
        if (!Number.isFinite(valor) || valor <= 0) {
            setError('Informe um valor de venda válido.');
            return;
        }
        const diasGarantia = formData.garantia_dias === '' ? null : Number(formData.garantia_dias);
        if (diasGarantia != null && (Number.isNaN(diasGarantia) || diasGarantia < 0)) {
            setError('Garantia deve ser um número maior ou igual a zero.');
            return;
        }

        const payload = {
            cliente_id: Number(formData.cliente_id),
            celular_id: Number(formData.celular_id),
            data_venda: formData.data_venda,
            valor_venda: Number(valor.toFixed(2)),
            garantia_dias: diasGarantia,
            garantia_validade: garantiaValidade || null,
            observacoes: formData.observacoes || undefined,
        };

        setSaving(true);
        try {
            if (isEditing) {
                await vendasApi.update(editId, payload);
                alert('Venda atualizada com sucesso!');
            } else {
                await vendasApi.create(payload);
                alert('Venda cadastrada com sucesso!');
            }
            navigate('/vendas');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Erro ao salvar a venda.');
        } finally {
            setSaving(false);
        }
    };

    if (initialLoading) {
        return <div>Carregando dados da venda...</div>;
    }

    return (
        <div className='novo-container-venda'>
            <h2>{isEditing ? 'Editar Venda' : 'Nova Venda'}</h2>
            <form className="form-box-venda" onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                <div>
                    <label>Cliente</label>
                    <Select
                        isDisabled={loadingOptions || saving}
                        isLoading={loadingOptions}
                        value={selectedClienteOption}
                        onChange={handleClienteChange}
                        options={opcoesClientes}
                        placeholder="Selecione o cliente..."
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        noOptionsMessage={() => 'Nenhum cliente encontrado'}
                    />
                    {clienteSelecionado && (
                        <small className="selection-hint">
                            Cliente selecionado: #{clienteSelecionado.id} - {clienteSelecionado.nome}
                        </small>
                    )}
                </div>

                <div>
                    <label>Celular</label>
                    <Select
                        isDisabled={loadingOptions || saving}
                        isLoading={loadingOptions}
                        value={selectedCelularOption}
                        onChange={handleCelularChange}
                        options={opcoesCelulares}
                        placeholder="Selecione o celular..."
                        isClearable
                        isSearchable
                        styles={selectStyles}
                        noOptionsMessage={() => 'Nenhum celular disponível'}
                    />
                    {celularSelecionado && (
                        <small className="selection-hint">
                            Celular selecionado: #{celularSelecionado.id} - {celularSelecionado.modelo}
                        </small>
                    )}
                </div>

                <div>
                    <label htmlFor="data_venda">Data da Venda</label>
                    <input
                        type="date"
                        id="data_venda"
                        name="data_venda"
                        value={formData.data_venda}
                        onChange={handleFieldChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="valor_venda">Valor da Venda (R$)</label>
                    <input
                        type="number"
                        id="valor_venda"
                        name="valor_venda"
                        value={formData.valor_venda}
                        onChange={handleFieldChange}
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="garantia_dias">Garantia (dias)</label>
                    <input
                        type="number"
                        id="garantia_dias"
                        name="garantia_dias"
                        value={formData.garantia_dias}
                        onChange={handleFieldChange}
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label>Validade da Garantia</label>
                    <input type="date" value={garantiaValidade || ''} readOnly />
                    <small>Calculada automaticamente a partir da data e do prazo informado.</small>
                </div>

                <div>
                    <label htmlFor="observacoes">Observações</label>
                    <textarea
                        id="observacoes"
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleFieldChange}
                        rows="4"
                        placeholder="Notas adicionais sobre a venda"
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Salvando...' : isEditing ? 'Atualizar Venda' : 'Cadastrar Venda'}
                    </button>
                    <button type="button" onClick={() => navigate('/vendas')} className="btn-secondary">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NovaVenda;
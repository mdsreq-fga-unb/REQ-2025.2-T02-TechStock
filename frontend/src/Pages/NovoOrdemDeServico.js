import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import '../styles/NovoOrdemDeSevico.css';
import { ordensServicoApi, clientesApi, celularesApi, pecasApi } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'EmAndamento', label: 'Em andamento' },
  { value: 'Concluido', label: 'Concluída' },
];

const TEST_CRITERIA = [
  { key: 'tela_touch', label: 'Tela / Touch' },
  { key: 'bateria_carregamento', label: 'Bateria / Carregamento' },
  { key: 'camera_traseira', label: 'Câmera Traseira' },
  { key: 'camera_frontal', label: 'Câmera Frontal' },
  { key: 'microfone', label: 'Microfone' },
  { key: 'alto_falante', label: 'Alto-falante' },
  { key: 'conectividade', label: 'Wi-Fi / Bluetooth' },
  { key: 'botoes_fisicos', label: 'Botões Físicos' },
  { key: 'sensores', label: 'Sensores (Proximidade/Luz)' },
];

const TEST_RESULT_OPTIONS = [
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'NAO_TESTADO', label: 'Não testado' },
];

const buildInitialTestResults = () => TEST_CRITERIA.reduce((acc, criterio) => {
  acc[criterio.key] = 'NAO_TESTADO';
  return acc;
}, {});

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '45px',
    marginBottom: '15px',
    borderRadius: '8px',
    borderColor: '#ccc'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const buildSnapshot = (lista = []) => (
  (lista || [])
    .map((item) => ({
      pecaId: Number(item?.pecaId ?? item?.peca_id),
      quantidade: Number(item?.quantidade ?? 0),
    }))
    .filter((item) => Number.isInteger(item.pecaId) && item.pecaId > 0)
    .sort((a, b) => a.pecaId - b.pecaId)
);

const snapshotsAreEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].pecaId !== b[i].pecaId || a[i].quantidade !== b[i].quantidade) {
      return false;
    }
  }
  return true;
};

const computeMaxPermitido = (item = {}) => {
  const disponivel = Number.isFinite(Number(item.disponibilidade)) ? Number(item.disponibilidade) : 0;
  const original = Number.isFinite(Number(item.originalQuantidade)) ? Number(item.originalQuantidade) : 0;
  return disponivel + original;
};

// --- COMPONENTE MODAL (Mantido igual) ---
function ModalCelular({ isOpen, onClose, onSave, loading }) {
  const [modelo, setModelo] = useState('');
  const [imei, setImei] = useState('');
  const [marca, setMarca] = useState('');

  if (!isOpen) return null;
}

// --- COMPONENTE PRINCIPAL ---
function NovoOS() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingId, setEditingId] = useState(null);
  
  const [clientes, setClientes] = useState([]);
  const [celulares, setCelulares] = useState([]);

  const [clienteId, setClienteId] = useState('');
  const [celularId, setCelularId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('EmAndamento');
  const [dataConclusao, setDataConclusao] = useState('');
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showModalCelular, setShowModalCelular] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [testResults, setTestResults] = useState(() => buildInitialTestResults());
  const [testObservacoes, setTestObservacoes] = useState('');
  const [testError, setTestError] = useState('');
  const [pecasLookup, setPecasLookup] = useState([]);
  const [pecasSelecionadas, setPecasSelecionadas] = useState([]);
  const [pecasOriginais, setPecasOriginais] = useState([]);
  const [pecasLoading, setPecasLoading] = useState(false);
  const [pecasSearch, setPecasSearch] = useState('');
  const [pecaSelecionadaId, setPecaSelecionadaId] = useState(null);
  const [pecaQuantidade, setPecaQuantidade] = useState('');
  const [pecasErro, setPecasErro] = useState('');

  const isEditing = Boolean(editingId);

  // 1. Opções de Clientes
  const opcoesClientes = useMemo(() => 
    clientes.map(c => ({ value: c.id, label: `${c.nome} - CPF: ${c.cpf}` })), 
  [clientes]);

  // 2. Opções de Celulares (AGORA INDEPENDENTE)
  // Não filtramos mais pelo clienteId. Mostramos todos.
  const opcoesCelulares = useMemo(() => {
    return celulares.map(c => {
      // Tenta achar o nome do dono na lista de clientes para ajudar visualmente
      // Assumindo que o objeto celular tem 'cliente_id'
      const dono = clientes.find(cli => cli.id === c.cliente_id);
      const labelDono = dono ? ` [Dono: ${dono.nome}]` : ' [Sem dono vinculado]';
      
      return { 
        value: c.id, 
        label: `${c.modelo} - IMEI: ${c.imei}${labelDono}` 
      };
    });
  }, [celulares, clientes]);

  const opcoesPecas = useMemo(() => (
    pecasLookup.map((p) => ({
      value: p.id,
      label: `#${p.id} - ${p.nome} (disp: ${p.quantidade ?? 0})`,
    }))
  ), [pecasLookup]);

  const selectedPecaOption = useMemo(() => (
    opcoesPecas.find((opt) => opt.value === pecaSelecionadaId) || null
  ), [opcoesPecas, pecaSelecionadaId]);

  useEffect(() => {
    let active = true;
    Promise.all([clientesApi.list({ pageSize: 100 }), celularesApi.list({ pageSize: 100 })])
      .then(([clientesRes, celularesRes]) => {
        if (!active) return;
        setClientes(clientesRes?.items || []);
        setCelulares(celularesRes?.items || []);
      })
      .catch((err) => { if (active) setMessage(err.message || 'Erro ao carregar dados.'); })
      .finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setPecasLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const filters = { pageSize: 50 };
        const trimmed = pecasSearch?.trim();
        if (trimmed) {
          filters.q = trimmed;
        }
        const base = await pecasApi.list(filters);
        let items = base?.items || [];
        if (trimmed && /^\d+$/.test(trimmed)) {
          try {
            const byId = await pecasApi.getById(Number(trimmed));
            if (byId && !items.find((item) => item.id === byId.id)) {
              items = [byId, ...items];
            }
          } catch (_) {
            // ignora busca específica sem resultados
          }
        }
        if (active) {
          setPecasLookup(items);
          setPecasErro('');
        }
      } catch (err) {
        if (active) {
          setPecasErro(err.message || 'Erro ao buscar peças.');
        }
      } finally {
        if (active) {
          setPecasLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [pecasSearch]);

  useEffect(() => {
    const editId = location?.state?.editId;
    if (!editId) {
      setEditingId(null);
      setPecasSelecionadas([]);
      setPecasOriginais([]);
      setPecaSelecionadaId(null);
      setPecaQuantidade('');
      setPecasErro('');
      return;
    }
    setEditingId(editId);
    setLoading(true);
    ordensServicoApi.getById(editId)
      .then((ordem) => {
        setClienteId(ordem.cliente_id);
        setCelularId(ordem.celular_id);
        setDescricao(ordem.descricao || '');
        setObservacoes(ordem.observacoes || '');
        setStatus(ordem.status || 'EmAndamento');
        setDataConclusao(ordem.data_conclusao ? ordem.data_conclusao.substring(0, 10) : '');
        const registradas = (ordem.pecas_utilizadas || []).map((item) => {
          const disponivel = Number.isFinite(Number(item.peca?.quantidade_disponivel))
            ? Number(item.peca.quantidade_disponivel)
            : 0;
          return {
            pecaId: item.peca?.id || item.peca_id,
            nome: item.peca?.nome || `Peça #${item.peca_id}`,
            codigo: item.peca?.codigo_interno,
            quantidade: item.quantidade,
            originalQuantidade: item.quantidade,
            disponibilidade: disponivel,
          };
        });
        setPecasSelecionadas(registradas);
        setPecasOriginais(buildSnapshot(registradas));
        setPecaSelecionadaId(null);
        setPecaQuantidade('');
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [location]);

  const handleStatusChange = (e) => {
    if (!isEditing) return;
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (newStatus === 'Concluido' && !dataConclusao) {
      setDataConclusao(getTodayDate());
    } else if (newStatus !== 'Concluido') {
      setDataConclusao('');
    }
  };

  const handleDataConclusaoChange = (e) => {
    const newData = e.target.value;
    setDataConclusao(newData);
    if (newData) setStatus('Concluido');
  };

  const handleSaveNewCelular = async (dadosCelular) => {
    setLoadingModal(true);
    try {
      // Como são independentes, se tiver cliente selecionado, vinculamos.
      // Se não, enviamos null ou undefined (depende da sua API aceitar celular sem dono)
      const payload = { 
        ...dadosCelular, 
        cliente_id: clienteId ? Number(clienteId) : null 
      };
      
      const novoCelular = await celularesApi.create(payload);
      setCelulares((prev) => [...prev, novoCelular]);
      setCelularId(novoCelular.id);
      setShowModalCelular(false);
      setMessage(`Celular cadastrado com sucesso!`);
    } catch (error) {
      alert("Erro ao criar celular: " + error.message);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSave = async () => {
    if (!clienteId || !celularId) {
      setMessage('Selecione um cliente e um celular.');
      return;
    }

    if (!isEditing) {
      const algumCriterioRegistrado = Object.values(testResults).some((status) => status !== 'NAO_TESTADO');
      if (!algumCriterioRegistrado) {
        setTestError('Informe o resultado de pelo menos um critério antes de criar a OS.');
        return;
      }
      setTestError('');
    }

    const pecasSanitizadas = pecasSelecionadas.map((item) => ({
      ...item,
      quantidade: Number(item.quantidade) || 0,
    }));

    for (const item of pecasSanitizadas) {
      if (!Number.isInteger(item.quantidade) || item.quantidade < 0) {
        setPecasErro(`Quantidade inválida para ${item.nome}.`);
        return;
      }
      const maxPermitido = computeMaxPermitido(item);
      if (item.quantidade > maxPermitido) {
        setPecasErro(`Quantidade para ${item.nome} excede o estoque disponível (${maxPermitido}).`);
        return;
      }
    }
    setPecasErro('');

    setLoading(true);
    setMessage('');
    try {
      const payload = {
        descricao: descricao || undefined,
        observacoes: observacoes || undefined,
        status: isEditing ? status : undefined,
      };
      
      if (status === 'Concluido') {
        payload.data_conclusao = dataConclusao
          ? new Date(dataConclusao).toISOString()
          : new Date().toISOString();
      }

      if (!isEditing) {
        const criteriosPayload = TEST_CRITERIA.map(({ label, key }) => ({
          nome: label,
          status: testResults[key] || 'NAO_TESTADO',
        }));
        payload.testes = [
          {
            etapa: 'INICIAL',
            criterios: criteriosPayload,
            observacoes: testObservacoes || undefined,
          },
        ];

        const pecasPayload = pecasSanitizadas
          .filter((item) => item.quantidade > 0)
          .map((item) => ({ peca_id: item.pecaId, quantidade: item.quantidade }));
        if (pecasPayload.length) {
          payload.pecas = pecasPayload;
        }
      }

      if (isEditing) {
        const pecasPayload = pecasSanitizadas
          .filter((item) => item.quantidade > 0 || (item.originalQuantidade || 0) > 0)
          .map((item) => ({ peca_id: item.pecaId, quantidade: item.quantidade }));
        const snapshotAtual = buildSnapshot(pecasPayload);
        const pecasMudaram = !snapshotsAreEqual(snapshotAtual, pecasOriginais);

        if (pecasMudaram) {
          await ordensServicoApi.atualizarPecas(editingId, pecasPayload);
        }

        await ordensServicoApi.update(editingId, payload);
        setMessage('Ordem atualizada com sucesso!');
      } else {
        payload.cliente_id = Number(clienteId);
        payload.celular_id = Number(celularId);
        await ordensServicoApi.create(payload);
        setMessage('Ordem criada com sucesso!');
        setTestResults(buildInitialTestResults());
        setTestObservacoes('');
        setPecasSelecionadas([]);
        setPecasOriginais([]);
        setPecaQuantidade('');
        setPecaSelecionadaId(null);
        setPecasErro('');
      }
      setTimeout(() => navigate('/ordemdeservico'), 800);
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar a ordem.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeca = () => {
    if (!pecaSelecionadaId) {
      setPecasErro('Selecione uma peça para vincular.');
      return;
    }
    const quantidade = Number(pecaQuantidade);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setPecasErro('Informe uma quantidade válida (mínimo 1).');
      return;
    }
    const pecaDados = pecasLookup.find((p) => p.id === Number(pecaSelecionadaId));
    if (!pecaDados) {
      setPecasErro('Peça não encontrada. Refine a busca digitando o nome ou o ID.');
      return;
    }
    const disponivel = Number.isFinite(Number(pecaDados.quantidade)) ? Number(pecaDados.quantidade) : 0;
    const atual = pecasSelecionadas.find((item) => item.pecaId === pecaDados.id);
    const originalQtd = atual?.originalQuantidade || 0;
    const maxPermitido = disponivel + originalQtd;
    const novoTotal = quantidade + (atual?.quantidade || 0);
    if (novoTotal > maxPermitido) {
      setPecasErro(`Quantidade solicitada maior que o estoque disponível (${maxPermitido}).`);
      return;
    }

    setPecasSelecionadas((prev) => {
      if (atual) {
        return prev.map((item) => (item.pecaId === pecaDados.id
          ? { ...item, quantidade: novoTotal, disponibilidade: disponivel }
          : item));
      }
      return [
        ...prev,
        {
          pecaId: pecaDados.id,
          nome: pecaDados.nome,
          codigo: pecaDados.codigo_interno,
          quantidade,
          disponibilidade: disponivel,
          originalQuantidade: 0,
        },
      ];
    });
    setPecaSelecionadaId(null);
    setPecaQuantidade('');
    setPecasErro('');
  };

  const handleRemovePeca = (pecaId) => {
    setPecasSelecionadas((prev) => {
      const alvo = prev.find((item) => item.pecaId === pecaId);
      if (!alvo) return prev;
      const original = alvo.originalQuantidade || 0;
      if (original > 0) {
        const estaRemovida = Number(alvo.quantidade) === 0;
        const quantidadeRestaurada = alvo.ultimaQuantidade ?? original;
        const proximaQuantidade = estaRemovida ? quantidadeRestaurada : 0;
        return prev.map((item) => (item.pecaId === pecaId
          ? {
              ...item,
              quantidade: proximaQuantidade,
              ultimaQuantidade: estaRemovida ? undefined : item.quantidade,
            }
          : item));
      }
      return prev.filter((item) => item.pecaId !== pecaId);
    });
    setPecasErro('');
  };

  const handleQuantidadeManualChange = (pecaId, value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setPecasErro('Informe apenas números inteiros para a quantidade.');
      return;
    }
    const quantidade = Math.max(0, Math.floor(parsed));
    setPecasSelecionadas((prev) => prev.flatMap((item) => {
      if (item.pecaId !== pecaId) return item;
      if (quantidade === 0 && (item.originalQuantidade || 0) === 0) {
        return [];
      }
      return { ...item, quantidade, ultimaQuantidade: undefined };
    }));
    setPecasErro('');
  };

  const renderPecasSection = () => {
    const titulo = isEditing ? 'Peças vinculadas à OS' : 'Peças utilizadas ao abrir a OS';
    const descricao = isEditing
      ? 'Edite quantidades, remova componentes ou inclua novos itens. As alterações impactam o estoque imediatamente.'
      : 'Busque pelo nome ou ID, informe a quantidade e reserve o estoque necessário para o reparo.';
    const badge = isEditing ? 'Sincronize o estoque' : 'Quantidade obrigatória';

    return (
      <div className={`pecas-section ${isEditing ? 'info' : ''}`}>
        <div className="testes-header">
          <div>
            <h3>{titulo}</h3>
            <p>{descricao}</p>
          </div>
          <span className="badge-required">{badge}</span>
        </div>
        {pecasErro && <p className="error-text">{pecasErro}</p>}
        <div className="pecas-form-row">
          <div style={{ flex: 1 }}>
            <Select
              value={selectedPecaOption}
              onChange={(opt) => setPecaSelecionadaId(opt ? opt.value : null)}
              onInputChange={(value, meta) => {
                if (meta.action === 'input-change') {
                  setPecasSearch(value);
                }
              }}
              options={opcoesPecas}
              isLoading={pecasLoading}
              placeholder="Busque peças por nome ou ID..."
              isClearable
              isSearchable
              styles={customStyles}
              noOptionsMessage={() => 'Nenhuma peça encontrada'}
            />
          </div>
          <input
            type="number"
            min="1"
            placeholder="Qtd"
            value={pecaQuantidade}
            onChange={(e) => setPecaQuantidade(e.target.value)}
            className="input-peca-quantidade"
          />
          <button type="button" className="btn-secondary add-peca-btn" onClick={handleAddPeca}>
            {isEditing ? 'Adicionar/Atualizar' : 'Adicionar peça'}
          </button>
        </div>

        {pecasSelecionadas.length > 0 ? (
          <table className="pecas-table">
            <thead>
              <tr>
                <th>Peça</th>
                <th>Estoque máximo</th>
                <th>Quantidade desejada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pecasSelecionadas.map((item) => {
                const maxPermitido = computeMaxPermitido(item);
                const seraRemovida = (item.originalQuantidade || 0) > 0 && Number(item.quantidade) === 0;
                return (
                  <tr key={item.pecaId} className={seraRemovida ? 'peca-removida' : ''}>
                    <td>
                      <div className="peca-nome">{item.nome}</div>
                      <small>
                        #{item.pecaId}
                        {item.codigo ? ` • ${item.codigo}` : ''}
                      </small>
                      {seraRemovida && <div className="removal-hint">Será removida da OS</div>}
                    </td>
                    <td>{maxPermitido}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.quantidade}
                        onChange={(e) => handleQuantidadeManualChange(item.pecaId, e.target.value)}
                        className="input-peca-quantidade"
                      />
                    </td>
                    <td>
                      <button type="button" className="btn-secondary" onClick={() => handleRemovePeca(item.pecaId)}>
                        {seraRemovida ? 'Desfazer remoção' : 'Remover'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="pecas-empty">Nenhuma peça selecionada.</p>
        )}
      </div>
    );
  };

  const handleTestResultChange = (key, value) => {
    setTestResults((prev) => ({ ...prev, [key]: value }));
  };

  const renderTestSection = () => {
    if (isEditing) {
      return (
        <div className="testes-section info">
          <h3>Testes técnicos já registrados</h3>
          <p>Para registrar novas inspeções utilize a tela "Controle de Qualidade".</p>
        </div>
      );
    }

    return (
      <div className="testes-section">
        <div className="testes-header">
          <div>
            <h3>Testes técnicos iniciais</h3>
            <p>Informe o resultado de cada critério para documentar o estado do aparelho.</p>
          </div>
          <span className="badge-required">Obrigatório antes do reparo</span>
        </div>
        {testError && <p className="error-text">{testError}</p>}
        <div className="test-grid">
          {TEST_CRITERIA.map((criterio) => (
            <div key={criterio.key} className="test-card">
              <label>{criterio.label}</label>
              <select
                value={testResults[criterio.key]}
                onChange={(e) => handleTestResultChange(criterio.key, e.target.value)}
              >
                {TEST_RESULT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="testes-extra">
          <label>Observações gerais dos testes:</label>
          <textarea
            rows="3"
            value={testObservacoes}
            onChange={(e) => setTestObservacoes(e.target.value)}
            placeholder="Ex: Tela com micro riscos, aparelho chegou sem parafusos."
          />
        </div>
      </div>
    );
  };

  const getSelectedCliente = () => opcoesClientes.find(c => c.value === Number(clienteId));
  const getSelectedCelular = () => opcoesCelulares.find(c => c.value === Number(celularId));

  return (
    <div className="novo-container-OS">
      <h2>Nova Ordem De Serviço</h2>

      <div className="form-box-OS">
        {message && (
          <div className={`message-box ${message.includes('sucesso') ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-md mb-4 flex justify-between items-center`}>
            <span>{message}</span>
            <button className="font-bold text-lg leading-none" onClick={() => setMessage('')}>&times;</button>
          </div>
        )}

        <label>Cliente:</label>
        <Select
          isDisabled={isEditing || loadingOptions}
          isLoading={loadingOptions}
          value={getSelectedCliente()}
          onChange={(opt) => setClienteId(opt ? opt.value : '')} // NÃO reseta mais o celular
          options={opcoesClientes}
          placeholder="Busque por nome ou CPF..."
          isClearable
          isSearchable
          styles={customStyles}
        />

        <label>Celular:</label>
        <div className="input-group-row">
          <div style={{ flex: 1 }}>
            <Select
              // NÃO depende mais do clienteId para ser habilitado
              isDisabled={loadingOptions} 
              value={getSelectedCelular()}
              onChange={(opt) => setCelularId(opt ? opt.value : '')}
              options={opcoesCelulares}
              placeholder="Busque o celular (Modelo ou IMEI)..."
              isClearable
              isSearchable
              styles={customStyles}
              noOptionsMessage={() => "Nenhum celular encontrado"}
            />
          </div>
        </div>

        <label>Descrição:</label>
        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        <label>Observações:</label>
        <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

        {renderPecasSection()}

        <label>Status:</label>
        <select value={status} onChange={handleStatusChange} disabled={!isEditing}>
          {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {!isEditing && (
          <small className="status-hint">Novas ordens sempre iniciam em andamento e podem ser concluídas pela listagem.</small>
        )}

        {status === 'Concluido' && (
          <div style={{animation: 'fadeIn 0.3s'}}>
            <label>Data de conclusão:</label>
            <input 
              type="date" 
              value={dataConclusao} 
              onChange={handleDataConclusaoChange} 
            />
          </div>
        )}

        {renderTestSection()}

        <button className="btn-primary" onClick={handleSave} disabled={loading || loadingOptions}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar OS'}
        </button>
        <button className="btn-secondary" onClick={() => navigate("/ordemdeservico")}>Cancelar</button>
      </div>

      <ModalCelular 
        isOpen={showModalCelular} 
        onClose={() => setShowModalCelular(false)} 
        onSave={handleSaveNewCelular}
        loading={loadingModal}
      />
    </div>
  );
}

export default NovoOS;
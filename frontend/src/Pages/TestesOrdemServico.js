import React, { useState } from 'react';

// 1. Dados Simulados (Mock Data)
// Num cenário real, isso viria da sua API/Backend
const MOCK_PHONES = [
  { id: 1, model: 'iPhone 11', imei: '123456789012345', color: 'Preto' },
  { id: 2, model: 'Samsung Galaxy S20', imei: '987654321098765', color: 'Azul' },
  { id: 3, model: 'Motorola Edge 30', imei: '456123789456123', color: 'Verde' },
];

// 2. Lista de testes padronizados
const TEST_CRITERIA = [
  'Tela / Touch',
  'Bateria / Carregamento',
  'Câmera Traseira',
  'Câmera Frontal',
  'Microfone',
  'Alto-falante',
  'Wi-Fi / Bluetooth',
  'Botões Físicos',
  'Sensores (Proximidade/Luz)'
];

const TesteCelulares = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [observations, setObservations] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // --- Funções Auxiliares ---

  // Filtra celulares baseado na busca
  const filteredPhones = MOCK_PHONES.filter(phone => 
    phone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    phone.imei.includes(searchTerm)
  );

  // Seleciona o celular e reseta o formulário
  const handleSelectPhone = (phone) => {
    setSelectedPhone(phone);
    setTestResults({});
    setObservations('');
    setSubmitted(false);
    setSearchTerm('');
  };

  // Gerencia o clique nos checkboxes
  const handleCheckboxChange = (testName) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: !prev[testName] 
    }));
  };

  // Envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const report = {
      phoneId: selectedPhone.id,
      model: selectedPhone.model,
      imei: selectedPhone.imei,
      passedTests: testResults,
      notes: observations,
      timestamp: new Date().toISOString()
    };

    console.log("Relatório gerado:", report);
    // Aqui você faria: axios.post('/api/tests', report)
    
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2> Controle de Qualidade - Gerência</h2>

      {/* Passo 1: Busca e Seleção */}
      {!selectedPhone && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <label>Buscar Aparelho (Modelo ou IMEI):</label>
          <input 
            type="text" 
            placeholder="Ex: iPhone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          
          {searchTerm && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredPhones.map(phone => (
                <li 
                  key={phone.id}
                  onClick={() => handleSelectPhone(phone)}
                  style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer',
                    background: '#f9f9f9'
                  }}
                >
                  <strong>{phone.model}</strong> <small>(IMEI: {phone.imei})</small>
                </li>
              ))}
              {filteredPhones.length === 0 && <li style={{ padding: '10px' }}>Nenhum aparelho encontrado.</li>}
            </ul>
          )}
        </div>
      )}
        {/* Passo 2: Formulário de Testes */}   
      {selectedPhone && !submitted && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Avaliando: {selectedPhone.model}</h3>
            <button 
              type="button" 
              onClick={() => setSelectedPhone(null)}
              style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Trocar Aparelho
            </button>
          </div>

          <p style={{ color: '#666' }}>Marque os itens que foram <strong>APROVADOS</strong>:</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {TEST_CRITERIA.map(test => (
              <label key={test} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!testResults[test]} 
                  onChange={() => handleCheckboxChange(test)}
                  style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                />
                {test}
              </label>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>Observações do Gerente:</label>
            <textarea 
              rows="3"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: Pequeno risco na tela, bateria ok..."
              style={{ width: '100%', marginTop: '5px', padding: '8px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: '20px', 
              width: '100%', 
              padding: '12px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Finalizar Teste
          </button>
        </form>
      )}

      {/* Passo 3: Feedback de Sucesso */}
      {submitted && (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#d4edda', color: '#155724', borderRadius: '8px' }}>
          <h3>✅ Teste Registrado com Sucesso!</h3>
          <p>O aparelho <strong>{selectedPhone.model}</strong> foi validado.</p>
          <button 
            onClick={() => setSelectedPhone(null)}
            style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Testar Novo Aparelho
          </button>
        </div>
      )}
    </div>
  );
};

export default TesteCelulares;
# Evidências

Esta seção contém todas as evidências do projeto, incluindo gravações de reuniões, apresentações, áudio e documentação de interações com o cliente.

## Gravações de Reuniões com o Cliente

Registros de feedbacks e comentários recebidos do cliente ao longo do projeto.

| Data | Título | Participantes | Link/Arquivo |
|------|--------|---------------|--------------|
| 11/10/2025 | Validação do MVP com o Cliente | Todos presentes | https://drive.google.com/file/d/1VSVFv30xdbBfPfzTLTyxSRF44RgW0eRd/view?usp=drivesdk |

## Apresentações e Slides

Aqui você encontra os slides e apresentações utilizadas nas reuniões e demonstrações do projeto.

| Data | Título | Tema | Link/Arquivo |
|------|--------|------|--------------|
| 16/10/2025 | Apresentação (Slidies)| Todos | https://drive.google.com/file/d/1vmVFco41wUCdLfd_fsxAcWAHY-gmcfWB/view?usp=sharing |

## Áudio de Reuniões

Arquivos de áudio das reuniões realizadas com o cliente para documentação e referência.

| Data | Título | Duração | Link/Arquivo |
|------|--------|---------|--------------|
| -- | -- | -- | -- |

## Atas de Reunião

Documentação das reuniões realizadas com resumo de discussões, decisões e próximos passos.

| Data | Título | Assunto Principal | Decisões Tomadas | Link/Arquivo |
|------|--------|------------------|-----------------|--------------|
| -- | -- | -- | -- | -- |


## Protótipos e Mockups

Versões de protótipos e mockups apresentados ao cliente durante o desenvolvimento.

| Versão | Data | Descrição | Link/Arquivo |
|--------|------|-----------|--------------|
| -- | -- | -- | -- |

## Validações e Testes

Evidências de validações realizadas com o cliente e testes executados.

| Data | Tipo | Descrição | Resultado | Link/Arquivo |
|------|------|-----------|-----------|--------------|
| -- | -- | -- | -- | -- |

## Documentos Importantes

Documentação relevante do projeto e comunicações com o cliente.

| Documento | Data | Descrição | Link/Arquivo |
|-----------|------|-----------|--------------|
| Docs (RF) e (RNF) | 11/10/2025 | -- | https://docs.google.com/document/d/12iLfANvTRu1hUw8SZgOLxpOGYA2biz1kvy5VJyi-hIQ/edit?tab=t.0 |

---

## Priorização do MVP - Feedback do Cliente

Esta seção documenta a conversa com o cliente (Moisés) sobre a priorização e definição do MVP (Minimum Viable Product), realizada via mensagens de áudio e texto. O cliente destacou os requisitos essenciais para começar a operar e substituir as planilhas manuais.

<style>
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
  }

  .modal-content {
    margin: auto;
    display: block;
    max-width: 90%;
    max-height: 90%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .modal-close {
    position: absolute;
    top: 20px;
    right: 30px;
    color: white;
    font-size: 40px;
    font-weight: bold;
    cursor: pointer;
  }

  .modal-close:hover {
    opacity: 0.7;
  }

  .view-btn {
    background: #0052cc;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .view-btn:hover {
    background: #003d99;
    transform: translateY(-2px);
  }
</style>

<script>
  function openModal(id) {
    document.getElementById(id).style.display = "block";
  }

  function closeModal(id) {
    document.getElementById(id).style.display = "none";
  }

  window.onclick = function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = "none";
    }
  }
</script>

### Requisitos Priorizados - Essenciais para MVP

#### Usuários e Acessos
O cliente enfatizou a necessidade de um sistema seguro com controle de acesso:

- **RF28**: Criação de usuários
- **RNF01**: Interface simples e intuitiva
- **RNF02**: Registro rápido (até 3 cliques)
- **RNF06**: Login e senha por usuário
- **RNF07**: Backup automático diário
- **RNF10**: Acesso web responsivo
- **RNF11**: Acesso dentro e fora da loja (nuvem)

<button class="view-btn" onclick="openModal('modal1')">Ver Evidência</button>

<div id="modal1" class="modal">
  <span class="modal-close" onclick="closeModal('modal1')">&times;</span>
  <img class="modal-content" src="../assets/feedback-mvp-01.jpg" alt="Priorização MVP - Usuários e Acessos">
</div>

---

#### Cadastro e Estoque
Funcionalidades críticas para gerenciar produtos:

- **RF06**: Alertas de estoque mínimo
- **RF25**: Estoque automático nas plataformas

<button class="view-btn" onclick="openModal('modal2')">Ver Evidência</button>

<div id="modal2" class="modal">
  <span class="modal-close" onclick="closeModal('modal2')">&times;</span>
  <img class="modal-content" src="../assets/feedback-mvp-02.jpg" alt="Priorização MVP - Cadastro e Estoque">
</div>

---

#### Histórico e Manutenção
Rastreabilidade completa das operações:

- **RF08**: Registro de testes feitos nos celulares
- **RF07**: Histórico completo de cada celular
- **RF09**: Vincular peças usadas em consertos

<button class="view-btn" onclick="openModal('modal3')">Ver Evidência</button>

<div id="modal3" class="modal">
  <span class="modal-close" onclick="closeModal('modal3')">&times;</span>
  <img class="modal-content" src="../assets/feedback-mvp-03.jpg" alt="Priorização MVP - Histórico e Manutenção">
</div>

---

#### Clientes, Garantias e Financeiro
Gestão de informações e relatórios:

- **RF11**: Classificação de clientes (consumidor, revendedor, manutenção)
- **RF13**: Relatórios de clientes
- **RF16**: Alertas de vencimento de garantias
- **RF19**: Relatórios financeiros
- **RF20**: Emitir notas fiscais/boletos
- **RF21**: Relatórios de estoque
- **RF22**: Gráficos de peças mais usadas e problemas comuns

<button class="view-btn" onclick="openModal('modal4')">Ver Evidência</button>

<div id="modal4" class="modal">
  <span class="modal-close" onclick="closeModal('modal4')">&times;</span>
  <img class="modal-content" src="../assets/feedback-mvp-04.jpg" alt="Priorização MVP - Clientes e Financeiro">
</div>

---

#### Relatórios e Indicadores
Necessidade de dashboards e métricas consolidadas:

- **RNF03**: Dashboards
- **RNF04**: Consultas rápidas (<60s)
- **RNF05**: Suporte a 5.000 registros
- **RNF08**: Logs de acesso
- **RNF12**: Uso simultâneo sem perda de dados

<button class="view-btn" onclick="openModal('modal5')">Ver Evidência</button>

<div id="modal5" class="modal">
  <span class="modal-close" onclick="closeModal('modal5')">&times;</span>
  <img class="modal-content" src="../assets/feedback-mvp-05.jpg" alt="Priorização MVP - Relatórios e Indicadores">
</div>

---

### Áudio - Priorização MVP

Gravação de áudio da conversa com o cliente sobre a priorização do MVP:

<div style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #f5f7fa 0%, #f0f3f8 100%); border-left: 4px solid #0052cc; border-radius: 6px;">
  <audio controls style="width: 100%;">
    <source src="../assets/Priorização MVP.mp3" type="audio/mpeg">
    Seu navegador não suporta o elemento de áudio.
  </audio>
</div>

---

### Observação Importante do Cliente

*"Eu não adicionei a **____** de serviço como prioridade aí nas RFs porque eu não sei como vocês vão organizar Mas eu peço pra não esquecer por favor da das ordens de serviço ____ acabei me esquecendo na na reunião de falar pra vocês na na primeira reunião que a gente teve Mas as ordens de serviço são muito importantes mesmo"*

**Ação**: Incluir **Ordens de Serviço** como alta prioridade no MVP, pois é fundamental para a operação da CELLVEX.

---

## Reunião de Elicitação e Descoberta

Documentação da reunião de elicitação e descoberta de requisitos, onde foram identificadas as necessidades iniciais do cliente e o contexto do negócio.

### Roteiro da Reunião

Documento com o roteiro estruturado utilizado para guiar a reunião de elicitação:

<iframe src="../../assets/roteiro.pdf" width="100%" height="600px" style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></iframe>

---

### Gravação da Reunião

Registro em vídeo completo da reunião de elicitação e descoberta:

<div align="center" style="margin: 20px 0;">
  <iframe width="700" height="400"
    src="https://www.youtube.com/embed/zhKQkZeraZg"
    title="Reunião de Elicitação e Descoberta" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2);">
  </iframe>
</div>

---

## Reunião de Validação - Sprint 7

Documentação da reunião de validação final com o cliente, realizada até a Sprint 7, onde foram apresentados os resultados e validadas as soluções implementadas.

<div align="center" style="margin: 20px 0;">
  <iframe width="700" height="400"
    src="https://www.youtube.com/embed/jevg5aEGIj4"
    title="Reunião de Validação - Sprint 7" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2);">
  </iframe>
</div>

---

## Reunião de Validação MVP

Validação do Minimum Viable Product com o cliente, apresentando as funcionalidades implementadas e coletando feedback sobre o MVP.

<div align="center" style="margin: 20px 0;">
  <iframe width="700" height="400"
    src="https://www.youtube.com/embed/FrhUj0PKlWg"
    title="Reunião de Validação MVP" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2);">
  </iframe>
</div>

---

## Reunião de RF e RNF

Reunião de discussão e alinhamento dos Requisitos Funcionais (RF) e Requisitos Não-Funcionais (RNF) do projeto.

### Documento de Requisitos

Lista completa de RF e RNF documentados:

<iframe src="../../assets/RF-RNF.pdf" width="100%" height="600px" style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></iframe>

---

### Gravação da Reunião

Registro em vídeo da reunião de RF e RNF:

<div align="center" style="margin: 20px 0;">
  <iframe width="700" height="400"
    src="https://www.youtube.com/embed/xF59l0Qzyk4"
    title="Reunião de RF e RNF" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2);">
  </iframe>
</div>

---

## Validação de Protótipo de Baixo Nível

Validação com o cliente das telas de protótipo de baixo nível, coletando feedback e ajustes necessários.

### Áudio - Validação Protótipo de Baixo Nível

Gravação de áudio da conversa sobre a validação do protótipo de baixo nível:

<div style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #f5f7fa 0%, #f0f3f8 100%); border-left: 4px solid #0052cc; border-radius: 6px;">
  <audio controls style="width: 100%;">
    <source src="../assets/Validação protótipo de baixo nível.mp3" type="audio/mpeg">
    Seu navegador não suporta o elemento de áudio.
  </audio>
</div>

---

### Evidência Visual
Print da conversa sobre a validação do protótipo de baixo nível:
<div class="evidence-container" style="margin-top: 16px;">
  <button class="view-btn" onclick="openModal('modal-proto-baixo')"> Clique para ver evidência</button>
</div>

<div id="modal-proto-baixo" class="modal">
  <button class="modal-close" onclick="closeModal('modal-proto-baixo')">&times;</button>
  <img class="modal-content" src="../assets/validacao-prototipo-baixo-nivel.jpg" alt="Validação Protótipo de Baixo Nível">
</div>

---

## Validação de Protótipo de Alto Nível

Validação com o cliente das telas de protótipo de alto nível, apresentando designs mais refinados e coletando aprovações finais.

Parte 1 

<div class="evidence-container" style="margin-top: 16px;">
  <button class="view-btn" onclick="openModal('modal-proto-alto-1')"> Clique para ver evidência</button>
</div>

<div id="modal-proto-alto-1" class="modal">
  <button class="modal-close" onclick="closeModal('modal-proto-alto-1')">&times;</button>
  <img class="modal-content" src="../assets/validacao-prototipo-alto-nivel(1).jpg" alt="Validação Protótipo de Alto Nível - 1">
</div>

---
Parte 2
<div class="evidence-container" style="margin-top: 16px;">
  <button class="view-btn" onclick="openModal('modal-proto-alto-2')"> Clique para ver evidência</button>
</div>

<div id="modal-proto-alto-2" class="modal">
  <button class="modal-close" onclick="closeModal('modal-proto-alto-2')">&times;</button>
  <img class="modal-content" src="../assets/validacao-prototipo-alto-nivel(2).jpg" alt="Validação Protótipo de Alto Nível - 2">
</div>

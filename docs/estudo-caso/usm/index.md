# User Story Mapping (USM) - Estudo de Caso HealthConnect

## Contexto do Estudo de Caso: HealthConnect

A **HealthConnect** é uma empresa fictícia que busca transformar a experiência digital de saúde em uma rede ampla de clínicas e hospitais. Este estudo de caso foi elaborado para proporcionar uma compreensão profunda dos desafios e oportunidades de um ecossistema de saúde distribuído, com foco na construção de um User Story Mapping robusto e orientado ao valor entregue a pacientes, profissionais e gestores.

### Problemas Identificados

#### Sistemas Desatualizados e Ilhas de Informação
Prontuários eletrônicos locais, planilhas e softwares legados não se comunicam entre si. Históricos clínicos, alergias e resultados de exames ficam dispersos, obrigando profissionais a reconstruírem o quadro de saúde do paciente a cada atendimento.

#### Agendamentos e Fluxo Assistencial
Módulos independentes geram conflitos de agenda, longas filas, reagendamentos e baixa visibilidade da disponibilidade de especialistas. Pacientes crônicos enfrentam múltiplas marcações e lembranças manuais, aumentando faltas e atrasos no cuidado.

#### Prescrições e Dispensação
Parte das prescrições é manuscrita ou inserida em sistemas sem checagem automática de interações medicamentosas. Nas farmácias internas, dados são redigitados, ampliando o risco de erro e duplicidade.

#### Comunicação e Engajamento
A comunicação com o paciente é difusa (telefonemas, e-mails, aplicativos distintos). Não há um canal unificado para lembretes de consulta, preparo de exame, instruções pós-atendimento e acompanhamento de adesão terapêutica.

#### Conformidade e Governança de Dados
A consolidação de informações para fins regulatórios (LGPD, auditorias, relatórios clínicos) é manual e sujeita a inconsistências. A ausência de trilhas de auditoria integradas cria riscos de conformidade.

### Objetivos de Negócio

- Unificar a experiência do paciente e do profissional ao longo de toda a jornada assistencial
- Reduzir erros e retrabalho por meio de dados consistentes, automações e alertas clínicos
- Aumentar engajamento e satisfação (NPS do paciente e do profissional)
- Diminuir tempo médio de atendimento, faltas e reagendamentos
- Fortalecer conformidade (LGPD) e governança de dados com trilhas de auditoria
- Otimizar custos operacionais via integração com parceiros (laboratórios, operadoras)

### Objetivos do Produto

- Centralizar prontuário, exames, prescrições e agendamentos em um ambiente seguro e escalável
- Prover portal/app do paciente com agendamento online, lembretes e acesso a resultados/exames
- Disponibilizar visão 360° do paciente para o profissional de saúde, com alertas de risco
- Implantar prescrições eletrônicas com checagem automática de interações e alergias
- Oferecer dashboards clínicos e administrativos, integrados a relatórios regulatórios

---

## Personas Principais

### 👩‍💼 Maria – Recepcionista
**Descrição:** Primeiro contato do paciente com a unidade. Responsável por cadastro, atualização de dados, conferência de documentos e orientação de fluxo.

**Necessidades:**
- Interface rápida e intuitiva para cadastro/atualização
- Busca unificada de pacientes (todas as unidades)
- Checklist de documentos e consentimentos (LGPD)
- Geração de senhas/QR e integração com fila/triagem
- Canal para mensagens automáticas de boas-vindas e instruções

### 👨‍⚕️ Dr. João – Médico Clínico
**Descrição:** Atende alta demanda diária. Precisa de visão clínica integrada, apoio à decisão e registro ágil.

**Necessidades:**
- Prontuário 360° com histórico consolidado e alertas (alergias/interações)
- Prescrição eletrônica com checagem automática
- Acesso rápido a exames e imagens, com comparativos
- Modelos de evolução, CID/LOINC/SNOMED
- Ferramentas para solicitar exames e programar retornos com poucos cliques

### 💊 Lívia – Farmacêutica
**Descrição:** Responsável por validar prescrição, dispensar medicamentos e orientar o paciente.

**Necessidades:**
- Recebimento estruturado de prescrições eletrônicas
- Alertas de interação, dose máxima e duplicidade terapêutica
- Histórico de dispensações e reconciliação medicamentosa
- Geração de instruções de uso e alertas de renovação
- Integração com estoque e lotes/validade

### 📅 Rafael – Coordenador de Agendamento
**Descrição:** Orquestra agendas de múltiplos especialistas e unidades, buscando equilíbrio entre demanda e capacidade.

**Necessidades:**
- Visão unificada de agendas, bloqueios e encaixes
- Regras configuráveis por perfil de atendimento e convênio
- Notificações automáticas (confirmação, lembrete, preparo)
- Gestão de fila de espera e reacomodação dinâmica
- Indicadores de ocupação, faltas e tempo médio

### 🧑‍🤝‍🧑 Clara – Paciente
**Descrição:** Paciente regular em acompanhamento de condição crônica. Busca autonomia, clareza e segurança.

**Necessidades:**
- Portal/app com agendamento, histórico, exames e prescrições
- Lembretes de consulta, preparo de exame e medicação
- Mensagens seguras com equipe (dúvidas e orientações)
- Acesso a instruções pós-consulta e plano terapêutico
- Facilidade de pagamento e de envio de documentos

### 💻 Roberto – Diretor de Tecnologia
**Descrição:** Responsável por garantir disponibilidade, segurança, conformidade e roadmap tecnológico.

**Necessidades:**
- Monitoramento proativo de performance e segurança
- Gestão de acessos e perfis (princípio do menor privilégio)
- Relatórios regulatórios e trilhas de auditoria LGPD
- Integrações com parceiros (laboratórios/operadoras)
- Escalabilidade e planos de continuidade de negócio

### 📊 Ana – Gestora de Operações Clínicas
**Descrição:** Acompanha indicadores assistenciais e operacionais; atua em melhoria contínua de processos.

**Necessidades:**
- Dashboards de produtividade, qualidade e satisfação
- Alertas de gargalos (espera, reagendamentos, faltas)
- Relatórios de segurança do paciente e incidentes
- Ferramentas para padronizar protocolos e treinamentos
- Rastreabilidade ponta a ponta da jornada do paciente

---

## USM

Abaixo está o User Story Mapping interativo do projeto:

<iframe src="https://miro.com/app/board/uXjVJxJREzY=/?share_link_id=383850552284" width="100%" height="800px" frameborder="0" allowfullscreen></iframe>

---

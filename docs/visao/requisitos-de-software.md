# 7 REQUISITOS DE SOFTWARE

## 7.1 Lista de Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades que o sistema deve ter para atender às necessidades do cliente, incluindo integrações, processos e interações do usuário com o sistema.

**RF01 - Cadastrar celulares:** Permitir o registro de celulares com informações de modelo, IMEI, cor, capacidade, estado, valor de compra e defeitos identificados.

**RF02 - Cadastrar peças:** Permitir o registro de peças com nome, código interno, garantia, compatibilidade, quantidade e fornecedor.

**RF03 – Registrar reparos, testes e atualizar estoque:** O sistema deve permitir registrar testes realizados nos celulares (ex.: câmera, tela, carregador, botões), registrar garantia e ordens de serviço de reparo vinculadas ao dispositivo e ao cliente associado, atualizando automaticamente o estoque sempre que as peças forem utilizadas nos reparos.

**RF04 - Registrar movimentações de estoque:** Permitir registrar entradas e saídas de celulares e peças (compra, venda, devolução, uso em conserto).

**RF05 - Diferenciar estoque de celulares:** Separar estoque de celulares para revenda e para manutenção.

**RF06 - Manter histórico de celulares:**

- **RF06.1:** Permitir o registro de entrada de celulares, a partir da data. 

- **RF06.2:** Permitir registrar peças utilizadas com nome ou código da peça. 

- **RF06.3:** Permitir registrar venda do celular, a partir da data. 

- **RF06.4:** Permitir vincular celular ao nome do cliente. 

**RF07 - Cadastrar clientes:** Permitir o registro de clientes com nome, contato, CPF e histórico de compras/consertos.

**RF08 - Classificar clientes:** Diferenciar clientes como consumidores finais, revendedores ou clientes de manutenção.

**RF09 - Consultar histórico por cliente:** Mostrar automaticamente os celulares comprados ou com reparo realizado por cada cliente.

**RF10 - Gerar relatórios de clientes:** 
- **RF10.1:** Gerar relatórios de clientes ativos e permitir filtrar por prazo (30,60 ou 90 dias). 

- **RF10.2:** Gerar relatório de clientes com garantia ativa e emitir alerta de vencimento de garantia. 

- **RF10.3:** Gerar relatório de clientes inadimplentes e lembrete de inadimplência. 

- **RF10.4:** Gerar relatórios de novos clientes. 


**RF11 - Gerenciar garantias:** 

- **RF11.1:** Registrar garantia vinculada ao celular. 

- **RF11.2:** Registrar garantia vinculada ao celular. 

- **RF11.3:** Configurar prazos de garantias. 

- **RF11.4:** Calcular vencimento da garantia e emitir alerta de vencimento e emitir alerta de vencimento. 

- **RF11.5:** Consultar status da garantia (ativa/inativa). 

**RF12 - Registrar vendas:** Permitir o registro de vendas, vinculado ao nome do cliente, modelo do dispositivo, data da venda, telefone do comprador, garantia do produto.

**RF13 - Registrar movimentações financeiras:** Registrar entradas e saídas financeiras vinculadas a vendas e serviços e permitir o registro de pagamento por PIX, cartão e boleto.

**RF14 - Gerar relatórios de estoque:** 

- **RF14.1:** Relatório de produtos disponíveis (peças e celulares). 

- **RF14.2:** Relatório de estoque mínimo. 

- **RF14.3:** Relatório de produtos parados. 

**RF15 - Gerar gráficos de manutenção:** 
- **RF15.1:** Gráfico de peças mais utilizadas em concertos. 

- **RF15.2:** Gráficos de celulares que mais apresentam problemas. 

- **RF15.3:** Exibir gráficos em dashboard. 


## 7.2 Lista de Requisitos Não Funcionais

Os requisitos não funcionais consistem nas restrições as aplicações de funções do sistema. Visando garantir a eficiência e qualidade das funcionalidades implementadas considerando o seu desempenho, segurança e usabilidade.

**RNF01 - Usabilidade:** O sistema deve possuir uma interface simples e intuitiva, com elementos visuais que auxiliam a organização e sua utilização no dia a dia, contendo dashboards de vendas, estoque e clientes, com gráficos e indicadores em sua forma resumida. O sistema também deve permitir que operações e registros de movimentação sejam feitos de forma rápida (até 3 cliques), além de botões com marcações descritivas. 

**RNF02 - Confiabilidade:**  O sistema deve exigir login e senha para a sua utilização. As sessões devem ser encerradas após 2h de inatividade. Além de se recuperar de forma rápida (em até 5 minutos) após uma falha.

**RNF03 - Desempenho:** Consultas no sistema devem responder em até 60 segundos, e o sistema deve ser capaz de suportar pelo menos 5.000 registros sem perda de desempenho. Além disso, operações como cadastro e edição não devem exceder o tempo de 60 segundos.

**RNF04 - Suportabilidade:** O sistema deve ser uma aplicação web responsiva, funcionando corretamente em navegadores modernos (Google Chrome, Mozilla Firefox, Microsoft Edge…) é capaz de se adaptar automaticamente a diferentes tamanhos de tela, de 360x640 px a 1920x1080 px, sem perda de usabilidade.  

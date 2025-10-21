# 7 REQUISITOS DE SOFTWARE

## 7.1 Lista de Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades que o sistema deve ter para atender às necessidades do cliente, incluindo integrações, processos e interações do usuário com o sistema.

**RF01 - Cadastrar celulares:** Permitir o registro de celulares com informações de modelo, IMEI, cor, capacidade, estado, valor de compra e defeitos identificados.

**RF02 - Cadastrar peças:** Permitir o registro de peças com nome, código interno, garantia, compatibilidade, quantidade e fornecedor.

**RF03 – Registrar reparos, testes e atualizar estoque:** O sistema deve permitir registrar testes realizados nos celulares (ex.: câmera, tela, carregador, botões), registrar garantia e ordens de serviço de reparo vinculadas ao dispositivo e ao cliente associado, atualizando automaticamente o estoque sempre que as peças forem utilizadas nos reparos.

**RF04 - Registrar movimentações de estoque:** Permitir registrar entradas e saídas de celulares e peças (compra, venda, devolução, uso em conserto).

**RF05 - Diferenciar estoque de celulares:** Separar estoque de celulares para revenda e para manutenção.

**RF06 - Manter histórico de celulares:** Registrar todo o ciclo do celular (entrada, peças utilizadas, venda e cliente).

**RF07 - Vincular peças utilizadas:** Associar peças usadas em concertos ao histórico do celular.

**RF08 - Cadastrar clientes:** Permitir o registro de clientes com nome, contato, CPF e histórico de compras/consertos.

**RF09 - Classificar clientes:** Diferenciar clientes como consumidores finais, revendedores ou clientes de manutenção.

**RF10 - Consultar histórico por cliente:** Mostrar automaticamente os celulares comprados ou com reparo realizado por cada cliente.

**RF11 - Gerar relatórios de clientes:** Emitir relatórios de clientes mais ativos (quem comprou ou trouxe celular para manutenção em 30, 60 ou 90 dias) com garantia ativa (avisar sobre vencimento, manter relacionamento com o cliente, evitar reclamações) e inadimplentes (pagamentos pendentes e ou atrasados, lembrete de clientes inadimplentes). Lista de clientes que foram criados no último mês para entender se o fluxo de clientes está crescendo ou se mantendo.

**RF12 - Gerenciar garantias:** Permitir registro de garantias vinculadas ao celular e ao cliente, configurando seus respectivos prazos (ex.: 90 dias, 1 ano) e emissão de mensagens de alertas próximo ao vencimento da garantia (2 meses antes do vencimento).

**RF13 - Registrar vendas:** Permitir o registro de vendas, vinculado ao nome do cliente, modelo do dispositivo, data da venda, telefone do comprador, garantia do produto.

**RF14 - Registrar movimentações financeiras:** Registrar entradas e saídas financeiras vinculadas a vendas e serviços e permitir o registro de pagamento por PIX, cartão e boleto.

**RF15 - Gerar relatórios de estoque:** Listar produtos disponíveis, estoque mínimo e produtos parados.

**RF16 - Gerar gráficos de manutenção:** Mostrar peças mais utilizadas em consertos e celulares com mais problemas.

## 7.2 Lista de Requisitos Não Funcionais

Os requisitos não funcionais consistem nas restrições as aplicações de funções do sistema. Visando garantir a eficiência e qualidade das funcionalidades implementadas considerando o seu desempenho, segurança e usabilidade.

**RNF01 - Usabilidade:** O sistema deve possuir uma interface simples e intuitiva, com elementos visuais que auxiliam a organização e sua utilização no dia a dia, contendo dashboards de vendas, estoque e clientes, com gráficos e indicadores em sua forma resumida. O sistema também deve permitir que operações e registros de movimentação sejam feitas de forma rápida (até 3 cliques), além de botões com marcações descritivas.

**RNF02 - Confiabilidade:** O sistema deve exigir login e senha para a sua utilização. As sessões devem ser encerradas após 2h de inatividade. Além de se recuperar de forma rápida (em até 5 minutos) após uma falha.

**RNF03 - Desempenho:** Consultas no sistema devem responder em até 60 segundos, e o sistema deve ser capaz de suportar pelo menos 5.000 registros sem perda de desempenho. Além disso, operações como cadastro e edição não devem exceder o tempo de 60 segundos.

**RNF04 - Suportabilidade:** O sistema deve ser uma aplicação web responsiva, funcionando corretamente em navegadores modernos (Google Chrome, Mozilla Firefox, Microsoft Edge…) é capaz de se adaptar automáticamente a diferentes tamanhos de tela, de 360x640 px a 1920x1080 px, sem perda de usabilidade.

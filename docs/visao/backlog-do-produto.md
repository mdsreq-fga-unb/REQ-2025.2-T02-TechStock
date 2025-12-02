# 9 Backlog do Produto

## 9.1 Backlog Geral

### User Stories

**US01 – Cadastrar Celulares (RF01):** Como Administrador, eu quero cadastrar as informações dos celulares (modelo, IMEI, cor, capacidade, estado, valor de compra, garantia e defeitos identificados) para ter um controle mais prático dos itens no estoque da loja.

**Critérios de aceitação:**

- [ ] Permitir cadastrar um novo celular com os campos: modelo, IMEI (único), cor, capacidade, estado, valor de compra, garantia e defeitos identificado. 
- [ ] Validar campos obrigatórios e exibir mensagem de erro quando houver dados ausentes ou duplicados (ex.: IMEI). 
- [ ] Permitir editar e excluir registros de celulares.  
- [ ] Registrar automaticamente a data, hora e o usuário responsável pelo cadastro ou alteração. 
- [ ] Exibir uma listagem de celulares e peças com opções de busca e filtros (por modelo, fornecedor, estado, etc.). 
- [ ] Armazenar os dados de forma segura e integrá-los ao módulo de controle de estoque. 

**US02 – Cadastrar Peças (RF2):** Como Administrador, eu quero cadastrar as informações das pecas de reposição (nome, código interno, garantia, compatibilidade, quantia e fornecedor) para manter o estoque preciso e organizado dos itens disponíveis para manutenção e venda.

**Critérios de aceitação:**

- [ ] Permitir cadastrar uma nova peça com os campos obrigatórios: nome, código interno (único), garantia, compatibilidade, quantidade e fornecedor. 
- [ ] Validar campos obrigatórios e exibir uma mensagem de erro clara quando houver dados ausentes. 
- [ ] Exibir uma mensagem de erro caso o código interno já esteja cadastrado (duplicidade). 
- [ ] Permitir editar as informações de uma peça existente. 
- [ ] Permitir excluir o registro de uma peça, mediante confirmação. 
- [ ] Exibir uma listagem de peças com opções de busca e filtros (por nome, código interno, fornecedor, compatibilidade, entre outros). 
- [ ] O campo "quantidade" deve ser inicializado e deve refletir a quantidade inicial da peça em estoque. 
- [ ] O campo "garantia" deve permitir a configuração do prazo. 

**US03 – Registrar ordem de serviço de reparo (RF3):** Como técnico, quero criar ordens de serviço vinculadas a um cliente e a um celular, para controlar os reparos realizados e suas garantias. 

**Critérios de aceitação:**

- [ ] Permitir criar uma nova OS vinculada a um cliente e a um celular. 
- [ ] A OS deve ser criada com status inicial "Em andamento". 
- [ ] Permitir atualizar o status para "Concluído" e registrar a data de conclusão. 
- [ ] Permitir registrar a garantia do serviço ao concluir o reparo. 
- [ ] O sistema deve adicionar automaticamente o evento ao histórico do celular.

**US03.1 - Registrar testes técnicos (RF3):** Como técnico de manutenção, quero registrar os testes realizados quando o celular é recebido para conserto, para documentar o estado do aparelho e evitar que o cliente elegeu posteriormente que causamos defeitos que já existiam. 

**Critérios de aceitação:**

- [ ] Ao criar uma nova OS, o sistema deve permitir registrar os testes e inspeções iniciais (ex.: câmera, tela, áudio, microfone, botões, conectores). 
- [ ] Deve ser possível indicar o resultado de cada teste (aprovado, reprovado, não testado) e adicionar observações. 
- [ ] O registro dos testes deve ser obrigatório antes de iniciar qualquer reparo. 
- [ ] As informações dos testes devem ficar vinculadas à OS e ao histórico do celular. 
- [ ] O sistema deve permitir anexar fotos ou vídeos do estado inicial do aparelho.
- [ ] O histórico de testes deve poder ser consultado posteriormente.

**US03.2 - Registrar peças utilizadas em reparos (RF3):** Como técnico, quero vincular as peças utilizadas durante um reparo, para que o sistema atualize automaticamente o estoque e registre os componentes aplicados no histórico do celular. 

**Critérios de aceitação:**

- [ ] Permitir selecionar peças do estoque e vincular à OS com quantidade utilizada.
- [ ] O sistema deve descontar automaticamente as peças do estoque.
- [ ] Exibir alerta caso a quantidade selecionada seja maior que o disponível em estoque.
- [ ] Registrar no histórico do celular as peças utilizadas no reparo.

**US04 – Registrar Movimentações de Estoque (RF04):** Como Administrador, eu quero registrar em tempo real a movimentação dos itens que entram e saem do estoque da loja (compra, venda, devolução, conserto) para ter uma visão mais acessível dessas informações. Assim facilitando a minha comunicação com o cliente em momentos chave.

**Critérios de aceitação:**

- [ ] Permitir registrar movimentações de entrada e saída de produtos.
- [ ] Cada movimentação deve conter: tipo de operação (compra, venda, devolução, conserto), item, quantidade, data/hora.
- [ ] O estoque deve ser atualizado automaticamente em tempo real após cada movimentação.
- [ ] Exibir alerta de erro quando a quantidade de saída for maior do que o disponível em estoque.
- [ ] Exibir mensagem de confirmação quando a movimentação for concluída com sucesso.
- [ ] Registrar automaticamente data, hora e usuário que realizou a movimentação.
- [ ] Manter histórico detalhado de todas as movimentações (data, tipo, quantidade, responsável).
- [ ] Permitir filtrar o histórico por tipo de operação, data ou usuário.
- [ ] Entradas de compras devem somar ao estoque.
- [ ] Devoluções devem repor o item no estoque.
- [ ] Exibir saldo atualizado de cada item na tela de controle de estoque.


**US05 – Diferenciar estoque de celulares (RF05):** Como Administrador, quero que o sistema mostre os celulares que estão para revenda e outros para manutenção no estoque.

**Critérios de aceitação:**

- [ ] Permitir vincular o celular ao tipo (se está para revenda ou para manutenção).
- [ ] Permitir filtrar o estoque por tipo (revenda ou manutenção).

**US06 – Manter Histórico de celulares (RF06):** Como Administrador, quero poder registrar todo o ciclo do celular, desde a entrada, as peças utilizadas, a venda e o cliente que comprou. 

**Critérios de aceitação:**

- [ ] Permitir registrar a data de entrada do celular.
- [ ] Permitir vincular as peças utilizadas no aparelho.
- [ ] Permitir registrar a data de venda.
- [ ] Permitir vincular o cliente que comprou o celular.

**US06.1 - Registrar de entrada de celulares (RF06.1)** Como administrador, quero registrar a data de entrada do celular para iniciar o histórico de manutenção. 

**Critérios de aceitação:**

- [ ] Permitir registrar a data de entrada do celular. 
- [ ] Permitir vincular as peças utilizadas no aparelho. 
- [ ] Permitir registrar a data de venda. 
- [ ] Permitir vincular o cliente que comprou o celular. 

**US06.2 - Registrar peças utilizadas (RF06.2)** Como administrador, quero registrar as peças utilizadas no conserto do celular para controlar o histórico e o consumo de estoque. 

**Critérios de aceitação:**

- [ ] Deve permitir selecionar peça por nome ou código. 
- [ ] Deve permitir inserir a quantidade usada. 
- [ ] Deve registrar a peça no histórico do aparelho.  
- [ ] Deve descontar do estoque. 
- [ ] Deve permitir adicionar mais de uma peça. 

**US06.3 - Registrar venda do celular (RF06.3)** Como administrador, quero registrar a data da venda do celular para finalizar o ciclo do aparelho. 

**Critérios de aceitação:**

- [ ] Deve permitir registrar a data de venda. 
- [ ] A data deve ser obrigatória. 
- [ ] A data não pode ser anterior à data de entrada.  
- [ ] Após salvar, o status do celular deve mudar para “vendido”. 
- [ ] Deve registrar essa etapa no histórico. 


**US06.4 - Vincular celular ao cliente (RF06.4)** Como administrador, quero vincular o cliente que comprou o celular para manter o histórico completo de venda. 

**Critérios de aceitação:**

- [ ] Deve permitir selecionar um cliente já cadastrado. 
- [ ] O cliente deve ser obrigatório. 
- [ ] O vínculo deve aparecer no histórico.  
- [ ] O sistema deve impedir vincular mais de um cliente a uma mesma venda. 
- [ ] Exibir mensagem de confirmação após salvar. 

**US07 - Cadastrar Clientes (RF07 e RF08):** Como Administrador eu quero cadastrar os clientes por meio de nome, contato, CPF, histórico de compras/consertos e tipo (consumidores finais, revendedores e clientes de manutenção). Assim, posso ter uma visão mais organizada e centralizada sobre os clientes que já frequentaram a loja. 

**Critérios de aceitação:**

- [ ] Permitir cadastrar um novo cliente com os campos: nome, contato, CPF, e tipo (consumidores finais, revendedores e clientes de manutenção). 
- [ ] Validar campos obrigatórios e exibir mensagem de erro quando houver dados ausentes ou duplicados (ex.: CPF). 
- [ ] Permitir editar e excluir registros de clientes. 
- [ ] Exibir uma listagem de clientes com opções de busca e filtros (por CPF, consertos e tipo).
- [ ] Armazenar os dados de forma segura.

**Regra de Negócio 08 – Histórico de Peças no Cadastro de Cliente** O sistema deve registrar automaticamente as peças usadas nos consertos associados ao cliente como parte do seu histórico, sem tratar esse vínculo como uma funcionalidade separada. 

**US08 - Consultar histórico por cliente (RF09):** Como Administrador, quero visualizar automaticamente os celulares comprados, ou com reparo realizado por cada cliente.

**Critérios de aceitação:**

- [ ] Listar os celulares comprados ou reparados.
- [ ] Permitir filtrar os celulares por tipo (comprados ou com reparos realizados) ou por cliente.

**US09.1 – Gerar relatório de clientes ativos com filtro por período (RF10.1)** Como Administrador, quero gerar relatórios de clientes mais ativos filtrando por prazo (30, 60 ou 90 dias), para analisar o engajamento recente. 

**Critérios de aceitação:**

- [ ] Deve permitir selecionar o período: 30, 60 ou 90 dias. 
- [ ] O relatório deve exibir: 
    - nome do cliente 

    - contato (telefone/e-mail) 

    - Quantidade de serviços/compras 

    - Última data de atividade 


**US09.2 – Gerar relatório de garantias ativas e alerta de vencimento (RF10.2)** Como Administrador, quero visualizar um relatório de clientes com garantias ativas e receber alertas quando uma garantia estiver prestes a vencer, para realizar acompanhamentos. 

**Critérios de aceitação:**   

- [ ] O relatório deve listar todos os clientes com garantias ativas. 

- [ ] Deve exibir: 

    - cliente 

    - celular comprado 

    - data de início da garantia 

    - data de vencimento 

    - status (ativa / prestes a vencer) 

- [ ] Deve emitir alerta visual quando faltarem 2 meses ara o vencimento. 

- [ ] Deve permitir filtrar por período (ex.: garantias que vencem em 15 ou 30 dias). 



**US09.3 – Gerar relatório de clientes inadimplentes e enviar lembretes (RF10.3)** Como Administrador, quero gerar um relatório de clientes inadimplentes e enviar lembretes de cobrança, para facilitar o controle financeiro. 

**Critérios de aceitação:**   

- [ ] O relatório deve listar todos os clientes inadimplentes. 

- [ ] Deve exibir: 

    - nome 

    - contato 

    - valor pendente 

    - data limite ultrapassada 

    - dias de atraso 

- [ ] Deve permitir filtrar por atraso: 15, 30, 60 dias. 

- [ ] Deve indicar quando o cliente tem mais de um débito. 


**US09.4 – Gerar relatório de novos clientes (RF10.4)**  Como Administrador, quero visualizar um relatório dos novos clientes cadastrados, para acompanhar o crescimento da base de clientes. 

**Critérios de aceitação:**   

- [ ] Deve permitir selecionar o período: semanal, mensal, trimestral (ou personalizado). 

- [ ] O relatório deve exibir: 

    - nome 

    - contato 

    - data de cadastro 

    - primeiro serviço/compra realizada (se existir) 

- [ ] Deve exibir mensagem caso nenhum novo cliente exista no período. 

**US10 - Gerenciar garantias (RF11):** Como Administrador, eu quero registrar e gerenciar as garantias dos produtos (celulares e serviços) definindo prazos específicos e recebendo alertas automáticos de vencimento, pata manter a conformidade do serviço e fidelizar o cliente.

**Critérios de aceitação:**

- [ ] O sistema deve permitir o registro de garantias vinculadas ao celular e ao cliente.
- [ ] O registro deve permitir a configuração do prazo da garantia, suportando:
- [ ] 90 dias como prazo padrão para serviços de conserto/reparo.
- [ ] 1 ano para celulares novos ou revenda.
- [ ] O sistema deve calcular e registrar automaticamente a data de vencimento da garantia.
- [ ] O sistema deve ser capaz alertas próximo ao vencimento (2 meses antes do vencimento).
- [ ] A informação da garantia (prazo e status) deve ser visível no histórico do celular e do cliente.
- [ ] O sistema deve permitir a consulta de status da garantia (ativa, vencida, próxima do vencimento).

**US10.1 - Registrar garantia vinculada ao celular (RF11.1):** Como administrador, quero registrar a garantia de um celular para manter o controle das garantias ativas. 

**Critérios de aceitação:**

- [ ] Deve permitir selecionar o celular por lista ou código/IMEI. 
- [ ] O sistema deve calcular automaticamente a data de vencimento. 
- [ ] Não deve permitir registrar duas garantias ativas para o mesmo celular. 
- [ ] Deve exibir mensagem de confirmação após o registro. 

**US10.2: Editar garantia vinculada ao celular (RF11.2) :** Como administrador, quero editar uma garantia cadastrada para corrigir dados ou atualizar o status. 

**Critérios de aceitação:**

-** [ ] Deve permitir alterar data de início, data de vencimento ou prazo.** 
- [ ] Deve exibir mensagem após salvar as atualizações. 

**US10.3: Calcular vencimento e emitir alertas (RF11.4) :** Como administrador, quero que o sistema calcule o vencimento da garantia e emita alertas quando estiver próxima de expirar para facilitar o acompanhamento. 

**Critérios de aceitação:**

- [ ] O sistema deve calcular a data de vencimento automaticamente. 
- [ ] Deve exibir alerta quando faltar 2 meses para o vencimento. 
- [ ] Deve marcar o status como “prestes a vencer”. 
- [ ] Deve atualizar automaticamente o status para “expirada” após a data. 


**US11 - Registrar vendas (RF12):**  Como Administrador, quero registrar as informações de uma venda realizada. Vinculando as informações do cliente (nome e contato), modelo do dispositivo, data de venda e a garantia do produto. 

**Critérios de aceitação:**    

- [ ] Registrar informações sobre a venda (data e comprador). 

- [ ] Vincular informações do comprador (nome e contato) a venda. 

- [ ] Vincular informações do dispositivo vendido (modelo e garantia) 

**US12 – Registrar movimentações financeiras (RF13):** 

Como Administrador, gostaria de registrar as entradas e saídas financeiras vinculadas as vendas e serviços realizados. Além de permitir o registro de formas de pagamento como PIX, cartão e boleto. 
 
**Critérios de aceitação:**   

- [ ] O sistema deve permitir o registo de todas as entradas financeiras provenientes de vendas e serviços. 

- [ ] O sistema deve perimir o registro de todas as saídas financeiras vinculadas a vendas e servicos. 

- [ ] Ao registrar uma movimentação (Entrada ou Saída), o sistema deve exigir a vinculação a uma venda ou serviço. 

- [ ] O sistema deve permitir a seleção e registro das seguintes formas de pagamento para entradas: Pix, cartão e boleto. 

- [ ] Cada registro de movimentação deve incluir o valor, a data, a forma de pagamento e a descrição (venda/serviço/associado). 

- [ ] O sistema deve armazenar essas movimentações para que possam ser utlizadas na geração de relatórios de faturamento e lucro. 


**US13 – Gerar relatórios de estoque (RF14)** 

Como Administrador, gostaria de visualizar relatórios com informações relevantes do estoque. Como os produtos disponíveis, estoque mínimo e produtos parados. Para ter uma visão mais ampla da situação do estoque da loja. 
 
**Critérios de aceitação:**   

- [ ] O sistema deve ter uma funcionalidade dedicada para Gerar Relatórios de Estoque. 

- [ ] Deve ser possível gerar um relatório que liste todos os produtos disponíveis (celulares e peças). 

- [ ] O sistema deve gerar específico para itens que atingirem ou estão abaixo do estoque mínimo. 

- [ ] O sistema deve gerar um relatório de Produtos parados (itens que não tiveram movimentação de saída, como venda ou uso em conserto, em um período específico). 

- [ ] Os relatórios devem incluir informações esses como: Nome/Modelo do item, quantidade atual, localização no estoque e data da última movimentação. 

- [ ] Os dados de cada relatório devem ser apresentados em uma lista que suporte a exportação em formato (PDF ou CSV). 

**US13.1 – Relatório de produtos disponíveis (RF14):**   

Como Administrador, gostaria de visualizar um relatório com todos os produtos disponíveis (celulares e peças), para acompanhar o inventário atual. 

** Critérios de aceitação:**     

- [ ] O sistema deve listar todos os produtos que possuam quantidade maior que zero. 

- [ ] A listagem deve incluir: nome/modelo, categoria (celular/peça), quantidade atual, localização e última movimentação. 

- [ ] O relatório deve ser atualizado em tempo real com base no estoque atual. 

**US13.2 – Relatório de estoque mínimo (RF14.2):**  

Como Administrador, gostaria de gerar um relatório com os produtos que atingiram ou estão abaixo do estoque mínimo, para facilitar reposições. 

**Critérios de aceitação:**  

- [ ] O sistema deve identificar produtos cuja quantidade atual ≤ quantidade mínima configurada. 

- [ ] O relatório deve apresentar: item, quantidade atual, estoque mínimo definido e última movimentação. 

**US13.3 – Relatório de produtos parados (RF14.3)** 

Como Administrador, gostaria de visualizar um relatório de produtos parados, ou seja, itens sem movimentação de saída em um período específico, para auxiliar decisões de compra. 

**Critérios de aceitação:**   

- [ ] O usuário deve poder definir o período (ex.: 30, 60, 90 dias ou customizado). 

- [ ] O sistema deve listar itens sem movimentação de saída (venda ou uso em conserto) dentro do período escolhido. 

- [ ] O relatório deve mostrar: nome/modelo, quantidade atual, localização e data da última movimentação. 

- [ ] O sistema deve exibir um aviso se não houver produtos parados no período selecionado. 

**US14 – Gerar gráficos de Manutenção (RF15)**  Como Administrador, gostaria de visualizar gráficos que mostrem as peças mais utilizadas em concertos, com maior recorrência de uso e celulares que mais apresentam problemas. Me auxiliando na manutenção do estoque e plano de manutenção. 

**Critérios de aceitação:** Gerar uma representação visual dos dados relevantes em formato de gráfico de pizza. 

- [ ] O sistema deve gerar um gráfico das peças mais utilizadas em consertos (em volume total) dentro de um período selecionável (íúltimos 30, 60, 90 dias ou customizados). 

- [ ] O sistema deve gerar um gráfico que identifique os Modelos de Celular com Maior Recorrência de Problemas/Consertos (em número de Ordens de Serviço abertas) dentro de um período selecionável. 

- [ ] O gráfico de peças deve permitir que o Administrador visualize a frequência de uso da peça, auxiliando na manutenção do estoque. 

- [ ] O gráfico de celulares deve auxiliar no plano de manutenção, destacando os modelos que mais demandam atenção. 

- [ ] O sistema deve exibir os gráficos em um dashboard ou tela de relatórios gerenciais de forma resumida e intuitiva. 

**US14.1 – Gráfico de peças mais utilizadas em consertos (RF15.1)** Como Administrador, gostaria de visualizar um gráfico que mostre as peças mais utilizadas em consertos, para auxiliar no controle e reposição do estoque. 

**Critérios de aceitação:**   

- [ ] O sistema deve permitir selecionar o período (30, 60, 90 dias ou customizado). 

- [ ] O gráfico deve ser no formato pizza, exibindo a proporção de uso das peças no período selecionado. 

- [ ] Devem ser exibidos no gráfico: nome da peça, quantidade de usos e porcentagem sobre o total. 

- [ ] Caso não haja dados no período, o sistema deve exibir uma mensagem informativa (“Não há peças utilizadas nesse período”). 

**US14.2 – Gráfico de celulares que mais apresentam problemas (RF15.2)** 

Como Administrador, gostaria de ver um gráfico que identifique os modelos de celular com maior recorrência de problemas, para apoiar o plano de manutenção e decisões estratégicas. 

**Critérios de aceitação:**   

- [ ] O sistema deve permitir selecionar o período (30, 60, 90 dias ou customizado). 

- [ ] O gráfico deve ser no formato pizza, mostrando quantidade de Ordens de Serviço por modelo de celular. 

- [ ] O sistema deve exibir uma mensagem caso não haja OS registradas no período. 

**US14.3 – Exibir gráficos em Dashboard (RF15.3)**   

Como Administrador, gostaria de visualizar os gráficos diretamente em um dashboard centralizado, facilitando a análise rápida. 

**Critérios de aceitação:**    

- [ ] O dashboard deve exibir os gráficos de maneira organizada e intuitiva, lado a lado ou em seções distintas. 

- [ ] O dashboard deve atualizar os gráficos automaticamente ao alterar o período de análise. 

- [ ] Cada gráfico deve possuir título e legenda clara. 

- [ ] O dashboard deve ser acessível a partir da área de relatórios gerenciais. 

## 9.2 Priorização do Backlog Geral 

A priorização apresentada foi revisada com base na complexidade estimada e no valor de negócio de cada requisito. Para estimar a complexidade, utilizamos Story Points, seguindo a sequência de Fibonacci (1, 2, 3, 5, 8, 13...), levando em consideração fatores como esforço técnico, grau de incerteza e impacto funcional. 

O valor de negócio foi avaliado em conjunto com o cliente por meio da técnica de priorização MoSCoW (Must have, Should have, Could have, Won’t have), permitindo identificar os requisitos de maior relevância para o negócio. 

- **Must have::** Requisitos essenciais, indispensáveis para o funcionamento mínimo do produto. Sua entrega é obrigatória, pois, sem eles, o sistema não atende aos requisitos básicos de uso ou de negócio. 

- **Should have:** Requisitos importantes, que agregam valor significativo ao produto, mas que podem ser implementados após os itens críticos. Embora não sejam vitais para o funcionamento imediato, sua ausência pode impactar a experiência do usuário ou a eficiência do sistema. 

- **Could have:** Requisitos desejáveis, que aumentam a atratividade ou conveniência do produto, mas que não são essenciais no escopo inicial. Podem ser considerados em futuras versões, caso haja tempo ou recursos disponíveis. 

- **Won’t have:** Requisitos ou melhorias que não serão implementados nesta versão do produto. São itens identificados como desejáveis ou interessantes, mas que, após análise com o cliente e a equipe, foram considerados fora do escopo atual devido a restrições de tempo, orçamento, tecnologia ou alinhamento estratégico. 

## 9.3 MVP

A definição do **Produto Mínimo Viável (MVP)** foi realizada com base na análise da relação entre o valor de negócio e o esforço de implementação de cada requisito, conforme representado na matriz de priorização. Assim, foram priorizados os requisitos localizados na região de **alto valor e complexidade viável**, por representarem **funcionalidades essenciais e de maior impacto para o cliente**. Requisitos com alto esforço de desenvolvimento e baixo valor agregado foram excluídos do escopo do MVP, de modo a concentrar o desenvolvimento em entregas que proporcionem maior retorno em menor tempo, garantindo uma primeira versão **funcional, estratégica e alinhada às necessidades prioritárias da loja "CELLVEX"**. 
 
A seguir, apresenta-se a matriz de esforço e impacto, que relaciona os requisitos conforme o valor de negócio e o esforço de implementação, servindo de base para a definição do MVP:

![Imagem 2 - Matriz de esforço e impacto](../assets/MVP.jpeg)
<p style="text-align: center; font-style: italic; color: #d8d7d7ff;">
Figura 2 – Matriz de esforço e impacto.
</p>

## 9.4 Avaliação Técnica (Esforço)

### Esforço

#### Descrição do Esforço para o Desenvolvimento

| Esforço | Descrição |
|---------|-----------|
| Pouco esforço (1) | 1 dia de desenvolvimento |
| Pouco esforço (2) | 1 dia e meio de desenvolvimento |
| Pouco esforço (3) | 2 dias de desenvolvimento |
| Médio esforço (5) | 3 dias de desenvolvimento |
| Médio esforço (8) | 4 dias de desenvolvimento |
| Alto esforço (13) | 1 semana de desenvolvimento |

Portanto, a tabela a seguir relaciona os requisitos funcionais, suas histórias de usuário, objetivos específicos, prioridade (MoSCoW), esforço estimado (Story Points) e a inclusão dos itens que compõem o MVP.

### Objetivos Específicos (OE)

| Código | Descrição |
|--------|-----------|
| OE1 | Otimização e organização do controle de entrada e saída dos produtos vendidos. |
| OE2 | Melhorar a visualização do estoque físico e da disponibilidade dos produtos. |
| OE3 | Permitir uma visualização concreta dos nomes, contatos, modelos de celulares e histórico de compras dos clientes. |
| OE4 | Oferecer garantia dos produtos vendidos. |
| OE5 | Aprimorar a tomada de decisão por meio da disponibilização de informações gerenciais sobre fluxo de produtos, vendas e lucro. |
| OE6 | Controle de trocas e registros de peças trocadas. |

### Tabela de Backlog com Priorização

| Código RF | US | OE | Prioridade (MoSCoW) | Story Points (Esforço) | MVP |
|-----------|----|----|---------------------|------------------------|-----|
| RF 01 | US01 | OE1 | Must | 5 | x |
| RF 02 | US02 | OE1 | Must | 5 | x |
| RF 03 | US3, US3.1, US3.2| OE2 | Must | 8 | x |
| RF 04 | US04 | OE1 | Must | 3 | x |
| RF 05 | US05 | OE2 | Must | 3 | x |
| RF 06 | US06, US6.1, US6.2, US6.3, US6.4 | OE3 | Must | 5 | x |
| RF 07 | US07 | OE3 | Must | 5 | x |
| RF 08 | US07 | OE3 | Must | 3 | x |
| RF 09 | US08 | OE3 | Must | 3 | x |
| RF 10 | US09 | OE5 | Should | 8 |  |
| RF 11 | US10 | OE4 | Must | 5 | x |
| RF 12 | US11 | OE3 | Must | 3 | x |
| RF 13 | US12 | OE1 | Should | 3 |  |
| RF 14 | US13 | OE5 | Could | 5 |  |
| RF 15 | US14 | OE5 | Could | 8 |  |



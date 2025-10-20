# Backlog do Produto

## 9.1 Backlog Geral

### User Stories

- **US01 – Cadastrar Celulares (RF01):** Como Administrador, eu quero cadastrar as informações dos celulares (modelo, IMEI, cor, capacidade, estado, valor de compra, garantia e defeitos identificados) e peças (nome, código interno, compatibilidade, quantidade, fornecedor) para ter um controle mais prático dos itens no estoque da loja.

**Critérios de aceitação:**

- [ ] Permitir cadastrar um novo celular com os campos: modelo, IMEI (único), cor, capacidade, estado, valor de compra, garantia e defeitos identificados. 
- [ ] Permitir cadastrar uma nova peça com os campos: nome, código interno (único), compatibilidade, quantidade e fornecedor. 
- [ ] Validar campos obrigatórios e exibir mensagem de erro quando houver dados ausentes ou duplicados (ex.: IMEI ou código interno). 
- [ ] Permitir editar e excluir registros de celulares e peças
- [ ] Registrar automaticamente a data, hora e o usuário responsável pelo cadastro ou alteração
- [ ] Exibir uma listagem de celulares e peças com opções de busca e filtros (por modelo, código interno, fornecedor, estado, etc.)
- [ ] Armazenar os dados de forma segura e integrá-los ao módulo de controle de estoque

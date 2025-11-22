// dados.js
export const dadosDoSistema = {
  metricas: [
    { id: 1, titulo: "Produtos em Estoque", valor: 550, crescimeto: "+12%", status: "positivo", icone: "package" },
    { id: 2, titulo: "Clientes Ativos", valor: 156, crescimeto: "+8%", status: "positivo", icone: "users" },
    { id: 3, titulo: "Manutenções Abertas", valor: 21, crescimeto: "-5%", status: "negativo", icone: "wrench" },
    { id: 4, titulo: "Vendas do Mês", valor: 300, crescimeto: "+12%", status: "positivo", icone: "trending-up" },
  ],
  vendasRecentes: [
    { id: 1, cliente: "Joao Silva", produto: "iPhone 14 Pro", valor: "R$ 6.000", status: "Em Andamento" },
    { id: 2, cliente: "Maria Oliveira", produto: "Samsung S22", valor: "R$ 4.500", status: "Concluído" },
    { id: 3, cliente: "Carlos Souza", produto: "Xiaomi 12", valor: "R$ 3.200", status: "Em Andamento" },

  ],
  filaManutencao: [
    { id: 1, modelo: "iPhone 13", servico: "Troca de Tela", cliente: "Carlos Mendes", valor: "R$ 2.200", status: "Concluído" },
    { id: 2, modelo: "iPhone 14", servico: "Troca de Bateria", cliente: "Juliana Alves", valor: "R$ 2.200", status: "Em Andamento" },
    { id: 3, modelo: "iPhone 11", servico: "Troca de Tela", cliente: "Roberto Mendes", valor: "R$ 2.200", status: "Concluído" },
  ],
  ordensServico: [
    { id: "OS-001", cliente: "Jade Silva", aparelho: "iPhone 14 Pro", status: "Em Andamento" },
    { id: "OS-002", cliente: "João Silva", aparelho: "iPhone 14 Pro", status: "Concluído" },
    { id: "OS-003", cliente: "Julia Silva", aparelho: "iPhone 14 Pro", status: "Em Andamento" },

  ],
  estoqueBaixo: [
    { item: "Tela iPhone 14", atual: 3, total: 5, porcentagem: 60 },
    { item: "Bateria iPhone", atual: 2, total: 5, porcentagem: 40 },
    { item: "Película iPhone 13", atual: 10, total: 10, porcentagem: 100 },
  ]
};
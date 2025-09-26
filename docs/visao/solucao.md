# SOLUÇÃO PROPOSTA 

## 2.1 Objetivos do Produto

### Objetivo Geral
Implantar um sistema digital capaz de centralizar, estabelecer a organização das vendas e o controle de estoque da empresa ‘CELLVEX’. 

### Objetivos Específicos

| Código | Objetivo Específico | Indicador de Sucesso |
|-----------|----------|-----------|
| **OE1** | Otimização e organização do controle de entrada e saída dos produtos vendidos. | Redução de 50% de tempo para registro.  |
| **OE2** | Melhorar a visualização do estoque físico e da disponibilidade dos produtos. | Melhorar a visualização do estoque físico e da disponibilidade dos produtos. |
| **OE3** | Permitir uma visualização concreta dos nomes, contatos, modelos de celulares e histórico de compras dos clientes. | Aumento de 50% de tempo na procura de clientes e dados sobre os produtos. |
| **OE4** | Aprimorar a tomada de decisão por meio da disponibilização de informações gerenciais sobre fluxo de produtos, vendas e lucro. | Redução de 50% no tempo gasto para análise de informações gerenciais. |
| **OE5** | Controle de trocas e registros de peças trocadas. | Aumento em 50% de garantia dos produtos. |

## 2.2 Características da Solução

- **Controle de entrada e saída (OE1)**: Possibilita cadastrar entrada e saída de produtos no estoque, gravando as suas informações principais. 
- **Visualização do estoque (OE2)**: Disponibilidade em tempo real dos produtos conforme estoque cadastrado.
- **Registro e cadastro de clientes (OE3)**: Cadastro e visualização dos clientes que já realizaram compras anteriormente. 
- **Controle de vendas realizadas (OE4)**: Cadastro e controle de notas fiscais e garantias das vendas realizadas. 
- **Melhorar gestão e decisões (OE5)**: Emissão de relatórios de faturamento, vendas e estoque. 
- **Controle de manutenção (OE6)**: Registro detalhado de manutenções realizadas em cada aparelho.

## 2.3 Tecnologias a Serem Utilizadas

<div class="tech-container">
  <div class="tech-card" id="frontend">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" />
    <h3>Frontend</h3>
    <p>React.js</p>
  </div>

  <div class="tech-card" id="backend">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node" />
    <h3>Backend</h3>
    <p>Node.js</p>
  </div>

  <div class="tech-card" id="database">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" />
    <h3>Banco de Dados</h3>
    <p>PostgreSQL</p>
  </div>
</div>

<style>
.tech-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 30px;
}

.tech-card {
  width: 160px;
  height: 200px;
  background: linear-gradient(145deg, #f0f4f8, #d9e2ec); /* mesma cor dos cards de equipe */
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, sans-serif;
  cursor: pointer;
  text-align: center;
  padding: 15px;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  animation: float 4s ease-in-out infinite alternate;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

.tech-card img {
  width: 65px;
  height: 65px;
  margin-bottom: 15px;
  transition: transform 0.5s;
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.tech-card:hover img {
  transform: rotate(15deg) scale(1.1);
}

.tech-card h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #1f4e79; /* cor semelhante ao título dos cards de equipe */
  font-weight: bold;
}

.tech-card p {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.tech-card:active {
  transform: scale(0.95);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
</style>

<script>
// Apenas animação de clique visual (pulse)
const cards = document.querySelectorAll('.tech-card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    card.style.transform += ' scale(1.05)';
    setTimeout(() => {
      card.style.transform = card.style.transform.replace(' scale(1.05)','');
    }, 150);
  });
});
</script>

## 2.4 Pesquisa de Mercado e Análise Competitiva
O mercado de venda de celulares na região do Novo Gama – GO é altamente competitivo, pois a demanda por celulares novos, usados e com um preço acessível é grande. O mercado da região utiliza sistemas de controle de vendas e estoque. Apesar disso, essas soluções apresentam fragilidades que geram riscos operacionais: 

- Falta de mobilidade: Sistemas tradicionais são hospedados localmente, limitando o acesso remoto ao estoque e relatórios, prejudicando operações fora da loja. 

- Interface pouco intuitiva: Softwares antigos dificultam o uso diário, aumentando a chance de erros e demandando maior treinamento da equipe. 

A TechStock se diferencia ao oferecer: 

- Aplicação Web hospedada em nuvem: Permite acesso ao estoque e relatórios de qualquer lugar, agilizando vendas externas e manutenções. 

- Interface intuitiva e responsiva: Facilita o uso, reduz erros e diminui a necessidade de treinamento. 

- Facilidade de organização: Gerenciamento de estoque, conserto, lucro, clientes, peças, garantia.  

## 2.5 Análise de Viabilidade

A viabilidade técnica do projeto é considerada alta, pois a equipe possui experiência em projetos utilizando as tecnologias que serão aplicadas: React no front-end, Node.js no back-end e PostgreSQL como banco de dados. A integração entre os sistemas será realizada por meio do Express.js, garantindo uma maior eficiência e confiabilidade. 

O prazo de entrega do produto é de dois meses, dividido em sprints de 9 dias. Cada sprint resultará em entregas incrementais de funcionalidades, permitindo validações constantes e ajustes ágeis. Essa abordagem contribui para a redução de riscos e aumenta a certeza no cumprimento do cronograma. 

Quanto às competências, a equipe já participou de projetos que demandaram o uso dessas tecnologias envolvidas em cenários reais, adquirindo conhecimento prático em integrações, como sincronização de dados em tempo real. Esse histórico reforça a consistência da base do projeto, garantindo efetividade nos prazos prazo e na qualidade da solução. 

## 2.6 Impacto da Solução

A implementação da solução digital na loja “CellVex” visa tornar a gestão mais organizada e eficiente, enriquecendo diretamente a operação e a experiência do cliente: 

1. **Otimização do Controle de Produtos**: O cadastro automatizado e a visualização em tempo real do estoque reduzem o tempo de registro, melhoram a disponibilidade de produtos e evitam perdas de vendas. 

1. **Gestão de Clientes e Histórico de Compras**: O registro detalhado de clientes e histórico de compras agiliza a localização de informações, melhora o atendimento e facilita a fidelização. 

1. **Tomada de Decisão Baseada em Informações Gerenciais**: Relatórios de vendas e estoque permitem analisar o desempenho e tomar decisões mais rapidamente. 

1. **Controle de Manutenções e Peças:**: O registro detalhado de manutenções e peças aumenta a confiabilidade das garantias e a qualidade do serviço. 

1. **Eficiência Operacional e Experiência do Cliente:**: A centralização das informações e a automação de processos rotineiros permite ao cliente focar em atividades estratégicas e maior atenção em atendimento aos seus clientes, garantindo uma experiência mais satisfatória, rápida e confiável. 

1. **Competitividade e Crescimento Sustentável:**: A integração das operações melhora a eficiência, fideliza clientes e fortalece a posição frente à concorrência. 

1. **Conformidade e Segurança de Dados:**: A solução protege informações de clientes e produtos, garantindo confiança e conformidade com regulamentos. 
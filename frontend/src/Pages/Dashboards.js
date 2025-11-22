import React from 'react';
import { Link } from 'react-router-dom'; 
import { Package, Users, Wrench, TrendingUp, Settings, AlertCircle, ShieldCheck } from 'lucide-react';
import '../styles/Dashboards.css';
import { dadosDoSistema } from './dados';


const Dashboard = () => {
  
  // Função auxiliar para renderizar ícones dinamicamente
  const renderIcone = (nome) => {
    switch(nome) {
      case 'package': return <Package size={24} color="white" />;
      case 'users': return <Users size={24} color="white" />;
      case 'wrench': return <Wrench size={24} color="white" />;
      case 'trending-up': return <TrendingUp size={24} color="white" />;
      default: return <Package size={24} color="white" />;
    }
  };

  return (
    <div className='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
        </div>

        <div className='BotoesNavegacao Ativo'>Dashboard</div>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Produtos</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Manutenção</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
      </div>
      <div className='ConteudoDashboard'>
        <div className='GradeMetricas'>
          {dadosDoSistema.metricas.map((metrica) => (
            <div key={metrica.id} className='CartaoMetrica'>
              <div className='CabecalhoCartao'>
                <span>{metrica.titulo}</span>
                <div className='IconeFundoRoxo'>{renderIcone(metrica.icone)}</div>
              </div>
              <div className='ValorGrande'>{metrica.valor}</div>
              <div className={`TextoCrescimento ${metrica.status}`}>
                {metrica.crescimeto} <span className='TextoCinza'>em relação ao mês anterior</span>
              </div>
            </div>
          ))}
        </div>
        <div className='GradeListas'>          
          <div className='CartaoLista'>
            <div className='TituloSecao'>
              <div className='IconeQuadradoPequeno'>R$</div>
              <div>
                <h3>Vendas Recentes</h3>
                <p>Últimas transações registradas</p>
              </div>
            </div>
            <div className='ListaConteudo'>
              {dadosDoSistema.vendasRecentes.map((venda) => (
                <div key={venda.id} className='ItemLista'>
                  <div>
                    <strong>{venda.cliente}</strong>
                    <p>{venda.produto}</p>
                  </div>
                  <div className='LadoDireitoItem'>
                    <strong>{venda.valor}</strong>
                    <span className={`BadgeStatus ${venda.status === 'Concluído' ? 'Verde' : 'Roxo'}`}>{venda.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='CartaoLista'>
            <div className='TituloSecao'>
              <div className='IconeQuadradoPequeno'><Wrench size={20} /></div>
              <div>
                <h3>Fila de Manutenção</h3>
                <p>Serviços em andamento</p>
              </div>
            </div>
            <div className='ListaConteudo'>
              {dadosDoSistema.filaManutencao.map((manut) => (
                <div key={manut.id} className='ItemLista'>
                  <div>
                    <div className='LinhaTitulo'>
                      <strong>{manut.modelo}</strong>
                      <span className='BadgePequeno'>{manut.servico}</span>
                      <span className={`BadgePequeno ${manut.status === 'Concluído' ? 'Verde' : 'Roxo'}`}>{manut.status}</span>
                    </div>
                    <p>{manut.cliente}</p>
                  </div>
                  <div className='PrecoManutencao'>{manut.valor}</div>
                </div>
              ))}
            </div>
          </div>

          <div className='CartaoLista'>
            <div className='TituloSecao'>
              <div className='IconeQuadradoPequeno'><Settings size={20} /></div>
              <div>
                <h3>Ordens de Serviço Recentes</h3>
                <p>xxxxxxx</p>
              </div>
            </div>
            <div className='ListaConteudo'>
              {dadosDoSistema.ordensServico.map((os) => (
                <div key={os.id} className='ItemLista'>
                  <div>
                    <strong>{os.id}</strong>
                    <p>{os.cliente}</p>
                    <p className='TextoCinzaPequeno'>{os.aparelho}</p>
                  </div>
                  <span className={`BadgeStatus ${os.status === 'Concluído' ? 'Verde' : 'Roxo'}`}>{os.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='GradeAlertas'>
          <div className='CartaoAlerta'>
            <div className='TituloSecao'>
              <AlertCircle className='TextoVermelho' />
              <h3>Alerta de Estoque</h3>
            </div>
            <p className='SubtituloAlerta'>Itens com quantidade baixa</p>
            
            <div className='ListaBarras'>
              {dadosDoSistema.estoqueBaixo.map((item, index) => (
                <div key={index} className='ItemBarraWrapper'>
                   <div className='BarraInfo'>
                      <strong>{item.item}</strong>
                      <span>{item.atual} / {item.total} unidades</span>
                   </div>
                   <div className='BarraFundo'>
                      <div className='BarraProgresso Roxo' style={{width: `${item.porcentagem}%`}}></div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className='CartaoAlerta'>
             <div className='TituloSecao'>
              <ShieldCheck className='TextoRoxo' />
              <h3>Alertas de Garantia</h3>
            </div>
            <p className='SubtituloAlerta'>Produtos próximos do vencimento</p>
            
            <div className='ItemAlertaGarantia'>
                <div className='InfoGarantia'>
                  <strong>iPhone 13 - IMEI 123456789</strong>
                  <span className='BadgeUrgente'>Urgente</span>
                </div>
                <div className='TextoDireitaPequeno'>Vence em 1 dias</div>
                <div className='BarraFundo'>
                   <div className='BarraProgresso Vermelho' style={{width: '90%'}}></div>
                </div>
            </div>

             <div className='ItemAlertaGarantia'>
                <div className='InfoGarantia'>
                  <strong>iPhone 13 - IMEI 123456789</strong>
                  <span className='BadgeAtiva'>Ativa</span>
                </div>
                <div className='TextoDireitaPequeno'>Vence em 30 dias</div>
                <div className='BarraFundo'>
                   <div className='BarraProgresso Roxo' style={{width: '40%'}}></div>
                </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
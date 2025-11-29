import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Package, Users, Wrench, TrendingUp, Settings, AlertCircle, ShieldCheck } from 'lucide-react';
import '../styles/Dashboards.css';
import { dashboardsApi } from '../services/api';
import LogoutButton from '../components/LogoutButton';


const Dashboard = () => {
  const [dados, setDados] = useState({
    metricas: [],
    vendasRecentes: [],
    filaManutencao: [],
    ordensServico: [],
    estoqueBaixo: [],
    alertasGarantia: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    dashboardsApi
      .getResumo()
      .then((payload) => {
        if (!active) return;
        setDados({
          metricas: payload?.metricas || [],
          vendasRecentes: payload?.vendasRecentes || [],
          filaManutencao: payload?.filaManutencao || [],
          ordensServico: payload?.ordensServico || [],
          estoqueBaixo: payload?.estoqueBaixo || [],
          alertasGarantia: payload?.alertasGarantia || [],
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Não foi possível carregar os dados do dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);
  
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

  const formatDiasRestantes = (dias) => {
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence em 1 dia';
    if (dias > 1) return `Vence em ${dias} dias`;
    return 'Prazo não informado';
  };

  const classBadgeGarantia = (status) => (status === 'Urgente' ? 'BadgeUrgente' : 'BadgeAtiva');

  const widthGarantia = (percent) => {
    const safePercent = Math.min(100, Math.max(0, percent || 0));
    return `${safePercent}%`;
  };

  const formatDescricaoGarantia = (alerta) => {
    if (alerta?.imei) {
      return `${alerta.produto} - IMEI ${alerta.imei}`;
    }
    return alerta?.produto || 'Produto não informado';
  };

  return (
    <div className='Container'>
      <div className='BarraSuperior'>
        <div className='LogoCellVex'>
          CellVex 
          <p className='SistemaDeGestao'>Sistema De Gestão</p>
         </div>
        <Link to="/vendas" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Vendas</Link>
        <Link to="/ordemdeservico" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Serviços</Link>
        <Link to="/Dashboards" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Dashboard</Link>
        <Link to="/celulares" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Celulares</Link>
        <Link to="/" style={{ textDecoration: 'none' }} className='BotoesNavegacao'>Clientes</Link>
        <div className='BotoesNavegacao'>Fornecedores</div>
        <Link to="/pecas" style={{ textDecoration: 'none' }}className='BotoesNavegacao'>Peças</Link>
        <div className='BotoesNavegacao'>Relatórios</div>
        <LogoutButton className='BotaoLogout' />
        </div>
        
      <div className='ConteudoDashboard'>
        {error && <div className='AlertaErro'>{error}</div>}
        {!error && loading && <div className='AlertaInfo'>Carregando indicadores...</div>}
        <div className='GradeMetricas'>
          {dados.metricas.map((metrica) => (
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
          {!loading && !dados.metricas.length && !error && (
            <div className='CartaoMetrica'>Nenhum indicador disponível.</div>
          )}
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
              {dados.vendasRecentes.map((venda) => (
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
              {!loading && !dados.vendasRecentes.length && !error && (
                <p className='TextoCinzaPequeno'>Nenhuma venda registrada.</p>
              )}
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
              {dados.filaManutencao.map((manut) => (
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
              {!loading && !dados.filaManutencao.length && !error && (
                <p className='TextoCinzaPequeno'>Nenhum serviço em andamento.</p>
              )}
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
              {dados.ordensServico.map((os) => (
                <div key={os.id} className='ItemLista'>
                  <div>
                    <strong>{os.id}</strong>
                    <p>{os.cliente}</p>
                    <p className='TextoCinzaPequeno'>{os.aparelho}</p>
                  </div>
                  <span className={`BadgeStatus ${os.status === 'Concluído' ? 'Verde' : 'Roxo'}`}>{os.status}</span>
                </div>
              ))}
              {!loading && !dados.ordensServico.length && !error && (
                <p className='TextoCinzaPequeno'>Nenhuma ordem recente encontrada.</p>
              )}
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
              {dados.estoqueBaixo.map((item, index) => (
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
              {!loading && !dados.estoqueBaixo.length && !error && (
                <p className='TextoCinzaPequeno'>Estoque saudável no momento.</p>
              )}
            </div>
          </div>

          <div className='CartaoAlerta'>
             <div className='TituloSecao'>
              <ShieldCheck className='TextoRoxo' />
              <h3>Alertas de Garantia</h3>
            </div>
            <p className='SubtituloAlerta'>Produtos próximos do vencimento</p>
            {dados.alertasGarantia.map((alerta) => (
              <div key={alerta.id} className='ItemAlertaGarantia'>
                <div className='InfoGarantia'>
                  <strong>{formatDescricaoGarantia(alerta)}</strong>
                  <span className={classBadgeGarantia(alerta.status)}>{alerta.status}</span>
                </div>
                <div className='TextoDireitaPequeno'>
                  {alerta.cliente} • {formatDiasRestantes(alerta.diasRestantes)}
                </div>
                <div className='BarraFundo'>
                  <div
                    className={`BarraProgresso ${alerta.status === 'Urgente' ? 'Vermelho' : 'Roxo'}`}
                    style={{ width: widthGarantia(alerta.progresso) }}
                  ></div>
                </div>
              </div>
            ))}
            {!loading && !dados.alertasGarantia.length && !error && (
              <p className='TextoCinzaPequeno'>Nenhum alerta de garantia no momento.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
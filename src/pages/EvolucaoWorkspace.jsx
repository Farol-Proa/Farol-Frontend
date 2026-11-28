import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Icon from '../components/Icon.jsx';
import {
  obterDataHojeCivil,
  navegarPeriodoEvolucao,
  calcularMetricasEvolucao,
} from '../services/evolucaoService.js';
import {
  obterVinculoAtivoMentorado,
  listarReunioesMentoria,
  listarOrientacoesMentoria,
} from '../services/mentoriaApi.js';
import './EvolucaoWorkspace.css';

export default function EvolucaoWorkspace({
  onNavegar = () => {},
  onLogout = () => {},
  objetivos = [],
  tarefas = [],
}) {
  const [tipoPeriodo, setTipoPeriodo] = useState('semana'); // 'semana' | 'mes' | 'ano'
  const [dataReferenciaCivil, setDataReferenciaCivil] = useState(() => obterDataHojeCivil());

  // Dados de Mentoria
  const [reunioes, setReunioes] = useState([]);
  const [orientacoes, setOrientacoes] = useState([]);

  // Carrega dados de mentoria de forma segura e não bloqueante
  useEffect(() => {
    let cancelado = false;

    async function carregarDadosMentoria() {
      try {
        const vinculo = await obterVinculoAtivoMentorado();
        if (vinculo?.id && !cancelado) {
          const [listaReunioes, listaOrientacoes] = await Promise.all([
            listarReunioesMentoria(vinculo.id).catch(() => []),
            listarOrientacoesMentoria(vinculo.id).catch(() => []),
          ]);
          if (!cancelado) {
            setReunioes(listaReunioes || []);
            setOrientacoes(listaOrientacoes || []);
          }
        }
      } catch {
        // Se o usuário não possui vínculo ou a rota retornar 404, listas permanecem vazias
      }
    }

    carregarDadosMentoria();
    return () => {
      cancelado = true;
    };
  }, []);

  // Consolidação das métricas com base no período e dados reais
  const metricas = useMemo(() => {
    return calcularMetricasEvolucao({
      objetivos,
      tarefas,
      reunioes,
      orientacoes,
      tipoPeriodo,
      dataCivil: dataReferenciaCivil,
    });
  }, [objetivos, tarefas, reunioes, orientacoes, tipoPeriodo, dataReferenciaCivil]);

  // Controles de navegação de período
  const handleRetroceder = useCallback(() => {
    setDataReferenciaCivil((anterior) => navegarPeriodoEvolucao(tipoPeriodo, anterior, -1));
  }, [tipoPeriodo]);

  const handleAvancar = useCallback(() => {
    setDataReferenciaCivil((anterior) => navegarPeriodoEvolucao(tipoPeriodo, anterior, 1));
  }, [tipoPeriodo]);

  const handleIrParaHoje = useCallback(() => {
    setDataReferenciaCivil(obterDataHojeCivil());
  }, []);

  // Altura máxima para normalização das barras do gráfico
  const maxTarefasColuna = useMemo(() => {
    const max = Math.max(...metricas.dadosGrafico.map((d) => d.total), 1);
    return max;
  }, [metricas.dadosGrafico]);

  return (
    <div className="farol-evolucao-screen">
      <Sidebar activeItem="Objetivos" onNavegar={onNavegar} onLogout={onLogout} />

      <main className="farol-evolucao-main" tabIndex={0}>
        {/* HEADER DA WORKSPACE */}
        <header className="farol-evolucao-header">
          <div className="farol-evolucao-heading">
            <p className="farol-evolucao-eyebrow">
              <span aria-hidden="true" /> Farol • Evolução e Conquistas
            </p>
            <h1>Minha Evolução</h1>
            <p className="farol-evolucao-subtitle">
              Acompanhe suas conquistas, seu progresso e sua jornada ao longo do tempo.
            </p>
          </div>

          <div className="farol-evolucao-actions">
            <button
              type="button"
              className="farol-evolucao-btn-voltar"
              onClick={() => onNavegar('Início')}
            >
              <Icon name="arrowLeft" size={16} />
              <span>Voltar ao Início</span>
            </button>
          </div>
        </header>

        {/* BARRA DE CONTROLE DE PERÍODO */}
        <section className="farol-evolucao-periodo-bar" aria-label="Seletor de período">
          <div className="farol-evolucao-periodo-tabs" role="tablist" aria-label="Granularidade do período">
            <button
              type="button"
              role="tab"
              aria-selected={tipoPeriodo === 'semana'}
              className={`farol-evolucao-periodo-tab ${tipoPeriodo === 'semana' ? 'is-active' : ''}`}
              onClick={() => setTipoPeriodo('semana')}
            >
              Semana
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tipoPeriodo === 'mes'}
              className={`farol-evolucao-periodo-tab ${tipoPeriodo === 'mes' ? 'is-active' : ''}`}
              onClick={() => setTipoPeriodo('mes')}
            >
              Mês
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tipoPeriodo === 'ano'}
              className={`farol-evolucao-periodo-tab ${tipoPeriodo === 'ano' ? 'is-active' : ''}`}
              onClick={() => setTipoPeriodo('ano')}
            >
              Ano
            </button>
          </div>

          <div className="farol-evolucao-periodo-nav">
            <button
              type="button"
              className="farol-evolucao-nav-btn"
              onClick={handleRetroceder}
              aria-label="Período anterior"
              title="Período anterior"
            >
              <Icon name="arrowLeft" size={14} />
            </button>

            <div className="farol-evolucao-periodo-titulo">
              <Icon name="calendar" size={15} />
              <span>{metricas.periodoAtual.textoPeriodo}</span>
            </div>

            <button
              type="button"
              className="farol-evolucao-nav-btn"
              onClick={handleAvancar}
              disabled={!metricas.periodoAtual.podeAvancar}
              aria-label="Próximo período"
              title={
                metricas.periodoAtual.podeAvancar
                  ? 'Próximo período'
                  : 'Você já está no período mais recente'
              }
            >
              <Icon name="arrowRight" size={14} />
            </button>

            <button
              type="button"
              className="farol-evolucao-periodo-hoje-btn"
              onClick={handleIrParaHoje}
            >
              Hoje
            </button>
          </div>
        </section>

        {/* RESUMO GERAL EM CARDS DE DESTAQUE */}
        <section className="farol-evolucao-cards-grid" aria-label="Indicadores gerais de evolução">
          {/* Card 1: Taxa Geral de Conclusão */}
          <div className="farol-evolucao-card">
            <div className="farol-evolucao-card-top">
              <span className="farol-evolucao-card-badge gold">
                <Icon name="sparkles" size={20} />
              </span>
              <span className="farol-evolucao-card-tag positive">
                {metricas.resumoGeral.taxaEvolucaoGeral}% Concluído
              </span>
            </div>
            <p className="farol-evolucao-card-label">Taxa Geral de Evolução</p>
            <h3 className="farol-evolucao-card-valor">{metricas.resumoGeral.taxaEvolucaoGeral}%</h3>
            <p className="farol-evolucao-card-desc">{metricas.resumoGeral.explicacaoFormula}</p>
          </div>

          {/* Card 2: Tarefas Concluídas */}
          <div className="farol-evolucao-card">
            <div className="farol-evolucao-card-top">
              <span className="farol-evolucao-card-badge blue">
                <Icon name="check" size={20} />
              </span>
              {metricas.tarefas.temComparativoAnterior ? (
                <span
                  className={`farol-evolucao-card-tag ${
                    metricas.tarefas.diferencaTarefas >= 0 ? 'positive' : 'neutral'
                  }`}
                >
                  {metricas.tarefas.diferencaTarefas >= 0 ? '+' : ''}
                  {metricas.tarefas.diferencaTarefas} vs anterior
                </span>
              ) : (
                <span className="farol-evolucao-card-tag neutral">Início</span>
              )}
            </div>
            <p className="farol-evolucao-card-label">Tarefas do Período</p>
            <h3 className="farol-evolucao-card-valor">
              {metricas.tarefas.concluidasNoPeriodo}{' '}
              <span style={{ fontSize: '15px', color: '#64748b' }}>
                / {metricas.tarefas.totalNoPeriodo}
              </span>
            </h3>
            <p className="farol-evolucao-card-desc">
              {metricas.tarefas.pendentesNoPeriodo} pendente(s) •{' '}
              {metricas.tarefas.taxaConclusao}% de conclusão
            </p>
          </div>

          {/* Card 3: Mapas e Objetivos */}
          <div className="farol-evolucao-card">
            <div className="farol-evolucao-card-top">
              <span className="farol-evolucao-card-badge teal">
                <Icon name="target" size={20} />
              </span>
              <span className="farol-evolucao-card-tag neutral">
                {metricas.objetivos.total} cadastrado(s)
              </span>
            </div>
            <p className="farol-evolucao-card-label">Mapas de Aprendizado</p>
            <h3 className="farol-evolucao-card-valor">
              {metricas.objetivos.concluidosGeral}{' '}
              <span style={{ fontSize: '15px', color: '#64748b' }}>
                finalizado(s)
              </span>
            </h3>
            <p className="farol-evolucao-card-desc">
              {metricas.objetivos.emAndamento} rota(s) em andamento • {metricas.objetivos.progressoMedio}% médio
            </p>
          </div>

          {/* Card 4: Mentoria e Encontros */}
          <div className="farol-evolucao-card">
            <div className="farol-evolucao-card-top">
              <span className="farol-evolucao-card-badge purple">
                <Icon name="users" size={20} />
              </span>
              <span className="farol-evolucao-card-tag neutral">
                {metricas.mentoria.reunioesRealizadas} realizada(s)
              </span>
            </div>
            <p className="farol-evolucao-card-label">Sessões de Mentoria</p>
            <h3 className="farol-evolucao-card-valor">
              {metricas.mentoria.reunioesRealizadas}{' '}
              <span style={{ fontSize: '15px', color: '#64748b' }}>encontros</span>
            </h3>
            <p className="farol-evolucao-card-desc">
              {metricas.mentoria.orientacoesConcluidas} orientação(ões) concluída(s)
            </p>
          </div>
        </section>

        {/* SEÇÃO 1: PRODUTIVIDADE E GRÁFICO DE TAREFAS */}
        <section className="farol-evolucao-secao" aria-label="Produtividade de tarefas">
          <div className="farol-evolucao-secao-header">
            <div className="farol-evolucao-secao-title">
              <span style={{ color: '#60a5fa' }}>
                <Icon name="check" size={22} />
              </span>
              <div>
                <h2>Produtividade de Tarefas</h2>
                <p className="farol-evolucao-secao-desc">
                  Volume de tarefas executadas e planejadas para este período.
                </p>
              </div>
            </div>

            <div className="farol-evolucao-pills-list">
              <span className="farol-evolucao-pill">
                Planejadas: <strong>{metricas.tarefas.totalNoPeriodo}</strong>
              </span>
              <span className="farol-evolucao-pill success">
                Concluídas: <strong>{metricas.tarefas.concluidasNoPeriodo}</strong>
              </span>
              <span className="farol-evolucao-pill">
                Pendentes: <strong>{metricas.tarefas.pendentesNoPeriodo}</strong>
              </span>
              <span className="farol-evolucao-pill success">
                Taxa de Conclusão: <strong>{metricas.tarefas.taxaConclusao}%</strong>
              </span>
            </div>
          </div>

          {metricas.tarefas.totalNoPeriodo === 0 ? (
            <div className="farol-evolucao-vazio">
              <span className="farol-evolucao-vazio-icone">
                <Icon name="calendar" size={24} />
              </span>
              <h3>Nenhuma tarefa com prazo neste período</h3>
              <p>
                Você não possui tarefas planejadas para este intervalo de datas. Que tal
                adicionar prazos nas etapas dos seus objetivos para acompanhar sua produtividade?
              </p>
            </div>
          ) : (
            <div className="farol-grafico-container">
              <div className="farol-grafico-barras">
                {metricas.dadosGrafico.map((col) => {
                  const percentualAltura = maxTarefasColuna > 0
                    ? Math.max(Math.round((col.total / maxTarefasColuna) * 100), 8)
                    : 0;

                  const percentualConclusao = col.total > 0
                    ? Math.round((col.concluidas / col.total) * 100)
                    : 0;

                  return (
                    <div key={col.chave} className="farol-grafico-coluna">
                      <div
                        className="farol-grafico-trilha"
                        style={{ height: `${percentualAltura}%` }}
                        title={`${col.nomeCompleto}: ${col.concluidas} de ${col.total} concluídas (${percentualConclusao}%)`}
                        tabIndex={0}
                        role="img"
                        aria-label={`${col.nomeCompleto}: ${col.concluidas} de ${col.total} tarefas concluídas`}
                      >
                        <div
                          className={`farol-grafico-preenchimento ${percentualConclusao === 100 ? 'completo' : ''}`}
                          style={{ height: `${percentualConclusao}%` }}
                        />
                      </div>
                      <span className="farol-grafico-label-coluna">{col.label}</span>
                      <span className="farol-grafico-sublabel-coluna">{col.sublabel}</span>
                    </div>
                  );
                })}
              </div>

              <div className="farol-grafico-legenda">
                <span className="farol-grafico-legenda-item">
                  <span className="farol-grafico-dot blue" /> Concluídas
                </span>
                <span className="farol-grafico-legenda-item">
                  <span className="farol-grafico-dot gold" /> 100% Finalizado
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Fórmula: Tarefas concluídas ÷ Total do período × 100
                </span>
              </div>
            </div>
          )}
        </section>

        {/* SEÇÃO 2: EVOLUÇÃO DOS MAPAS E ILHAS */}
        <section className="farol-evolucao-secao" aria-label="Evolução dos mapas e ilhas">
          <div className="farol-evolucao-secao-header">
            <div className="farol-evolucao-secao-title">
              <span style={{ color: '#2dd4bf' }}>
                <Icon name="map" size={22} />
              </span>
              <div>
                <h2>Evolução dos Mapas e Ilhas</h2>
                <p className="farol-evolucao-secao-desc">
                  Progresso individual das suas rotas de aprendizado e conquista de novas etapas.
                </p>
              </div>
            </div>

            <div className="farol-evolucao-pills-list">
              <span className="farol-evolucao-pill">
                Mapas Ativos: <strong>{metricas.objetivos.emAndamento}</strong>
              </span>
              <span className="farol-evolucao-pill success">
                Ilhas Conquistadas: <strong>{metricas.etapas.concluidasGeral} / {metricas.etapas.totalGeral}</strong>
              </span>
            </div>
          </div>

          {metricas.objetivos.lista.length === 0 ? (
            <div className="farol-evolucao-vazio">
              <span className="farol-evolucao-vazio-icone">
                <Icon name="map" size={24} />
              </span>
              <h3>Sua jornada está começando!</h3>
              <p>
                Você ainda não possui nenhum objetivo ou mapa criado. Crie seu primeiro mapa
                para traçar suas ilhas de aprendizado e acompanhar seu avanço.
              </p>
              <button
                type="button"
                className="farol-evolucao-btn-voltar"
                onClick={() => onNavegar('Ilhas')}
                style={{ marginTop: '6px' }}
              >
                + Criar Primeiro Objetivo
              </button>
            </div>
          ) : (
            <div className="farol-evolucao-mapas-grid">
              {metricas.objetivos.lista.map((obj) => (
                <div key={obj.id} className="farol-evolucao-mapa-card">
                  <div className="farol-evolucao-mapa-topo">
                    <div>
                      <h4 className="farol-evolucao-mapa-nome">{obj.nome}</h4>
                      {obj.descricao && (
                        <p className="farol-evolucao-mapa-desc">{obj.descricao}</p>
                      )}
                    </div>
                    <span
                      className={`farol-evolucao-card-tag ${obj.concluido ? 'positive' : 'neutral'}`}
                    >
                      {obj.concluido ? 'Porto Conquistado' : 'Em Navegação'}
                    </span>
                  </div>

                  <div className="farol-evolucao-barra-trilha">
                    <div
                      className={`farol-evolucao-barra-fill ${obj.concluido ? 'concluido' : ''}`}
                      style={{ width: `${obj.percentual}%` }}
                    />
                  </div>

                  <div className="farol-evolucao-mapa-rodape">
                    <span>
                      {obj.etapasConcluidas} de {obj.totalEtapas} ilhas concluídas
                    </span>
                    <strong>{obj.percentual}%</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selos Náuticos Farol */}
          <div className="farol-selos-grid">
            <div className="farol-selo-item">
              <span className="farol-selo-icone">
                <Icon name="sailboat" size={18} />
              </span>
              <div className="farol-selo-info">
                <strong>Rumo Traçado</strong>
                <span>{metricas.objetivos.total} mapa(s) em desenvolvimento</span>
              </div>
            </div>

            <div className="farol-selo-item">
              <span className="farol-selo-icone">
                <Icon name="sparkles" size={18} />
              </span>
              <div className="farol-selo-info">
                <strong>Farol Ativo</strong>
                <span>{metricas.etapas.concluidasGeral} ilhas conquistadas na jornada</span>
              </div>
            </div>

            <div className="farol-selo-item">
              <span className="farol-selo-icone">
                <Icon name="target" size={18} />
              </span>
              <div className="farol-selo-info">
                <strong>Navegador Constante</strong>
                <span>{metricas.tarefas.concluidasNoPeriodo} tarefas finalizadas no período</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: MENTORIA E ACOMPANHAMENTO */}
        <section className="farol-evolucao-secao" aria-label="Acompanhamento da mentoria">
          <div className="farol-evolucao-secao-header">
            <div className="farol-evolucao-secao-title">
              <span style={{ color: '#c084fc' }}>
                <Icon name="users" size={22} />
              </span>
              <div>
                <h2>Mentoria e Orientação</h2>
                <p className="farol-evolucao-secao-desc">
                  Reuniões individuais, direcionamentos práticos e planos de ação com mentores.
                </p>
              </div>
            </div>

            <div className="farol-evolucao-pills-list">
              <span className="farol-evolucao-pill success">
                Realizadas: <strong>{metricas.mentoria.reunioesRealizadas}</strong>
              </span>
              <span className="farol-evolucao-pill">
                Agendadas: <strong>{metricas.mentoria.reunioesAgendadas}</strong>
              </span>
              <span className="farol-evolucao-pill success">
                Orientações Concluídas: <strong>{metricas.mentoria.orientacoesConcluidas}</strong>
              </span>
            </div>
          </div>

          {metricas.mentoria.totalReunioesNoPeriodo === 0 &&
          metricas.mentoria.totalOrientacoesNoPeriodo === 0 &&
          !metricas.mentoria.proximaReuniao ? (
            <div className="farol-evolucao-vazio">
              <span className="farol-evolucao-vazio-icone">
                <Icon name="users" size={24} />
              </span>
              <h3>Nenhum encontro de mentoria neste período</h3>
              <p>
                Não há reuniões ou orientações registradas para este intervalo. Acesse o
                módulo de Mentoria para conversar com seu mentor ou agendar sua próxima sessão.
              </p>
              <button
                type="button"
                className="farol-evolucao-btn-voltar"
                onClick={() => onNavegar('Mentoria')}
                style={{ marginTop: '6px' }}
              >
                Abrir Mentoria
              </button>
            </div>
          ) : (
            <div className="farol-evolucao-cards-grid">
              <div className="farol-evolucao-card">
                <p className="farol-evolucao-card-label">Sessões Realizadas</p>
                <h3 className="farol-evolucao-card-valor">{metricas.mentoria.reunioesRealizadas}</h3>
                <p className="farol-evolucao-card-desc">
                  Encontros concluídos com sucesso neste período
                </p>
              </div>

              <div className="farol-evolucao-card">
                <p className="farol-evolucao-card-label">Orientações Concluídas</p>
                <h3 className="farol-evolucao-card-valor">
                  {metricas.mentoria.orientacoesConcluidas}
                </h3>
                <p className="farol-evolucao-card-desc">
                  Planos de ação colocados em prática
                </p>
              </div>

              {metricas.mentoria.proximaReuniao && (
                <div className="farol-evolucao-card" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                  <div className="farol-evolucao-card-top">
                    <span className="farol-evolucao-card-label">Próximo Encontro</span>
                    <span className="farol-evolucao-card-tag positive">Confirmado</span>
                  </div>
                  <h4 style={{ color: '#ffffff', fontSize: '16px', margin: '0 0 4px' }}>
                    {metricas.mentoria.proximaReuniao.titulo || 'Sessão de Alinhamento'}
                  </h4>
                  <p className="farol-evolucao-card-desc">
                    {metricas.mentoria.proximaReuniao.dataHora?.slice(0, 16).replace('T', ' às ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SEÇÃO 4: HISTÓRICO DE CONQUISTAS DO PERÍODO */}
        <section className="farol-evolucao-secao" aria-label="Histórico de conquistas">
          <div className="farol-evolucao-secao-header">
            <div className="farol-evolucao-secao-title">
              <span style={{ color: '#f5d547' }}>
                <Icon name="flame" size={22} />
              </span>
              <div>
                <h2>Histórico de Conquistas do Período</h2>
                <p className="farol-evolucao-secao-desc">
                  Linha do tempo cronológica com marcos atingidos e atividades concluídas.
                </p>
              </div>
            </div>

            <span className="farol-evolucao-card-tag positive">
              {metricas.conquistas.length} conquista(s)
            </span>
          </div>

          {metricas.conquistas.length === 0 ? (
            <div className="farol-evolucao-vazio">
              <span className="farol-evolucao-vazio-icone">
                <Icon name="sparkles" size={24} />
              </span>
              <h3>Nenhuma conquista registrada ainda neste período</h3>
              <p>
                Conclua tarefas, avance pelas ilhas ou realize reuniões com seu mentor
                para registrar seus marcos de vitória aqui.
              </p>
            </div>
          ) : (
            <div className="farol-timeline-container">
              {metricas.conquistas.map((item) => (
                <div key={item.id} className="farol-timeline-item">
                  <div className={`farol-timeline-dot ${item.badgeCor === 'amber' ? 'gold' : item.badgeCor === 'green' ? 'green' : ''}`} />
                  <div className="farol-timeline-card">
                    <div className="farol-timeline-card-main">
                      <span className="farol-timeline-icon">
                        <Icon name={item.icone} size={16} />
                      </span>
                      <div>
                        <h4 className="farol-timeline-titulo">{item.titulo}</h4>
                        <p className="farol-timeline-subtitulo">{item.subtitulo}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="farol-evolucao-card-tag positive">{item.tag}</span>
                      <span className="farol-timeline-data">{item.dataCivil}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

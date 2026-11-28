import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';
import {
  extrairDataCivil,
  formatarHorarioPrazo,
  formatarPrazo,
} from '../dashboard/taskDates.js';
import {
  obterDataHojeCivil,
  formatarDataCivil,
  decomporDataCivil,
  obterDiasDoMes,
  obterDiasDaSemana,
  obterMesesDoAno,
  obterTextoPeriodo,
  navegarPeriodo,
  agruparTarefasPorData,
  filtrarTarefasPorTermo,
  DIAS_DA_SEMANA_ABREV,
  NOMES_MESES,
} from './Calendario/calendarUtils.js';
import './CalendarioWorkspace.css';

function CalendarioWorkspace({
  tarefas = [],
  onNavegar = () => {},
  onLogout = () => {},
  onAlternarTarefa = () => {},
}) {
  const hojeCivil = useMemo(() => obterDataHojeCivil(), []);

  const [visualizacao, setVisualizacao] = useState('mes'); // 'mes' | 'semana' | 'dia' | 'ano'
  const [dataReferenciaCivil, setDataReferenciaCivil] = useState(hojeCivil);
  const [dataSelecionada, setDataSelecionada] = useState(hojeCivil);
  const [termoBusca, setTermoBusca] = useState('');
  const [modoVisualizacaoBusca, setModoVisualizacaoBusca] = useState('calendario'); // 'calendario' | 'lista'
  const [barraLateralAberta, setBarraLateralAberta] = useState(true);

  // Mês exibido no mini-calendário lateral (ano, mes)
  const [miniMesAno, setMiniMesAno] = useState(() => {
    const { ano, mes } = decomporDataCivil(hojeCivil);
    return { ano, mes };
  });

  const buscaAtiva = Boolean(termoBusca && termoBusca.trim());

  // Filtra as tarefas pelo termo de busca (insensível a maiúsculas e acentos)
  const tarefasFiltradas = useMemo(() => {
    return filtrarTarefasPorTermo(tarefas, termoBusca);
  }, [tarefas, termoBusca]);

  // Agrupa tarefas por data civil (YYYY-MM-DD)
  const tarefasPorData = useMemo(() => {
    return agruparTarefasPorData(tarefasFiltradas);
  }, [tarefasFiltradas]);

  // Contadores globais das tarefas filtradas
  const totalTarefas = tarefasFiltradas.length;
  const concluidasCount = tarefasFiltradas.filter((t) => t.concluida).length;
  const pendentesCount = totalTarefas - concluidasCount;

  // Navegação de período do topo
  function irParaHoje() {
    setDataReferenciaCivil(hojeCivil);
    setDataSelecionada(hojeCivil);
    const { ano, mes } = decomporDataCivil(hojeCivil);
    setMiniMesAno({ ano, mes });
  }

  function mudarPeriodo(direcao) {
    const proximaData = navegarPeriodo(visualizacao, dataReferenciaCivil, direcao);
    setDataReferenciaCivil(proximaData);

    // Se estiver navegando em mês, sincroniza o mini-calendário
    if (visualizacao === 'mes') {
      const { ano, mes } = decomporDataCivil(proximaData);
      setMiniMesAno({ ano, mes });
    }
  }

  // Mini-calendário navegação
  function mudarMiniMes(diferenca) {
    setMiniMesAno((anterior) => {
      const novaData = new Date(anterior.ano, anterior.mes + diferenca, 1);
      return { ano: novaData.getFullYear(), mes: novaData.getMonth() };
    });
  }

  // Ao clicar em uma data (mini-calendário ou grade)
  function selecionarData(dataFormatada) {
    setDataSelecionada(dataFormatada);
    setDataReferenciaCivil(dataFormatada);
    const { ano, mes } = decomporDataCivil(dataFormatada);
    setMiniMesAno({ ano, mes });
  }

  // Ir para data a partir de um resultado de busca
  function irParaDataDeBusca(dataCivil) {
    if (!dataCivil) return;
    selecionarData(dataCivil);
    setModoVisualizacaoBusca('calendario');
  }

  // Limpar busca
  function limparBusca() {
    setTermoBusca('');
    setModoVisualizacaoBusca('calendario');
  }

  // Tarefas da data selecionada para a barra lateral
  const tarefasDoDiaSelecionado = useMemo(() => {
    return tarefasPorData.get(dataSelecionada) || [];
  }, [tarefasPorData, dataSelecionada]);

  return (
    <div className="cal-screen">
      <Sidebar activeItem="Calendário" onNavegar={onNavegar} onLogout={onLogout} />

      <div className="cal-main-layout">
        {/* Barra superior de navegação */}
        <header className="cal-topbar">
          <div className="cal-topbar-info">
            <span className="cal-eyebrow">
              <Icon name="calendar" size={13} />
              Agenda & Prazos • Calendário do Farol
            </span>
            <div className="cal-title-row">
              <h2 className="cal-periodo-titulo">
                {obterTextoPeriodo(visualizacao, dataReferenciaCivil)}
              </h2>

              <div className="cal-nav-buttons">
                <button
                  type="button"
                  className="cal-btn-hoje"
                  onClick={irParaHoje}
                  title="Voltar para a data de hoje"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  className="cal-btn-nav"
                  onClick={() => mudarPeriodo(-1)}
                  aria-label="Período anterior"
                  title="Período anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="cal-btn-nav"
                  onClick={() => mudarPeriodo(1)}
                  aria-label="Próximo período"
                  title="Próximo período"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div className="cal-topbar-actions">
            {/* Campo de busca de tarefas */}
            <div className="cal-search-box">
              <input
                type="text"
                className="cal-search-input"
                placeholder="Buscar tarefas por título..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') limparBusca();
                }}
                aria-label="Buscar tarefas por título ou ilha"
              />
              {termoBusca && (
                <button
                  type="button"
                  className="cal-search-clear"
                  onClick={limparBusca}
                  aria-label="Limpar busca"
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Alternância de visualização: Dia, Semana, Mês, Ano */}
            <nav className="cal-view-tabs" aria-label="Visualizações do calendário">
              <button
                type="button"
                className={`cal-view-tab ${visualizacao === 'dia' ? 'active' : ''}`}
                onClick={() => setVisualizacao('dia')}
              >
                Dia
              </button>
              <button
                type="button"
                className={`cal-view-tab ${visualizacao === 'semana' ? 'active' : ''}`}
                onClick={() => setVisualizacao('semana')}
              >
                Semana
              </button>
              <button
                type="button"
                className={`cal-view-tab ${visualizacao === 'mes' ? 'active' : ''}`}
                onClick={() => setVisualizacao('mes')}
              >
                Mês
              </button>
              <button
                type="button"
                className={`cal-view-tab ${visualizacao === 'ano' ? 'active' : ''}`}
                onClick={() => setVisualizacao('ano')}
              >
                Ano
              </button>
            </nav>

            {/* Alternar barra lateral interna */}
            <button
              type="button"
              className="cal-btn-toggle-aside"
              onClick={() => setBarraLateralAberta((prev) => !prev)}
              aria-label={barraLateralAberta ? 'Ocultar barra lateral interna' : 'Exibir barra lateral interna'}
              title={barraLateralAberta ? 'Ocultar barra lateral interna' : 'Exibir barra lateral interna'}
            >
              <Icon name="list" size={14} />
              <span>{barraLateralAberta ? 'Recolher lateral' : 'Expandir lateral'}</span>
            </button>
          </div>
        </header>

        {/* Área de conteúdo: Barra lateral interna + Área de trabalho */}
        <div className="cal-content">
          {/* Barra lateral interna com Mini Calendário e Tarefas do Dia Selecionado */}
          <aside className={`cal-aside ${barraLateralAberta ? '' : 'collapsed'}`}>
            <div className="cal-mini-box">
              <div className="cal-mini-header">
                <span className="cal-mini-title">
                  {NOMES_MESES[miniMesAno.mes]} {miniMesAno.ano}
                </span>
                <div className="cal-mini-nav">
                  <button
                    type="button"
                    className="cal-mini-btn-nav"
                    onClick={() => mudarMiniMes(-1)}
                    aria-label="Mês anterior no mini-calendário"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="cal-mini-btn-nav"
                    onClick={() => mudarMiniMes(1)}
                    aria-label="Próximo mês no mini-calendário"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="cal-mini-grid">
                {DIAS_DA_SEMANA_ABREV.map((dia) => (
                  <span key={dia} className="cal-mini-weekday">
                    {dia.charAt(0)}
                  </span>
                ))}

                {obterDiasDoMes(miniMesAno.ano, miniMesAno.mes).map((d) => {
                  const temTarefas = tarefasPorData.has(d.dataFormatada);
                  const isSelecionado = dataSelecionada === d.dataFormatada;
                  const isHoje = hojeCivil === d.dataFormatada;

                  return (
                    <button
                      type="button"
                      key={d.dataFormatada}
                      className={`cal-mini-day ${d.foraDoMes ? 'fora-mes' : ''} ${
                        isHoje ? 'hoje' : ''
                      } ${isSelecionado ? 'selecionado' : ''}`}
                      onClick={() => selecionarData(d.dataFormatada)}
                      aria-label={`${d.dia} de ${NOMES_MESES[miniMesAno.mes]}`}
                    >
                      <span>{d.dia}</span>
                      {temTarefas && <span className="cal-mini-dot" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seção de Tarefas na lateral: Resultados da Busca ou Tarefas do Dia */}
            <div className="cal-aside-tasks">
              <div className="cal-aside-tasks-header">
                <h4>
                  <Icon name="sparkles" size={14} />
                  {buscaAtiva ? 'Resultados da busca' : 'Tarefas do dia'}
                </h4>
                <span className="cal-aside-badge">
                  {buscaAtiva
                    ? `${tarefasFiltradas.length} encontrada${tarefasFiltradas.length === 1 ? '' : 's'}`
                    : formatarPrazo(dataSelecionada) || 'Sem data'}
                </span>
              </div>

              {buscaAtiva ? (
                tarefasFiltradas.length === 0 ? (
                  <div className="cal-empty-box mt-3">
                    <p>Nenhuma tarefa encontrada.</p>
                  </div>
                ) : (
                  <ul className="cal-aside-task-list mt-3">
                    {tarefasFiltradas.map((tarefa) => {
                      const horario = formatarHorarioPrazo(tarefa.prazo);
                      const dataFormatada = formatarPrazo(tarefa.prazo);

                      return (
                        <li
                          key={tarefa.id}
                          className={`cal-aside-task-item ${tarefa.concluida ? 'concluida' : ''}`}
                        >
                          <div className="cal-task-meta-row">
                            <span
                              className={`cal-badge-status ${
                                tarefa.concluida ? 'concluida' : 'pendente'
                              }`}
                            >
                              {tarefa.concluida ? 'Concluída' : 'Pendente'}
                            </span>
                            {dataFormatada && (
                              <span className="cal-badge-time">
                                {dataFormatada} {horario ? `• ${horario}` : ''}
                              </span>
                            )}
                          </div>

                          <div className="cal-task-title-row">
                            <input
                              type="checkbox"
                              checked={tarefa.concluida}
                              onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                              className="cal-task-checkbox"
                              aria-label={`Alternar tarefa ${tarefa.texto}`}
                            />
                            <p
                              className={`cal-task-text ${tarefa.concluida ? 'riscado' : ''}`}
                              title={tarefa.texto}
                            >
                              {tarefa.texto}
                            </p>
                          </div>

                          <span className="cal-task-context">
                            {tarefa.objetivoNome || 'Objetivo'} · {tarefa.etapaNome || 'Ilha'}
                          </span>

                          <button
                            type="button"
                            className="cal-btn-ilha"
                            onClick={() =>
                              onNavegar('Ilhas', {
                                objetivoId: tarefa.objetivoId,
                                etapaId: tarefa.etapaId,
                                tarefaId: tarefa.id,
                              })
                            }
                            title={`Ver tarefa “${tarefa.texto}” na Ilha`}
                          >
                            <span>Ver na Ilha</span>
                            <Icon name="arrowRight" size={11} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : tarefasDoDiaSelecionado.length === 0 ? (
                <div className="cal-empty-box mt-3">
                  <p>Nenhuma tarefa agendada para este dia.</p>
                </div>
              ) : (
                <ul className="cal-aside-task-list mt-3">
                  {tarefasDoDiaSelecionado.map((tarefa) => {
                    const horario = formatarHorarioPrazo(tarefa.prazo);

                    return (
                      <li
                        key={tarefa.id}
                        className={`cal-aside-task-item ${tarefa.concluida ? 'concluida' : ''}`}
                      >
                        <div className="cal-task-meta-row">
                          <span
                            className={`cal-badge-status ${
                              tarefa.concluida ? 'concluida' : 'pendente'
                            }`}
                          >
                            {tarefa.concluida ? 'Concluída' : 'Pendente'}
                          </span>
                          {horario && <span className="cal-badge-time">{horario}</span>}
                        </div>

                        <div className="cal-task-title-row">
                          <input
                            type="checkbox"
                            checked={tarefa.concluida}
                            onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                            className="cal-task-checkbox"
                            aria-label={`Marcar tarefa ${tarefa.texto} como ${
                              tarefa.concluida ? 'pendente' : 'concluída'
                            }`}
                          />
                          <p
                            className={`cal-task-text ${tarefa.concluida ? 'riscado' : ''}`}
                            title={tarefa.texto}
                          >
                            {tarefa.texto}
                          </p>
                        </div>

                        <span className="cal-task-context">
                          {tarefa.objetivoNome || 'Objetivo'} · {tarefa.etapaNome || 'Ilha'}
                        </span>

                        <button
                          type="button"
                          className="cal-btn-ilha"
                          onClick={() =>
                            onNavegar('Ilhas', {
                              objetivoId: tarefa.objetivoId,
                              etapaId: tarefa.etapaId,
                              tarefaId: tarefa.id,
                            })
                          }
                          title={`Ver tarefa “${tarefa.texto}” na Ilha`}
                        >
                          <span>Ver na Ilha</span>
                          <Icon name="arrowRight" size={11} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Área Principal de Visualização */}
          <main className="cal-viewport">
            {/* Banner superior de busca ativa */}
            {buscaAtiva && (
              <div className="cal-search-status-bar">
                <div className="cal-search-status-info">
                  <span className="cal-search-icon" aria-hidden="true">🔍</span>
                  <span>
                    {tarefasFiltradas.length === 0
                      ? `Nenhuma tarefa encontrada para “${termoBusca}”`
                      : `${tarefasFiltradas.length} tarefa${tarefasFiltradas.length === 1 ? '' : 's'} encontrada${tarefasFiltradas.length === 1 ? '' : 's'} para “${termoBusca}”`}
                  </span>
                </div>

                <div className="cal-search-status-actions">
                  {tarefasFiltradas.length > 0 && (
                    <div className="cal-search-mode-tabs" aria-label="Modo de exibição dos resultados da busca">
                      <button
                        type="button"
                        className={`cal-btn-mode ${modoVisualizacaoBusca === 'calendario' ? 'active' : ''}`}
                        onClick={() => setModoVisualizacaoBusca('calendario')}
                      >
                        Ver no Calendário
                      </button>
                      <button
                        type="button"
                        className={`cal-btn-mode ${modoVisualizacaoBusca === 'lista' ? 'active' : ''}`}
                        onClick={() => setModoVisualizacaoBusca('lista')}
                      >
                        Ver em Lista ({tarefasFiltradas.length})
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className="cal-btn-limpar-busca"
                    onClick={limparBusca}
                    title="Limpar pesquisa e restaurar calendário"
                  >
                    Limpar pesquisa ✕
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo: Se busca sem resultados, exibe estado vazio claro */}
            {buscaAtiva && tarefasFiltradas.length === 0 ? (
              <div className="cal-search-empty-state">
                <div className="cal-search-empty-icon">
                  <Icon name="target" size={32} />
                </div>
                <h3>Nenhum resultado encontrado</h3>
                <p>
                  Não encontramos nenhuma tarefa correspondente a “<strong>{termoBusca}</strong>”.
                </p>
                <p className="cal-search-empty-hint">
                  Verifique se o título foi digitado corretamente ou tente palavras-chave parciais.
                </p>
                <button
                  type="button"
                  className="cal-btn-limpar-grande"
                  onClick={limparBusca}
                >
                  Limpar pesquisa e voltar ao calendário
                </button>
              </div>
            ) : buscaAtiva && modoVisualizacaoBusca === 'lista' ? (
              /* Modo de exibição em lista detalhada dos resultados */
              <VisualizacaoResultadosBusca
                tarefas={tarefasFiltradas}
                onNavegar={onNavegar}
                onAlternarTarefa={onAlternarTarefa}
                onIrParaData={irParaDataDeBusca}
              />
            ) : (
              /* Visualizações normais do Calendário (Mês, Semana, Dia, Ano) */
              <>
                {visualizacao === 'mes' && (
                  <VisualizacaoMes
                    dataReferenciaCivil={dataReferenciaCivil}
                    dataSelecionada={dataSelecionada}
                    hojeCivil={hojeCivil}
                    tarefasPorData={tarefasPorData}
                    onSelecionarData={selecionarData}
                    onNavegar={onNavegar}
                    onAlternarTarefa={onAlternarTarefa}
                  />
                )}

                {visualizacao === 'semana' && (
                  <VisualizacaoSemana
                    dataReferenciaCivil={dataReferenciaCivil}
                    hojeCivil={hojeCivil}
                    tarefasPorData={tarefasPorData}
                    onSelecionarData={selecionarData}
                    onNavegar={onNavegar}
                    onAlternarTarefa={onAlternarTarefa}
                  />
                )}

                {visualizacao === 'dia' && (
                  <VisualizacaoDia
                    dataReferenciaCivil={dataReferenciaCivil}
                    tarefasPorData={tarefasPorData}
                    onNavegar={onNavegar}
                    onAlternarTarefa={onAlternarTarefa}
                  />
                )}

                {visualizacao === 'ano' && (
                  <VisualizacaoAno
                    dataReferenciaCivil={dataReferenciaCivil}
                    hojeCivil={hojeCivil}
                    tarefasPorData={tarefasPorData}
                    onMudarParaMes={(ano, mes) => {
                      setDataReferenciaCivil(formatarDataCivil(ano, mes + 1, 1));
                      setMiniMesAno({ ano, mes });
                      setVisualizacao('mes');
                    }}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Subcomponentes de Visualização
// ----------------------------------------------------

function VisualizacaoMes({
  dataReferenciaCivil,
  dataSelecionada,
  hojeCivil,
  tarefasPorData,
  onSelecionarData,
  onNavegar,
  onAlternarTarefa,
}) {
  const { ano, mes } = decomporDataCivil(dataReferenciaCivil);
  const diasDoMes = useMemo(() => obterDiasDoMes(ano, mes), [ano, mes]);
  const totalSemanas = Math.max(4, Math.ceil(diasDoMes.length / 7));

  return (
    <div
      className="cal-month-grid"
      style={{ '--num-semanas': totalSemanas }}
    >
      {DIAS_DA_SEMANA_ABREV.map((dia) => (
        <div key={dia} className="cal-month-weekday-header">
          {dia}
        </div>
      ))}

      {diasDoMes.map((d) => {
        const tarefasDoDia = tarefasPorData.get(d.dataFormatada) || [];
        const isHoje = d.dataFormatada === hojeCivil;
        const isSelecionado = d.dataFormatada === dataSelecionada;

        return (
          <div
            key={d.dataFormatada}
            className={`cal-month-cell ${d.foraDoMes ? 'fora-mes' : ''} ${
              isSelecionado ? 'selecionado' : ''
            }`}
            onClick={() => onSelecionarData(d.dataFormatada)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelecionarData(d.dataFormatada);
              }
            }}
          >
            <div className="cal-cell-header">
              <span className={`cal-cell-day-num ${isHoje ? 'hoje' : ''}`}>{d.dia}</span>
              {tarefasDoDia.length > 0 && (
                <span className="cal-cell-badge-count">
                  {tarefasDoDia.length} {tarefasDoDia.length === 1 ? 'tarefa' : 'tarefas'}
                </span>
              )}
            </div>

            <div className="cal-cell-tasks-container">
              {tarefasDoDia.map((tarefa) => {
                const horario = formatarHorarioPrazo(tarefa.prazo);
                const tooltipCompleto = `${tarefa.texto}${
                  horario ? ` às ${horario}` : ''
                } • ${tarefa.concluida ? 'Concluída' : 'Pendente'} • ${
                  tarefa.objetivoNome || 'Objetivo'
                } › ${tarefa.etapaNome || 'Ilha'}${
                  tarefa.descricao ? `\n\n${tarefa.descricao}` : ''
                }`;

                return (
                  <div
                    key={tarefa.id}
                    className={`cal-task-chip ${tarefa.concluida ? 'concluida' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelecionarData(d.dataFormatada);
                    }}
                    title={tooltipCompleto}
                  >
                    <div className="cal-chip-top">
                      <span
                        className={`cal-chip-indicator ${
                          tarefa.concluida ? 'concluida' : 'pendente'
                        }`}
                      />
                      {horario && <span className="cal-badge-time">{horario}</span>}
                      <span
                        className={`cal-chip-title ${tarefa.concluida ? 'riscado' : ''}`}
                        title={tarefa.texto}
                      >
                        {tarefa.texto}
                      </span>
                      <button
                        type="button"
                        className="cal-chip-btn-ilha"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavegar('Ilhas', {
                            objetivoId: tarefa.objetivoId,
                            etapaId: tarefa.etapaId,
                            tarefaId: tarefa.id,
                          });
                        }}
                        title={`Ver tarefa “${tarefa.texto}” na Ilha`}
                        aria-label={`Ver tarefa “${tarefa.texto}” na Ilha`}
                      >
                        <Icon name="arrowRight" size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisualizacaoSemana({
  dataReferenciaCivil,
  hojeCivil,
  tarefasPorData,
  onSelecionarData,
  onNavegar,
  onAlternarTarefa,
}) {
  const diasDaSemana = useMemo(
    () => obterDiasDaSemana(dataReferenciaCivil),
    [dataReferenciaCivil]
  );

  return (
    <div className="cal-week-grid">
      {diasDaSemana.map((dia) => {
        const tarefasDoDia = tarefasPorData.get(dia.dataFormatada) || [];
        const isHoje = dia.dataFormatada === hojeCivil;

        return (
          <div
            key={dia.dataFormatada}
            className={`cal-week-col ${isHoje ? 'hoje' : ''}`}
            onClick={() => onSelecionarData(dia.dataFormatada)}
          >
            <div className={`cal-week-col-header ${isHoje ? 'hoje' : ''}`}>
              <span className="dia-nome">{dia.nomeAbrev}</span>
              <span className="dia-num">{dia.dia}</span>
              {tarefasDoDia.length > 0 && (
                <span className="cal-aside-badge mt-1">
                  {tarefasDoDia.length} {tarefasDoDia.length === 1 ? 'tarefa' : 'tarefas'}
                </span>
              )}
            </div>

            <div className="cal-week-col-body">
              {tarefasDoDia.length === 0 ? (
                <div className="cal-empty-box" style={{ padding: '1rem 0.5rem' }}>
                  <p className="text-xs">Sem tarefas</p>
                </div>
              ) : (
                tarefasDoDia.map((tarefa) => {
                  const horario = formatarHorarioPrazo(tarefa.prazo);
                  const tooltipCompleto = `${tarefa.texto}${
                    horario ? ` às ${horario}` : ''
                  } • ${tarefa.concluida ? 'Concluída' : 'Pendente'}`;

                  return (
                    <div
                      key={tarefa.id}
                      className={`cal-aside-task-item ${tarefa.concluida ? 'concluida' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="cal-task-meta-row">
                        <span
                          className={`cal-badge-status ${
                            tarefa.concluida ? 'concluida' : 'pendente'
                          }`}
                        >
                          {tarefa.concluida ? 'Concluída' : 'Pendente'}
                        </span>
                        {horario && <span className="cal-badge-time">{horario}</span>}
                      </div>

                      <div className="cal-task-title-row">
                        <input
                          type="checkbox"
                          checked={tarefa.concluida}
                          onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                          className="cal-task-checkbox"
                          aria-label={`Alternar tarefa ${tarefa.texto}`}
                        />
                        <p
                          className={`cal-task-text ${tarefa.concluida ? 'riscado' : ''}`}
                          title={tooltipCompleto}
                        >
                          {tarefa.texto}
                        </p>
                      </div>

                      <span className="cal-task-context">
                        {tarefa.objetivoNome || 'Objetivo'} › {tarefa.etapaNome || 'Ilha'}
                      </span>

                      <button
                        type="button"
                        className="cal-btn-ilha"
                        onClick={() =>
                          onNavegar('Ilhas', {
                            objetivoId: tarefa.objetivoId,
                            etapaId: tarefa.etapaId,
                            tarefaId: tarefa.id,
                          })
                        }
                      >
                        <span>Ver na Ilha</span>
                        <Icon name="arrowRight" size={11} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisualizacaoDia({
  dataReferenciaCivil,
  tarefasPorData,
  onNavegar,
  onAlternarTarefa,
}) {
  const tarefasDoDia = useMemo(() => {
    return tarefasPorData.get(dataReferenciaCivil) || [];
  }, [tarefasPorData, dataReferenciaCivil]);

  const concluidas = tarefasDoDia.filter((t) => t.concluida).length;
  const pendentes = tarefasDoDia.length - concluidas;
  const percentual =
    tarefasDoDia.length === 0 ? 0 : Math.round((concluidas / tarefasDoDia.length) * 100);

  // Divide entre tarefas com horário e tarefas ao longo do dia
  const comHorario = tarefasDoDia
    .filter((t) => formatarHorarioPrazo(t.prazo))
    .sort((a, b) => (a.prazo || '').localeCompare(b.prazo || ''));

  const semHorario = tarefasDoDia.filter((t) => !formatarHorarioPrazo(t.prazo));

  return (
    <div className="cal-day-view">
      <div className="cal-day-header-card">
        <div>
          <span className="cal-eyebrow">Visualização Diária</span>
          <h3 className="text-xl font-bold text-white mt-1">
            {formatarPrazo(dataReferenciaCivil)}
          </h3>
        </div>

        <div className="cal-day-stats">
          <div className="cal-stat-item">
            <span className="cal-stat-val text-white">{tarefasDoDia.length}</span>
            <span className="cal-stat-lbl">Total</span>
          </div>
          <div className="cal-stat-item">
            <span className="cal-stat-val text-amber-400">{pendentes}</span>
            <span className="cal-stat-lbl">Pendentes</span>
          </div>
          <div className="cal-stat-item">
            <span className="cal-stat-val text-emerald-400">{concluidas}</span>
            <span className="cal-stat-lbl">Concluídas</span>
          </div>
          <div className="cal-stat-item">
            <span className="cal-stat-val text-sky-400">{percentual}%</span>
            <span className="cal-stat-lbl">Progresso</span>
          </div>
        </div>
      </div>

      {tarefasDoDia.length === 0 ? (
        <div className="cal-empty-box">
          <p className="text-base font-medium text-white mb-1">
            Nenhuma tarefa agendada para este dia.
          </p>
          <p className="text-sm text-slate-400">
            Prazos definidos nas etapas das Ilhas aparecerão automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="cal-day-timeline">
          {comHorario.length > 0 && (
            <div className="cal-timeline-section">
              <h4>Horários Marcados</h4>
              <div className="flex flex-col gap-3">
                {comHorario.map((tarefa) => {
                  const horario = formatarHorarioPrazo(tarefa.prazo);

                  return (
                    <div
                      key={tarefa.id}
                      className={`cal-day-task-card ${tarefa.concluida ? 'opacity-75' : ''}`}
                    >
                      <div className="cal-task-meta-row">
                        <span className="cal-badge-time text-sm font-semibold">{horario}</span>
                        <span
                          className={`cal-badge-status ${
                            tarefa.concluida ? 'concluida' : 'pendente'
                          }`}
                        >
                          {tarefa.concluida ? 'Concluída' : 'Pendente'}
                        </span>
                      </div>

                      <div className="cal-task-title-row">
                        <input
                          type="checkbox"
                          checked={tarefa.concluida}
                          onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                          className="cal-task-checkbox"
                          aria-label={`Alternar tarefa ${tarefa.texto}`}
                        />
                        <p
                          className={`cal-task-text text-base ${tarefa.concluida ? 'riscado' : ''}`}
                          title={tarefa.texto}
                        >
                          {tarefa.texto}
                        </p>
                      </div>

                      {tarefa.descricao && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {tarefa.descricao}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                        <span className="cal-task-context">
                          {tarefa.objetivoNome || 'Objetivo'} › {tarefa.etapaNome || 'Ilha'}
                        </span>

                        <button
                          type="button"
                          className="cal-btn-ilha"
                          onClick={() =>
                            onNavegar('Ilhas', {
                              objetivoId: tarefa.objetivoId,
                              etapaId: tarefa.etapaId,
                              tarefaId: tarefa.id,
                            })
                          }
                        >
                          <span>Ver na Ilha</span>
                          <Icon name="arrowRight" size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {semHorario.length > 0 && (
            <div className="cal-timeline-section">
              <h4>Ao longo do dia</h4>
              <div className="flex flex-col gap-3">
                {semHorario.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={`cal-day-task-card ${tarefa.concluida ? 'opacity-75' : ''}`}
                  >
                    <div className="cal-task-meta-row">
                      <span
                        className={`cal-badge-status ${
                          tarefa.concluida ? 'concluida' : 'pendente'
                        }`}
                      >
                        {tarefa.concluida ? 'Concluída' : 'Pendente'}
                      </span>
                    </div>

                    <div className="cal-task-title-row">
                      <input
                        type="checkbox"
                        checked={tarefa.concluida}
                        onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                        className="cal-task-checkbox"
                        aria-label={`Alternar tarefa ${tarefa.texto}`}
                      />
                      <p
                        className={`cal-task-text text-base ${tarefa.concluida ? 'riscado' : ''}`}
                        title={tarefa.texto}
                      >
                        {tarefa.texto}
                      </p>
                    </div>

                    {tarefa.descricao && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tarefa.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                      <span className="cal-task-context">
                        {tarefa.objetivoNome || 'Objetivo'} › {tarefa.etapaNome || 'Ilha'}
                      </span>

                      <button
                        type="button"
                        className="cal-btn-ilha"
                        onClick={() =>
                          onNavegar('Ilhas', {
                            objetivoId: tarefa.objetivoId,
                            etapaId: tarefa.etapaId,
                            tarefaId: tarefa.id,
                          })
                        }
                      >
                        <span>Ver na Ilha</span>
                        <Icon name="arrowRight" size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VisualizacaoAno({
  dataReferenciaCivil,
  hojeCivil,
  tarefasPorData,
  onMudarParaMes,
}) {
  const { ano } = decomporDataCivil(dataReferenciaCivil);
  const meses = useMemo(() => obterMesesDoAno(ano), [ano]);

  return (
    <div className="cal-year-grid">
      {meses.map((m) => {
        const dias = obterDiasDoMes(ano, m.mesIndice);
        let totalTarefasMes = 0;
        for (const d of dias) {
          if (!d.foraDoMes && tarefasPorData.has(d.dataFormatada)) {
            totalTarefasMes += tarefasPorData.get(d.dataFormatada).length;
          }
        }

        return (
          <div
            key={m.nome}
            className="cal-year-month-card"
            onClick={() => onMudarParaMes(ano, m.mesIndice)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onMudarParaMes(ano, m.mesIndice);
              }
            }}
          >
            <div className="cal-year-month-header">
              <span className="cal-year-month-title">{m.nome}</span>
              {totalTarefasMes > 0 && (
                <span className="cal-aside-badge">
                  {totalTarefasMes} {totalTarefasMes === 1 ? 'tarefa' : 'tarefas'}
                </span>
              )}
            </div>

            <div className="cal-mini-grid">
              {DIAS_DA_SEMANA_ABREV.map((dia) => (
                <span key={dia} className="cal-mini-weekday">
                  {dia.charAt(0)}
                </span>
              ))}

              {dias.map((d) => {
                const temTarefas = !d.foraDoMes && tarefasPorData.has(d.dataFormatada);
                const isHoje = d.dataFormatada === hojeCivil;

                return (
                  <div
                    key={d.dataFormatada}
                    className={`cal-mini-day ${d.foraDoMes ? 'fora-mes' : ''} ${
                      isHoje ? 'hoje' : ''
                    }`}
                  >
                    <span>{d.dia}</span>
                    {temTarefas && <span className="cal-mini-dot" />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisualizacaoResultadosBusca({
  tarefas,
  onNavegar,
  onAlternarTarefa,
  onIrParaData,
}) {
  return (
    <div className="cal-search-results-list">
      {tarefas.map((tarefa) => {
        const horario = formatarHorarioPrazo(tarefa.prazo);
        const dataFormatada = formatarPrazo(tarefa.prazo);
        const dataCivil = extrairDataCivil(tarefa.prazo);

        return (
          <div
            key={tarefa.id}
            className={`cal-search-card ${tarefa.concluida ? 'opacity-75' : ''}`}
          >
            <div className="cal-task-meta-row">
              <div className="flex items-center gap-2">
                <span
                  className={`cal-badge-status ${
                    tarefa.concluida ? 'concluida' : 'pendente'
                  }`}
                >
                  {tarefa.concluida ? 'Concluída' : 'Pendente'}
                </span>
                {dataFormatada ? (
                  <span className="cal-badge-time">
                    {dataFormatada} {horario ? ` às ${horario}` : ''}
                  </span>
                ) : (
                  <span className="cal-badge-time text-slate-400">Sem prazo</span>
                )}
              </div>

              <div className="cal-search-card-actions">
                {dataCivil && (
                  <button
                    type="button"
                    className="cal-btn-ver-data"
                    onClick={() => onIrParaData(dataCivil)}
                    title={`Ver dia ${dataFormatada} no calendário`}
                  >
                    <Icon name="calendar" size={11} />
                    <span>Ver no calendário</span>
                  </button>
                )}
                <button
                  type="button"
                  className="cal-btn-ilha"
                  onClick={() =>
                    onNavegar('Ilhas', {
                      objetivoId: tarefa.objetivoId,
                      etapaId: tarefa.etapaId,
                      tarefaId: tarefa.id,
                    })
                  }
                  title={`Ver tarefa “${tarefa.texto}” na Ilha`}
                >
                  <span>Ver na Ilha</span>
                  <Icon name="arrowRight" size={11} />
                </button>
              </div>
            </div>

            <div className="cal-task-title-row">
              <input
                type="checkbox"
                checked={tarefa.concluida}
                onChange={() => onAlternarTarefa(tarefa.id, !tarefa.concluida)}
                className="cal-task-checkbox"
                aria-label={`Alternar tarefa ${tarefa.texto}`}
              />
              <p
                className={`cal-task-text text-base ${tarefa.concluida ? 'riscado' : ''}`}
                title={tarefa.texto}
              >
                {tarefa.texto}
              </p>
            </div>

            {tarefa.descricao && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {tarefa.descricao}
              </p>
            )}

            <span className="cal-task-context">
              {tarefa.objetivoNome || 'Objetivo'} › {tarefa.etapaNome || 'Ilha'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default CalendarioWorkspace;

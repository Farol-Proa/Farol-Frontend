import { extrairDataCivil } from '../dashboard/taskDates.js';
import {
  NOMES_MESES,
  DIAS_DA_SEMANA_ABREV,
  DIAS_DA_SEMANA_NOMES,
  obterDataHojeCivil,
  formatarDataCivil,
  decomporDataCivil,
  obterDiasDaSemana,
} from '../pages/Calendario/calendarUtils.js';

export {
  NOMES_MESES,
  DIAS_DA_SEMANA_ABREV,
  DIAS_DA_SEMANA_NOMES,
  obterDataHojeCivil,
  formatarDataCivil,
  decomporDataCivil,
  obterDiasDaSemana,
};

/**
 * Retorna o intervalo da semana (Segunda a Domingo) contendo a data informada.
 */
export function obterIntervaloSemana(dataCivil) {
  const dataRef = extrairDataCivil(dataCivil) || obterDataHojeCivil();
  const dias = obterDiasDaSemana(dataRef);
  const inicio = dias[0].dataFormatada;
  const fim = dias[6].dataFormatada;
  const primeiro = dias[0];
  const ultimo = dias[6];

  let textoPeriodo = '';
  if (primeiro.mes === ultimo.mes) {
    textoPeriodo = `${primeiro.dia} a ${ultimo.dia} de ${NOMES_MESES[primeiro.mes]} de ${primeiro.ano}`;
  } else {
    textoPeriodo = `${primeiro.dia} de ${NOMES_MESES[primeiro.mes]} a ${ultimo.dia} de ${NOMES_MESES[ultimo.mes]} de ${ultimo.ano}`;
  }

  const colunasGrafico = dias.map((d) => ({
    chave: d.dataFormatada,
    label: d.nomeAbrev,
    sublabel: `${d.dia}/${d.mes + 1}`,
    nomeCompleto: d.nomeCompleto,
    dataCivil: d.dataFormatada,
  }));

  return {
    tipoPeriodo: 'semana',
    inicio,
    fim,
    textoPeriodo,
    colunasGrafico,
    dias,
  };
}

/**
 * Retorna o intervalo do mês civil contendo a data informada.
 */
export function obterIntervaloMes(dataCivil) {
  const { ano, mes } = decomporDataCivil(dataCivil || obterDataHojeCivil());
  const ultimoDiaNum = new Date(ano, mes + 1, 0).getDate();
  const inicio = formatarDataCivil(ano, mes + 1, 1);
  const fim = formatarDataCivil(ano, mes + 1, ultimoDiaNum);
  const textoPeriodo = `${NOMES_MESES[mes]} de ${ano}`;

  // Divide o mês em até 5 semanas ou blocos para o gráfico
  const colunasGrafico = [];
  let diaInicioSemana = 1;
  let semanaIndex = 1;

  while (diaInicioSemana <= ultimoDiaNum) {
    const diaFimSemana = Math.min(diaInicioSemana + 6, ultimoDiaNum);
    const dataInicioSemana = formatarDataCivil(ano, mes + 1, diaInicioSemana);
    const dataFimSemana = formatarDataCivil(ano, mes + 1, diaFimSemana);

    colunasGrafico.push({
      chave: `sem-${semanaIndex}`,
      label: `Sem ${semanaIndex}`,
      sublabel: `${diaInicioSemana} a ${diaFimSemana}`,
      nomeCompleto: `Semana ${semanaIndex} (${diaInicioSemana} a ${diaFimSemana} de ${NOMES_MESES[mes]})`,
      dataInicio: dataInicioSemana,
      dataFim: dataFimSemana,
    });

    diaInicioSemana += 7;
    semanaIndex += 1;
  }

  return {
    tipoPeriodo: 'mes',
    inicio,
    fim,
    ano,
    mes,
    textoPeriodo,
    colunasGrafico,
  };
}

/**
 * Retorna o intervalo do ano civil contendo a data informada.
 */
export function obterIntervaloAno(dataCivil) {
  const { ano } = decomporDataCivil(dataCivil || obterDataHojeCivil());
  const inicio = formatarDataCivil(ano, 1, 1);
  const fim = formatarDataCivil(ano, 12, 31);
  const textoPeriodo = `Ano de ${ano}`;

  const colunasGrafico = NOMES_MESES.map((nome, index) => {
    const ultimoDia = new Date(ano, index + 1, 0).getDate();
    return {
      chave: `mes-${index + 1}`,
      label: nome.slice(0, 3),
      sublabel: nome,
      nomeCompleto: `${nome} de ${ano}`,
      mesIndice: index,
      dataInicio: formatarDataCivil(ano, index + 1, 1),
      dataFim: formatarDataCivil(ano, index + 1, ultimoDia),
    };
  });

  return {
    tipoPeriodo: 'ano',
    inicio,
    fim,
    ano,
    textoPeriodo,
    colunasGrafico,
  };
}

/**
 * Retorna as informações do período selecionado ('semana', 'mes', 'ano').
 */
export function obterInformacoesPeriodo(tipoPeriodo = 'semana', dataCivil = null) {
  const dataRef = extrairDataCivil(dataCivil) || obterDataHojeCivil();

  let info;
  switch (tipoPeriodo) {
    case 'mes':
      info = obterIntervaloMes(dataRef);
      break;
    case 'ano':
      info = obterIntervaloAno(dataRef);
      break;
    case 'semana':
    default:
      info = obterIntervaloSemana(dataRef);
      break;
  }

  // Verifica se o período atual já está no presente/futuro
  const hoje = obterDataHojeCivil();
  const podeAvancar = info.fim < hoje;

  return {
    ...info,
    dataReferenciaCivil: dataRef,
    podeAvancar,
  };
}

/**
 * Navega no período (direção: -1 anterior, +1 próximo) impedindo avançar além do presente.
 */
export function navegarPeriodoEvolucao(tipoPeriodo, dataCivil, direcao) {
  const infoAtual = obterInformacoesPeriodo(tipoPeriodo, dataCivil);

  if (direcao > 0 && !infoAtual.podeAvancar) {
    return infoAtual.dataReferenciaCivil;
  }

  const { ano, mes, dia } = decomporDataCivil(infoAtual.dataReferenciaCivil);
  let novaData;

  switch (tipoPeriodo) {
    case 'semana': {
      const data = new Date(ano, mes, dia + direcao * 7);
      novaData = formatarDataCivil(data.getFullYear(), data.getMonth() + 1, data.getDate());
      break;
    }
    case 'mes': {
      const data = new Date(ano, mes + direcao, 1);
      novaData = formatarDataCivil(data.getFullYear(), data.getMonth() + 1, 1);
      break;
    }
    case 'ano': {
      novaData = formatarDataCivil(ano + direcao, 1, 1);
      break;
    }
    default:
      novaData = infoAtual.dataReferenciaCivil;
  }

  // Bloqueio de segurança: não permite que a nova data caia num período cujo início seja posterior a hoje
  const hoje = obterDataHojeCivil();
  const novaInfo = obterInformacoesPeriodo(tipoPeriodo, novaData);
  if (novaInfo.inicio > hoje) {
    return hoje;
  }

  return novaData;
}

/**
 * Retorna as datas do período anterior equivalente para comparação.
 */
export function obterPeriodoAnteriorEquivalente(tipoPeriodo, dataCivil) {
  const { ano, mes, dia } = decomporDataCivil(dataCivil || obterDataHojeCivil());
  let dataAnterior;

  switch (tipoPeriodo) {
    case 'semana': {
      const data = new Date(ano, mes, dia - 7);
      dataAnterior = formatarDataCivil(data.getFullYear(), data.getMonth() + 1, data.getDate());
      break;
    }
    case 'mes': {
      const data = new Date(ano, mes - 1, 1);
      dataAnterior = formatarDataCivil(data.getFullYear(), data.getMonth() + 1, 1);
      break;
    }
    case 'ano': {
      dataAnterior = formatarDataCivil(ano - 1, 1, 1);
      break;
    }
    default:
      dataAnterior = dataCivil;
  }

  return obterInformacoesPeriodo(tipoPeriodo, dataAnterior);
}

/**
 * Verifica se uma data civil 'YYYY-MM-DD' está dentro do intervalo [inicio, fim].
 */
export function dataEstaNoIntervalo(dataCivil, inicio, fim) {
  if (!dataCivil) return false;
  const limpa = extrairDataCivil(dataCivil);
  if (!limpa) return false;
  return limpa >= inicio && limpa <= fim;
}

/**
 * Calcula todas as métricas consolidadas e transparentes de evolução do usuário para um período.
 */
export function calcularMetricasEvolucao({
  objetivos = [],
  tarefas = [],
  reunioes = [],
  orientacoes = [],
  tipoPeriodo = 'semana',
  dataCivil = null,
}) {
  const periodoAtual = obterInformacoesPeriodo(tipoPeriodo, dataCivil);
  const periodoAnterior = obterPeriodoAnteriorEquivalente(tipoPeriodo, periodoAtual.dataReferenciaCivil);

  // 1. TAREFAS NO PERÍODO ATUAL
  const tarefasNoPeriodo = tarefas.filter((t) =>
    dataEstaNoIntervalo(t.prazo, periodoAtual.inicio, periodoAtual.fim)
  );
  const tarefasConcluidasPeriodo = tarefasNoPeriodo.filter((t) => Boolean(t.concluida));
  const tarefasPendentesPeriodo = tarefasNoPeriodo.filter((t) => !t.concluida);

  const totalTarefasPeriodo = tarefasNoPeriodo.length;
  const qtdTarefasConcluidas = tarefasConcluidasPeriodo.length;
  const qtdTarefasPendentes = tarefasPendentesPeriodo.length;
  const taxaConclusaoTarefas = totalTarefasPeriodo > 0
    ? Math.round((qtdTarefasConcluidas / totalTarefasPeriodo) * 100)
    : 0;

  // 2. TAREFAS NO PERÍODO ANTERIOR (para comparação)
  const tarefasNoPeriodoAnterior = tarefas.filter((t) =>
    dataEstaNoIntervalo(t.prazo, periodoAnterior.inicio, periodoAnterior.fim)
  );
  const qtdTarefasConcluidasAnterior = tarefasNoPeriodoAnterior.filter((t) => Boolean(t.concluida)).length;
  const totalTarefasAnterior = tarefasNoPeriodoAnterior.length;

  const diffTarefasConcluidas = qtdTarefasConcluidas - qtdTarefasConcluidasAnterior;
  const variacaoPercentualTarefas = qtdTarefasConcluidasAnterior > 0
    ? Math.round(((qtdTarefasConcluidas - qtdTarefasConcluidasAnterior) / qtdTarefasConcluidasAnterior) * 100)
    : null;

  // 3. OBJETIVOS E MAPAS
  const listaObjetivos = Array.isArray(objetivos) ? objetivos : [];
  const objetivosDetalhados = listaObjetivos.map((obj) => {
    const etapas = obj.etapas || [];
    const etapasConcluidasObj = etapas.filter(
      (e) => Boolean(e.concluida ?? e.progresso?.concluida) || e.status === 'done' || e.status === 'CONCLUIDA'
    );
    const todasEtapasConcluidas = etapas.length > 0 && etapasConcluidasObj.length === etapas.length;
    const concluido = obj.status === 'CONCLUIDO' || todasEtapasConcluidas;

    const percentualObj = Number.isFinite(obj.progresso?.percentual)
      ? obj.progresso.percentual
      : etapas.length > 0
      ? Math.round((etapasConcluidasObj.length / etapas.length) * 100)
      : 0;

    const noPeriodo = dataEstaNoIntervalo(obj.prazo, periodoAtual.inicio, periodoAtual.fim);

    return {
      id: obj.id,
      nome: obj.nome || `Objetivo #${obj.id}`,
      descricao: obj.descricao || '',
      status: obj.status,
      concluido,
      percentual: percentualObj,
      totalEtapas: etapas.length,
      etapasConcluidas: etapasConcluidasObj.length,
      prazo: obj.prazo,
      noPeriodo,
    };
  });

  const objetivosConcluidosNoPeriodo = objetivosDetalhados.filter(
    (o) => o.concluido && o.noPeriodo
  );
  const totalObjetivosConcluidosGeral = objetivosDetalhados.filter((o) => o.concluido).length;
  const objetivosEmAndamento = objetivosDetalhados.filter((o) => !o.concluido);

  const progressoMedioGeral = objetivosDetalhados.length > 0
    ? Math.round(
        objetivosDetalhados.reduce((acc, o) => acc + o.percentual, 0) / objetivosDetalhados.length
      )
    : 0;

  // 4. ETAPAS E ILHAS
  const todasEtapas = listaObjetivos.flatMap((obj) =>
    (obj.etapas || []).map((etapa) => ({
      ...etapa,
      objetivoId: obj.id,
      objetivoNome: obj.nome,
      concluidaEfetiva:
        Boolean(etapa.concluida ?? etapa.progresso?.concluida) ||
        etapa.status === 'done' ||
        etapa.status === 'CONCLUIDA',
    }))
  );

  const totalEtapasGeral = todasEtapas.length;
  const totalEtapasConcluidasGeral = todasEtapas.filter((e) => e.concluidaEfetiva).length;

  const etapasNoPeriodo = todasEtapas.filter((e) =>
    dataEstaNoIntervalo(e.prazo, periodoAtual.inicio, periodoAtual.fim)
  );
  const etapasConcluidasNoPeriodo = etapasNoPeriodo.filter((e) => e.concluidaEfetiva);

  // 5. MENTORIA
  const listaReunioes = Array.isArray(reunioes) ? reunioes : [];
  const reunioesNoPeriodo = listaReunioes.filter((r) =>
    dataEstaNoIntervalo(r.dataHora, periodoAtual.inicio, periodoAtual.fim)
  );

  const reunioesRealizadas = reunioesNoPeriodo.filter((r) => r.status === 'REALIZADA');
  const reunioesAgendadas = reunioesNoPeriodo.filter((r) => r.status === 'AGENDADA');
  const reunioesCanceladas = reunioesNoPeriodo.filter((r) => r.status === 'CANCELADA');

  const agoraIso = new Date().toISOString();
  const proximaReuniao = listaReunioes
    .filter((r) => r.status === 'AGENDADA' && (r.dataHora || '') >= agoraIso.slice(0, 16))
    .sort((a, b) => (a.dataHora || '').localeCompare(b.dataHora || ''))[0] || null;

  const listaOrientacoes = Array.isArray(orientacoes) ? orientacoes : [];
  const orientacoesNoPeriodo = listaOrientacoes.filter((o) =>
    dataEstaNoIntervalo(o.prazo || o.criadoEm, periodoAtual.inicio, periodoAtual.fim)
  );
  const orientacoesConcluidas = orientacoesNoPeriodo.filter((o) => o.status === 'CONCLUIDA');
  const orientacoesPendentes = orientacoesNoPeriodo.filter((o) => o.status !== 'CONCLUIDA');

  // 6. TAXA GERAL DE EVOLUÇÃO DO PERÍODO (Fórmula transparente)
  // Se houver tarefas com prazo no período: taxaConclusaoTarefas
  // Se não houver tarefas com prazo no período, mas houver etapas com prazo: % etapas concluídas
  // Se não houver nenhum item com prazo planejado: 0
  let taxaEvolucaoGeral = 0;
  let explicacaoFormula = '';

  if (totalTarefasPeriodo > 0) {
    taxaEvolucaoGeral = taxaConclusaoTarefas;
    explicacaoFormula = `${qtdTarefasConcluidas} de ${totalTarefasPeriodo} tarefas planejadas concluídas (${taxaConclusaoTarefas}%)`;
  } else if (etapasNoPeriodo.length > 0) {
    taxaEvolucaoGeral = Math.round((etapasConcluidasNoPeriodo.length / etapasNoPeriodo.length) * 100);
    explicacaoFormula = `${etapasConcluidasNoPeriodo.length} de ${etapasNoPeriodo.length} ilhas planejadas concluídas (${taxaEvolucaoGeral}%)`;
  } else if (totalEtapasGeral > 0) {
    taxaEvolucaoGeral = Math.round((totalEtapasConcluidasGeral / totalEtapasGeral) * 100);
    explicacaoFormula = `Sem prazos neste período. Progresso acumulado das ilhas: ${totalEtapasConcluidasGeral} de ${totalEtapasGeral} (${taxaEvolucaoGeral}%)`;
  } else {
    taxaEvolucaoGeral = 0;
    explicacaoFormula = 'Nenhuma atividade com prazo cadastrada neste período.';
  }

  // 7. DADOS PARA O GRÁFICO DE BARRAS DE PRODUTIVIDADE
  const dadosGrafico = periodoAtual.colunasGrafico.map((coluna) => {
    let tarefasColuna = [];

    if (tipoPeriodo === 'semana') {
      tarefasColuna = tarefas.filter(
        (t) => extrairDataCivil(t.prazo) === coluna.dataCivil
      );
    } else {
      tarefasColuna = tarefas.filter((t) =>
        dataEstaNoIntervalo(t.prazo, coluna.dataInicio, coluna.dataFim)
      );
    }

    const concluidasCol = tarefasColuna.filter((t) => Boolean(t.concluida)).length;
    const pendentesCol = tarefasColuna.length - concluidasCol;
    const taxaCol = tarefasColuna.length > 0
      ? Math.round((concluidasCol / tarefasColuna.length) * 100)
      : 0;

    return {
      chave: coluna.chave,
      label: coluna.label,
      sublabel: coluna.sublabel,
      nomeCompleto: coluna.nomeCompleto,
      concluidas: concluidasCol,
      pendentes: pendentesCol,
      total: tarefasColuna.length,
      taxa: taxaCol,
    };
  });

  // 8. HISTÓRICO DE CONQUISTAS (TIMELINE DO PERÍODO)
  const conquistas = [];

  // Tarefas concluídas
  for (const t of tarefasConcluidasPeriodo) {
    conquistas.push({
      id: `t-${t.id}`,
      tipo: 'tarefa',
      titulo: t.texto || 'Tarefa concluída',
      subtitulo: t.etapaNome ? `Etapa: ${t.etapaNome}` : 'Tarefa da jornada',
      data: t.prazo || periodoAtual.fim,
      dataCivil: extrairDataCivil(t.prazo) || periodoAtual.fim,
      icone: 'check',
      tag: 'Tarefa',
      badgeCor: 'green',
    });
  }

  // Etapas concluídas
  for (const e of etapasConcluidasNoPeriodo) {
    conquistas.push({
      id: `e-${e.id}`,
      tipo: 'etapa',
      titulo: e.texto || 'Ilha concluída',
      subtitulo: e.objetivoNome ? `Mapa: ${e.objetivoNome}` : 'Ilha de aprendizado',
      data: e.prazo || periodoAtual.fim,
      dataCivil: extrairDataCivil(e.prazo) || periodoAtual.fim,
      icone: 'map',
      tag: 'Ilha Conquistada',
      badgeCor: 'blue',
    });
  }

  // Objetivos concluídos
  for (const o of objetivosConcluidosNoPeriodo) {
    conquistas.push({
      id: `o-${o.id}`,
      tipo: 'objetivo',
      titulo: o.nome,
      subtitulo: 'Mapa de aprendizado finalizado com sucesso!',
      data: o.prazo || periodoAtual.fim,
      dataCivil: extrairDataCivil(o.prazo) || periodoAtual.fim,
      icone: 'target',
      tag: 'Objetivo Atingido',
      badgeCor: 'amber',
    });
  }

  // Reuniões realizadas
  for (const r of reunioesRealizadas) {
    conquistas.push({
      id: `r-${r.id}`,
      tipo: 'reuniao',
      titulo: r.titulo || 'Sessão de mentoria',
      subtitulo: `Reunião realizada (${r.duracaoMinutos || 60} min)`,
      data: r.dataHora || periodoAtual.fim,
      dataCivil: extrairDataCivil(r.dataHora) || periodoAtual.fim,
      icone: 'users',
      tag: 'Mentoria',
      badgeCor: 'teal',
    });
  }

  // Orientações concluídas
  for (const ori of orientacoesConcluidas) {
    conquistas.push({
      id: `ori-${ori.id}`,
      tipo: 'orientacao',
      titulo: ori.titulo || 'Orientação concluída',
      subtitulo: ori.objetivoTitulo ? `Foco: ${ori.objetivoTitulo}` : 'Plano de ação',
      data: ori.prazo || ori.criadoEm || periodoAtual.fim,
      dataCivil: extrairDataCivil(ori.prazo || ori.criadoEm) || periodoAtual.fim,
      icone: 'sparkles',
      tag: 'Orientação',
      badgeCor: 'purple',
    });
  }

  // Ordena conquistas da mais recente para a mais antiga
  conquistas.sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  return {
    periodoAtual,
    periodoAnterior,
    // Métricas de tarefas
    tarefas: {
      totalNoPeriodo: totalTarefasPeriodo,
      concluidasNoPeriodo: qtdTarefasConcluidas,
      pendentesNoPeriodo: qtdTarefasPendentes,
      taxaConclusao: taxaConclusaoTarefas,
      concluidasAnterior: qtdTarefasConcluidasAnterior,
      totalAnterior: totalTarefasAnterior,
      diferencaTarefas: diffTarefasConcluidas,
      variacaoPercentual: variacaoPercentualTarefas,
      temComparativoAnterior: totalTarefasAnterior > 0,
    },
    // Métricas de objetivos
    objetivos: {
      total: listaObjetivos.length,
      concluidosNoPeriodo: objetivosConcluidosNoPeriodo.length,
      concluidosGeral: totalObjetivosConcluidosGeral,
      emAndamento: objetivosEmAndamento.length,
      progressoMedio: progressoMedioGeral,
      lista: objetivosDetalhados,
    },
    // Métricas de ilhas/etapas
    etapas: {
      totalGeral: totalEtapasGeral,
      concluidasGeral: totalEtapasConcluidasGeral,
      totalNoPeriodo: etapasNoPeriodo.length,
      concluidasNoPeriodo: etapasConcluidasNoPeriodo.length,
    },
    // Métricas de mentoria
    mentoria: {
      reunioesRealizadas: reunioesRealizadas.length,
      reunioesAgendadas: reunioesAgendadas.length,
      reunioesCanceladas: reunioesCanceladas.length,
      totalReunioesNoPeriodo: reunioesNoPeriodo.length,
      proximaReuniao,
      orientacoesConcluidas: orientacoesConcluidas.length,
      orientacoesPendentes: orientacoesPendentes.length,
      totalOrientacoesNoPeriodo: orientacoesNoPeriodo.length,
    },
    // Visão Geral
    resumoGeral: {
      taxaEvolucaoGeral,
      explicacaoFormula,
      totalConquistas: conquistas.length,
    },
    // Gráfico de produtividade
    dadosGrafico,
    // Linha do tempo de conquistas
    conquistas,
  };
}

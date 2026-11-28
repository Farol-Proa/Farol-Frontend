import { extrairDataCivil } from '../../dashboard/taskDates.js';

export const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DIAS_DA_SEMANA_ABREV = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
export const DIAS_DA_SEMANA_NOMES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

/**
 * Retorna a data atual local no formato civil 'YYYY-MM-DD'.
 */
export function obterDataHojeCivil() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata ano, mês (1..12) e dia em 'YYYY-MM-DD'.
 */
export function formatarDataCivil(ano, mes, dia) {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/**
 * Converte 'YYYY-MM-DD' para objeto com ano, mes (0..11) e dia (1..31).
 */
export function decomporDataCivil(dataFormatada) {
  const dataLimpa = extrairDataCivil(dataFormatada) || obterDataHojeCivil();
  const [ano, mes, dia] = dataLimpa.split('-').map(Number);
  return {
    ano,
    mes: mes - 1, // 0-indexed para compatibilidade com Date
    dia,
    dataFormatada: dataLimpa,
  };
}

/**
 * Retorna os dias para preencher a grade mensal (completando a primeira semana e a última).
 * Começa na Segunda-feira (índice 0).
 */
export function obterDiasDoMes(ano, mes) {
  const primeiroDiaDoMes = new Date(ano, mes, 1);
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0);
  const totalDiasMes = ultimoDiaDoMes.getDate();

  // No JS, getDay() retorna 0 para Domingo. Convertendo para 0 = Segunda .. 6 = Domingo:
  const diaSemanaPrimeiro = (primeiroDiaDoMes.getDay() + 6) % 7;

  // Dias do mês anterior para preenchimento
  const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
  const mesAnterior = mes === 0 ? 11 : mes - 1;
  const anoMesAnterior = mes === 0 ? ano - 1 : ano;

  const dias = [];

  // Preenche dias do mês anterior
  for (let i = diaSemanaPrimeiro - 1; i >= 0; i--) {
    const diaNum = ultimoDiaMesAnterior - i;
    dias.push({
      dia: diaNum,
      dataFormatada: formatarDataCivil(anoMesAnterior, mesAnterior + 1, diaNum),
      foraDoMes: true,
      mesRelativo: -1,
    });
  }

  // Preenche dias do mês atual
  for (let d = 1; d <= totalDiasMes; d++) {
    dias.push({
      dia: d,
      dataFormatada: formatarDataCivil(ano, mes + 1, d),
      foraDoMes: false,
      mesRelativo: 0,
    });
  }

  // Preenche dias do próximo mês para fechar a última linha em múltiplos de 7
  const restante = (7 - (dias.length % 7)) % 7;
  const mesProximo = mes === 11 ? 0 : mes + 1;
  const anoMesProximo = mes === 11 ? ano + 1 : ano;

  for (let d = 1; d <= restante; d++) {
    dias.push({
      dia: d,
      dataFormatada: formatarDataCivil(anoMesProximo, mesProximo + 1, d),
      foraDoMes: true,
      mesRelativo: 1,
    });
  }

  return dias;
}

/**
 * Retorna os 7 dias da semana correspondentes à data informada (Segunda a Domingo).
 */
export function obterDiasDaSemana(dataReferenciaCivil) {
  const { ano, mes, dia } = decomporDataCivil(dataReferenciaCivil);
  const data = new Date(ano, mes, dia);
  const diaSemana = (data.getDay() + 6) % 7; // 0 = Seg .. 6 = Dom

  // Segunda-feira dessa semana
  const segunda = new Date(ano, mes, dia - diaSemana);

  const dias = [];
  for (let i = 0; i < 7; i++) {
    const diaCorrente = new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + i);
    const anoD = diaCorrente.getFullYear();
    const mesD = diaCorrente.getMonth() + 1;
    const numD = diaCorrente.getDate();
    const dataFormatada = formatarDataCivil(anoD, mesD, numD);

    dias.push({
      dataFormatada,
      dia: numD,
      mes: mesD - 1,
      ano: anoD,
      diaSemanaIndice: i,
      nomeAbrev: DIAS_DA_SEMANA_ABREV[i],
      nomeCompleto: DIAS_DA_SEMANA_NOMES[i],
    });
  }

  return dias;
}

/**
 * Retorna os 12 meses do ano para a visão anual.
 */
export function obterMesesDoAno(ano) {
  return NOMES_MESES.map((nome, index) => ({
    mesIndice: index,
    nome,
    ano,
  }));
}

/**
 * Título descritivo do período conforme a visualização.
 */
export function obterTextoPeriodo(visualizacao, dataReferenciaCivil) {
  const { ano, mes, dia } = decomporDataCivil(dataReferenciaCivil);

  switch (visualizacao) {
    case 'dia': {
      const data = new Date(ano, mes, dia);
      const diaSemana = (data.getDay() + 6) % 7;
      return `${DIAS_DA_SEMANA_NOMES[diaSemana]}, ${dia} de ${NOMES_MESES[mes]} de ${ano}`;
    }
    case 'semana': {
      const dias = obterDiasDaSemana(dataReferenciaCivil);
      const primeiro = dias[0];
      const ultimo = dias[6];
      if (primeiro.mes === ultimo.mes) {
        return `${primeiro.dia} a ${ultimo.dia} de ${NOMES_MESES[primeiro.mes]} de ${primeiro.ano}`;
      }
      return `${primeiro.dia} de ${NOMES_MESES[primeiro.mes]} a ${ultimo.dia} de ${NOMES_MESES[ultimo.mes]} de ${ultimo.ano}`;
    }
    case 'ano':
      return `Ano de ${ano}`;
    case 'mes':
    default:
      return `${NOMES_MESES[mes]} de ${ano}`;
  }
}

/**
 * Avança ou retrocede a data conforme a visualização ('mes', 'semana', 'dia', 'ano').
 * @param {'mes'|'semana'|'dia'|'ano'} visualizacao
 * @param {string} dataCivil - 'YYYY-MM-DD'
 * @param {number} direcao - +1 ou -1
 * @returns {string} nova data civil 'YYYY-MM-DD'
 */
export function navegarPeriodo(visualizacao, dataCivil, direcao) {
  const { ano, mes, dia } = decomporDataCivil(dataCivil);

  switch (visualizacao) {
    case 'dia': {
      const nova = new Date(ano, mes, dia + direcao);
      return formatarDataCivil(nova.getFullYear(), nova.getMonth() + 1, nova.getDate());
    }
    case 'semana': {
      const nova = new Date(ano, mes, dia + direcao * 7);
      return formatarDataCivil(nova.getFullYear(), nova.getMonth() + 1, nova.getDate());
    }
    case 'ano': {
      return formatarDataCivil(ano + direcao, mes + 1, Math.min(dia, 28));
    }
    case 'mes':
    default: {
      const nova = new Date(ano, mes + direcao, 1);
      // Mantém o dia 1 para evitar saltos indesejados ao alternar meses com menos dias
      return formatarDataCivil(nova.getFullYear(), nova.getMonth() + 1, 1);
    }
  }
}

/**
 * Agrupa tarefas por data civil (YYYY-MM-DD).
 */
export function agruparTarefasPorData(tarefas = []) {
  const mapa = new Map();

  for (const tarefa of tarefas) {
    const dataCivil = extrairDataCivil(tarefa.prazo);
    if (!dataCivil) continue;

    if (!mapa.has(dataCivil)) {
      mapa.set(dataCivil, []);
    }
    mapa.get(dataCivil).push(tarefa);
  }

  return mapa;
}

/**
 * Normaliza uma string removendo acentos, convertendo para minúsculas e eliminando espaços extras.
 */
export function normalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra tarefas pelo termo de busca (título, descrição, objetivo ou ilha),
 * com suporte a busca insensível a maiúsculas/minúsculas e acentuação.
 */
export function filtrarTarefasPorTermo(tarefas = [], termo = '') {
  if (!Array.isArray(tarefas)) return [];
  const termoNormalizado = normalizarTexto(termo);
  if (!termoNormalizado) return tarefas;

  return tarefas.filter((tarefa) => {
    if (!tarefa) return false;
    const titulo = normalizarTexto(tarefa.texto || tarefa.titulo || '');
    const descricao = normalizarTexto(tarefa.descricao || '');
    const objetivo = normalizarTexto(tarefa.objetivoNome || '');
    const etapa = normalizarTexto(tarefa.etapaNome || '');

    return (
      titulo.includes(termoNormalizado) ||
      descricao.includes(termoNormalizado) ||
      objetivo.includes(termoNormalizado) ||
      etapa.includes(termoNormalizado)
    );
  });
}

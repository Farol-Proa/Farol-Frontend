import test from 'node:test';
import assert from 'node:assert/strict';
import {
  obterIntervaloSemana,
  obterIntervaloMes,
  obterIntervaloAno,
  obterInformacoesPeriodo,
  navegarPeriodoEvolucao,
  obterPeriodoAnteriorEquivalente,
  dataEstaNoIntervalo,
  calcularMetricasEvolucao,
} from './evolucaoService.js';

test('evolucaoService: obterIntervaloSemana retorna de Segunda a Domingo', () => {
  // Sábado, 28/11/2026
  const info = obterIntervaloSemana('2026-11-28');
  assert.equal(info.tipoPeriodo, 'semana');
  assert.equal(info.inicio, '2026-11-23'); // Segunda-feira
  assert.equal(info.fim, '2026-11-29'); // Domingo
  assert.equal(info.colunasGrafico.length, 7);
  assert.equal(info.colunasGrafico[0].label, 'SEG');
  assert.equal(info.colunasGrafico[6].label, 'DOM');
});

test('evolucaoService: obterIntervaloMes retorna inicio e fim do mês', () => {
  const info = obterIntervaloMes('2026-11-15');
  assert.equal(info.tipoPeriodo, 'mes');
  assert.equal(info.inicio, '2026-11-01');
  assert.equal(info.fim, '2026-11-30');
  assert.equal(info.textoPeriodo, 'Novembro de 2026');
  assert.ok(info.colunasGrafico.length >= 4);
});

test('evolucaoService: obterIntervaloAno retorna os 12 meses do ano', () => {
  const info = obterIntervaloAno('2026-05-10');
  assert.equal(info.tipoPeriodo, 'ano');
  assert.equal(info.inicio, '2026-01-01');
  assert.equal(info.fim, '2026-12-31');
  assert.equal(info.textoPeriodo, 'Ano de 2026');
  assert.equal(info.colunasGrafico.length, 12);
  assert.equal(info.colunasGrafico[0].label, 'Jan');
  assert.equal(info.colunasGrafico[11].label, 'Dez');
});

test('evolucaoService: navegarPeriodoEvolucao avança e retrocede períodos com bloqueio de datas futuras', () => {
  // Período passado: semana de 2026-10-12
  const passada = '2026-10-12';
  const infoPassada = obterInformacoesPeriodo('semana', passada);
  assert.equal(infoPassada.podeAvancar, true);

  // Retroceder 1 semana
  const semanaAnterior = navegarPeriodoEvolucao('semana', passada, -1);
  assert.equal(semanaAnterior, '2026-10-05');

  // Avançar 1 semana
  const semanaPosterior = navegarPeriodoEvolucao('semana', passada, 1);
  assert.equal(semanaPosterior, '2026-10-19');

  // Período atual (hoje): não deve permitir avançar além
  const hoje = '2026-11-28';
  const infoAtual = obterInformacoesPeriodo('semana', hoje);
  // Como hoje está dentro da semana de 23 a 29 de novembro, fim é 2026-11-29, que é amanhã, logo podeAvancar é false
  assert.equal(infoAtual.podeAvancar, false);

  const tentativaAvanco = navegarPeriodoEvolucao('semana', hoje, 1);
  assert.equal(tentativaAvanco, hoje, 'Não deve avançar além do presente');
});

test('evolucaoService: dataEstaNoIntervalo valida datas corretamente', () => {
  assert.equal(dataEstaNoIntervalo('2026-11-25T14:30:00', '2026-11-23', '2026-11-29'), true);
  assert.equal(dataEstaNoIntervalo('2026-11-23', '2026-11-23', '2026-11-29'), true);
  assert.equal(dataEstaNoIntervalo('2026-11-29', '2026-11-23', '2026-11-29'), true);
  assert.equal(dataEstaNoIntervalo('2026-11-22', '2026-11-23', '2026-11-29'), false);
  assert.equal(dataEstaNoIntervalo('2026-11-30', '2026-11-23', '2026-11-29'), false);
  assert.equal(dataEstaNoIntervalo(null, '2026-11-23', '2026-11-29'), false);
});

test('evolucaoService: calcularMetricasEvolucao calcula produtividade e gráficos com fidelidade', () => {
  const objetivosMock = [
    {
      id: 1,
      nome: 'Trilha React',
      status: 'EM_ANDAMENTO',
      prazo: '2026-11-28',
      progresso: { percentual: 50 },
      etapas: [
        {
          id: 10,
          texto: 'Componentes e Hooks',
          concluida: true,
          status: 'done',
          prazo: '2026-11-25',
        },
        {
          id: 11,
          texto: 'Roteamento e Estado',
          concluida: false,
          status: 'progress',
          prazo: '2026-11-27',
        },
      ],
    },
  ];

  const tarefasMock = [
    { id: 101, texto: 'Estudar useState', concluida: true, prazo: '2026-11-24T10:00:00', etapaNome: 'Componentes' },
    { id: 102, texto: 'Estudar useEffect', concluida: true, prazo: '2026-11-25T15:00:00', etapaNome: 'Componentes' },
    { id: 103, texto: 'Criar Router', concluida: false, prazo: '2026-11-27T18:00:00', etapaNome: 'Roteamento' },
    // Tarefa na semana anterior (para teste de comparativo)
    { id: 100, texto: 'Configurar Vite', concluida: true, prazo: '2026-11-18T09:00:00', etapaNome: 'Setup' },
  ];

  const reunioesMock = [
    { id: 201, titulo: 'Alinhamento Semanal', status: 'REALIZADA', dataHora: '2026-11-25T14:00:00', duracaoMinutos: 45 },
    { id: 202, titulo: 'Próxima Sessão', status: 'AGENDADA', dataHora: '2026-11-28T16:00:00', duracaoMinutos: 60 },
  ];

  const orientacoesMock = [
    { id: 301, titulo: 'Revisar hooks customizados', status: 'CONCLUIDA', prazo: '2026-11-26', objetivoTitulo: 'Trilha React' },
  ];

  const metricas = calcularMetricasEvolucao({
    objetivos: objetivosMock,
    tarefas: tarefasMock,
    reunioes: reunioesMock,
    orientacoes: orientacoesMock,
    tipoPeriodo: 'semana',
    dataCivil: '2026-11-28',
  });

  // 1. Tarefas no período (24, 25 e 27/11 pertencem à semana de 23 a 29/11)
  assert.equal(metricas.tarefas.totalNoPeriodo, 3);
  assert.equal(metricas.tarefas.concluidasNoPeriodo, 2);
  assert.equal(metricas.tarefas.pendentesNoPeriodo, 1);
  assert.equal(metricas.tarefas.taxaConclusao, 67); // 2 / 3 * 100 = 66.6% -> 67%

  // 2. Comparativo com período anterior (semana 16 a 22/11 teve 1 tarefa concluída)
  assert.equal(metricas.tarefas.totalAnterior, 1);
  assert.equal(metricas.tarefas.concluidasAnterior, 1);
  assert.equal(metricas.tarefas.diferencaTarefas, 1); // 2 - 1 = +1
  assert.equal(metricas.tarefas.variacaoPercentual, 100); // +100%

  // 3. Objetivos e Etapas
  assert.equal(metricas.objetivos.total, 1);
  assert.equal(metricas.objetivos.emAndamento, 1);
  assert.equal(metricas.etapas.totalNoPeriodo, 2);
  assert.equal(metricas.etapas.concluidasNoPeriodo, 1);

  // 4. Mentoria
  assert.equal(metricas.mentoria.reunioesRealizadas, 1);
  assert.equal(metricas.mentoria.reunioesAgendadas, 1);
  assert.equal(metricas.mentoria.orientacoesConcluidas, 1);

  // 5. Linha do tempo de conquistas
  // Deve conter: 2 tarefas concluídas + 1 etapa concluída + 1 reunião realizada + 1 orientação concluída = 5 conquistas
  assert.equal(metricas.conquistas.length, 5);

  // 6. Dados do gráfico de 7 dias
  assert.equal(metricas.dadosGrafico.length, 7);
  const terca = metricas.dadosGrafico.find((d) => d.label === 'TER'); // 24/11
  const quarta = metricas.dadosGrafico.find((d) => d.label === 'QUA'); // 25/11
  const sexta = metricas.dadosGrafico.find((d) => d.label === 'SEX'); // 27/11

  assert.equal(terca.concluidas, 1);
  assert.equal(quarta.concluidas, 1);
  assert.equal(sexta.pendentes, 1);
  assert.equal(sexta.concluidas, 0);
});

test('evolucaoService: trata com segurança períodos sem dados e previne divisão por zero', () => {
  const metricasVazias = calcularMetricasEvolucao({
    objetivos: [],
    tarefas: [],
    reunioes: [],
    orientacoes: [],
    tipoPeriodo: 'mes',
    dataCivil: '2026-11-01',
  });

  assert.equal(metricasVazias.tarefas.totalNoPeriodo, 0);
  assert.equal(metricasVazias.tarefas.concluidasNoPeriodo, 0);
  assert.equal(metricasVazias.tarefas.taxaConclusao, 0);
  assert.equal(metricasVazias.tarefas.variacaoPercentual, null);
  assert.equal(metricasVazias.resumoGeral.taxaEvolucaoGeral, 0);
  assert.equal(metricasVazias.conquistas.length, 0);
  assert.ok(metricasVazias.resumoGeral.explicacaoFormula);
});

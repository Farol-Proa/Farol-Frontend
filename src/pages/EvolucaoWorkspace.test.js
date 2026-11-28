import test from 'node:test';
import assert from 'node:assert/strict';
import {
  obterInformacoesPeriodo,
  navegarPeriodoEvolucao,
  calcularMetricasEvolucao,
} from '../services/evolucaoService.js';

test('EvolucaoWorkspace: estrutura de seções cobre todos os requisitos de Minha Evolução', () => {
  const secoesObrigatorias = [
    'resumoGeral',
    'produtividadeTarefas',
    'evolucaoMapasIlhas',
    'acompanhamentoMentoria',
    'historicoConquistas',
  ];

  assert.equal(secoesObrigatorias.length, 5);
  assert.ok(secoesObrigatorias.includes('resumoGeral'));
  assert.ok(secoesObrigatorias.includes('produtividadeTarefas'));
  assert.ok(secoesObrigatorias.includes('evolucaoMapasIlhas'));
  assert.ok(secoesObrigatorias.includes('acompanhamentoMentoria'));
  assert.ok(secoesObrigatorias.includes('historicoConquistas'));
});

test('EvolucaoWorkspace: seleção de período Semana agrupa dados por 7 dias', () => {
  const info = obterInformacoesPeriodo('semana', '2026-11-28');
  assert.equal(info.tipoPeriodo, 'semana');
  assert.equal(info.colunasGrafico.length, 7);
  assert.equal(info.colunasGrafico[0].label, 'SEG');
  assert.equal(info.colunasGrafico[6].label, 'DOM');
  assert.ok(info.textoPeriodo.includes('Novembro'));
});

test('EvolucaoWorkspace: seleção de período Mês divide semanas corretamente', () => {
  const info = obterInformacoesPeriodo('mes', '2026-11-15');
  assert.equal(info.tipoPeriodo, 'mes');
  assert.equal(info.textoPeriodo, 'Novembro de 2026');
  assert.ok(info.colunasGrafico.length >= 4);
  assert.equal(info.colunasGrafico[0].label, 'Sem 1');
});

test('EvolucaoWorkspace: seleção de período Ano divide em 12 meses', () => {
  const info = obterInformacoesPeriodo('ano', '2026-06-01');
  assert.equal(info.tipoPeriodo, 'ano');
  assert.equal(info.colunasGrafico.length, 12);
  assert.equal(info.colunasGrafico[0].label, 'Jan');
  assert.equal(info.colunasGrafico[11].label, 'Dez');
});

test('EvolucaoWorkspace: cálculo de produtividade de tarefas com proteção de divisão por zero', () => {
  // Cenário com tarefas
  const metricasComTarefas = calcularMetricasEvolucao({
    tarefas: [
      { id: 1, texto: 'T1', concluida: true, prazo: '2026-11-25' },
      { id: 2, texto: 'T2', concluida: false, prazo: '2026-11-26' },
    ],
    tipoPeriodo: 'semana',
    dataCivil: '2026-11-28',
  });

  assert.equal(metricasComTarefas.tarefas.totalNoPeriodo, 2);
  assert.equal(metricasComTarefas.tarefas.concluidasNoPeriodo, 1);
  assert.equal(metricasComTarefas.tarefas.pendentesNoPeriodo, 1);
  assert.equal(metricasComTarefas.tarefas.taxaConclusao, 50);

  // Cenário sem tarefas (divisão por zero)
  const metricasSemTarefas = calcularMetricasEvolucao({
    tarefas: [],
    tipoPeriodo: 'semana',
    dataCivil: '2026-11-28',
  });

  assert.equal(metricasSemTarefas.tarefas.totalNoPeriodo, 0);
  assert.equal(metricasSemTarefas.tarefas.concluidasNoPeriodo, 0);
  assert.equal(metricasSemTarefas.tarefas.taxaConclusao, 0);
  assert.equal(metricasSemTarefas.resumoGeral.taxaEvolucaoGeral, 0);
});

test('EvolucaoWorkspace: métricas de mentoria separam claramente realizadas, agendadas e canceladas', () => {
  const reunioes = [
    { id: 1, titulo: 'R1', status: 'REALIZADA', dataHora: '2026-11-24T10:00:00' },
    { id: 2, titulo: 'R2', status: 'AGENDADA', dataHora: '2026-11-26T14:00:00' },
    { id: 3, titulo: 'R3', status: 'CANCELADA', dataHora: '2026-11-27T16:00:00' },
  ];

  const orientacoes = [
    { id: 10, titulo: 'Ori 1', status: 'CONCLUIDA', prazo: '2026-11-25' },
    { id: 11, titulo: 'Ori 2', status: 'PENDENTE', prazo: '2026-11-26' },
  ];

  const metricas = calcularMetricasEvolucao({
    reunioes,
    orientacoes,
    tipoPeriodo: 'semana',
    dataCivil: '2026-11-28',
  });

  assert.equal(metricas.mentoria.reunioesRealizadas, 1);
  assert.equal(metricas.mentoria.reunioesAgendadas, 1);
  assert.equal(metricas.mentoria.reunioesCanceladas, 1);
  assert.equal(metricas.mentoria.totalReunioesNoPeriodo, 3);
  assert.equal(metricas.mentoria.orientacoesConcluidas, 1);
  assert.equal(metricas.mentoria.orientacoesPendentes, 1);
});

test('EvolucaoWorkspace: linha do tempo de conquistas ordena do mais recente para o mais antigo', () => {
  const tarefas = [
    { id: 1, texto: 'Primeira tarefa', concluida: true, prazo: '2026-11-24T09:00:00' },
    { id: 2, texto: 'Última tarefa', concluida: true, prazo: '2026-11-27T17:00:00' },
  ];

  const reunioes = [
    { id: 5, titulo: 'Reunião intermediária', status: 'REALIZADA', dataHora: '2026-11-25T15:00:00' },
  ];

  const metricas = calcularMetricasEvolucao({
    tarefas,
    reunioes,
    tipoPeriodo: 'semana',
    dataCivil: '2026-11-28',
  });

  assert.equal(metricas.conquistas.length, 3);
  assert.equal(metricas.conquistas[0].titulo, 'Última tarefa'); // 27/11 mais recente primeiro
  assert.equal(metricas.conquistas[1].titulo, 'Reunião intermediária'); // 25/11
  assert.equal(metricas.conquistas[2].titulo, 'Primeira tarefa'); // 24/11
});

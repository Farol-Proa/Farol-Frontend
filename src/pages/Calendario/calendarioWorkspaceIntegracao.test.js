import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decomporDataCivil,
  obterDiasDoMes,
  obterDiasDaSemana,
  obterMesesDoAno,
  obterTextoPeriodo,
  navegarPeriodo,
  agruparTarefasPorData,
  filtrarTarefasPorTermo,
} from './calendarUtils.js';
import {
  extrairDataCivil,
  formatarHorarioPrazo,
  formatarPrazo,
} from '../../dashboard/taskDates.js';

test('integração Workspace: tarefas da árvore de objetivos são agrupadas por data e preservam contexto', () => {
  const tarefas = [
    {
      id: 1,
      texto: 'Estudar arquitetura React',
      descricao: 'Verificar patterns e hooks',
      concluida: false,
      prazo: '2026-11-28T09:00:00',
      objetivoId: 10,
      objetivoNome: 'Frontend Master',
      etapaId: 20,
      etapaNome: 'Ilha dos Fundamentos',
    },
    {
      id: 2,
      texto: 'Praticar estilização CSS',
      descricao: '',
      concluida: true,
      prazo: '2026-11-28',
      objetivoId: 10,
      objetivoNome: 'Frontend Master',
      etapaId: 21,
      etapaNome: 'Ilha dos Estilos',
    },
    {
      id: 3,
      texto: 'Configurar rotas e navegação',
      descricao: 'Integrar páginas com sidebar',
      concluida: false,
      prazo: '2026-11-30T16:45:00',
      objetivoId: 11,
      objetivoNome: 'App Farol',
      etapaId: 30,
      etapaNome: 'Ilha de Navegação',
    },
  ];

  const mapa = agruparTarefasPorData(tarefas);

  // 28/11/2026 tem 2 tarefas (uma com hora, uma sem hora)
  const tarefas28 = mapa.get('2026-11-28');
  assert.equal(tarefas28.length, 2);
  assert.equal(tarefas28[0].objetivoNome, 'Frontend Master');
  assert.equal(tarefas28[0].etapaNome, 'Ilha dos Fundamentos');
  assert.equal(formatarHorarioPrazo(tarefas28[0].prazo), '09:00');
  assert.equal(formatarPrazo(tarefas28[0].prazo), '28/11/2026');

  // Payload de navegação para a Ilha
  const payloadIlha = {
    objetivoId: tarefas28[0].objetivoId,
    etapaId: tarefas28[0].etapaId,
    tarefaId: tarefas28[0].id,
  };
  assert.deepEqual(payloadIlha, { objetivoId: 10, etapaId: 20, tarefaId: 1 });
});

test('visualizações do workspace: visão Mês calcula semanas dinamicamente (4, 5 e 6 semanas) para evitar corte', () => {
  // 4 semanas: Fev/2021
  const diasFev2021 = obterDiasDoMes(2021, 1);
  const semanasFev2021 = Math.max(4, Math.ceil(diasFev2021.length / 7));
  assert.equal(semanasFev2021, 4);

  // 5 semanas: Fev/2026
  const diasFev2026 = obterDiasDoMes(2026, 1);
  const semanasFev2026 = Math.max(4, Math.ceil(diasFev2026.length / 7));
  assert.equal(semanasFev2026, 5);

  // 6 semanas: Nov/2026
  const diasNov2026 = obterDiasDoMes(2026, 10);
  const semanasNov2026 = Math.max(4, Math.ceil(diasNov2026.length / 7));
  assert.equal(semanasNov2026, 6);

  // 6 semanas: Ago/2026
  const diasAgo2026 = obterDiasDoMes(2026, 7);
  const semanasAgo2026 = Math.max(4, Math.ceil(diasAgo2026.length / 7));
  assert.equal(semanasAgo2026, 6);

  // Nenhum dia é omitido na última semana
  assert.equal(diasNov2026[diasNov2026.length - 1].dia, 6); // Dezembro 6 completando a 6ª linha
});

test('visualizações do workspace: visão Mês distribui tarefas nos dias corretos', () => {
  const tarefas = [
    { id: 1, texto: 'T1', prazo: '2026-11-05' },
    { id: 2, texto: 'T2', prazo: '2026-11-28' },
  ];
  const mapa = agruparTarefasPorData(tarefas);
  const diasMes = obterDiasDoMes(2026, 10); // Novembro 2026

  const dia05 = diasMes.find((d) => d.dataFormatada === '2026-11-05');
  const dia28 = diasMes.find((d) => d.dataFormatada === '2026-11-28');
  const dia12 = diasMes.find((d) => d.dataFormatada === '2026-11-12');

  assert.ok(dia05);
  assert.equal(mapa.get(dia05.dataFormatada).length, 1);
  assert.ok(dia28);
  assert.equal(mapa.get(dia28.dataFormatada).length, 1);
  assert.equal(mapa.get(dia12.dataFormatada), undefined);
});

test('visualizações do workspace: visão Semana agrupa tarefas nos 7 dias de Seg a Dom', () => {
  const tarefas = [
    { id: 1, texto: 'Segunda Tarefa', prazo: '2026-11-23' },
    { id: 2, texto: 'Sábado Tarefa', prazo: '2026-11-28T10:00:00' },
  ];
  const mapa = agruparTarefasPorData(tarefas);
  const semana = obterDiasDaSemana('2026-11-28');

  assert.equal(semana.length, 7);
  // Segunda-feira 23/11
  assert.equal(semana[0].dataFormatada, '2026-11-23');
  assert.equal(mapa.get(semana[0].dataFormatada).length, 1);

  // Sábado 28/11
  assert.equal(semana[5].dataFormatada, '2026-11-28');
  assert.equal(mapa.get(semana[5].dataFormatada).length, 1);

  // Domingo 29/11
  assert.equal(mapa.has(semana[6].dataFormatada), false);
});

test('visualizações do workspace: visão Dia separa tarefas com horário e sem horário', () => {
  const tarefas = [
    { id: 1, texto: 'Consulta', prazo: '2026-11-28T14:30:00', concluida: false },
    { id: 2, texto: 'Reunião', prazo: '2026-11-28T09:00:00', concluida: true },
    { id: 3, texto: 'Leitura geral', prazo: '2026-11-28', concluida: false },
  ];

  const mapa = agruparTarefasPorData(tarefas);
  const tarefasDia = mapa.get('2026-11-28');

  const comHorario = tarefasDia
    .filter((t) => formatarHorarioPrazo(t.prazo))
    .sort((a, b) => a.prazo.localeCompare(b.prazo));
  const semHorario = tarefasDia.filter((t) => !formatarHorarioPrazo(t.prazo));

  assert.equal(comHorario.length, 2);
  assert.equal(comHorario[0].texto, 'Reunião'); // 09:00 vem antes de 14:30
  assert.equal(comHorario[1].texto, 'Consulta');

  assert.equal(semHorario.length, 1);
  assert.equal(semHorario[0].texto, 'Leitura geral');
});

test('visualizações do workspace: visão Ano computa total de tarefas para cada um dos 12 meses', () => {
  const tarefas = [
    { id: 1, texto: 'Janeiro task', prazo: '2026-01-15' },
    { id: 2, texto: 'Novembro task 1', prazo: '2026-11-10' },
    { id: 3, texto: 'Novembro task 2', prazo: '2026-11-28' },
  ];

  const mapa = agruparTarefasPorData(tarefas);
  const meses = obterMesesDoAno(2026);

  let totalJan = 0;
  for (const d of obterDiasDoMes(2026, 0)) {
    if (!d.foraDoMes && mapa.has(d.dataFormatada)) totalJan += mapa.get(d.dataFormatada).length;
  }
  assert.equal(totalJan, 1);

  let totalNov = 0;
  for (const d of obterDiasDoMes(2026, 10)) {
    if (!d.foraDoMes && mapa.has(d.dataFormatada)) totalNov += mapa.get(d.dataFormatada).length;
  }
  assert.equal(totalNov, 2);
});

test('busca em tempo real filtra tarefas com acentos, maiúsculas e tarefas sem prazo', () => {
  const tarefas = [
    {
      id: 1,
      texto: 'Aprender Autenticação e Autorização',
      descricao: 'Configurar tokens JWT',
      objetivoNome: 'Segurança',
      etapaNome: 'Módulo Auth',
      prazo: '2026-11-28T10:00:00',
    },
    {
      id: 2,
      texto: 'Criar modelo de banco de dados',
      descricao: '',
      objetivoNome: 'Banco de Dados',
      etapaNome: 'PostgreSQL',
      prazo: null, // Tarefa sem prazo cadastrado
    },
    {
      id: 3,
      texto: 'Implementação de testes E2E',
      descricao: 'Verificar Cypress e Playwright',
      objetivoNome: 'Qualidade de Software',
      etapaNome: 'Testes',
      prazo: '2026-12-05',
    },
  ];

  // Busca sem acento encontra título com acento
  const buscaAutenticacao = filtrarTarefasPorTermo(tarefas, 'autenticacao');
  assert.equal(buscaAutenticacao.length, 1);
  assert.equal(buscaAutenticacao[0].id, 1);

  // Busca maiúscula com acento
  const buscaMaiuscula = filtrarTarefasPorTermo(tarefas, 'AUTORIZAÇÃO');
  assert.equal(buscaMaiuscula.length, 1);
  assert.equal(buscaMaiuscula[0].id, 1);

  // Tarefa sem prazo é encontrada normalmente na busca
  const buscaSemPrazo = filtrarTarefasPorTermo(tarefas, 'banco de dados');
  assert.equal(buscaSemPrazo.length, 1);
  assert.equal(buscaSemPrazo[0].id, 2);

  // Busca inexistente
  const buscaInexistente = filtrarTarefasPorTermo(tarefas, 'termo_inexistente');
  assert.equal(buscaInexistente.length, 0);

  // Busca vazia retorna todas as tarefas
  assert.equal(filtrarTarefasPorTermo(tarefas, '').length, 3);
});

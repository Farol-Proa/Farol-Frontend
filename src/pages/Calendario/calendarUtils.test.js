import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decomporDataCivil,
  obterDiasDoMes,
  obterDiasDaSemana,
  obterTextoPeriodo,
  navegarPeriodo,
  agruparTarefasPorData,
  filtrarTarefasPorTermo,
  normalizarTexto,
} from './calendarUtils.js';

test('decomporDataCivil extrai ano, mês e dia com precisão sem desvios de fuso', () => {
  const info = decomporDataCivil('2026-11-28');
  assert.equal(info.ano, 2026);
  assert.equal(info.mes, 10); // Novembro é índice 10
  assert.equal(info.dia, 28);
  assert.equal(info.dataFormatada, '2026-11-28');
});

test('obterDiasDoMes suporta meses com 4, 5 e 6 semanas sem recortar dias', () => {
  // 4 semanas: Fevereiro de 2021 começa em Segunda-feira e termina em Domingo (28 dias)
  const fev2021 = obterDiasDoMes(2021, 1);
  assert.equal(fev2021.length, 28);
  assert.equal(fev2021.length / 7, 4);
  assert.equal(fev2021[0].dataFormatada, '2021-02-01');
  assert.equal(fev2021[27].dataFormatada, '2021-02-28');

  // 5 semanas: Fevereiro de 2026 (1º de Fev é Domingo, 28 de Fev é Sábado -> 35 dias com padding)
  const fev2026 = obterDiasDoMes(2026, 1);
  assert.equal(fev2026.length, 35);
  assert.equal(fev2026.length / 7, 5);
  const diasFevCorrente = fev2026.filter((d) => !d.foraDoMes);
  assert.equal(diasFevCorrente.length, 28);

  // 6 semanas: Novembro de 2026 (1º de Nov é Domingo, 30 de Nov é Segunda -> 42 dias com padding)
  const nov2026 = obterDiasDoMes(2026, 10);
  assert.equal(nov2026.length, 42);
  assert.equal(nov2026.length / 7, 6);
  const diasNovCorrente = nov2026.filter((d) => !d.foraDoMes);
  assert.equal(diasNovCorrente.length, 30);
  assert.equal(diasNovCorrente[0].dataFormatada, '2026-11-01');
  assert.equal(diasNovCorrente[29].dataFormatada, '2026-11-30');
});

test('obterDiasDaSemana retorna 7 dias de Segunda a Domingo contendo a data informada', () => {
  // 28/11/2026 é Sábado
  const semana = obterDiasDaSemana('2026-11-28');
  assert.equal(semana.length, 7);
  assert.equal(semana[0].nomeAbrev, 'SEG');
  assert.equal(semana[0].dataFormatada, '2026-11-23'); // Segunda-feira
  assert.equal(semana[5].nomeAbrev, 'SÁB');
  assert.equal(semana[5].dataFormatada, '2026-11-28'); // Sábado
  assert.equal(semana[6].nomeAbrev, 'DOM');
  assert.equal(semana[6].dataFormatada, '2026-11-29'); // Domingo
});

test('obterTextoPeriodo descreve o período conforme a visualização', () => {
  assert.equal(obterTextoPeriodo('mes', '2026-11-28'), 'Novembro de 2026');
  assert.equal(obterTextoPeriodo('ano', '2026-11-28'), 'Ano de 2026');
  assert.equal(obterTextoPeriodo('semana', '2026-11-28'), '23 a 29 de Novembro de 2026');
  assert.equal(obterTextoPeriodo('dia', '2026-11-28'), 'Sábado, 28 de Novembro de 2026');
});

test('navegarPeriodo avança e retrocede períodos com segurança', () => {
  assert.equal(navegarPeriodo('dia', '2026-11-28', 1), '2026-11-29');
  assert.equal(navegarPeriodo('dia', '2026-11-28', -1), '2026-11-27');

  assert.equal(navegarPeriodo('semana', '2026-11-28', 1), '2026-12-05');
  assert.equal(navegarPeriodo('semana', '2026-11-28', -1), '2026-11-21');

  assert.equal(navegarPeriodo('mes', '2026-11-28', 1), '2026-12-01');
  assert.equal(navegarPeriodo('mes', '2026-11-28', -1), '2026-10-01');

  assert.equal(navegarPeriodo('ano', '2026-11-28', 1), '2027-11-28');
});

test('normalizarTexto remove acentos, espaços e converte para minúsculas', () => {
  assert.equal(normalizarTexto('Reunião de Mentoria'), 'reuniao de mentoria');
  assert.equal(normalizarTexto('  AÇÃO & Configuração  '), 'acao & configuracao');
  assert.equal(normalizarTexto('PROGRAMAÇÃO'), 'programacao');
  assert.equal(normalizarTexto(null), '');
  assert.equal(normalizarTexto(undefined), '');
});

test('filtrarTarefasPorTermo realiza busca insensível a maiúsculas e acentos', () => {
  const tarefas = [
    { id: 1, texto: 'Reunião de Alinhamento', objetivoNome: 'Desenvolvimento', etapaNome: 'Sprint 1' },
    { id: 2, texto: 'Prática de Português', objetivoNome: 'Estudos', etapaNome: 'Gramática' },
    { id: 3, texto: 'Configuração do Banco', objetivoNome: 'Backend', etapaNome: 'Database' },
    { id: 4, texto: 'Sem acento simples', objetivoNome: 'Geral', etapaNome: 'Geral' },
  ];

  // Busca sem acento encontrando palavra com acento
  const res1 = filtrarTarefasPorTermo(tarefas, 'reuniao');
  assert.equal(res1.length, 1);
  assert.equal(res1[0].id, 1);

  // Busca com acento encontrando palavra com acento
  const res2 = filtrarTarefasPorTermo(tarefas, 'reunião');
  assert.equal(res2.length, 1);
  assert.equal(res2[0].id, 1);

  // Busca maiúscula
  const res3 = filtrarTarefasPorTermo(tarefas, 'PORTUGUES');
  assert.equal(res3.length, 1);
  assert.equal(res3[0].id, 2);

  // Busca por objetivo ou ilha
  const res4 = filtrarTarefasPorTermo(tarefas, 'gramatica');
  assert.equal(res4.length, 1);
  assert.equal(res4[0].id, 2);

  // Busca vazia retorna todas as tarefas
  assert.equal(filtrarTarefasPorTermo(tarefas, '').length, 4);
  assert.equal(filtrarTarefasPorTermo(tarefas, '   ').length, 4);

  // Busca sem resultados retorna array vazio
  assert.equal(filtrarTarefasPorTermo(tarefas, 'termo_inexistente').length, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  avancarMesCalendario,
  extrairDataCivil,
  filtrarTarefasPorPrazo,
  formatarHorarioPrazo,
  formatarPrazo,
  mapearTarefa,
} from './taskDates.js';

test('mapeia prazo de resposta sem conversão de fuso', () => {
  const tarefa = mapearTarefa({ id: 1, titulo: 'Entregar', concluida: false, prazo: '2026-11-20' });

  assert.equal(tarefa.prazo, '2026-11-20');
});

test('mapeia tarefa sem prazo como vazio', () => {
  const tarefa = mapearTarefa({ id: 2, titulo: 'Estudar', concluida: false, prazo: null });

  assert.equal(tarefa.prazo, '');
});

test('extrairDataCivil suporta formato YYYY-MM-DD e YYYY-MM-DDTHH:mm:ss', () => {
  assert.equal(extrairDataCivil('2026-11-28'), '2026-11-28');
  assert.equal(extrairDataCivil('2026-11-28T14:30:00'), '2026-11-28');
  assert.equal(extrairDataCivil('2026-11-28T09:15'), '2026-11-28');
  assert.equal(extrairDataCivil('2026-11-28 20:00:00'), '2026-11-28');
  assert.equal(extrairDataCivil(''), '');
  assert.equal(extrairDataCivil(null), '');
  assert.equal(extrairDataCivil(undefined), '');
  assert.equal(extrairDataCivil('data-invalida'), '');
});

test('formatarHorarioPrazo extrai hora e minuto quando presentes', () => {
  assert.equal(formatarHorarioPrazo('2026-11-28T14:30:00'), '14:30');
  assert.equal(formatarHorarioPrazo('2026-11-28T08:05'), '08:05');
  assert.equal(formatarHorarioPrazo('2026-11-28 19:45:00'), '19:45');
  assert.equal(formatarHorarioPrazo('2026-11-28'), '');
  assert.equal(formatarHorarioPrazo(''), '');
  assert.equal(formatarHorarioPrazo(null), '');
});

test('formatarPrazo formata sem vazar horario', () => {
  assert.equal(formatarPrazo('2026-11-28'), '28/11/2026');
  assert.equal(formatarPrazo('2026-11-28T14:30:00'), '28/11/2026');
  assert.equal(formatarPrazo('2026-11-20'), '20/11/2026');
  assert.equal(formatarPrazo(null), '');
  assert.equal(formatarPrazo(''), '');
  assert.equal(formatarPrazo('texto-invalido'), '');
});

test('filtra tarefas pela data civil mesmo quando possuem horario', () => {
  const tarefas = [
    { id: 1, texto: 'Tarefa 1', prazo: '2026-11-28' },
    { id: 2, texto: 'Tarefa 2 com hora', prazo: '2026-11-28T14:30:00' },
    { id: 3, texto: 'Tarefa 3 outro dia', prazo: '2026-11-29T10:00:00' },
    { id: 4, texto: 'Tarefa sem prazo', prazo: '' },
    { id: 5, texto: 'Tarefa prazo nulo', prazo: null },
  ];

  const resultado = filtrarTarefasPorPrazo(tarefas, '2026-11-28');
  assert.equal(resultado.length, 2);
  assert.deepEqual(resultado.map((t) => t.id), [1, 2]);

  // Tarefas sem prazo ou outro dia não aparecem
  assert.deepEqual(filtrarTarefasPorPrazo(tarefas, '2026-11-29').map((t) => t.id), [3]);
  assert.deepEqual(filtrarTarefasPorPrazo(tarefas, '2026-11-30'), []);
  assert.deepEqual(filtrarTarefasPorPrazo(tarefas, ''), []);
});

test('preserva tarefas concluidas e pendentes com status distinto', () => {
  const tarefaConcluida = mapearTarefa({
    id: 10,
    titulo: 'Revisar PR',
    concluida: true,
    prazo: '2026-11-28T16:00:00',
  });
  const tarefaPendente = mapearTarefa({
    id: 11,
    titulo: 'Iniciar estudos',
    concluida: false,
    prazo: '2026-11-28T18:00:00',
  });

  assert.equal(tarefaConcluida.concluida, true);
  assert.equal(tarefaPendente.concluida, false);

  const filtradas = filtrarTarefasPorPrazo([tarefaConcluida, tarefaPendente], '2026-11-28');
  assert.equal(filtradas.length, 2);
  assert.equal(filtradas[0].concluida, true);
  assert.equal(filtradas[1].concluida, false);
});

test('garante unicidade sem duplicar tarefas ao filtrar', () => {
  const tarefas = [
    { id: 1, prazo: '2026-11-28T10:00:00' },
    { id: 2, prazo: '2026-11-28T15:00:00' },
  ];

  const doDia = filtrarTarefasPorPrazo(tarefas, '2026-11-28');
  const ids = doDia.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('limpa a data selecionada ao navegar para outro mês', () => {
  const estado = avancarMesCalendario(new Date(2026, 10, 1), 1);

  assert.deepEqual(estado, {
    mesExibido: new Date(2026, 11, 1),
    dataSelecionada: '',
  });
});

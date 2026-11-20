import test from 'node:test';
import assert from 'node:assert/strict';
import {
  avancarMesCalendario,
  filtrarTarefasPorPrazo,
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

test('filtra tarefas pela data civil selecionada', () => {
  const tarefas = [
    { id: 1, prazo: '2026-11-20' },
    { id: 2, prazo: '2026-11-21' },
    { id: 3, prazo: '' },
  ];

  assert.deepEqual(filtrarTarefasPorPrazo(tarefas, '2026-11-20'), [tarefas[0]]);
});

test('formata LocalDate em português sem deslocar o dia', () => {
  assert.equal(formatarPrazo('2026-11-20'), '20/11/2026');
  assert.equal(formatarPrazo(null), '');
});

test('limpa a data selecionada ao navegar para outro mês', () => {
  const estado = avancarMesCalendario(new Date(2026, 10, 1), 1);

  assert.deepEqual(estado, {
    mesExibido: new Date(2026, 11, 1),
    dataSelecionada: '',
  });
});

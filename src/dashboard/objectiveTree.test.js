import test from 'node:test';
import assert from 'node:assert/strict';
import { mapearArvoreObjetivos } from './objectiveTree.js';

test('mapeia uma árvore mantendo status, progresso e prazo das tarefas', () => {
  const objetivos = mapearArvoreObjetivos([
    {
      id: 1,
      titulo: 'Aprender Java',
      descricao: 'Objetivo',
      status: 'EM_ANDAMENTO',
      prazo: null,
      prioridade: 'ALTA',
      etapas: [
        {
          id: 2,
          titulo: 'Fundamentos',
          descricao: 'Ilha',
          status: 'EM_ANDAMENTO',
          ordem: 0,
          tarefas: [
            {
              id: 3,
              titulo: 'Estudar classes',
              status: 'NAO_INICIADA',
              concluida: false,
              prazo: '2026-11-20',
            },
          ],
        },
      ],
    },
  ]);

  assert.deepEqual(objetivos[0].etapas[0].tarefas[0], {
    id: 3,
    texto: 'Estudar classes',
    descricao: undefined,
    status: 'NAO_INICIADA',
    concluida: false,
    prazo: '2026-11-20',
  });
  assert.equal(objetivos[0].etapas[0].status, 'EM_ANDAMENTO');
});

test('preserva objetivos e ilhas que ainda não têm elementos filhos', () => {
  const objetivos = mapearArvoreObjetivos([
    { id: 1, titulo: 'Novo objetivo', etapas: [] },
    { id: 2, titulo: 'Outro objetivo', etapas: [{ id: 3, titulo: 'Ilha vazia', tarefas: [] }] },
  ]);

  assert.equal(objetivos.length, 2);
  assert.deepEqual(objetivos[0].etapas, []);
  assert.deepEqual(objetivos[1].etapas[0].tarefas, []);
});

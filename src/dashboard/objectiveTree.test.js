import test from 'node:test';
import assert from 'node:assert/strict';
import { mapearArvoreObjetivos, percentualProgressoObjetivo } from './objectiveTree.js';

test('não presume progresso do mapa quando o agregado não o fornece', () => {
  const [mapa] = mapearArvoreObjetivos([{
    id: 1,
    titulo: 'Mapa sem progresso agregado',
    etapas: [{ id: 2, titulo: 'Ilha sem requisitos', progresso: 100, concluida: true }],
  }]);

  assert.equal(percentualProgressoObjetivo(mapa), null);
  assert.deepEqual(mapa.etapas[0].progresso, { percentual: 100, concluida: true });
});

test('aceita percentual agregado somente quando o backend o informa como número', () => {
  assert.equal(percentualProgressoObjetivo({ progresso: { percentual: 35 } }), 35);
  assert.equal(percentualProgressoObjetivo({ progresso: null }), null);
  assert.equal(percentualProgressoObjetivo({}), null);
});

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

test('preserva posicoes, conexoes, conteudo e progresso recebidos do backend', () => {
  const [mapa] = mapearArvoreObjetivos([{
    id: 10,
    titulo: 'Mapa persistido',
    progresso: { percentual: 25 },
    conexoes: [{ id: 80, origemId: 21, destinoId: 22 }],
    ilhas: [{
      id: 21,
      titulo: 'Fundamentos',
      posicaoX: 120,
      posicaoY: 80,
      conteudo: { schemaVersion: 1, blocks: [{ id: 'b1', type: 'paragraph', content: { text: 'Texto' } }] },
      progresso: 50,
      topicos: [{ id: 5, title: 'Variaveis', required: false, concluido: true }],
      tarefas: [{ id: 9, titulo: 'Praticar', obrigatoria: false, concluida: false }],
    }],
  }]);

  assert.deepEqual(mapa.progresso, { percentual: 25 });
  assert.deepEqual(mapa.conexoes, [{ id: 80, origemEtapaId: 21, destinoEtapaId: 22 }]);
  assert.deepEqual(mapa.etapas[0].posicao, { x: 120, y: 80 });
  assert.equal(mapa.etapas[0].topicos[0].obrigatorio, false);
  assert.equal(mapa.etapas[0].topicos[0].titulo, 'Variaveis');
  assert.equal(mapa.etapas[0].tarefas[0].obrigatoria, false);
  assert.deepEqual(mapa.etapas[0].progresso, { percentual: 50, concluida: false });
  assert.equal(mapa.etapas[0].conteudo.blocks[0].content.text, 'Texto');
});

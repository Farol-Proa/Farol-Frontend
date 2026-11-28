import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dadosAtualizacaoNota,
  estadoInicialNotas,
  notasReducer,
  rascunhoNotasSujo,
  extrairTextoDocumento,
  extrairPreviaDocumento,
} from './notasState.js';

const documento = [
  {
    id: 'bloco-1',
    type: 'paragraph',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [{ type: 'text', text: 'Meu texto', styles: {} }],
    children: [],
  },
];

const notaSalva = {
  id: 9,
  titulo: 'Anotações',
  conteudo: documento,
  versaoConteudo: 1,
  revisao: 4,
  objetivoId: 12,
  etapaId: null,
};

test('controla carregamento, lista vazia e falha de carregamento', () => {
  let estado = notasReducer(estadoInicialNotas, { tipo: 'carregamento-iniciado' });
  assert.equal(estado.carregando, true);

  estado = notasReducer(estado, { tipo: 'carregamento-concluido', notas: [] });
  assert.equal(estado.carregando, false);
  assert.deepEqual(estado.notas, []);

  estado = notasReducer(estado, { tipo: 'carregamento-falhou', mensagem: 'Sem conexão.' });
  assert.equal(estado.erro, 'Sem conexão.');
});

test('seleciona uma nota e carrega documento, vínculo e revisão persistida', () => {
  const estado = notasReducer(estadoInicialNotas, {
    tipo: 'selecionar-nota',
    nota: notaSalva,
  });

  assert.equal(estado.idSelecionado, 9);
  assert.equal(estado.titulo, 'Anotações');
  assert.deepEqual(estado.conteudo, documento);
  assert.equal(estado.objetivoId, 12);
  assert.equal(estado.etapaId, null);
  assert.equal(estado.revisao, 4);
  assert.equal(rascunhoNotasSujo(estado), false);
});

test('cria nota com vínculo de ilha sem preencher também o mapa', () => {
  const estado = notasReducer(estadoInicialNotas, {
    tipo: 'criar-rascunho',
    objetivoId: null,
    etapaId: 31,
  });

  assert.equal(estado.notaNova, true);
  assert.equal(estado.objetivoId, null);
  assert.equal(estado.etapaId, 31);
  assert.deepEqual(estado.conteudo, []);

  const alterado = notasReducer(estado, { tipo: 'editar-titulo', titulo: 'Nova nota' });
  assert.equal(rascunhoNotasSujo(alterado), true);
});

test('salvamento de criação seleciona a resposta e usa o ID e revisão do servidor', () => {
  const rascunho = notasReducer(estadoInicialNotas, {
    tipo: 'criar-rascunho',
    objetivoId: 12,
    etapaId: null,
  });
  const editado = notasReducer(rascunho, { tipo: 'editar-titulo', titulo: 'Nova nota' });
  const resposta = { ...notaSalva, id: 10, titulo: 'Nova nota', revisao: 0 };
  const salvo = notasReducer(editado, { tipo: 'nota-criada', nota: resposta });

  assert.equal(salvo.idSelecionado, 10);
  assert.equal(salvo.revisao, 0);
  assert.equal(salvo.sucesso, 'Nota criada.');
  assert.equal(rascunhoNotasSujo(salvo), false);
  assert.equal(dadosAtualizacaoNota(salvo).revisao, 0);
});

test('salvamento substitui a nota e sua revisão pela resposta do servidor', () => {
  let estado = notasReducer(estadoInicialNotas, { tipo: 'selecionar-nota', nota: notaSalva });
  estado = notasReducer(estado, { tipo: 'editar-titulo', titulo: 'Título editado' });

  const dados = dadosAtualizacaoNota(estado);
  assert.equal(dados.revisao, 4);
  assert.equal(dados.objetivoId, 12);
  assert.equal(dados.etapaId, null);

  const resposta = { ...notaSalva, titulo: 'Título editado', revisao: 5 };
  const salvo = notasReducer(estado, { tipo: 'nota-atualizada', nota: resposta });
  assert.equal(salvo.revisao, 5);
  assert.equal(salvo.tituloSalvo, 'Título editado');
  assert.equal(rascunhoNotasSujo(salvo), false);
});

test('excluir a nota selecionada remove-a da lista e limpa o editor', () => {
  let estado = notasReducer(estadoInicialNotas, {
    tipo: 'carregamento-concluido',
    notas: [notaSalva],
  });
  estado = notasReducer(estado, { tipo: 'selecionar-nota', nota: notaSalva });
  estado = notasReducer(estado, { tipo: 'nota-excluida', id: notaSalva.id });

  assert.deepEqual(estado.notas, []);
  assert.equal(estado.idSelecionado, null);
  assert.equal(estado.titulo, '');
  assert.deepEqual(estado.conteudo, []);
});

test('conflito 409 conserva título e documento locais sem alterar revisão', () => {
  let estado = notasReducer(estadoInicialNotas, { tipo: 'selecionar-nota', nota: notaSalva });
  estado = notasReducer(estado, { tipo: 'editar-titulo', titulo: 'Rascunho local' });
  estado = notasReducer(estado, { tipo: 'editar-conteudo', conteudo: [...documento, { id: 'bloco-2', type: 'paragraph', content: [], children: [] }] });

  const tituloLocal = estado.titulo;
  const conteudoLocal = estado.conteudo;
  const estadoComConflito = notasReducer(estado, {
    tipo: 'salvamento-falhou',
    conflito: true,
    mensagem: 'Conflito',
  });

  assert.equal(estadoComConflito.conflito, true);
  assert.equal(estadoComConflito.revisao, 4);
  assert.equal(estadoComConflito.titulo, tituloLocal);
  assert.deepEqual(estadoComConflito.conteudo, conteudoLocal);
  assert.equal(rascunhoNotasSujo(estadoComConflito), true);
  assert.match(estadoComConflito.erro, /outra sessão/);
});

test('falha comum ao salvar conserva o rascunho para nova tentativa manual', () => {
  let estado = notasReducer(estadoInicialNotas, { tipo: 'selecionar-nota', nota: notaSalva });
  estado = notasReducer(estado, { tipo: 'editar-titulo', titulo: 'Rascunho local' });
  estado = notasReducer(estado, {
    tipo: 'salvamento-falhou',
    conflito: false,
    mensagem: 'Servidor indisponível.',
  });

  assert.equal(estado.titulo, 'Rascunho local');
  assert.equal(estado.erro, 'Servidor indisponível.');
  assert.equal(rascunhoNotasSujo(estado), true);
});

test('alterar associação de ilha ou mapa torna rascunho de nota existente sujo', () => {
  let estado = notasReducer(estadoInicialNotas, { tipo: 'selecionar-nota', nota: notaSalva });
  assert.equal(rascunhoNotasSujo(estado), false);

  estado = notasReducer(estado, { tipo: 'alterar-associacao', objetivoId: null, etapaId: 55 });
  assert.equal(rascunhoNotasSujo(estado), true);
  assert.equal(estado.etapaId, 55);
});

test('extrairTextoDocumento e extrairPreviaDocumento extraem texto de blocos BlockNote', () => {
  assert.equal(extrairTextoDocumento(null), '');
  assert.equal(extrairTextoDocumento([]), '');
  assert.equal(extrairTextoDocumento(documento), 'Meu texto');
  assert.equal(extrairPreviaDocumento(documento), 'Meu texto');
  assert.equal(extrairPreviaDocumento([]), 'Nota sem conteúdo');
});

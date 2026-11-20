import test from 'node:test';
import assert from 'node:assert/strict';
import { criarControleSessao } from './sessionVersion.js';

test('invalidar a sessão torna respostas iniciadas anteriormente obsoletas', () => {
  const sessao = criarControleSessao();
  const requisicaoAnterior = sessao.capturar();

  sessao.invalidar();

  assert.equal(sessao.aindaAtual(requisicaoAnterior), false);
  assert.equal(sessao.aindaAtual(sessao.capturar()), true);
});

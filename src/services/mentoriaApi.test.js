import test from 'node:test';
import assert from 'node:assert/strict';
import * as mentoriaApi from './mentoriaApi.js';

test('mentoriaApi encapsula endpoints com sucesso', async (t) => {
  const chamadas = [];
  const fetchOriginal = globalThis.fetch;
  const storageOriginal = globalThis.sessionStorage;

  globalThis.sessionStorage = {
    getItem(key) {
      if (key === 'token') return 'mock-jwt-token';
      return null;
    },
    removeItem() {},
    setItem() {},
  };

  globalThis.fetch = async (url, options = {}) => {
    chamadas.push({ url, options });
    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({ ok: true });
      },
    };
  };

  t.after(() => {
    globalThis.fetch = fetchOriginal;
    globalThis.sessionStorage = storageOriginal;
  });

  await mentoriaApi.obterVinculoAtivoMentorado();
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/meu-vinculo'), true);

  await mentoriaApi.listarMentoresDisponiveis();
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/mentores'), true);

  await mentoriaApi.enviarSolicitacaoMentoria({ mentorId: 1, objetivo: 'Aprender React' });
  assert.equal(chamadas[chamadas.length - 1].options.method, 'POST');
  assert.equal(JSON.parse(chamadas[chamadas.length - 1].options.body).mentorId, 1);

  await mentoriaApi.listarMensagensMentoria(10);
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/vinculos/10/mensagens'), true);

  await mentoriaApi.enviarMensagemMentoria(10, 'Olá mentor!');
  assert.equal(chamadas[chamadas.length - 1].options.method, 'POST');
  assert.equal(JSON.parse(chamadas[chamadas.length - 1].options.body).conteudo, 'Olá mentor!');

  await mentoriaApi.listarReunioesMentoria(10);
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/vinculos/10/reunioes'), true);

  await mentoriaApi.criarReuniaoMentoria(10, { titulo: 'Reunião 1' });
  assert.equal(chamadas[chamadas.length - 1].options.method, 'POST');

  await mentoriaApi.listarOrientacoesMentoria(10);
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/vinculos/10/orientacoes'), true);

  await mentoriaApi.criarOrientacaoMentoria(10, { titulo: 'Orientação 1', conteudo: 'Conteúdo' });
  assert.equal(chamadas[chamadas.length - 1].options.method, 'POST');

  await mentoriaApi.listarObjetivosDoMentorado(5);
  assert.equal(chamadas[chamadas.length - 1].url.endsWith('/mentoria/mentor/mentorados/5/objetivos'), true);
});

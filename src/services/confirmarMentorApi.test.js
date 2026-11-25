import test from 'node:test';
import assert from 'node:assert/strict';
import { requisicaoAPI } from './api.js';

test('rotas de decisao administrativa de mentoria sao publicas e nao enviam Authorization desnecessario', async () => {
  const chamadas = [];
  const originalFetch = globalThis.fetch;
  const originalSessionStorage = globalThis.sessionStorage;

  globalThis.sessionStorage = {
    getItem(key) {
      if (key === 'token') return 'dummy-expired-token';
      return null;
    },
    setItem() {},
    removeItem() {},
  };

  globalThis.fetch = async (url, options) => {
    chamadas.push({ url, options });
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ valido: true, nome: 'Mentor Teste' }),
    };
  };

  try {
    await requisicaoAPI('/mentoria/decisao-admin/detalhes?token=abc-123');

    await requisicaoAPI('/mentoria/decisao-admin/executar', {
      method: 'POST',
      body: JSON.stringify({ token: 'abc-123' }),
    });

    assert.equal(chamadas.length, 2);
    assert.equal(chamadas[0].options.headers.Authorization, undefined);
    assert.equal(chamadas[1].options.headers.Authorization, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.sessionStorage = originalSessionStorage;
  }
});

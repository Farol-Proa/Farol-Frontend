import test from 'node:test';
import assert from 'node:assert/strict';
import { requisicaoAPI } from './api.js';

test('rotas publicas de verificacao e reenvio de codigo nao enviam Authorization', async () => {
  const chamadas = [];
  const originalFetch = globalThis.fetch;
  const originalSessionStorage = globalThis.sessionStorage;

  globalThis.sessionStorage = {
    getItem(key) {
      if (key === 'token') return 'dummy-token-123';
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
      text: async () => JSON.stringify({ mensagem: 'Sucesso' }),
    };
  };

  try {
    await requisicaoAPI('/usuarios/verificar-codigo', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@farol.local', codigo: '123456' }),
    });

    await requisicaoAPI('/usuarios/reenviar-codigo', {
      method: 'POST',
      body: JSON.stringify({ email: 'teste@farol.local' }),
    });

    assert.equal(chamadas.length, 2);
    assert.equal(chamadas[0].options.headers.Authorization, undefined);
    assert.equal(chamadas[1].options.headers.Authorization, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.sessionStorage = originalSessionStorage;
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCIAS_PADRAO,
  obterPreferencias,
  salvarPreferencias,
  restaurarPreferenciasPadrao,
  mesclarPreferencias,
  obterChaveStorage,
} from './preferenciasUsuario.js';

// Setup mock de localStorage para ambiente Node puro
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MemoryStorage();

test('preferenciasUsuario: retorna configurações padrão quando localStorage estiver vazio', () => {
  const usuario = { id: 999, email: 'teste@farol.com' };
  const chave = obterChaveStorage(usuario);
  globalThis.localStorage.removeItem(chave);

  const prefs = obterPreferencias(usuario);
  assert.deepEqual(prefs.painel, PREFERENCIAS_PADRAO.painel);
  assert.equal(prefs.painel.notasDiarias, true);
  assert.equal(prefs.painel.calendario, true);
  assert.equal(prefs.painel.fraseDoDia, true);
});

test('preferenciasUsuario: mescla alterações parciais mantendo campos não modificados', () => {
  const base = {
    painel: { notasDiarias: true, calendario: true },
    jornada: { modoVisualizacao: 'completo' },
    ilhas: { estiloOceano: 'oceano-noturno' },
    notificacoes: { lembretesTarefas: true },
  };

  const overrides = {
    painel: { calendario: false },
    notificacoes: { lembretesTarefas: false },
  };

  const resultado = mesclarPreferencias(base, overrides);
  assert.equal(resultado.painel.notasDiarias, true);
  assert.equal(resultado.painel.calendario, false);
  assert.equal(resultado.jornada.modoVisualizacao, 'completo');
  assert.equal(resultado.notificacoes.lembretesTarefas, false);
});

test('preferenciasUsuario: salva e recupera preferências com persistência', () => {
  const usuario = { id: 123, email: 'douglas@farol.com' };
  const chave = obterChaveStorage(usuario);
  globalThis.localStorage.removeItem(chave);

  const res = salvarPreferencias(
    {
      painel: {
        fraseDoDia: false,
        tarefasSemana: false,
      },
      ilhas: {
        estiloOceano: 'oceano-profundo',
      },
    },
    usuario
  );

  assert.equal(res.sucesso, true);

  const recuperadas = obterPreferencias(usuario);
  assert.equal(recuperadas.painel.fraseDoDia, false);
  assert.equal(recuperadas.painel.tarefasSemana, false);
  assert.equal(recuperadas.painel.notasDiarias, true); // padrão preservado
  assert.equal(recuperadas.ilhas.estiloOceano, 'oceano-profundo');

  // restaura padrão
  restaurarPreferenciasPadrao(usuario);
  const restauradas = obterPreferencias(usuario);
  assert.equal(restauradas.painel.fraseDoDia, true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCIAS_PADRAO,
  obterPreferencias,
  salvarPreferencias,
  restaurarPreferenciasPadrao,
  mesclarPreferencias,
  obterChaveStorage,
  obterUltimoMapaAcessado,
  salvarUltimoMapaAcessado,
  resolverObjetivoInicial,
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

test('preferenciasUsuario: persiste e recupera o último mapa acessado por usuário', () => {
  const usuario = { id: 77, email: 'mapas@farol.com' };
  salvarUltimoMapaAcessado(10, usuario);
  assert.equal(obterUltimoMapaAcessado(usuario), '10');

  salvarUltimoMapaAcessado('mapa-react', usuario);
  assert.equal(obterUltimoMapaAcessado(usuario), 'mapa-react');
});

test('preferenciasUsuario: resolverObjetivoInicial prioriza objetivoSelecionado explícito', () => {
  const objetivos = [
    { id: 1, nome: 'Objetivo 1' },
    { id: 2, nome: 'Objetivo 2' },
    { id: 3, nome: 'Objetivo 3' },
  ];

  const resultado = resolverObjetivoInicial({
    objetivos,
    objetivoSelecionado: 3,
    mapaPadraoId: 1,
    ultimoMapaAcessadoId: 2,
  });

  assert.equal(resultado, 3);
});

test('preferenciasUsuario: resolverObjetivoInicial respeita mapaPadraoId configurado', () => {
  const objetivos = [
    { id: 10, nome: 'Node.js' },
    { id: 20, nome: 'Spring Boot' },
  ];

  const resultado = resolverObjetivoInicial({
    objetivos,
    objetivoSelecionado: null,
    mapaPadraoId: '20',
    ultimoMapaAcessadoId: '10',
  });

  assert.equal(resultado, 20);
});

test('preferenciasUsuario: resolverObjetivoInicial usa ultimoMapaAcessadoId quando mapaPadraoId for "ultimo"', () => {
  const objetivos = [
    { id: 'a', nome: 'Frontend' },
    { id: 'b', nome: 'Backend' },
  ];

  const resultado = resolverObjetivoInicial({
    objetivos,
    objetivoSelecionado: null,
    mapaPadraoId: 'ultimo',
    ultimoMapaAcessadoId: 'b',
  });

  assert.equal(resultado, 'b');
});

test('preferenciasUsuario: resolverObjetivoInicial faz fallback gracioso se mapa configurado foi excluído', () => {
  const objetivos = [
    { id: 100, nome: 'DevOps' },
    { id: 200, nome: 'Cloud' },
  ];

  // mapa configurado 999 foi excluído; último acessado 200 ainda existe
  const resultado = resolverObjetivoInicial({
    objetivos,
    objetivoSelecionado: null,
    mapaPadraoId: '999',
    ultimoMapaAcessadoId: '200',
  });

  assert.equal(resultado, 200);

  // tanto mapa configurado quanto último acessado foram excluídos; cai no primeiro objetivo
  const fallbackPrimeiro = resolverObjetivoInicial({
    objetivos,
    objetivoSelecionado: null,
    mapaPadraoId: '999',
    ultimoMapaAcessadoId: '888',
  });

  assert.equal(fallbackPrimeiro, 100);
});

test('preferenciasUsuario: resolverObjetivoInicial retorna null se não houver objetivos', () => {
  assert.equal(resolverObjetivoInicial({ objetivos: [] }), null);
  assert.equal(resolverObjetivoInicial({ objetivos: null }), null);
});

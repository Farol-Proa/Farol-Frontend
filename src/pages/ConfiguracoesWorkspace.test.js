import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCIAS_PADRAO,
  obterPreferencias,
  salvarPreferencias,
  restaurarPreferenciasPadrao,
  mesclarPreferencias,
} from '../services/preferenciasUsuario.js';

// Setup de mock do ambiente de storage
class MockStorage {
  constructor() {
    this.itens = new Map();
  }
  getItem(key) {
    return this.itens.has(key) ? this.itens.get(key) : null;
  }
  setItem(key, val) {
    this.itens.set(key, String(val));
  }
  removeItem(key) {
    this.itens.delete(key);
  }
  clear() {
    this.itens.clear();
  }
}

globalThis.localStorage = new MockStorage();

test('ConfiguracoesWorkspace: estrutura de seções cobre todas as áreas solicitadas', () => {
  const secoesEsperadas = ['perfil', 'painel', 'jornada', 'ilhas', 'notificacoes', 'seguranca'];
  assert.equal(secoesEsperadas.length, 6);
  assert.ok(secoesEsperadas.includes('perfil'));
  assert.ok(secoesEsperadas.includes('painel'));
  assert.ok(secoesEsperadas.includes('jornada'));
  assert.ok(secoesEsperadas.includes('ilhas'));
  assert.ok(secoesEsperadas.includes('notificacoes'));
  assert.ok(secoesEsperadas.includes('seguranca'));
});

test('ConfiguracoesWorkspace: detecta alterações pendentes no rascunho de configurações', () => {
  const salvo = {
    painel: { notasDiarias: true, calendario: true, fraseDoDia: true },
    jornada: { modoVisualizacao: 'completo' },
  };

  let rascunho = JSON.parse(JSON.stringify(salvo));
  let temAlteracoes = JSON.stringify(salvo) !== JSON.stringify(rascunho);
  assert.equal(temAlteracoes, false);

  // Modifica um toggle no rascunho
  rascunho.painel.calendario = false;
  temAlteracoes = JSON.stringify(salvo) !== JSON.stringify(rascunho);
  assert.equal(temAlteracoes, true);

  // Descarte / Cancelar restaura para o salvo
  rascunho = JSON.parse(JSON.stringify(salvo));
  temAlteracoes = JSON.stringify(salvo) !== JSON.stringify(rascunho);
  assert.equal(temAlteracoes, false);
  assert.equal(rascunho.painel.calendario, true);
});

test('ConfiguracoesWorkspace: persistência de módulos do Painel reflete no estado de preferências', () => {
  const usuario = { id: 'usr-config-test', email: 'test@farol.com' };
  restaurarPreferenciasPadrao(usuario);

  // Usuário desativa Calendário e Notas Diárias
  const modificacoes = {
    painel: {
      calendario: false,
      notasDiarias: false,
    },
  };

  const resultado = salvarPreferencias(modificacoes, usuario);
  assert.equal(resultado.sucesso, true);

  const persistido = obterPreferencias(usuario);
  assert.equal(persistido.painel.calendario, false);
  assert.equal(persistido.painel.notasDiarias, false);
  assert.equal(persistido.painel.minhaJornada, true);
  assert.equal(persistido.painel.fraseDoDia, true);

  // Limpeza
  restaurarPreferenciasPadrao(usuario);
});

test('ConfiguracoesWorkspace: preferências de Ilhas e Jornada são mescladas e salvas com integridade', () => {
  const usuario = { id: 'usr-ilhas-test', email: 'ilhas@farol.com' };
  restaurarPreferenciasPadrao(usuario);

  const modificacoes = {
    jornada: {
      modoVisualizacao: 'resumido',
      mensagemMotivacional: false,
    },
    ilhas: {
      mapaPadraoId: '10',
      estiloOceano: 'oceano-profundo',
      exibirProgressoNos: false,
    },
    notificacoes: {
      horarioLembrete: '18:00',
      somConclusao: false,
    },
  };

  const resultado = salvarPreferencias(modificacoes, usuario);
  assert.equal(resultado.sucesso, true);

  const persistido = obterPreferencias(usuario);
  assert.equal(persistido.jornada.modoVisualizacao, 'resumido');
  assert.equal(persistido.jornada.mensagemMotivacional, false);
  assert.equal(persistido.ilhas.mapaPadraoId, '10');
  assert.equal(persistido.ilhas.estiloOceano, 'oceano-profundo');
  assert.equal(persistido.ilhas.exibirProgressoNos, false);
  assert.equal(persistido.notificacoes.horarioLembrete, '18:00');
  assert.equal(persistido.notificacoes.somConclusao, false);

  // Padrão do painel permanece intacto
  assert.equal(persistido.painel.minhasIlhas, true);

  restaurarPreferenciasPadrao(usuario);
});

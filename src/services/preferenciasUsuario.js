export const PREFERENCIAS_PADRAO = Object.freeze({
  painel: Object.freeze({
    notasDiarias: true,
    calendario: true,
    minhaJornada: true,
    minhasIlhas: true,
    tarefasSemana: true,
    fraseDoDia: true,
  }),
  jornada: Object.freeze({
    modoVisualizacao: 'completo', // 'completo' | 'resumido'
    mensagemMotivacional: true,
    destacarStreak: true,
  }),
  ilhas: Object.freeze({
    mapaPadraoId: 'ultimo', // 'ultimo' | string id
    exibirProgressoNos: true,
    exibirBarco: true,
    estiloOceano: 'oceano-noturno', // 'oceano-noturno' | 'oceano-profundo' | 'contraste-suave'
  }),
  notificacoes: Object.freeze({
    lembretesTarefas: true,
    lembretesEstudo: true,
    horarioLembrete: '08:00',
    somConclusao: true,
  }),
});

function obterStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

function obterUsuarioAtual() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return JSON.parse(window.sessionStorage.getItem('usuario') || '{}');
    }
    if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
      return JSON.parse(globalThis.sessionStorage.getItem('usuario') || '{}');
    }
    return {};
  } catch {
    return {};
  }
}

export function obterChaveStorage(usuario = null) {
  const u = usuario || obterUsuarioAtual();
  const idOuEmail = u.id || u.email || 'padrao';
  return `farol:preferencias:${idOuEmail}`;
}

export function mesclarPreferencias(base, overrides) {
  if (!overrides || typeof overrides !== 'object') {
    return { ...base };
  }

  return {
    painel: {
      ...base.painel,
      ...(overrides.painel || {}),
    },
    jornada: {
      ...base.jornada,
      ...(overrides.jornada || {}),
    },
    ilhas: {
      ...base.ilhas,
      ...(overrides.ilhas || {}),
    },
    notificacoes: {
      ...base.notificacoes,
      ...(overrides.notificacoes || {}),
    },
  };
}

export function obterPreferencias(usuario = null) {
  try {
    const storage = obterStorage();
    if (!storage) {
      return JSON.parse(JSON.stringify(PREFERENCIAS_PADRAO));
    }
    const chave = obterChaveStorage(usuario);
    const dados = storage.getItem(chave);
    if (!dados) {
      return JSON.parse(JSON.stringify(PREFERENCIAS_PADRAO));
    }
    const parsed = JSON.parse(dados);
    return mesclarPreferencias(PREFERENCIAS_PADRAO, parsed);
  } catch {
    return JSON.parse(JSON.stringify(PREFERENCIAS_PADRAO));
  }
}

export function salvarPreferencias(novasPreferencias, usuario = null) {
  try {
    const storage = obterStorage();
    const atual = obterPreferencias(usuario);
    const mesclado = mesclarPreferencias(atual, novasPreferencias);

    if (storage) {
      const chave = obterChaveStorage(usuario);
      storage.setItem(chave, JSON.stringify(mesclado));
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('farol:preferencias-atualizadas', {
          detail: mesclado,
        })
      );
    }
    return { sucesso: true, dados: mesclado };
  } catch (erro) {
    return { sucesso: false, erro: erro?.message || 'Erro ao persistir preferências' };
  }
}

export function restaurarPreferenciasPadrao(usuario = null) {
  try {
    const storage = obterStorage();
    if (storage) {
      const chave = obterChaveStorage(usuario);
      storage.removeItem(chave);
    }

    const padrao = JSON.parse(JSON.stringify(PREFERENCIAS_PADRAO));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('farol:preferencias-atualizadas', {
          detail: padrao,
        })
      );
    }
    return { sucesso: true, dados: padrao };
  } catch (erro) {
    return { sucesso: false, erro: erro?.message || 'Erro ao restaurar preferências padrão' };
  }
}

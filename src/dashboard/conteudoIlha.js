/**
 * Utilitários para normalização, validação e manipulação do Guia de Conteúdo das Ilhas.
 * Garante que o conteúdo seja sempre estruturado de forma consistente, seja recebido
 * como string JSON (EtapaRespostaDTO), objeto aninhado ({ conteudo: ... }) ou objeto direto.
 */

export const TIPOS_BLOCOS_PERMITIDOS = [
  'paragraph',
  'heading',
  'list',
  'callout',
  'code',
  'reference',
];

export function gerarIdBloco() {
  return 'bloco_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

export function normalizarUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validarUrlSegura(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Normaliza um bloco individual, garantindo id, type e estrutura content adequados.
 */
export function normalizarBloco(bloco) {
  if (!bloco || typeof bloco !== 'object') {
    return {
      id: gerarIdBloco(),
      type: 'paragraph',
      content: { text: '' },
    };
  }

  const id = bloco.id || gerarIdBloco();
  const rawType = String(bloco.type || 'paragraph').toLowerCase();
  const type = TIPOS_BLOCOS_PERMITIDOS.includes(rawType) ? rawType : 'paragraph';
  const content = bloco.content && typeof bloco.content === 'object' ? bloco.content : {};

  if (type === 'list') {
    const rawItems = Array.isArray(content.items) ? content.items : [];
    const items = rawItems
      .map((item) => (typeof item === 'string' ? item : item?.text ?? ''))
      .filter((it) => typeof it === 'string');
    return {
      id,
      type,
      content: { items: items.length > 0 ? items : [''] },
    };
  }

  if (type === 'code') {
    return {
      id,
      type,
      content: {
        code: content.code ?? content.text ?? '',
        language: content.language ?? '',
      },
    };
  }

  if (type === 'reference') {
    return {
      id,
      type,
      content: {
        title: content.title ?? '',
        url: normalizarUrl(content.url ?? ''),
      },
    };
  }

  // paragraph, heading, callout
  return {
    id,
    type,
    content: {
      text: content.text ?? '',
    },
  };
}

/**
 * Normaliza qualquer formato de conteúdo de ilha para o padrão { schemaVersion: 1, blocks: [...] }.
 * Aceita:
 * - null / undefined / string vazia -> { schemaVersion: 1, blocks: [] }
 * - JSON stringificado (como retornado pelo banco e EtapaRespostaDTO)
 * - Objeto envelopado { conteudo: { schemaVersion: 1, blocks: [...] } }
 * - Objeto com { schemaVersion: 1, blocks: [...] }
 */
export function normalizarConteudoIlha(conteudo) {
  if (!conteudo) {
    return { schemaVersion: 1, blocks: [] };
  }

  let parsed = conteudo;

  // Se for string, tenta fazer parse seguro
  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '{}' || trimmed === '""') {
      return { schemaVersion: 1, blocks: [] };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { schemaVersion: 1, blocks: [] };
    }
  }

  // Se o objeto estiver envelopado em { conteudo: ... }
  if (parsed && typeof parsed === 'object' && parsed.conteudo !== undefined) {
    let interno = parsed.conteudo;
    if (typeof interno === 'string') {
      try {
        interno = JSON.parse(interno.trim());
      } catch {
        interno = null;
      }
    }
    if (interno && typeof interno === 'object') {
      parsed = interno;
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { schemaVersion: 1, blocks: [] };
  }

  const rawBlocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
  const blocks = rawBlocks.map(normalizarBloco);

  return {
    schemaVersion: Number.isInteger(parsed.schemaVersion) ? parsed.schemaVersion : 1,
    blocks,
  };
}

/**
 * Verifica se a Ilha possui conteúdo com material de estudo relevante (não apenas blocos em branco).
 */
export function conteudoTemMaterial(conteudo) {
  const norm = normalizarConteudoIlha(conteudo);
  if (!norm.blocks || norm.blocks.length === 0) return false;

  return norm.blocks.some((b) => {
    if (b.type === 'list') {
      return (b.content?.items ?? []).some((it) => typeof it === 'string' && it.trim().length > 0);
    }
    if (b.type === 'code') {
      return Boolean(b.content?.code && b.content.code.trim().length > 0);
    }
    if (b.type === 'reference') {
      return Boolean(b.content?.url && b.content.url.trim().length > 0);
    }
    return Boolean(b.content?.text && b.content.text.trim().length > 0);
  });
}

/**
 * Extrai texto resumido de um bloco para prévias e buscas.
 */
export function extrairTextoBloco(bloco) {
  if (!bloco || !bloco.content) return '';
  if (bloco.type === 'list') {
    return (bloco.content.items ?? []).filter(Boolean).join(' ');
  }
  if (bloco.type === 'code') {
    return bloco.content.code ?? '';
  }
  if (bloco.type === 'reference') {
    return `${bloco.content.title ?? ''} ${bloco.content.url ?? ''}`.trim();
  }
  return bloco.content.text ?? '';
}

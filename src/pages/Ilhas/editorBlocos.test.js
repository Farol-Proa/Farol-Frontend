import test from 'node:test';
import assert from 'node:assert/strict';

function urlReferenciaSegura(valor) {
  try {
    const url = new URL(valor);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function validarBlocos(blocos) {
  const tiposAceitos = new Set(['paragraph', 'heading', 'list', 'callout', 'code', 'reference']);
  const ids = new Set();
  if (!Array.isArray(blocos)) throw new Error('O conteúdo precisa ser uma lista de blocos.');
  for (const bloco of blocos) {
    if (
      !bloco?.id ||
      ids.has(bloco.id) ||
      !tiposAceitos.has(bloco.type) ||
      !bloco.content ||
      typeof bloco.content !== 'object' ||
      Array.isArray(bloco.content)
    ) {
      throw new Error('Cada bloco precisa ter id único, tipo aceito e conteúdo em objeto.');
    }
    ids.add(bloco.id);
    if (bloco.type === 'reference' && !urlReferenciaSegura(bloco.content.url)) {
      throw new Error('As referências precisam usar uma URL HTTP ou HTTPS.');
    }
  }
}

function normalizarUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

test('validarBlocos aceita todos os 6 tipos suportados de blocos', () => {
  const blocosValidos = [
    { id: 'b1', type: 'heading', content: { text: 'Título da Seção' } },
    { id: 'b2', type: 'paragraph', content: { text: 'Parágrafo explicativo' } },
    { id: 'b3', type: 'list', content: { items: ['Item 1', 'Item 2'] } },
    { id: 'b4', type: 'callout', content: { text: 'Destaque ou dica' } },
    { id: 'b5', type: 'code', content: { code: 'console.log("ok")' } },
    { id: 'b6', type: 'reference', content: { title: 'MDN', url: 'https://developer.mozilla.org' } },
  ];

  assert.doesNotThrow(() => validarBlocos(blocosValidos));
});

test('validarBlocos rejeita identificadores duplicados', () => {
  const blocosDuplicados = [
    { id: 'b1', type: 'paragraph', content: { text: 'Texto 1' } },
    { id: 'b1', type: 'paragraph', content: { text: 'Texto 2' } },
  ];

  assert.throws(() => validarBlocos(blocosDuplicados), /id único/);
});

test('validarBlocos rejeita tipos desconhecidos', () => {
  const blocosInvalidos = [
    { id: 'b1', type: 'tabela_secreta', content: { text: 'Invalido' } },
  ];

  assert.throws(() => validarBlocos(blocosInvalidos), /tipo aceito/);
});

test('validarBlocos e normalizacao de URL para referências', () => {
  const urlInvalida = 'javascript:alert(1)';
  assert.equal(urlReferenciaSegura(urlInvalida), null);

  const urlSemProtocolo = 'developer.mozilla.org';
  const urlNormalizada = normalizarUrl(urlSemProtocolo);
  assert.equal(urlNormalizada, 'https://developer.mozilla.org');
  assert.equal(urlReferenciaSegura(urlNormalizada), 'https://developer.mozilla.org/');

  const blocoReferencia = {
    id: 'b_ref',
    type: 'reference',
    content: { title: 'MDN Docs', url: urlNormalizada },
  };
  assert.doesNotThrow(() => validarBlocos([blocoReferencia]));
});

test('preserva compatibilidade com payloads existentes salvos no backend', () => {
  const payloadLegado = {
    schemaVersion: 1,
    blocks: [
      { id: '1', type: 'heading', content: { text: 'Passo 1' } },
      { id: '2', type: 'code', content: { text: 'const x = 10;' } },
      { id: '3', type: 'list', content: { items: ['A', 'B'] } },
    ],
  };

  assert.equal(payloadLegado.schemaVersion, 1);
  assert.equal(payloadLegado.blocks.length, 3);
  assert.doesNotThrow(() => validarBlocos(payloadLegado.blocks));
});

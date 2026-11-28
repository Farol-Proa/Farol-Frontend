import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarConteudoIlha,
  normalizarBloco,
  conteudoTemMaterial,
  extrairTextoBloco,
  normalizarUrl,
  validarUrlSegura,
} from './conteudoIlha.js';

test('normalizarUrl e validarUrlSegura lidam com protocolos e entradas vazias', () => {
  assert.equal(normalizarUrl(''), '');
  assert.equal(normalizarUrl('   '), '');
  assert.equal(normalizarUrl('farol.app'), 'https://farol.app');
  assert.equal(normalizarUrl('http://example.com'), 'http://example.com');
  assert.equal(normalizarUrl('https://example.com'), 'https://example.com');

  assert.equal(validarUrlSegura('https://farol.app'), true);
  assert.equal(validarUrlSegura('http://farol.app'), true);
  assert.equal(validarUrlSegura('javascript:alert(1)'), false);
  assert.equal(validarUrlSegura('invalida'), false);
});

test('normalizarConteudoIlha trata valores nulos, vazios ou inválidos', () => {
  assert.deepEqual(normalizarConteudoIlha(null), { schemaVersion: 1, blocks: [] });
  assert.deepEqual(normalizarConteudoIlha(undefined), { schemaVersion: 1, blocks: [] });
  assert.deepEqual(normalizarConteudoIlha(''), { schemaVersion: 1, blocks: [] });
  assert.deepEqual(normalizarConteudoIlha('   '), { schemaVersion: 1, blocks: [] });
  assert.deepEqual(normalizarConteudoIlha('{}'), { schemaVersion: 1, blocks: [] });
  assert.deepEqual(normalizarConteudoIlha('não é json'), { schemaVersion: 1, blocks: [] });
});

test('normalizarConteudoIlha desserializa string JSON (formato do EtapaRespostaDTO)', () => {
  const jsonStr = JSON.stringify({
    schemaVersion: 1,
    blocks: [
      { id: 'b1', type: 'paragraph', content: { text: 'Introdução ao Farol' } },
      { id: 'b2', type: 'code', content: { code: 'console.log("ok");' } },
    ],
  });

  const resultado = normalizarConteudoIlha(jsonStr);
  assert.equal(resultado.schemaVersion, 1);
  assert.equal(resultado.blocks.length, 2);
  assert.equal(resultado.blocks[0].id, 'b1');
  assert.equal(resultado.blocks[0].type, 'paragraph');
  assert.equal(resultado.blocks[0].content.text, 'Introdução ao Farol');
  assert.equal(resultado.blocks[1].id, 'b2');
  assert.equal(resultado.blocks[1].type, 'code');
  assert.equal(resultado.blocks[1].content.code, 'console.log("ok");');
});

test('normalizarConteudoIlha desembala objeto { conteudo: ... } (formato ConteudoIlhaDTO)', () => {
  const dto = {
    conteudo: {
      schemaVersion: 1,
      blocks: [
        { id: 'b_ref', type: 'reference', content: { title: 'Docs', url: 'https://farol.app' } },
      ],
    },
  };

  const resultado = normalizarConteudoIlha(dto);
  assert.equal(resultado.schemaVersion, 1);
  assert.equal(resultado.blocks.length, 1);
  assert.equal(resultado.blocks[0].id, 'b_ref');
  assert.equal(resultado.blocks[0].type, 'reference');
  assert.equal(resultado.blocks[0].content.title, 'Docs');
  assert.equal(resultado.blocks[0].content.url, 'https://farol.app');
});

test('normalizarConteudoIlha desembala string JSON dentro de { conteudo: "..." }', () => {
  const dto = {
    conteudo: JSON.stringify({
      schemaVersion: 1,
      blocks: [
        { id: 'b_callout', type: 'callout', content: { text: 'Atenção aos detalhes' } },
      ],
    }),
  };

  const resultado = normalizarConteudoIlha(dto);
  assert.equal(resultado.schemaVersion, 1);
  assert.equal(resultado.blocks.length, 1);
  assert.equal(resultado.blocks[0].type, 'callout');
  assert.equal(resultado.blocks[0].content.text, 'Atenção aos detalhes');
});

test('conteudoTemMaterial detecta conteúdo com blocos preenchidos vs vazios', () => {
  assert.equal(conteudoTemMaterial(null), false);
  assert.equal(conteudoTemMaterial({ schemaVersion: 1, blocks: [] }), false);
  assert.equal(conteudoTemMaterial({ schemaVersion: 1, blocks: [{ id: 'b1', type: 'paragraph', content: { text: '   ' } }] }), false);
  assert.equal(conteudoTemMaterial({ schemaVersion: 1, blocks: [{ id: 'b2', type: 'paragraph', content: { text: 'Tem texto aqui' } }] }), true);
  assert.equal(conteudoTemMaterial({ schemaVersion: 1, blocks: [{ id: 'b3', type: 'code', content: { code: 'npm test' } }] }), true);
  assert.equal(conteudoTemMaterial({ schemaVersion: 1, blocks: [{ id: 'b4', type: 'list', content: { items: ['Item 1'] } }] }), true);
});

test('extrairTextoBloco extrai representação textual para pesquisa', () => {
  assert.equal(extrairTextoBloco({ type: 'paragraph', content: { text: 'Texto' } }), 'Texto');
  assert.equal(extrairTextoBloco({ type: 'code', content: { code: 'const x = 1;' } }), 'const x = 1;');
  assert.equal(extrairTextoBloco({ type: 'list', content: { items: ['A', 'B'] } }), 'A B');
  assert.equal(extrairTextoBloco({ type: 'reference', content: { title: 'Guia', url: 'https://ex.com' } }), 'Guia https://ex.com');
});

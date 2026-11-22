import assert from 'node:assert/strict';
import test from 'node:test';
import { criarServicoNotas } from './notasApi.js';

const documento = [
  {
    id: 'block-1',
    type: 'paragraph',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [{ type: 'text', text: 'Revisar o conteúdo', styles: {} }],
    children: [],
  },
];

test('lista notas sem filtros', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => {
    chamadas.push(args);
    return [{ id: 4, titulo: 'Revisão', conteudo: documento }];
  });

  const notas = await servico.listar();

  assert.deepEqual(chamadas, [['/notas']]);
  assert.deepEqual(notas, [{ id: 4, titulo: 'Revisão', conteudo: documento }]);
});

test('filtra notas por mapa ou por ilha', async (t) => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await t.test('mapa', async () => {
    await servico.listar({ objetivoId: 18 });
    assert.deepEqual(chamadas.at(-1), ['/notas?objetivoId=18']);
  });

  await t.test('ilha', async () => {
    await servico.listar({ etapaId: 27 });
    assert.deepEqual(chamadas.at(-1), ['/notas?etapaId=27']);
  });
});

test('busca uma nota pelo identificador', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => {
    chamadas.push(args);
    return { id: 42, titulo: 'Aula', conteudo: documento };
  });

  const nota = await servico.buscar(42);

  assert.deepEqual(chamadas, [['/notas/42']]);
  assert.equal(nota.id, 42);
});

test('cria nota com título, documento JSON e associação opcional', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await servico.criar({ titulo: 'Anotações', conteudo: documento, objetivoId: 18 });

  assert.equal(chamadas[0][0], '/notas');
  assert.equal(chamadas[0][1].method, 'POST');
  assert.deepEqual(JSON.parse(chamadas[0][1].body), {
    titulo: 'Anotações',
    conteudo: documento,
    objetivoId: 18,
    etapaId: null,
  });
});

test('atualiza nota enviando a revisão esperada', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await servico.atualizar(42, {
    titulo: 'Anotações revisadas',
    conteudo: documento,
    revisao: 3,
    objetivoId: null,
    etapaId: 27,
  });

  assert.equal(chamadas[0][0], '/notas/42');
  assert.equal(chamadas[0][1].method, 'PUT');
  assert.deepEqual(JSON.parse(chamadas[0][1].body), {
    titulo: 'Anotações revisadas',
    conteudo: documento,
    objetivoId: null,
    etapaId: 27,
    revisao: 3,
  });
});

test('não envia uma nota ligada simultaneamente a mapa e ilha', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  assert.throws(
    () => servico.criar({ titulo: 'Inválida', conteudo: [], objetivoId: 18, etapaId: 27 }),
    TypeError,
  );
  assert.deepEqual(chamadas, []);
});

test('exige os dois campos de associação ao atualizar para evitar desvinculação acidental', () => {
  const servico = criarServicoNotas(async () => assert.fail('Não deveria enviar a requisição.'));

  assert.throws(
    () => servico.atualizar(42, { titulo: 'Aula', conteudo: documento, revisao: 2 }),
    TypeError,
  );
});

test('exclui uma nota pelo identificador persistido', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await servico.remover(42);

  assert.deepEqual(chamadas, [['/notas/42', { method: 'DELETE' }]]);
});

test('propaga conflitos HTTP 409 sem perder o status', async () => {
  const conflito = Object.assign(new Error('A nota foi atualizada em outro lugar.'), {
    status: 409,
  });
  const servico = criarServicoNotas(async () => {
    throw conflito;
  });

  await assert.rejects(
    servico.atualizar(42, {
      titulo: 'Aula',
      conteudo: documento,
      objetivoId: null,
      etapaId: null,
      revisao: 2,
    }),
    (erro) => erro === conflito && erro.status === 409,
  );
});

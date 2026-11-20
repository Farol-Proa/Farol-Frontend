import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServicoNotas } from './notasApi.js';

test('lista as notas pela API autenticada', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => {
    chamadas.push(args);
    return [{ id: 4, texto: 'Revisar plano', concluida: false }];
  });

  const notas = await servico.listar();

  assert.deepEqual(chamadas, [['/notas']]);
  assert.deepEqual(notas, [{ id: 4, texto: 'Revisar plano', concluida: false }]);
});

test('cria uma nota com o contrato atual texto e concluida', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => {
    chamadas.push(args);
    return { id: 5, texto: 'Ler capítulo', concluida: false };
  });

  await servico.criar('Ler capítulo');

  assert.equal(chamadas[0][0], '/notas');
  assert.equal(chamadas[0][1].method, 'POST');
  assert.deepEqual(JSON.parse(chamadas[0][1].body), {
    texto: 'Ler capítulo',
    concluida: false,
  });
});

test('edita o texto da nota sem alterar sua conclusão', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await servico.atualizar({ id: 6, texto: 'Texto antigo', concluida: true }, 'Texto novo');

  assert.equal(chamadas[0][0], '/notas/6');
  assert.equal(chamadas[0][1].method, 'PUT');
  assert.deepEqual(JSON.parse(chamadas[0][1].body), {
    texto: 'Texto novo',
    concluida: true,
  });
});

test('altera conclusão e exclui usando o identificador da nota', async () => {
  const chamadas = [];
  const servico = criarServicoNotas(async (...args) => chamadas.push(args));

  await servico.alternar({ id: 8, texto: 'Nota', concluida: false });
  await servico.remover(8);

  assert.equal(chamadas[0][0], '/notas/8');
  assert.equal(chamadas[0][1].method, 'PUT');
  assert.deepEqual(JSON.parse(chamadas[0][1].body), { texto: 'Nota', concluida: true });
  assert.deepEqual(chamadas[1], ['/notas/8', { method: 'DELETE' }]);
});

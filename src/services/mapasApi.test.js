import test from 'node:test';
import assert from 'node:assert/strict';
import { criarServicoMapas } from './mapasApi.js';

function criarRequestFake() {
  const chamadas = [];
  const request = async (path, options) => {
    chamadas.push({ path, options });
    return { id: 9 };
  };
  return { chamadas, service: criarServicoMapas(request) };
}

test('consulta árvore e detalhes do mapa pelas rotas documentadas', async () => {
  const { chamadas, service } = criarRequestFake();
  await service.arvore();
  await service.mapa(12);
  assert.deepEqual(chamadas.map(({ path }) => path), ['/objetivos/arvore', '/objetivos/12']);
});

test('usa os corpos documentados para conexões, posições e conteúdo estruturado', async () => {
  const { chamadas, service } = criarRequestFake();
  await service.criarConexao(12, 21, 22);
  await service.atualizarPosicao(21, { x: 120, y: 80 });
  await service.salvarConteudo(21, { schemaVersion: 1, blocks: [] });
  assert.deepEqual(chamadas.map(({ path }) => path), [
    '/objetivos/12/conexoes', '/etapas/21/posicao', '/etapas/21/conteudo',
  ]);
  assert.deepEqual(JSON.parse(chamadas[0].options.body), { origemEtapaId: 21, destinoEtapaId: 22 });
  assert.deepEqual(JSON.parse(chamadas[1].options.body), { x: 120, y: 80 });
  assert.deepEqual(JSON.parse(chamadas[2].options.body), { conteudo: { schemaVersion: 1, blocks: [] } });
});

test('concluir e reabrir tópicos e tarefas envia estado explícito', async () => {
  const { chamadas, service } = criarRequestFake();
  await service.concluirTopico(21, 4, false);
  await service.concluirTopico(21, 4, true);
  await service.concluirTarefa(8, false);
  await service.concluirTarefa(8, true);
  assert.deepEqual(JSON.parse(chamadas[0].options.body), { concluido: false });
  assert.deepEqual(JSON.parse(chamadas[1].options.body), { concluido: true });
  assert.deepEqual(JSON.parse(chamadas[2].options.body), { concluida: false });
  assert.deepEqual(JSON.parse(chamadas[3].options.body), { concluida: true });
});

test('usa os verbos e rotas documentados para CRUD de mapas, ilhas, tópicos e tarefas', async () => {
  const { chamadas, service } = criarRequestFake();
  await service.criarMapa({});
  await service.atualizarMapa(12, {});
  await service.removerMapa(12);
  await service.criarIlha(12, {});
  await service.atualizarIlha(21, {});
  await service.removerIlha(21);
  await service.listarConexoes(12);
  await service.removerConexao(80);
  await service.conteudo(21);
  await service.listarTopicos(21);
  await service.criarTopico(21, {});
  await service.atualizarTopico(21, 5, {});
  await service.removerTopico(21, 5);
  await service.listarTarefas(21);
  await service.criarTarefa(21, {});
  await service.atualizarTarefa(9, {});
  await service.atualizarPrazo(9, '');
  await service.removerTarefa(9);
  assert.deepEqual(chamadas.map(({ path, options }) => [options?.method ?? 'GET', path]), [
    ['POST', '/objetivos'], ['PUT', '/objetivos/12'], ['DELETE', '/objetivos/12'],
    ['POST', '/objetivos/12/etapas'], ['PUT', '/etapas/21'], ['DELETE', '/etapas/21'],
    ['GET', '/objetivos/12/conexoes'], ['DELETE', '/conexoes/80'], ['GET', '/etapas/21/conteudo'],
    ['GET', '/etapas/21/topicos'], ['POST', '/etapas/21/topicos'], ['PUT', '/etapas/21/topicos/5'],
    ['DELETE', '/etapas/21/topicos/5'], ['GET', '/etapas/21/tarefas'], ['POST', '/etapas/21/tarefas'],
    ['PUT', '/tarefas/9'], ['PATCH', '/tarefas/9/prazo'], ['DELETE', '/tarefas/9'],
  ]);
});

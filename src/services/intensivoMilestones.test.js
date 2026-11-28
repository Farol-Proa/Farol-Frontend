import test from 'node:test';
import assert from 'node:assert/strict';
import {
  obterChaveUsuario,
  obterMarcosVisualizados,
  marcarMarcoVisualizado,
  obterProximoMarcoParaCelebrar,
} from './intensivoMilestones.js';

test('intensivoMilestones: obterChaveUsuario gera chave correta', () => {
  assert.equal(obterChaveUsuario(123), 'farol:marcos_visualizados:123');
  assert.equal(obterChaveUsuario('usuario@farol.app'), 'farol:marcos_visualizados:usuario@farol.app');
  assert.equal(obterChaveUsuario(null), 'farol:marcos_visualizados:padrao');
});

test('intensivoMilestones: marcar e obter marcos visualizados no sessionStorage', () => {
  // Mock sessionStorage se não estiver no navegador
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
  };

  const usuarioId = 'user-test-1';
  assert.deepEqual(obterMarcosVisualizados(usuarioId), []);

  marcarMarcoVisualizado(usuarioId, 3);
  assert.deepEqual(obterMarcosVisualizados(usuarioId), [3]);

  // Não duplica se marcar novamente
  marcarMarcoVisualizado(usuarioId, 3);
  assert.deepEqual(obterMarcosVisualizados(usuarioId), [3]);

  marcarMarcoVisualizado(usuarioId, 7);
  assert.deepEqual(obterMarcosVisualizados(usuarioId), [3, 7]);
});

test('intensivoMilestones: obterProximoMarcoParaCelebrar seleciona marco desbloqueado não visto', () => {
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
  };

  const usuarioId = 'user-test-2';
  const marcos = [
    { dias: 3, titulo: 'Primeiro Brilho', desbloqueado: true },
    { dias: 7, titulo: 'Farol da Semana', desbloqueado: true },
    { dias: 14, titulo: 'Guia das Águas', desbloqueado: false },
    { dias: 30, titulo: 'Farol Inabalável', desbloqueado: false },
  ];

  // Nenhum foi visto ainda: deve sugerir o maior desbloqueado (7 dias)
  const primeiro = obterProximoMarcoParaCelebrar(usuarioId, marcos);
  assert.ok(primeiro);
  assert.equal(primeiro.dias, 7);
  assert.equal(primeiro.titulo, 'Farol da Semana');

  // Marca 7 como visto
  marcarMarcoVisualizado(usuarioId, 7);

  // Agora deve sugerir o marco de 3 dias
  const segundo = obterProximoMarcoParaCelebrar(usuarioId, marcos);
  assert.ok(segundo);
  assert.equal(segundo.dias, 3);

  // Marca 3 como visto
  marcarMarcoVisualizado(usuarioId, 3);

  // Todos desbloqueados já foram vistos: retorna null
  const terceiro = obterProximoMarcoParaCelebrar(usuarioId, marcos);
  assert.equal(terceiro, null);
});

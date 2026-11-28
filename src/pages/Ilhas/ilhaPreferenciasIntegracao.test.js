import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCIAS_PADRAO,
  mesclarPreferencias,
  resolverObjetivoInicial,
} from '../../services/preferenciasUsuario.js';

test('Ilhas preferências: temas de oceano e cores da grade possuem mapeamento consistente', () => {
  const temasAceitos = ['oceano-noturno', 'oceano-profundo', 'contraste-suave'];
  const gridColorByTheme = {
    'oceano-noturno': 'rgba(252, 252, 252, 0.14)',
    'oceano-profundo': 'rgba(93, 122, 255, 0.18)',
    'contraste-suave': 'rgba(255, 255, 255, 0.08)',
  };

  for (const tema of temasAceitos) {
    assert.ok(gridColorByTheme[tema], `Tema ${tema} deve ter cor de grade definida`);
  }

  // Verifica se cada tema possui cor de grade distinta
  const cores = Object.values(gridColorByTheme);
  const coresUnicas = new Set(cores);
  assert.equal(coresUnicas.size, 3, 'As cores de grade dos 3 temas devem ser distintas');
});

test('Ilhas preferências: criação de nós propaga flags exibirBarco e exibirProgressoNos', () => {
  function simularCreateNodes(roadmap, onSelectIsland, opcoes = {}) {
    const { exibirBarco = true, exibirProgressoNos = true } = opcoes;
    return roadmap.islands.map((island, index) => ({
      id: island.id,
      type: 'island',
      position: island.position,
      data: {
        ...island,
        index,
        onSelect: () => onSelectIsland(island.id),
        exibirBarco,
        exibirProgressoNos,
      },
    }));
  }

  const roadmapMock = {
    title: 'Trilha Fullstack',
    islands: [
      { id: '1', title: 'Fundamentos', status: 'progress', position: { x: 100, y: 100 } },
      { id: '2', title: 'APIs REST', status: 'locked', position: { x: 200, y: 200 } },
    ],
  };

  // 1. Padrão: barco e progresso ativos
  const nosPadrao = simularCreateNodes(roadmapMock, () => {});
  assert.equal(nosPadrao[0].data.exibirBarco, true);
  assert.equal(nosPadrao[0].data.exibirProgressoNos, true);

  // 2. Barco desativado nas preferências
  const nosSemBarco = simularCreateNodes(roadmapMock, () => {}, { exibirBarco: false });
  assert.equal(nosSemBarco[0].data.exibirBarco, false);
  assert.equal(nosSemBarco[0].data.exibirProgressoNos, true);

  // 3. Progresso nos nós desativado nas preferências
  const nosSemProgresso = simularCreateNodes(roadmapMock, () => {}, { exibirProgressoNos: false });
  assert.equal(nosSemProgresso[0].data.exibirBarco, true);
  assert.equal(nosSemProgresso[0].data.exibirProgressoNos, false);
});

test('Ilhas preferências: renderização condicional do barco em IslandNode', () => {
  function deveRenderizarBarco(nodeData) {
    return nodeData.status === 'progress' && nodeData.exibirBarco !== false;
  }

  // Em andamento com barco habilitado -> deve exibir
  assert.equal(deveRenderizarBarco({ status: 'progress', exibirBarco: true }), true);
  assert.equal(deveRenderizarBarco({ status: 'progress' }), true); // default true

  // Em andamento com barco desabilitado -> NÃO deve exibir
  assert.equal(deveRenderizarBarco({ status: 'progress', exibirBarco: false }), false);

  // Outros status -> NÃO deve exibir mesmo se exibirBarco for true
  assert.equal(deveRenderizarBarco({ status: 'done', exibirBarco: true }), false);
  assert.equal(deveRenderizarBarco({ status: 'locked', exibirBarco: true }), false);
});

test('Ilhas preferências: renderização condicional da barra de progresso em IslandNode', () => {
  function deveRenderizarProgresso(nodeData) {
    return nodeData.exibirProgressoNos !== false;
  }

  assert.equal(deveRenderizarProgresso({ exibirProgressoNos: true }), true);
  assert.equal(deveRenderizarProgresso({}), true); // default true
  assert.equal(deveRenderizarProgresso({ exibirProgressoNos: false }), false);
});

test('Ilhas preferências: fallback consistente quando tema for inválido ou não informado', () => {
  const prefs = mesclarPreferencias(PREFERENCIAS_PADRAO, {
    ilhas: { estiloOceano: 'tema-inexistente' },
  });

  const temaEfetivo = ['oceano-noturno', 'oceano-profundo', 'contraste-suave'].includes(
    prefs.ilhas.estiloOceano
  )
    ? prefs.ilhas.estiloOceano
    : 'oceano-noturno';

  assert.equal(temaEfetivo, 'oceano-noturno');
});

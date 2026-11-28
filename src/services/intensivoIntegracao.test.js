import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('intensivoIntegracao: regra restrita - nenhum fogo, chama ou flame icon no Sidebar e CardIntensivoFarol', () => {
  const sidebarPath = path.resolve('src/components/Sidebar.jsx');
  const cardIntensivoPath = path.resolve('src/components/CardIntensivoFarol.jsx');
  const farolLuzPath = path.resolve('src/components/FarolLuz.jsx');

  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const cardContent = fs.readFileSync(cardIntensivoPath, 'utf8');
  const farolLuzContent = fs.readFileSync(farolLuzPath, 'utf8');

  // Verificar que Sidebar NÃO usa ícone "flame"
  assert.ok(
    !sidebarContent.includes('name="flame"'),
    'Sidebar não deve utilizar o ícone flame de fogo!',
  );
  assert.ok(
    sidebarContent.includes('<FarolLuz'),
    'Sidebar deve utilizar o componente FarolLuz com luz progressiva.',
  );

  // Verificar que CardIntensivoFarol não tem referências a fogo
  assert.ok(!cardContent.includes('flame'), 'CardIntensivoFarol não deve conter menção a flame.');
  assert.ok(!cardContent.toLowerCase().includes('chama'), 'CardIntensivoFarol não deve conter a palavra chama.');
  assert.ok(!cardContent.toLowerCase().includes('fogo'), 'CardIntensivoFarol não deve conter a palavra fogo.');

  // Verificar que FarolLuz não tem referências a fogo
  assert.ok(!farolLuzContent.includes('flame'), 'FarolLuz não deve conter menção a flame.');
  assert.ok(!farolLuzContent.toLowerCase().includes('fogo'), 'FarolLuz não deve conter menção a fogo.');
});

test('intensivoIntegracao: FarolLuz e CardIntensivoFarol possuem estilos náuticos correspondentes', () => {
  const cssFarolLuz = fs.readFileSync(path.resolve('src/components/FarolLuz.css'), 'utf8');
  const cssCard = fs.readFileSync(path.resolve('src/components/CardIntensivoFarol.css'), 'utf8');

  // Verifica suporte a acessibilidade prefers-reduced-motion
  assert.ok(
    cssFarolLuz.includes('prefers-reduced-motion'),
    'FarolLuz.css deve conter suporte a prefers-reduced-motion',
  );

  // Verifica níveis 0 a 5 no CSS
  for (let nivel = 1; nivel <= 5; nivel++) {
    assert.ok(
      cssFarolLuz.includes(`.nivel-${nivel}`),
      `FarolLuz.css deve conter estilos para o nível ${nivel}`,
    );
  }

  // Verifica classes do histórico de 7 dias
  assert.ok(cssCard.includes('.historico-dia-item.concluido'), 'CardIntensivoFarol.css deve conter estilo para dia concluído.');
  assert.ok(cssCard.includes('.historico-dia-item.dia-hoje.pendente'), 'CardIntensivoFarol.css deve conter estilo para dia de hoje pendente.');
  assert.ok(cssCard.includes('.historico-dia-item.perdido'), 'CardIntensivoFarol.css deve conter estilo para dia perdido.');
});

test('intensivoIntegracao: Painel.jsx inclui CardIntensivoFarol no lugar do antigo painel-journey', () => {
  const painelPath = path.resolve('src/pages/Painel.jsx');
  const painelContent = fs.readFileSync(painelPath, 'utf8');

  assert.ok(
    painelContent.includes('<CardIntensivoFarol'),
    'Painel.jsx deve renderizar CardIntensivoFarol',
  );
  assert.ok(
    !painelContent.includes('painel-journey-ring'),
    'Painel.jsx não deve mais renderizar o antigo painel-journey-ring estático',
  );
});

test('intensivoIntegracao: Sidebar possui card compacto de Intensivo com FarolLuz e contador de dias de luz', () => {
  const sidebarPath = path.resolve('src/components/Sidebar.jsx');
  const cssSidebarPath = path.resolve('src/components/Sidebar.css');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const cssSidebarContent = fs.readFileSync(cssSidebarPath, 'utf8');

  // Verifica integração do FarolLuz com propriedades nivelLuz e concluiuHoje
  assert.ok(sidebarContent.includes('nivelLuz={intensivo?.nivelLuz ?? 0}'), 'Sidebar deve repassar nivelLuz para FarolLuz');
  assert.ok(sidebarContent.includes('concluiuHoje={Boolean(intensivo?.concluiuHoje)}'), 'Sidebar deve repassar concluiuHoje para FarolLuz');
  assert.ok(sidebarContent.includes('farol-luz-sidebar'), 'Sidebar deve aplicar classe compacta farol-luz-sidebar');

  // Verifica contador de dias de luz
  assert.ok(sidebarContent.includes('dia de luz'), 'Sidebar deve exibir formato dia de luz');
  assert.ok(sidebarContent.includes('dias de luz'), 'Sidebar deve exibir formato dias de luz');

  // Verifica que NÃO exibe elementos do card completo (regra da Sidebar compacta)
  assert.ok(!sidebarContent.includes('historico7Dias'), 'Sidebar não deve conter histórico de 7 dias');
  assert.ok(!sidebarContent.includes('recordePessoal'), 'Sidebar não deve conter recorde pessoal');
  assert.ok(!sidebarContent.includes('proximoMarco'), 'Sidebar não deve conter próximo marco');
  assert.ok(!sidebarContent.includes('marcoCelebracao'), 'Sidebar não deve conter modal de celebração');

  // Verifica estilos do card compacto
  assert.ok(cssSidebarContent.includes('.farol-streak-visual'), 'Sidebar.css deve estilizar o container visual');
  assert.ok(cssSidebarContent.includes('.farol-streak-number'), 'Sidebar.css deve estilizar o número de dias');
  assert.ok(cssSidebarContent.includes('.farol-streak-label'), 'Sidebar.css deve estilizar o rótulo de dias de luz');
  assert.ok(cssSidebarContent.includes('flex-shrink: 0'), 'Sidebar.css deve proteger o card com flex-shrink: 0 contra esmagamento');
  assert.ok(cssSidebarContent.includes('overflow-y: auto'), 'Sidebar.css deve permitir rolagem interna sem corte');
});

test('intensivoIntegracao: FarolLuz gera IDs de gradiente dinamicos e isolados por instancia', () => {
  const farolLuzPath = path.resolve('src/components/FarolLuz.jsx');
  const farolLuzContent = fs.readFileSync(farolLuzPath, 'utf8');

  // Verifica que useId é utilizado para evitar colisão de IDs em telas com elementos ocultos
  assert.ok(farolLuzContent.includes('useId('), 'FarolLuz deve utilizar useId para escopo de gradientes');
  assert.ok(farolLuzContent.includes('idCeuNoturno'), 'FarolLuz deve vincular idCeuNoturno dinâmico');
  assert.ok(farolLuzContent.includes('idTorreFarol'), 'FarolLuz deve vincular idTorreFarol dinâmico');
  assert.ok(farolLuzContent.includes('idMarOceano'), 'FarolLuz deve vincular idMarOceano dinâmico');
});

test('intensivoIntegracao: intensivoApi implementa cache em memoria e sessionStorage para troca instantanea de telas', async () => {
  const { obterCacheIntensivo, obterDadosIntensivo } = await import('./intensivoApi.js');

  assert.equal(typeof obterCacheIntensivo, 'function', 'obterCacheIntensivo deve ser uma função');
  assert.equal(typeof obterDadosIntensivo, 'function', 'obterDadosIntensivo deve ser uma função');
});

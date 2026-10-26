export const NODE_WIDTH = 248;
export const LIGHTHOUSE_WIDTH = 260;
export const LIGHTHOUSE_HEIGHT = 340;

// Cada mapa contém apenas conteúdo e coordenadas; a interface transforma esses dados em nós e conexões.
// Os ids também são as referências usadas em connections; mantenha-os únicos dentro de cada mapa.
// position usa as coordenadas do canvas (origem no canto superior esquerdo), não pixels da tela.
// status controla o selo, a aparência da conexão que chega à ilha e os totais de conclusão.
export const roadmaps = [
  {
    id: 'jogo-indie',
    title: 'Criar um jogo indie',
    objective: 'Planejar, construir e publicar um primeiro jogo independente.',
    lighthouseCaption: 'Seu próximo projeto',
    islands: [
      { id: 'ideia', title: 'Ideia e escopo', category: 'Planejamento', status: 'done', completed: 5, total: 5, icon: 'sparkles', tag: 'Comece por aqui', position: { x: 360, y: 100 } },
      { id: 'game-design', title: 'Game design', category: 'Documentação', status: 'done', completed: 6, total: 6, icon: 'notebook', position: { x: 690, y: 370 } },
      { id: 'prototipo', title: 'Protótipo jogável', category: 'Desenvolvimento', status: 'progress', completed: 3, total: 7, icon: 'layout', position: { x: 1020, y: 90 } },
      { id: 'arte-audio', title: 'Arte e áudio', category: 'Produção', status: 'locked', completed: 0, total: 5, icon: 'sparkles', position: { x: 1350, y: 370 } },
      { id: 'publicacao', title: 'Publicação', category: 'Lançamento', status: 'locked', completed: 0, total: 4, icon: 'rocket', position: { x: 1680, y: 100 } },
    ],
    connections: [
      { source: 'farol', target: 'ideia' },
      { source: 'ideia', target: 'game-design' },
      { source: 'game-design', target: 'prototipo' },
      { source: 'prototipo', target: 'arte-audio' },
      { source: 'arte-audio', target: 'publicacao' },
    ],
  },
  {
    id: 'design-interfaces',
    title: 'Aprender design de interfaces',
    objective: 'Criar interfaces acessíveis, consistentes e validadas com pessoas.',
    lighthouseCaption: 'Sua jornada de design',
    islands: [
      { id: 'fundamentos-design', title: 'Fundamentos visuais', category: 'Princípios de design', status: 'done', completed: 5, total: 5, icon: 'sparkles', tag: 'Ponto de partida', position: { x: 360, y: 370 } },
      { id: 'pesquisa-ux', title: 'Pesquisa com usuários', category: 'Experiência do usuário', status: 'progress', completed: 2, total: 6, icon: 'users', position: { x: 690, y: 80 } },
      { id: 'figma', title: 'Prototipar no Figma', category: 'Ferramentas', status: 'locked', completed: 0, total: 5, icon: 'layout', position: { x: 1020, y: 370 } },
      { id: 'design-system', title: 'Design system', category: 'Componentes e padrões', status: 'locked', completed: 0, total: 4, icon: 'braces', position: { x: 1350, y: 80 } },
      { id: 'teste-usabilidade', title: 'Testar e iterar', category: 'Validação', status: 'locked', completed: 0, total: 4, icon: 'target', position: { x: 1680, y: 370 } },
    ],
    connections: [
      { source: 'farol', target: 'fundamentos-design' },
      { source: 'fundamentos-design', target: 'pesquisa-ux' },
      { source: 'pesquisa-ux', target: 'figma' },
      { source: 'figma', target: 'design-system' },
      { source: 'design-system', target: 'teste-usabilidade' },
    ],
  },
];

import { useCallback } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Icon from '../../components/Icon';
import { LIGHTHOUSE_HEIGHT, LIGHTHOUSE_WIDTH, NODE_WIDTH } from './data';
import { edgeTypes } from './edges';
import { nodeTypes } from './IslandNode';
import { GoalNode } from './GoalIsland';

const flowNodeTypes = { ...nodeTypes, lighthouse: GoalNode };

function createNodes(roadmap, onSelectIsland) {
  // O farol acompanha verticalmente a primeira ilha em andamento para aproximar visualmente o ponto de partida da rota atual.
  const progressIsland = roadmap.islands.find((island) => island.status === 'progress');
  const lighthouseY = (progressIsland?.position.y ?? 100) + (progressIsland ? 35 : 100);

  return [
    {
      id: 'farol',
      type: 'lighthouse',
      position: { x: 40, y: lighthouseY },
      data: { title: roadmap.title, caption: roadmap.lighthouseCaption },
      style: { width: LIGHTHOUSE_WIDTH, height: LIGHTHOUSE_HEIGHT },
      draggable: true,
    },
    ...roadmap.islands.map((island, index) => ({
      id: island.id,
      type: 'island',
      position: island.position,
      data: { ...island, index, onSelect: () => onSelectIsland(island.id) },
      style: { width: NODE_WIDTH },
      draggable: true,
    })),
  ];
}

function createEdges(roadmap) {
  // O estado da conexão vem do destino: ele representa o avanço necessário para alcançar aquela ilha.
  const statusById = Object.fromEntries(
    roadmap.islands.map((island) => [island.id, island.status]),
  );

  return roadmap.connections.map(({ source, target }) => ({
    id: `${roadmap.id}:${source}->${target}`,
    source,
    target,
    type: 'roadmap',
    data: { status: statusById[target] ?? 'locked' },
  }));
}

// Cada mapa tem sua própria chave para não reaproveitar posições de outro roadmap.
function getPositionsStorageKey(roadmapId) {
  return `farol:roadmap:${roadmapId}:positions`;
}

// Lê posições guardadas e ignora dados inválidos ou incompletos.
function loadNodes(roadmap, onSelectIsland) {
  const initialNodes = createNodes(roadmap, onSelectIsland);

  try {
    const savedPositions = JSON.parse(
      localStorage.getItem(getPositionsStorageKey(roadmap.id)) || '{}',
    );

    return initialNodes.map((node) => {
      const savedPosition = savedPositions[node.id];
      const hasValidPosition =
        Number.isFinite(savedPosition?.x) && Number.isFinite(savedPosition?.y);

      return hasValidPosition ? { ...node, position: savedPosition } : node;
    });
  } catch {
    // Se o navegador bloquear o localStorage ou o JSON estiver inválido, usamos as posições padrão.
    return initialNodes;
  }
}

function RoadmapChrome({ roadmap }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const completedCount = roadmap.islands.filter((island) => island.status === 'done').length;

  return (
    <>
      <div className="roadmap-overlay roadmap-overlay-top">
        <div className="roadmap-map-label">
          <p>Mapa de aprendizado</p>
          <strong>{roadmap.title}</strong>
        </div>
        <div className="roadmap-progress-label">
          <div>
            <span>Seu percurso</span>
            <strong>
              <b>{completedCount}</b> de {roadmap.islands.length} ilhas
            </strong>
          </div>
          <div className="roadmap-progress-dashes" aria-hidden="true">
            {roadmap.islands.map((island) => (
              <span key={island.id} className={`status-${island.status}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="roadmap-overlay roadmap-overlay-bottom">
        <p className="roadmap-instructions">
          <Icon name="pointer" size={14} />
          Arraste para navegar ou mover ilhas. Role para dar zoom.
        </p>
        <div className="roadmap-controls" role="toolbar" aria-label="Controles de zoom">
          <button
            type="button"
            aria-label="Diminuir zoom"
            title="Diminuir zoom"
            onClick={() => zoomOut()}
          >
            <Icon name="minus" size={16} />
          </button>
          <span className="roadmap-zoom-value" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Aumentar zoom"
            title="Aumentar zoom"
            onClick={() => zoomIn()}
          >
            <Icon name="plus" size={16} />
          </button>
          <i aria-hidden="true" />
          <button
            type="button"
            aria-label="Enquadrar mapa"
            title="Enquadrar mapa"
            onClick={() => fitView({ padding: 0.18, duration: 320 })}
          >
            <Icon name="maximize" size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function FlowCanvas({ roadmap, onSelectIsland }) {
  // React Flow mantém o estado interativo; a carga inicial restaura as posições deste mapa.
  const [nodes, , onNodesChange] = useNodesState(() => loadNodes(roadmap, onSelectIsland));
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges(roadmap));

  const onConnect = useCallback(
    (connection) => {
      // Ligações criadas arrastando os conectores existem só nesta sessão e começam com aparência de progresso.
      setEdges((currentEdges) =>
        addEdge({ ...connection, type: 'roadmap', data: { status: 'progress' } }, currentEdges),
      );
    },
    [setEdges],
  );

  const onNodeClick = useCallback(
    (_, node) => {
      if (node.id !== 'farol') onSelectIsland(node.id);
    },
    [onSelectIsland],
  );

  // A key baseada no id do roadmap remonta o canvas ao trocar de mapa.
  return (
    <ReactFlow
      className="roadmap-flow"
      nodes={nodes}
      edges={edges}
      nodeTypes={flowNodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.25}
      maxZoom={1.5}
      nodesConnectable
      elementsSelectable
      deleteKeyCode={null}
      onNodeDragStop={(_, node) => {
        const positions = Object.fromEntries(
          nodes.map((n) => [n.id, n.id === node.id ? node.position : n.position]),
        );

        try {
          localStorage.setItem(
            getPositionsStorageKey(roadmap.id),
            JSON.stringify(positions),
          );
        } catch {
          // O mapa continua funcionando mesmo se o navegador não permitir salvar localmente.
        }
      }}
    >
      <Background
        variant={BackgroundVariant.Lines}
        gap={32}
        size={1}
        color="rgba(252, 252, 252, 0.14)"
      />
      <RoadmapChrome roadmap={roadmap} />
    </ReactFlow>
  );
}

export default function RoadmapCanvas({ roadmap, onSelectIsland }) {
  return (
    <section className="roadmap-canvas" aria-label={`Mapa de aprendizado: ${roadmap.title}`}>
      <FlowCanvas key={roadmap.id} roadmap={roadmap} onSelectIsland={onSelectIsland} />
    </section>
  );
}

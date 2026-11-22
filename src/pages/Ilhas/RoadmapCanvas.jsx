import { useCallback, useEffect } from 'react';
import {
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
  const statusById = Object.fromEntries(roadmap.islands.map((island) => [island.id, island.status]));

  return roadmap.connections.map((connection) => ({
    id: String(connection.id),
    source: String(connection.source),
    target: String(connection.target),
    type: 'roadmap',
    data: { status: statusById[connection.target] ?? 'locked' },
  }));
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
          <button type="button" aria-label="Diminuir zoom" title="Diminuir zoom" onClick={() => zoomOut()}>
            <Icon name="minus" size={16} />
          </button>
          <span className="roadmap-zoom-value" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" aria-label="Aumentar zoom" title="Aumentar zoom" onClick={() => zoomIn()}>
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

function FlowCanvas({
  roadmap,
  onSelectIsland,
  onConnectPersist,
  onDeleteConnection,
  onPositionPersist,
  onError,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes(roadmap, onSelectIsland));
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges(roadmap));

  useEffect(() => {
    setNodes(createNodes(roadmap, onSelectIsland));
    setEdges(createEdges(roadmap));
  }, [roadmap, onSelectIsland, setNodes, setEdges]);

  const handleConnect = useCallback(async ({ source, target }) => {
    if (!source || !target || source === 'farol' || target === 'farol') return;

    const alreadyConnected = edges.some(
      (edge) =>
        (edge.source === source && edge.target === target) ||
        (edge.source === target && edge.target === source),
    );
    if (alreadyConnected) return;

    try {
      await onConnectPersist(source, target);
    } catch (error) {
      onError(error.message || 'Não foi possível criar a conexão.');
    }
  }, [edges, onConnectPersist, onError]);

  const handleDeleteEdges = useCallback(async (removed) => {
    for (const edge of removed) {
      try {
        await onDeleteConnection(edge.id);
      } catch (error) {
        setEdges((current) =>
          current.some((item) => item.id === edge.id) ? current : [...current, edge],
        );
        onError(error.message || 'Não foi possível remover a conexão.');
      }
    }
  }, [onDeleteConnection, onError, setEdges]);

  const handleDragStop = useCallback(async (_, node) => {
    if (node.id === 'farol') return;

    const previous = roadmap.islands.find((island) => island.id === node.id)?.position;
    try {
      await onPositionPersist(node.id, node.position);
    } catch (error) {
      setNodes((current) =>
        current.map((item) =>
          item.id === node.id && previous ? { ...item, position: previous } : item,
        ),
      );
      onError(error.message || 'Não foi possível salvar a posição.');
    }
  }, [onPositionPersist, onError, roadmap.islands, setNodes]);

  const onNodeClick = useCallback((_, node) => {
    if (node.id !== 'farol') onSelectIsland(node.id);
  }, [onSelectIsland]);

  return (
    <ReactFlow
      className="roadmap-flow"
      nodes={nodes}
      edges={edges}
      nodeTypes={flowNodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onEdgesDelete={handleDeleteEdges}
      onNodeClick={onNodeClick}
      onNodeDragStop={handleDragStop}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.25}
      maxZoom={1.5}
      nodesConnectable
      elementsSelectable
      deleteKeyCode={['Backspace', 'Delete']}
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

export default function RoadmapCanvas(props) {
  const { roadmap } = props;

  return (
    <section className="roadmap-canvas" aria-label={`Mapa de aprendizado: ${roadmap.title}`}>
      <FlowCanvas key={roadmap.id} {...props} />
    </section>
  );
}

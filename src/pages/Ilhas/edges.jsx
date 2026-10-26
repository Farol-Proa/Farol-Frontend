import { BaseEdge, getBezierPath } from '@xyflow/react';

function RoadmapEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  // A curva acompanha os lados dos conectores, mesmo quando os nós são movidos no canvas.
  const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  // Fallback para ligações novas ou dados ausentes; cada estado conserva a mesma legenda visual do selo da ilha.
  const status = data?.status ?? 'locked';
  const colors = { done: '#f5d547', progress: '#aebcff', locked: '#ffffff' };

  return (
    <>
      {/* Traço largo e translúcido cria um halo sem interferir na seleção da conexão. */}
      <path className="roadmap-edge-glow" d={path} stroke={colors[status]} />
      <BaseEdge
        id={id}
        path={path}
        className={status === 'progress' ? 'roadmap-edge-progress' : ''}
        style={{ stroke: colors[status], strokeWidth: 3, strokeDasharray: '2 12', opacity: status === 'locked' ? 0.28 : 0.82 }}
      />
    </>
  );
}

export const edgeTypes = { roadmap: RoadmapEdge };

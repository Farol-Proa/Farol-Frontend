import { Handle, Position } from '@xyflow/react';
import Icon from '../../components/Icon';

const statusLabel = {
  done: 'Concluída',
  progress: 'Em andamento',
  locked: 'Bloqueada',
};

const islandShapes = [
  'M8,14 C14,4 30,6 44,5 C58,4 72,2 84,6 C95,9 98,22 96,36 C94,48 99,60 97,74 C95,88 86,96 72,95 C58,94 46,98 32,96 C18,94 6,92 4,78 C2,64 5,52 3,40 C1,28 3,20 8,14 Z',
  'M6,20 C8,8 22,3 36,6 C48,8 60,2 74,4 C88,6 97,14 95,28 C93,40 98,54 96,68 C94,84 88,95 72,96 C60,97 48,93 34,96 C20,99 7,92 5,80 C3,68 7,56 4,44 C2,34 4,28 6,20 Z',
  'M10,10 C20,3 34,7 48,4 C62,1 76,5 88,8 C97,12 96,26 97,40 C98,52 94,62 96,76 C98,90 86,97 72,95 C56,93 44,97 30,95 C16,93 4,90 3,74 C2,60 6,48 4,34 C2,22 2,15 10,10 Z',
];

function StatusBadge({ status }) {
  return (
    <span className={`island-status island-status-${status}`}>
      {status === 'done' && <Icon name="check" size={12} />}
      {status === 'progress' && <Icon name="sparkles" size={12} />}
      {status === 'locked' && <Icon name="lock" size={12} />}
      {statusLabel[status]}
    </span>
  );
}

function IslandNode({ data, selected }) {
  // Os valores são demonstrativos; limitar a divisão evita NaN quando total for zero.
  const percent = data.total ? Math.round((data.completed / data.total) * 100) : 0;
  // Repetir as formas por índice dá variedade sem exigir uma forma específica nos dados de cada ilha.
  const shape = islandShapes[data.index % islandShapes.length];

  return (
    <div className="island-node-wrap">
      <Handle type="target" position={Position.Left} className="roadmap-handle" />
      <div className={`island-glow ${data.status}`} aria-hidden="true" />
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${data.title}, ${statusLabel[data.status]}, ${data.completed} de ${data.total} etapas`}
        onKeyDown={(event) => {
          // O nó continua acessível pelo teclado mesmo sendo arrastável no canvas.
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            data.onSelect();
          }
        }}
        className={`island-node ${data.status} ${selected ? 'selected' : ''}`}
      >
        <svg aria-hidden="true" className="island-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* A cópia deslocada funciona como sombra/borda inferior; a segunda forma é o preenchimento. */}
          <path d={shape} transform="translate(0 3.5)" className="island-shore" />
          <path d={shape} className="island-fill" />
        </svg>

        <div className="island-node-content">
          <div className="island-node-topline">
            <span className="island-category-icon"><Icon name={data.icon} size={20} /></span>
            <StatusBadge status={data.status} />
          </div>
          <p className="island-category">{data.category}</p>
          <h3>{data.title}</h3>
          <div className="island-progress-row">
            <span className="island-progress-track">
              <span className="island-progress-fill" style={{ width: `${percent}%` }} />
            </span>
            <span className="island-progress-count">{data.completed}/{data.total}</span>
          </div>
          {data.status === 'progress' && (
            <button className="island-continue nodrag" type="button" onClick={data.onSelect}>
              Continuar <Icon name="arrowRight" size={16} />
            </button>
          )}
        </div>
      </div>
      {data.tag && <span className="island-tag">{data.tag}</span>}
      {data.status === 'progress' && (
        <span className="roadmap-boat" aria-hidden="true">
          <Icon name="sailboat" size={20} />
        </span>
      )}
      <Handle type="source" position={Position.Right} className="roadmap-handle" />
    </div>
  );
}

export const nodeTypes = { island: IslandNode };

export default IslandNode;

import { useState } from 'react';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import { roadmaps } from './Ilhas/data';
import './Ilhas.css';

function MapHeader({ roadmap, onChangeRoadmap }) {
  return (
    <header className="ilhas-header">
      <div className="ilhas-heading">
        <p className="ilhas-eyebrow"><span aria-hidden="true" /> Sua rota</p>
        <h1>{roadmap.title}</h1>
        <p className="ilhas-subtitle">{roadmap.objective}</p>
      </div>

      <div className="ilhas-profile-area">
        <label className="roadmap-select-label">
          <span>Trocar mapa</span>
          <select value={roadmap.id} onChange={(event) => onChangeRoadmap(event.target.value)}>
            {roadmaps.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <button className="ilhas-notifications" type="button" aria-label="Notificações">
          <Icon name="bell" size={17} />
        </button>
        <div className="ilhas-profile"><span>AC</span><strong>Robriel</strong></div>
      </div>
    </header>
  );
}

function RoadmapsStrip({ selectedId, onSelectRoadmap }) {
  return (
    <section className="ilhas-goals" aria-label="Seus mapas">
      {roadmaps.map((roadmap) => {
        // O resumo usa somente ilhas concluídas; etapas individuais não estão ligadas a esses dados demonstrativos.
        const completed = roadmap.islands.filter((island) => island.status === 'done').length;
        const isSelected = roadmap.id === selectedId;

        return (
          <button
            key={roadmap.id}
            type="button"
            aria-pressed={isSelected}
            className={`goal-card ${isSelected ? 'active' : ''}`}
            onClick={() => onSelectRoadmap(roadmap.id)}
          >
            <span className="goal-card-meta">
              <span className={isSelected ? 'is-active' : ''}>
                <Icon name="map" size={14} />
                {isSelected ? 'Mapa atual' : 'Mapa'}
              </span>
              <span>{completed}/{roadmap.islands.length} ilhas</span>
            </span>
            <strong className="goal-card-title">{roadmap.title}</strong>
            <span className="goal-card-description">{roadmap.objective}</span>
            <span className="goal-card-progress">
              <span className={isSelected ? 'is-active' : ''} style={{ width: `${(completed / roadmap.islands.length) * 100}%` }} />
            </span>
          </button>
        );
      })}
    </section>
  );
}

function Ilhas({ onNavegar }) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(roadmaps[0].id);
  const [selectedIslandId, setSelectedIslandId] = useState(null);
  const roadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0];

  function changeRoadmap(id) {
    setSelectedRoadmapId(id);
    // A seleção pertence ao mapa atual; ao trocar de mapa, não carregamos um id de ilha que pode não existir nele.
    setSelectedIslandId(null);
  }

  return (
    <div className="ilhas-screen">
      <Sidebar activeItem="Ilhas" onNavegar={onNavegar} />
      <main className="ilhas-main">
        <MapHeader roadmap={roadmap} onChangeRoadmap={changeRoadmap} />
        <RoadmapCanvas roadmap={roadmap} onSelectIsland={setSelectedIslandId} />
        <RoadmapsStrip selectedId={selectedRoadmapId} onSelectRoadmap={changeRoadmap} />
        <span className="sr-only" aria-live="polite">
          {selectedIslandId ? `Ilha selecionada: ${roadmap.islands.find((island) => island.id === selectedIslandId)?.title ?? ''}` : ''}
        </span>
      </main>
    </div>
  );
}

export default Ilhas;

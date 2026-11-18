import { useState } from 'react';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import { roadmaps } from './Ilhas/data';
import './Ilhas.css';
import IslandLearningPanel from './Ilhas/IslandLearningPanel';
import { getIslandLearning } from './Ilhas/learningData';
import { progressRepository } from './Ilhas/learningRepository';

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
  const [progress, setProgress] = useState(() => progressRepository.load(selectedRoadmapId));
  const baseRoadmap = roadmaps.find((item) => item.id === selectedRoadmapId) ?? roadmaps[0];
  const roadmap = { ...baseRoadmap, islands: baseRoadmap.islands.map((island) => {
    const learning = getIslandLearning(island);
    const record = progress[island.id];
    const completedTopics = learning.topics.filter((topic) => record?.topics?.[topic.id]?.status === 'completed' && (!topic.quiz || !topic.quiz.required || record?.topics?.[topic.id]?.quizPassed)).length;
    const requiredTopics = learning.topics.filter((topic) => topic.required !== false);
    const complete = requiredTopics.length > 0 && requiredTopics.every((topic) => record?.topics?.[topic.id]?.status === 'completed' && (!topic.quiz?.required || record?.topics?.[topic.id]?.quizPassed));
    const status = complete ? 'done' : completedTopics || Object.keys(record?.topics ?? {}).length || Object.values(record?.tasks ?? {}).some(Boolean) ? 'progress' : island.status;
    return { ...island, status, completed: record ? completedTopics : island.completed, total: record ? learning.topics.length : island.total };
  }) };

  function changeRoadmap(id) {
    setSelectedRoadmapId(id);
    const nextProgress = progressRepository.load(id);
    setProgress(nextProgress);
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
      {selectedIslandId && <IslandLearningPanel island={roadmap.islands.find((island) => island.id === selectedIslandId)} roadmapId={roadmap.id} progress={progress[selectedIslandId] ?? {}} onProgress={(next) => { const updated = { ...progress, [selectedIslandId]: next }; setProgress(updated); progressRepository.save(roadmap.id, updated); }} onClose={() => setSelectedIslandId(null)} />}
    </div>
  );
}

export default Ilhas;

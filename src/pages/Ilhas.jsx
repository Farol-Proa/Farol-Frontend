import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import './Ilhas.css';

function progressoObjetivo(objetivo) {
  const tarefas = (objetivo.etapas ?? []).flatMap((etapa) => etapa.tarefas ?? []);
  const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
  return {
    total: tarefas.length,
    concluidas,
    percentual: tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0,
  };
}

function criarRoadmap(objetivo) {
  const etapas = [...(objetivo.etapas ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const islands = etapas.map((etapa, index) => {
    const tarefas = etapa.tarefas ?? [];
    const concluidas = tarefas.filter((tarefa) => tarefa.concluida).length;
    const status =
      tarefas.length && concluidas === tarefas.length
        ? 'done'
        : concluidas > 0
          ? 'progress'
          : 'locked';

    return {
      id: String(etapa.id),
      title: etapa.texto,
      category: 'Etapa',
      status,
      completed: concluidas,
      total: tarefas.length,
      icon: 'sparkles',
      description: etapa.descricao,
      position: { x: 360 + index * 330, y: index % 2 === 0 ? 100 : 370 },
    };
  });

  return {
    id: String(objetivo.id),
    title: objetivo.nome,
    objective: objetivo.descricao || 'Seu objetivo e as etapas para alcançá-lo.',
    lighthouseCaption: 'Seu objetivo',
    islands,
    connections: islands.map((island, index) => ({
      source: index === 0 ? 'farol' : islands[index - 1].id,
      target: island.id,
    })),
  };
}

function MapHeader({ roadmap, objetivos, onChangeRoadmap, onOpenCreate, onDelete }) {
  return (
    <header className="ilhas-header">
      <div className="ilhas-heading">
        <p className="ilhas-eyebrow">
          <span aria-hidden="true" /> Sua rota
        </p>
        <h1>{roadmap.title}</h1>
        <p className="ilhas-subtitle">{roadmap.objective}</p>
      </div>
      <div className="ilhas-profile-area">
        <label className="roadmap-select-label">
          <span>Trocar mapa</span>
          <select value={roadmap.id} onChange={(event) => onChangeRoadmap(event.target.value)}>
            {objetivos.map((objetivo) => (
              <option key={objetivo.id} value={objetivo.id}>
                {objetivo.nome}
              </option>
            ))}
          </select>
        </label>
        <button className="ilhas-action-button" type="button" onClick={onOpenCreate}>
          Novo objetivo
        </button>
        <button className="ilhas-action-button danger" type="button" onClick={onDelete}>
          Excluir objetivo
        </button>
      </div>
    </header>
  );
}

function RoadmapsStrip({ objetivos, selectedId, onSelectRoadmap }) {
  return (
    <section className="ilhas-goals" aria-label="Seus mapas">
      {objetivos.map((objetivo) => {
        const progresso = progressoObjetivo(objetivo);
        const selecionado = String(objetivo.id) === String(selectedId);
        return (
          <button
            key={objetivo.id}
            type="button"
            aria-pressed={selecionado}
            className={`goal-card ${selecionado ? 'active' : ''}`}
            onClick={() => onSelectRoadmap(objetivo.id)}
          >
            <span className="goal-card-meta">
              <span className={selecionado ? 'is-active' : ''}>
                <Icon name="map" size={14} />
                {selecionado ? 'Mapa atual' : 'Mapa'}
              </span>
              <span>
                {progresso.concluidas}/{progresso.total} tarefas
              </span>
            </span>
            <strong className="goal-card-title">{objetivo.nome}</strong>
            <span className="goal-card-description">
              {objetivo.descricao || 'Objetivo pessoal'}
            </span>
            <span className="goal-card-progress">
              <span
                className={selecionado ? 'is-active' : ''}
                style={{ width: `${progresso.percentual}%` }}
              />
            </span>
          </button>
        );
      })}
    </section>
  );
}

function ModalObjetivo({ onClose, onCreate }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onCreate({ titulo: titulo.trim(), descricao: descricao.trim(), prioridade });
      onClose();
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível criar o objetivo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="ilhas-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="ilhas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-objetivo-titulo"
      >
        <h2 id="novo-objetivo-titulo">Criar objetivo</h2>
        <form onSubmit={enviar}>
          <label>
            Título
            <input
              autoFocus
              required
              maxLength={180}
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
            />
          </label>
          <label>
            Descrição
            <textarea
              rows="3"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </label>
          <label>
            Prioridade
            <select value={prioridade} onChange={(event) => setPrioridade(event.target.value)}>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </select>
          </label>
          {erro && <p role="alert">{erro}</p>}
          <div className="ilhas-modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Criar objetivo'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DetalhesEtapa({ etapa, onAddTask, onToggleTask, onDeleteTask, onClose }) {
  const [titulo, setTitulo] = useState('');
  const [erro, setErro] = useState('');

  async function executarAcao(acao) {
    setErro('');
    try {
      await acao();
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível atualizar a tarefa.');
    }
  }

  async function adicionar(event) {
    event.preventDefault();
    if (!titulo.trim()) return;
    setErro('');
    try {
      await onAddTask(etapa.id, titulo.trim());
      setTitulo('');
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível criar a tarefa.');
    }
  }

  return (
    <>
      <button
        className="learning-backdrop"
        type="button"
        aria-label="Fechar etapa"
        onClick={onClose}
      />
      <aside className="learning-panel" role="dialog" aria-modal="true" aria-label={etapa.texto}>
        <header className="learning-header">
          <div>
            <span className="learning-kicker">Etapa do objetivo</span>
            <h2>{etapa.texto}</h2>
            <p>{etapa.descricao || 'Organize as tarefas necessárias para concluir esta etapa.'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="learning-body">
          <h3>Tarefas</h3>
          {(etapa.tarefas ?? []).length === 0 && <p>Nenhuma tarefa nesta etapa.</p>}
          {(etapa.tarefas ?? []).map((tarefa) => (
            <div className="learning-task" key={tarefa.id}>
              <input
                type="checkbox"
                checked={tarefa.concluida}
                onChange={() => executarAcao(() => onToggleTask(tarefa.id, tarefa.concluida))}
                aria-label={`Marcar ${tarefa.texto} como ${tarefa.concluida ? 'não concluída' : 'concluída'}`}
              />
              <span>
                <b>{tarefa.texto}</b>
              </span>
              <button
                type="button"
                onClick={() => executarAcao(() => onDeleteTask(tarefa.id))}
                aria-label={`Excluir tarefa ${tarefa.texto}`}
              >
                Excluir
              </button>
            </div>
          ))}
          <form className="learning-add-task" onSubmit={adicionar}>
            <label>
              Nova tarefa
              <input
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                maxLength={180}
              />
            </label>
            <button type="submit">Adicionar tarefa</button>
          </form>
          {erro && <p role="alert">{erro}</p>}
        </div>
      </aside>
    </>
  );
}

function Ilhas({
  onNavegar,
  objetivoSelecionado,
  abrirModalObjetivo,
  objetivos,
  onAdicionarObjetivo,
  onRemoverObjetivo,
  onAdicionarEtapa,
  onAdicionarTarefa,
  onAlternarTarefa,
  onRemoverTarefa,
  carregando,
  erro,
}) {
  const [selectedGoalId, setSelectedGoalId] = useState(objetivoSelecionado);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [modalAberto, setModalAberto] = useState(abrirModalObjetivo);
  const [tituloEtapa, setTituloEtapa] = useState('');
  const [descricaoEtapa, setDescricaoEtapa] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const goalIdAtivo = selectedGoalId ?? objetivos[0]?.id ?? null;
  const objetivo = objetivos.find((item) => String(item.id) === String(goalIdAtivo));
  const roadmap = useMemo(() => (objetivo ? criarRoadmap(objetivo) : null), [objetivo]);
  const etapaSelecionada = objetivo?.etapas.find(
    (etapa) => String(etapa.id) === String(selectedStageId),
  );

  async function criarEtapa(event) {
    event.preventDefault();
    if (!objetivo || !tituloEtapa.trim()) return;
    setErroAcao('');
    try {
      await onAdicionarEtapa(objetivo.id, {
        titulo: tituloEtapa.trim(),
        descricao: descricaoEtapa.trim(),
      });
      setTituloEtapa('');
      setDescricaoEtapa('');
    } catch (requestError) {
      setErroAcao(requestError.message || 'Não foi possível criar a etapa.');
    }
  }

  async function excluirObjetivo() {
    if (!objetivo || !window.confirm(`Excluir o objetivo “${objetivo.nome}”?`)) return;
    setErroAcao('');
    try {
      await onRemoverObjetivo(objetivo.id);
      setSelectedStageId(null);
      setSelectedGoalId(objetivos.find((item) => item.id !== objetivo.id)?.id ?? null);
    } catch (requestError) {
      setErroAcao(requestError.message || 'Não foi possível excluir o objetivo.');
    }
  }

  return (
    <div className="ilhas-screen">
      <Sidebar activeItem="Ilhas" onNavegar={onNavegar} />
      <main className="ilhas-main">
        {objetivo && roadmap ? (
          <>
            <MapHeader
              roadmap={roadmap}
              objetivos={objetivos}
              onChangeRoadmap={(id) => {
                setSelectedGoalId(id);
                setSelectedStageId(null);
              }}
              onOpenCreate={() => setModalAberto(true)}
              onDelete={excluirObjetivo}
            />
            <form className="ilhas-add-stage" onSubmit={criarEtapa}>
              <label>
                Nova etapa
                <input
                  required
                  value={tituloEtapa}
                  onChange={(event) => setTituloEtapa(event.target.value)}
                  placeholder="Ex.: Estudar fundamentos"
                />
              </label>
              <label>
                Descrição
                <input
                  value={descricaoEtapa}
                  onChange={(event) => setDescricaoEtapa(event.target.value)}
                  placeholder="O que será feito nesta etapa?"
                />
              </label>
              <button type="submit">Adicionar etapa</button>
            </form>
            <RoadmapCanvas roadmap={roadmap} onSelectIsland={(id) => setSelectedStageId(id)} />
            <RoadmapsStrip
              objetivos={objetivos}
              selectedId={objetivo.id}
              onSelectRoadmap={(id) => {
                setSelectedGoalId(id);
                setSelectedStageId(null);
              }}
            />
          </>
        ) : (
          <section className="ilhas-empty-state">
            <h1>{carregando ? 'Carregando seus objetivos...' : 'Sua jornada começa aqui'}</h1>
            <p>{erro || 'Crie um objetivo para começar a montar seu mapa de etapas.'}</p>
            <button type="button" onClick={() => setModalAberto(true)}>
              Criar objetivo
            </button>
          </section>
        )}
        {erroAcao && (
          <p role="alert" className="ilhas-error">
            {erroAcao}
          </p>
        )}
        {erro && (
          <p role="alert" className="ilhas-error">
            {erro}
          </p>
        )}
      </main>
      {etapaSelecionada && (
        <DetalhesEtapa
          etapa={etapaSelecionada}
          onAddTask={onAdicionarTarefa}
          onToggleTask={onAlternarTarefa}
          onDeleteTask={onRemoverTarefa}
          onClose={() => setSelectedStageId(null)}
        />
      )}
      {modalAberto && (
        <ModalObjetivo
          onClose={() => setModalAberto(false)}
          onCreate={async (dados) => {
            const criado = await onAdicionarObjetivo(dados);
            setSelectedGoalId(criado.id);
            setSelectedStageId(null);
          }}
        />
      )}
    </div>
  );
}

export default Ilhas;

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import ModalGerarMapaIa from '../components/ModalGerarMapaIa';
import { percentualProgressoObjetivo } from '../dashboard/objectiveTree';
import './Ilhas.css';

function urlReferenciaSegura(valor) {
  try {
    const url = new URL(valor);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function validarBlocos(blocos) {
  const tiposAceitos = new Set(['paragraph', 'heading', 'list', 'callout', 'code', 'reference']);
  const ids = new Set();
  if (!Array.isArray(blocos)) throw new Error('O conteúdo precisa ser uma lista de blocos.');
  for (const bloco of blocos) {
    if (!bloco?.id || ids.has(bloco.id) || !tiposAceitos.has(bloco.type) || !bloco.content || typeof bloco.content !== 'object' || Array.isArray(bloco.content)) {
      throw new Error('Cada bloco precisa ter id único, tipo aceito e conteúdo em objeto.');
    }
    ids.add(bloco.id);
    if (bloco.type === 'reference' && !urlReferenciaSegura(bloco.content.url)) {
      throw new Error('As referências precisam usar uma URL HTTP ou HTTPS.');
    }
  }
}

function prazoParaInput(prazo) {
  return prazo ? prazo.slice(0, 16) : '';
}

function prazoParaAPI(prazo) {
  return prazo ? (prazo.length === 16 ? `${prazo}:00` : prazo) : null;
}

function criarRoadmap(objetivo) {
  const etapas = [...(objetivo.etapas ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const islands = etapas.map((etapa, index) => {
    const percentual = Number.isFinite(etapa.progresso?.percentual) ? etapa.progresso.percentual : null;
    const concluida = Boolean(etapa.progresso?.concluida ?? etapa.concluida);
    return {
      id: String(etapa.id),
      title: etapa.texto,
      category: 'Etapa',
      status: concluida ? 'done' : (percentual ?? 0) > 0 ? 'progress' : 'locked',
      percentual,
      icon: 'sparkles',
      description: etapa.descricao,
      persistedPosition: etapa.posicao,
      // Coordenadas estáveis apenas para apresentação; só PATCH após ação explícita do usuário.
      position: etapa.posicao ?? { x: 360 + (index % 3) * 330, y: 100 + Math.floor(index / 3) * 270 },
    };
  });
  const seenPairs = new Set();
  const seenConnectionIds = new Set();
  const islandIds = new Set(islands.map((island) => island.id));
  const connections = (objetivo.conexoes ?? []).filter((connection) => {
    if (connection.id == null || connection.origemEtapaId == null || connection.destinoEtapaId == null) return false;
    const source = String(connection.origemEtapaId);
    const target = String(connection.destinoEtapaId);
    if (source === target || !islandIds.has(source) || !islandIds.has(target) || seenConnectionIds.has(String(connection.id))) return false;
    const ends = [String(connection.origemEtapaId), String(connection.destinoEtapaId)].sort();
    const pair = ends.join(':');
    if (seenPairs.has(pair)) return false;
    seenPairs.add(pair);
    seenConnectionIds.add(String(connection.id));
    return true;
  }).map((connection) => ({
    id: String(connection.id),
    source: String(connection.origemEtapaId),
    target: String(connection.destinoEtapaId),
  }));

  return {
    id: String(objetivo.id),
    title: objetivo.nome,
    objective: objetivo.descricao || 'Seu objetivo e as etapas para alcançá-lo.',
    lighthouseCaption: 'Seu objetivo',
    percentual: objetivo.progresso?.percentual,
    islands,
    connections,
    invalidConnectionCount: (objetivo.conexoes ?? []).length - connections.length,
  };
}

function MapHeader({ roadmap, objetivos, onChangeRoadmap, onOpenCreate, onOpenIaModal, onDelete, onOpenNotes }) {
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
        <button className="ilhas-action-button ilhas-btn-ia" type="button" onClick={onOpenIaModal}>
          ✨ Criar com IA
        </button>
        <button className="ilhas-action-button" type="button" onClick={onOpenNotes}>
          Notas do mapa
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
        const percentual = percentualProgressoObjetivo(objetivo);
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
                {percentual !== null ? `${percentual}% concluído` : `${objetivo.etapas?.length ?? 0} ilhas`}
              </span>
            </span>
            <strong className="goal-card-title">{objetivo.nome}</strong>
            <span className="goal-card-description">
              {objetivo.descricao || 'Objetivo pessoal'}
            </span>
            <span className="goal-card-progress">
              {percentual !== null && (
                <span
                  className={selecionado ? 'is-active' : ''}
                  style={{ width: `${percentual}%` }}
                />
              )}
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

function TarefaEtapa({ tarefa, onUpdateDeadline, onToggle, onDelete, onEdit, onError }) {
  const [prazo, setPrazo] = useState(() => prazoParaInput(tarefa.prazo));
  const [salvandoPrazo, setSalvandoPrazo] = useState(false);

  useEffect(() => setPrazo(prazoParaInput(tarefa.prazo)), [tarefa.prazo]);

  async function salvarPrazo(novoPrazo) {
    setPrazo(novoPrazo);
    setSalvandoPrazo(true);
    onError('');

    try {
      await onUpdateDeadline(tarefa.id, prazoParaAPI(novoPrazo));
    } catch (requestError) {
      setPrazo(prazoParaInput(tarefa.prazo));
      onError(requestError.message || 'Não foi possível atualizar o prazo.');
    } finally {
      setSalvandoPrazo(false);
    }
  }

  return (
    <div className="learning-task">
      <input
        type="checkbox"
        checked={tarefa.concluida}
        disabled={salvandoPrazo}
        onChange={() => onToggle(tarefa.id, tarefa.concluida)}
        aria-label={`Marcar ${tarefa.texto} como ${tarefa.concluida ? 'não concluída' : 'concluída'}`}
      />
      <span>
        <b>{tarefa.texto}</b>
        {tarefa.obrigatoria !== undefined && <small>{tarefa.obrigatoria ? 'Obrigatória' : 'Opcional'}</small>}
      </span>
      <label className="learning-task-deadline">
        Prazo
        <input
          type="datetime-local"
          value={prazo}
          disabled={salvandoPrazo}
          aria-label={`Prazo de ${tarefa.texto}`}
          onChange={(event) => salvarPrazo(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="learning-task-clear"
        disabled={!prazo || salvandoPrazo}
        onClick={() => salvarPrazo('')}
        aria-label={`Limpar prazo de ${tarefa.texto}`}
      >
        Limpar
      </button>
      <button
        type="button"
        disabled={salvandoPrazo}
        onClick={() => {
          const titulo = window.prompt('Título da tarefa', tarefa.texto);
          if (titulo?.trim()) {
            const dados = { titulo: titulo.trim(), descricao: tarefa.descricao ?? '', prazo: tarefa.prazo || null };
            if (tarefa.obrigatoria !== undefined) dados.obrigatoria = tarefa.obrigatoria;
            onEdit(tarefa.id, dados);
          }
        }}
        aria-label={`Editar tarefa ${tarefa.texto}`}
      >Editar</button>
      <button
        type="button"
        disabled={salvandoPrazo}
        onClick={() => onDelete(tarefa.id)}
        aria-label={`Excluir tarefa ${tarefa.texto}`}
      >
        Excluir
      </button>
    </div>
  );
}

function DetalhesEtapa({
  etapa,
  onAddTask,
  onUpdateTaskDeadline,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onUpdateIsland,
  onDeleteIsland,
  onToggleTopic,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onSaveContent,
  onOpenNotes,
  onClose,
}) {
  const [titulo, setTitulo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [obrigatoria, setObrigatoria] = useState(true);
  const [topico, setTopico] = useState('');
  const [topicoObrigatorio, setTopicoObrigatorio] = useState(true);
  const [blocksDraft, setBlocksDraft] = useState(() => JSON.stringify(etapa.conteudo?.blocks ?? [], null, 2));
  const [erro, setErro] = useState('');

  useEffect(() => {
    setBlocksDraft(JSON.stringify(etapa.conteudo?.blocks ?? [], null, 2));
  }, [etapa.id, etapa.conteudo]);

  async function executarAcao(acao) {
    setErro('');
    try {
      await acao();
      return true;
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível atualizar a tarefa.');
      return false;
    }
  }

  async function adicionar(event) {
    event.preventDefault();
    if (!titulo.trim()) return;
    setErro('');
    try {
      await onAddTask(etapa.id, { titulo: titulo.trim(), prazo: prazoParaAPI(prazo), obrigatoria });
      setTitulo('');
      setPrazo('');
      setObrigatoria(true);
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
          <section aria-label="Progresso da ilha">
            <h3>Progresso</h3>
            {Number.isFinite(etapa.progresso?.percentual) ? <><strong>{etapa.progresso.percentual}% concluído</strong><progress value={etapa.progresso.percentual} max="100" /></> : <p>Progresso indisponível na resposta do servidor.</p>}
          </section>
          <section>
            <h3>Tópicos</h3>
            {(etapa.topicos ?? []).map((item) => (
              <div className="learning-task" key={item.id}>
                <input type="checkbox" checked={Boolean(item.concluido)} onChange={() => executarAcao(() => onToggleTopic(etapa.id, item.id, !item.concluido))} aria-label={`Concluir tópico ${item.titulo}`} />
                <span><b>{item.titulo}</b>{item.obrigatorio !== undefined && <small>{item.obrigatorio ? 'Obrigatório' : 'Opcional'}</small>}{item.descricao && <small>{item.descricao}</small>}</span>
                <button type="button" onClick={() => { const nome = window.prompt('Título do tópico', item.titulo); if (nome?.trim()) { const dados = { titulo: nome.trim(), descricao: item.descricao ?? '' }; if (item.obrigatorio !== undefined) dados.obrigatorio = item.obrigatorio; executarAcao(() => onUpdateTopic(etapa.id, item.id, dados)); } }}>Editar</button>
                <button type="button" onClick={() => window.confirm(`Excluir o tópico “${item.titulo}”?`) && executarAcao(() => onDeleteTopic(etapa.id, item.id))}>Excluir</button>
              </div>
            ))}
            {(etapa.topicos ?? []).length === 0 && <p>Nenhum tópico cadastrado.</p>}
            <form className="learning-add-task" onSubmit={async (event) => { event.preventDefault(); if (!topico.trim()) return; if (await executarAcao(() => onAddTopic(etapa.id, { titulo: topico.trim(), descricao: '', obrigatorio: topicoObrigatorio }))) setTopico(''); }}>
              <label>Novo tópico<input value={topico} onChange={(event) => setTopico(event.target.value)} /></label>
              <label className="learning-task-classification"><input type="checkbox" checked={topicoObrigatorio} onChange={(event) => setTopicoObrigatorio(event.target.checked)} /> Tópico obrigatório</label>
              <button type="submit">Adicionar tópico</button>
            </form>
          </section>
          <section>
            <h3>Conteúdo estruturado</h3>
            {(etapa.conteudo?.blocks ?? []).map((block) => <article className="learning-section" key={block.id}>
              {block.type === 'heading' ? <h4>{block.content?.text}</h4> : block.type === 'list' ? <ul>{(block.content?.items ?? []).map((item, index) => <li key={`${block.id}-${index}`}>{typeof item === 'string' ? item : item.text}</li>)}</ul> : block.type === 'callout' ? <aside>{block.content?.text}</aside> : block.type === 'code' ? <pre><code>{block.content?.code ?? block.content?.text}</code></pre> : block.type === 'reference' ? (urlReferenciaSegura(block.content?.url) ? <a href={urlReferenciaSegura(block.content?.url)} target="_blank" rel="noopener noreferrer">{block.content?.title ?? block.content?.url}</a> : <p>{block.content?.title ?? block.content?.url}</p>) : <p>{block.content?.text}</p>}
            </article>)}
            <label>Blocos (JSON estruturado)
              <textarea rows="7" value={blocksDraft} onChange={(event) => setBlocksDraft(event.target.value)} />
            </label>
            <button type="button" onClick={async () => { try { const blocks = JSON.parse(blocksDraft); validarBlocos(blocks); await onSaveContent(etapa.id, { schemaVersion: 1, blocks }); setErro(''); } catch (error) { setErro(error.message || 'Não foi possível salvar o conteúdo.'); } }}>Salvar conteúdo</button>
          </section>
          <div className="learning-island-actions">
            <button type="button" onClick={onOpenNotes}>Notas da ilha</button>
            <button type="button" onClick={() => { const nome = window.prompt('Nome da ilha', etapa.texto); if (!nome?.trim()) return; const descricao = window.prompt('Descrição da ilha', etapa.descricao ?? ''); if (descricao !== null) executarAcao(() => onUpdateIsland(etapa.id, { titulo: nome.trim(), descricao })); }}>Editar ilha</button>
            <button type="button" onClick={() => window.confirm(`Excluir a ilha “${etapa.texto}”?`) && executarAcao(async () => { await onDeleteIsland(etapa.id); onClose(); })}>Excluir ilha</button>
          </div>
          <h3>Tarefas</h3>
          {(etapa.tarefas ?? []).length === 0 && <p>Nenhuma tarefa nesta etapa.</p>}
          {(etapa.tarefas ?? []).map((tarefa) => (
            <TarefaEtapa
              key={tarefa.id}
              tarefa={tarefa}
              onUpdateDeadline={onUpdateTaskDeadline}
              onToggle={(id, concluida) => executarAcao(() => onToggleTask(id, concluida))}
              onDelete={(id) => executarAcao(() => onDeleteTask(id))}
              onEdit={(id, dados) => executarAcao(() => onUpdateTask(id, dados))}
              onError={setErro}
            />
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
            <label>
              Prazo (opcional)
              <input type="datetime-local" value={prazo} onChange={(event) => setPrazo(event.target.value)} />
            </label>
            <label className="learning-task-classification">
              <input type="checkbox" checked={obrigatoria} onChange={(event) => setObrigatoria(event.target.checked)} />
              Obrigatória
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
  abrirModalIa,
  objetivos,
  onAdicionarObjetivo,
  onGerarObjetivoIa,
  onRemoverObjetivo,
  onAdicionarEtapa,
  onAdicionarTarefa,
  onAtualizarPrazoTarefa,
  onAlternarTarefa,
  onRemoverTarefa,
  onAtualizarTarefa,
  onAtualizarIlha,
  onRemoverIlha,
  onAtualizarPosicaoIlha,
  onCriarConexao,
  onRemoverConexao,
  onConcluirTopico,
  onCriarTopico,
  onAtualizarTopico,
  onRemoverTopico,
  onSalvarConteudo,
  onCarregarMapa,
  onCarregarIlha,
  carregando,
  erro,
}) {
  const [selectedGoalId, setSelectedGoalId] = useState(objetivoSelecionado);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [modalAberto, setModalAberto] = useState(abrirModalObjetivo);
  const [modalIaAberto, setModalIaAberto] = useState(abrirModalIa ?? false);
  const [tituloEtapa, setTituloEtapa] = useState('');
  const [descricaoEtapa, setDescricaoEtapa] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const goalIdAtivo = selectedGoalId ?? objetivos[0]?.id ?? null;
  const objetivoBase = objetivos.find((item) => String(item.id) === String(goalIdAtivo));
  const objetivo = objetivoBase;
  const roadmap = useMemo(() => (objetivo ? criarRoadmap(objetivo) : null), [objetivo]);
  const etapaDaArvore = objetivo?.etapas.find(
    (etapa) => String(etapa.id) === String(selectedStageId),
  );
  const etapaSelecionada = etapaDaArvore;

  useEffect(() => {
    let cancelado = false;
    if (!goalIdAtivo) return undefined;
    onCarregarMapa(goalIdAtivo).catch((error) => {
      if (!cancelado) setErroAcao(error.message || 'Não foi possível carregar os detalhes do mapa.');
    });
    return () => { cancelado = true; };
  }, [goalIdAtivo, onCarregarMapa]);

  const selecionarIlha = useCallback(async (id) => {
    setSelectedStageId(id);
    setErroAcao('');
    try {
      await onCarregarIlha(id);
    } catch (error) {
      setErroAcao(error.message || 'Não foi possível carregar os detalhes da ilha.');
    }
  }, [onCarregarIlha]);

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
              onOpenIaModal={() => setModalIaAberto(true)}
              onDelete={excluirObjetivo}
              onOpenNotes={() => onNavegar('Anotações', { objetivoId: objetivo.id })}
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
            {roadmap.islands.length === 0 && <p role="status">Este mapa ainda não tem ilhas. Crie uma etapa para começar.</p>}
            <RoadmapCanvas
              roadmap={roadmap}
              onSelectIsland={selecionarIlha}
              onConnectPersist={(source, target) => onCriarConexao(objetivo.id, Number(source), Number(target))}
              onDeleteConnection={onRemoverConexao}
              onPositionPersist={onAtualizarPosicaoIlha}
              onError={setErroAcao}
            />
            {roadmap.islands.some((island) => !island.persistedPosition) && (
              <p role="status" className="ilhas-error">Ilhas sem posição salva estão em posições temporárias. Arraste-as para salvar no mapa.</p>
            )}
            {roadmap.invalidConnectionCount > 0 && (
              <p role="status" className="ilhas-error">{roadmap.invalidConnectionCount} conexão(ões) não foram exibidas porque a API não retornou identificador ou ilhas de origem e destino.</p>
            )}
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
            <div className="ilhas-empty-actions">
              <button type="button" onClick={() => setModalAberto(true)}>
                Criar manual
              </button>
              <button
                type="button"
                className="ilhas-btn-ia"
                onClick={() => setModalIaAberto(true)}
              >
                ✨ Criar com IA
              </button>
            </div>
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
          onUpdateTaskDeadline={onAtualizarPrazoTarefa}
          onToggleTask={onAlternarTarefa}
          onDeleteTask={onRemoverTarefa}
          onUpdateTask={onAtualizarTarefa}
          onUpdateIsland={onAtualizarIlha}
          onDeleteIsland={onRemoverIlha}
          onToggleTopic={onConcluirTopico}
          onAddTopic={onCriarTopico}
          onUpdateTopic={onAtualizarTopico}
          onDeleteTopic={onRemoverTopico}
          onSaveContent={onSalvarConteudo}
          onOpenNotes={() => onNavegar('Anotações', { etapaId: etapaSelecionada.id })}
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
      <ModalGerarMapaIa
        aberto={modalIaAberto}
        onFechar={() => setModalIaAberto(false)}
        onGerar={async (dados) => {
          const mapaGerado = await onGerarObjetivoIa(dados);
          if (mapaGerado?.id) {
            setSelectedGoalId(mapaGerado.id);
            setSelectedStageId(null);
          }
        }}
      />
    </div>
  );
}

export default Ilhas;

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon';
import Sidebar from '../components/Sidebar';
import RoadmapCanvas from './Ilhas/RoadmapCanvas';
import EditorBlocosVisual from './Ilhas/EditorBlocosVisual';
import ModalGerarMapaIa from '../components/ModalGerarMapaIa';
import { percentualProgressoObjetivo } from '../dashboard/objectiveTree';
import { normalizarConteudoIlha } from '../dashboard/conteudoIlha';
import {
  obterPreferencias,
  obterUltimoMapaAcessado,
  salvarUltimoMapaAcessado,
  resolverObjetivoInicial,
} from '../services/preferenciasUsuario';
import './Ilhas.css';

function formatarPrazoAmigavel(prazoIso) {
  if (!prazoIso) return null;
  try {
    const data = new Date(prazoIso);
    if (Number.isNaN(data.getTime())) return prazoIso.slice(0, 16);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return prazoIso.slice(0, 16);
  }
}

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

function MapHeader({ roadmap, objetivos, onChangeRoadmap, onOpenCreate, onOpenIaModal, onDelete, onOpenNotes, onVoltarPainel }) {
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
        <button
          className="ilhas-action-button"
          type="button"
          onClick={onVoltarPainel}
          style={{ background: '#10234A', borderColor: '#26395C' }}
        >
          ← Voltar ao Início
        </button>
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

function TarefaEtapa({ tarefa, onUpdateDeadline, onToggle, onDelete, onEdit, onError, isFocused }) {
  const [prazo, setPrazo] = useState(() => prazoParaInput(tarefa.prazo));
  const [salvandoPrazo, setSalvandoPrazo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mostrandoPrazo, setMostrandoPrazo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState(tarefa.texto);
  const containerRef = useRef(null);

  useEffect(() => setPrazo(prazoParaInput(tarefa.prazo)), [tarefa.prazo]);
  useEffect(() => setNovoTitulo(tarefa.texto), [tarefa.texto]);

  useEffect(() => {
    if (isFocused && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFocused]);

  async function salvarPrazo(novoPrazo) {
    setPrazo(novoPrazo);
    setSalvandoPrazo(true);
    onError('');

    try {
      await onUpdateDeadline(tarefa.id, prazoParaAPI(novoPrazo));
      setMostrandoPrazo(false);
    } catch (requestError) {
      setPrazo(prazoParaInput(tarefa.prazo));
      onError(requestError.message || 'Não foi possível atualizar o prazo.');
    } finally {
      setSalvandoPrazo(false);
    }
  }

  async function confirmarEdicao(event) {
    if (event) event.preventDefault();
    if (!novoTitulo.trim()) return;
    const dados = { titulo: novoTitulo.trim(), descricao: tarefa.descricao ?? '', prazo: tarefa.prazo || null };
    if (tarefa.obrigatoria !== undefined) dados.obrigatoria = tarefa.obrigatoria;
    await onEdit(tarefa.id, dados);
    setEditando(false);
  }

  if (editando) {
    return (
      <form
        onSubmit={confirmarEdicao}
        className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-[#0D1930] p-3 text-sm text-white"
      >
        <input
          autoFocus
          className="flex-1 rounded-lg border border-[#26395C] bg-[#070C1E] px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          value={novoTitulo}
          onChange={(e) => setNovoTitulo(e.target.value)}
          placeholder="Título da tarefa"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => {
            setNovoTitulo(tarefa.texto);
            setEditando(false);
          }}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-600"
        >
          Cancelar
        </button>
      </form>
    );
  }

  const prazoFormatado = formatarPrazoAmigavel(tarefa.prazo);

  return (
    <div
      ref={containerRef}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
        isFocused
          ? 'border-[#F5D547] bg-[#121E3E] ring-2 ring-[#F5D547]/60 shadow-[0_0_15px_rgba(245,213,71,0.2)]'
          : tarefa.concluida
          ? 'border-[#1E293B]/60 bg-[#070D1E]/60 text-slate-400'
          : 'border-[#1E293B] bg-[#0B142F] text-slate-200 hover:border-[#26395C]'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <input
          type="checkbox"
          checked={Boolean(tarefa.concluida)}
          disabled={salvandoPrazo}
          onChange={() => onToggle(tarefa.id, tarefa.concluida)}
          aria-label={`Marcar ${tarefa.texto} como ${tarefa.concluida ? 'não concluída' : 'concluída'}`}
          className="mt-1 h-4 w-4 rounded border-[#26395C] bg-[#070D1E] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <p
            className={`text-sm font-medium leading-snug break-words ${
              tarefa.concluida ? 'line-through text-slate-400' : 'text-white'
            }`}
          >
            {tarefa.texto}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isFocused && (
              <span className="rounded bg-[#F5D547]/20 border border-[#F5D547]/40 px-1.5 py-0.5 text-[10px] font-semibold text-[#F5D547] animate-pulse">
                Selecionada no Calendário
              </span>
            )}
            {tarefa.obrigatoria !== undefined && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  tarefa.obrigatoria
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tarefa.obrigatoria ? 'Obrigatória' : 'Opcional'}
              </span>
            )}
            {prazoFormatado && (
              <span className="flex items-center gap-1 text-[11px] text-sky-300 bg-sky-950/40 border border-sky-800/40 rounded px-1.5 py-0.5">
                <Icon name="calendar" size={11} />
                {prazoFormatado}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0">
        {mostrandoPrazo ? (
          <div className="flex items-center gap-1 bg-[#070D1E] p-1 rounded-lg border border-[#26395C]">
            <input
              type="datetime-local"
              value={prazo}
              disabled={salvandoPrazo}
              aria-label={`Prazo de ${tarefa.texto}`}
              onChange={(e) => salvarPrazo(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none p-1"
            />
            {prazo && (
              <button
                type="button"
                onClick={() => salvarPrazo('')}
                title="Limpar prazo"
                className="text-slate-400 hover:text-red-400 px-1 text-xs"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => setMostrandoPrazo(false)}
              className="text-slate-400 hover:text-white px-1 text-xs"
            >
              Fechar
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={salvandoPrazo}
            onClick={() => setMostrandoPrazo(true)}
            title="Alterar prazo"
            className="flex items-center gap-1 rounded-lg border border-[#26395C] bg-[#101D3D] px-2 py-1 text-xs text-slate-300 hover:border-slate-400 hover:text-white transition"
          >
            <Icon name="calendar" size={12} />
            <span>{prazo ? 'Prazo' : '+ Prazo'}</span>
          </button>
        )}

        <button
          type="button"
          disabled={salvandoPrazo}
          onClick={() => setEditando(true)}
          aria-label={`Editar tarefa ${tarefa.texto}`}
          className="rounded-lg border border-[#26395C] bg-[#101D3D] p-1.5 text-slate-300 hover:border-slate-400 hover:text-white transition"
          title="Editar título"
        >
          <Icon name="edit" size={13} />
        </button>

        <button
          type="button"
          disabled={salvandoPrazo}
          onClick={() => onDelete(tarefa.id)}
          aria-label={`Excluir tarefa ${tarefa.texto}`}
          className="rounded-lg border border-[#26395C] bg-[#101D3D] p-1.5 text-slate-300 hover:border-red-400 hover:text-red-400 transition"
          title="Excluir tarefa"
        >
          <Icon name="trash" size={13} />
        </button>
      </div>
    </div>
  );
}

function DetalhesEtapa({
  etapa,
  tarefaFocoId,
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
  const [abaAtiva, setAbaAtiva] = useState('tarefas');
  const [titulo, setTitulo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [obrigatoria, setObrigatoria] = useState(true);
  const [topico, setTopico] = useState('');
  const [topicoObrigatorio, setTopicoObrigatorio] = useState(true);
  const [erro, setErro] = useState('');
  const [editandoIlha, setEditandoIlha] = useState(false);
  const [nomeIlha, setNomeIlha] = useState(etapa.texto);
  const [descIlha, setDescIlha] = useState(etapa.descricao || '');
  const [topicoEditandoId, setTopicoEditandoId] = useState(null);
  const [tituloTopicoEditado, setTituloTopicoEditado] = useState('');

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setNomeIlha(etapa.texto);
    setDescIlha(etapa.descricao || '');
    setEditandoIlha(false);
    setTopicoEditandoId(null);
  }, [etapa.id, etapa.texto, etapa.descricao]);

  async function executarAcao(acao) {
    setErro('');
    try {
      await acao();
      return true;
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível concluir a ação.');
      return false;
    }
  }

  async function adicionarTarefa(event) {
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

  async function adicionarTopico(event) {
    event.preventDefault();
    if (!topico.trim()) return;
    const ok = await executarAcao(() =>
      onAddTopic(etapa.id, { titulo: topico.trim(), descricao: '', obrigatorio: topicoObrigatorio })
    );
    if (ok) {
      setTopico('');
      setTopicoObrigatorio(true);
    }
  }

  const percentual = Number.isFinite(etapa.progresso?.percentual) ? etapa.progresso.percentual : null;
  const concluida = Boolean(etapa.progresso?.concluida ?? (percentual === 100));
  const tarefas = etapa.tarefas ?? [];
  const tarefasConcluidas = tarefas.filter((t) => t.concluida).length;
  const topicos = etapa.topicos ?? [];
  const topicosConcluidos = topicos.filter((tp) => tp.concluido).length;
  const blocos = normalizarConteudoIlha(etapa.conteudo).blocks;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm transition-opacity"
        role="presentation"
        onClick={onClose}
      />

      {/* Drawer / Painel Lateral da Ilha */}
      <aside
        className="fixed inset-y-0 right-0 z-[121] flex w-full max-w-2xl flex-col border-l border-[#26395C] bg-[#090F24] text-slate-100 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={etapa.texto}
      >
        {/* Cabeçalho do Painel */}
        <header className="border-b border-[#1E293B] bg-[#070D1E] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F5D547]">
                <Icon name="sparkles" size={14} />
                Ilha de Aprendizado
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  concluida
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : percentual !== null && percentual > 0
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}
              >
                {concluida ? 'Concluída' : percentual !== null ? `${percentual}% concluído` : 'Pendente'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel da ilha"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1E293B] hover:text-white transition"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Título e Descrição da Ilha */}
          {editandoIlha ? (
            <div className="mt-4 space-y-3 rounded-xl border border-blue-500/40 bg-[#0A132C] p-3.5">
              <span className="text-xs font-semibold text-sky-300">Editar detalhes da ilha</span>
              <input
                className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                value={nomeIlha}
                onChange={(e) => setNomeIlha(e.target.value)}
                placeholder="Título da ilha"
              />
              <textarea
                rows={2}
                className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                value={descIlha}
                onChange={(e) => setDescIlha(e.target.value)}
                placeholder="Descrição e objetivos desta ilha"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                  onClick={async () => {
                    if (!nomeIlha.trim()) return;
                    const ok = await executarAcao(() =>
                      onUpdateIsland(etapa.id, { titulo: nomeIlha.trim(), descricao: descIlha.trim() })
                    );
                    if (ok) setEditandoIlha(false);
                  }}
                >
                  Salvar alterações
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-700 px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-600"
                  onClick={() => {
                    setNomeIlha(etapa.texto);
                    setDescIlha(etapa.descricao || '');
                    setEditandoIlha(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {etapa.texto}
              </h2>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                {etapa.descricao || 'Organize as tarefas, tópicos e conceitos necessários para conquistar esta etapa.'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditandoIlha(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#26395C] bg-[#101D3D] px-2.5 py-1 text-xs text-slate-300 hover:border-slate-400 hover:text-white transition"
                >
                  <Icon name="edit" size={13} />
                  <span>Editar Ilha</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenNotes}
                  className="flex items-center gap-1.5 rounded-lg border border-[#26395C] bg-[#101D3D] px-2.5 py-1 text-xs text-slate-300 hover:border-slate-400 hover:text-white transition"
                >
                  <Icon name="notebook" size={13} />
                  <span>Anotações</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.confirm(`Excluir permanentemente a ilha “${etapa.texto}”?`) &&
                    executarAcao(async () => {
                      await onDeleteIsland(etapa.id);
                      onClose();
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition ml-auto"
                >
                  <Icon name="trash" size={13} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progresso geral</span>
              <span className="font-semibold text-[#F5D547]">
                {percentual !== null ? `${percentual}% concluído` : 'Pendente'}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#101C38]">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300"
                style={{ width: `${percentual ?? 0}%` }}
              />
            </div>
          </div>
        </header>

        {/* Navegação por Abas Segmentadas */}
        <div className="flex border-b border-[#1E293B] bg-[#070D1E] px-6">
          <button
            type="button"
            onClick={() => setAbaAtiva('tarefas')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
              abaAtiva === 'tarefas'
                ? 'border-[#F5D547] text-[#F5D547]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon name="check" size={14} />
            <span>Tarefas</span>
            <span className="rounded-full bg-[#16254A] px-2 py-0.5 text-[10px] text-slate-300">
              {tarefasConcluidas}/{tarefas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('conteudo')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
              abaAtiva === 'conteudo'
                ? 'border-[#F5D547] text-[#F5D547]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon name="notebook" size={14} />
            <span>Guia de Conteúdo</span>
            <span className="rounded-full bg-[#16254A] px-2 py-0.5 text-[10px] text-slate-300">
              {blocos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('topicos')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
              abaAtiva === 'topicos'
                ? 'border-[#F5D547] text-[#F5D547]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon name="sparkles" size={14} />
            <span>Tópicos</span>
            <span className="rounded-full bg-[#16254A] px-2 py-0.5 text-[10px] text-slate-300">
              {topicosConcluidos}/{topicos.length}
            </span>
          </button>
        </div>

        {/* Corpo Scrollável da Aba Ativa */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {erro && (
            <div role="alert" className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
              <span>{erro}</span>
              <button type="button" onClick={() => setErro('')} className="text-red-400 hover:text-red-200">
                ✕
              </button>
            </div>
          )}

          {/* ABA 1: TAREFAS */}
          {abaAtiva === 'tarefas' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Tarefas Práticas</h3>
                <p className="text-xs text-slate-400">
                  Marque cada tarefa conforme for executando para avançar no progresso desta ilha.
                </p>
              </div>

              {tarefas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1E293B] p-6 text-center text-slate-400">
                  <p className="text-sm font-medium">Nenhuma tarefa nesta etapa ainda.</p>
                  <p className="mt-1 text-xs">Crie tarefas práticas para organizar sua rotina de estudos.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tarefas.map((tarefa) => (
                    <TarefaEtapa
                      key={tarefa.id}
                      tarefa={tarefa}
                      isFocused={tarefaFocoId != null && String(tarefa.id) === String(tarefaFocoId)}
                      onUpdateDeadline={onUpdateTaskDeadline}
                      onToggle={(id, concluida) => executarAcao(() => onToggleTask(id, concluida))}
                      onDelete={(id) => executarAcao(() => onDeleteTask(id))}
                      onEdit={(id, dados) => executarAcao(() => onUpdateTask(id, dados))}
                      onError={setErro}
                    />
                  ))}
                </div>
              )}

              {/* Formulário de Adicionar Tarefa */}
              <form onSubmit={adicionarTarefa} className="rounded-xl border border-[#26395C] bg-[#0B142F] p-4 space-y-3">
                <span className="text-xs font-semibold text-sky-300 block">Adicionar nova tarefa</span>
                <input
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={180}
                  placeholder="O que precisa ser feito nesta tarefa?"
                  className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="datetime-local"
                        value={prazo}
                        onChange={(e) => setPrazo(e.target.value)}
                        className="rounded-lg border border-[#26395C] bg-[#070D1E] px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obrigatoria}
                        onChange={(e) => setObrigatoria(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#26395C] bg-[#070D1E] text-blue-600 focus:ring-0"
                      />
                      <span>Tarefa obrigatória</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Icon name="plus" size={13} />
                    <span>Adicionar tarefa</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ABA 2: CONTEÚDO (EDITOR VISUAL DE BLOCOS) */}
          {abaAtiva === 'conteudo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Guia & Material de Estudo</h3>
                <p className="text-xs text-slate-400">
                  Estruture explicações, links de artigos, comandos e dicas para consulta rápida.
                </p>
              </div>

              <EditorBlocosVisual
                blocks={blocos}
                onSave={async (novosBlocos) => {
                  validarBlocos(novosBlocos);
                  await onSaveContent(etapa.id, { schemaVersion: 1, blocks: novosBlocos });
                }}
                onError={setErro}
              />
            </div>
          )}

          {/* ABA 3: TÓPICOS */}
          {abaAtiva === 'topicos' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Tópicos e Conceitos</h3>
                <p className="text-xs text-slate-400">
                  Conceitos fundamentais que você deve compreender durante o aprendizado desta ilha.
                </p>
              </div>

              {topicos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1E293B] p-6 text-center text-slate-400">
                  <p className="text-sm font-medium">Nenhum tópico cadastrado nesta ilha.</p>
                  <p className="mt-1 text-xs">Adicione os principais conceitos teóricos a serem absorvidos.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topicos.map((item) =>
                    topicoEditandoId === item.id ? (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-[#0D1930] p-3 text-sm text-white"
                      >
                        <input
                          autoFocus
                          className="flex-1 rounded-lg border border-[#26395C] bg-[#070C1E] px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                          value={tituloTopicoEditado}
                          onChange={(e) => setTituloTopicoEditado(e.target.value)}
                          placeholder="Título do tópico"
                        />
                        <button
                          type="button"
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                          onClick={async () => {
                            if (!tituloTopicoEditado.trim()) return;
                            const dados = { titulo: tituloTopicoEditado.trim(), descricao: item.descricao ?? '' };
                            if (item.obrigatorio !== undefined) dados.obrigatorio = item.obrigatorio;
                            const ok = await executarAcao(() => onUpdateTopic(etapa.id, item.id, dados));
                            if (ok) setTopicoEditandoId(null);
                          }}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-600"
                          onClick={() => setTopicoEditandoId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div
                        key={item.id}
                        className={`group flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                          item.concluido
                            ? 'border-[#1E293B]/60 bg-[#070D1E]/60 text-slate-400'
                            : 'border-[#1E293B] bg-[#0B142F] text-slate-200 hover:border-[#26395C]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={Boolean(item.concluido)}
                            onChange={() =>
                              executarAcao(() => onToggleTopic(etapa.id, item.id, !item.concluido))
                            }
                            aria-label={`Concluir tópico ${item.titulo}`}
                            className="mt-1 h-4 w-4 rounded border-[#26395C] bg-[#070D1E] text-blue-600 focus:ring-0 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <p
                              className={`text-sm font-medium leading-snug break-words ${
                                item.concluido ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {item.titulo}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {item.obrigatorio !== undefined && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                    item.obrigatorio
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {item.obrigatorio ? 'Obrigatório' : 'Opcional'}
                                </span>
                              )}
                              {item.descricao && <span className="text-slate-400 text-xs">{item.descricao}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setTopicoEditandoId(item.id);
                              setTituloTopicoEditado(item.titulo);
                            }}
                            className="rounded-lg border border-[#26395C] bg-[#101D3D] p-1.5 text-slate-300 hover:border-slate-400 hover:text-white transition"
                            title="Editar tópico"
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.confirm(`Excluir o tópico “${item.titulo}”?`) &&
                              executarAcao(() => onDeleteTopic(etapa.id, item.id))
                            }
                            className="rounded-lg border border-[#26395C] bg-[#101D3D] p-1.5 text-slate-300 hover:border-red-400 hover:text-red-400 transition"
                            title="Excluir tópico"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Formulário de Adicionar Tópico */}
              <form onSubmit={adicionarTopico} className="rounded-xl border border-[#26395C] bg-[#0B142F] p-4 space-y-3">
                <span className="text-xs font-semibold text-sky-300 block">Novo conceito / tópico</span>
                <input
                  required
                  value={topico}
                  onChange={(e) => setTopico(e.target.value)}
                  placeholder="Ex.: Gerenciamento de Estado com Redux"
                  className="w-full rounded-lg border border-[#26395C] bg-[#070D1E] px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={topicoObrigatorio}
                      onChange={(e) => setTopicoObrigatorio(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[#26395C] bg-[#070D1E] text-blue-600 focus:ring-0"
                    />
                    <span>Tópico obrigatório para conclusão</span>
                  </label>

                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Icon name="plus" size={13} />
                    <span>Adicionar tópico</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Ilhas({
  onNavegar,
  onLogout,
  objetivoSelecionado,
  etapaSelecionadaInicial,
  tarefaFocoId,
  onLimparFocoTarefa,
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
  const [preferencias, setPreferencias] = useState(() => obterPreferencias());
  const [selectedGoalId, setSelectedGoalId] = useState(objetivoSelecionado);
  const [selectedStageId, setSelectedStageId] = useState(etapaSelecionadaInicial ?? null);
  const [tarefaDestacadaId, setTarefaDestacadaId] = useState(tarefaFocoId ?? null);
  const [modalAberto, setModalAberto] = useState(abrirModalObjetivo);
  const [modalIaAberto, setModalIaAberto] = useState(abrirModalIa ?? false);
  const [tituloEtapa, setTituloEtapa] = useState('');
  const [descricaoEtapa, setDescricaoEtapa] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  useEffect(() => {
    function aoAtualizarPreferencias(evento) {
      if (evento?.detail) {
        setPreferencias(evento.detail);
      } else {
        setPreferencias(obterPreferencias());
      }
    }
    window.addEventListener('farol:preferencias-atualizadas', aoAtualizarPreferencias);
    return () => {
      window.removeEventListener('farol:preferencias-atualizadas', aoAtualizarPreferencias);
    };
  }, []);

  useEffect(() => {
    if (objetivoSelecionado != null) {
      setSelectedGoalId(objetivoSelecionado);
    }
  }, [objetivoSelecionado]);

  useEffect(() => {
    if (etapaSelecionadaInicial != null) {
      setSelectedStageId(etapaSelecionadaInicial);
    }
  }, [etapaSelecionadaInicial]);

  useEffect(() => {
    if (tarefaFocoId != null) {
      setTarefaDestacadaId(tarefaFocoId);
    }
  }, [tarefaFocoId]);

  const goalIdAtivo = useMemo(() => {
    return resolverObjetivoInicial({
      objetivos,
      objetivoSelecionado: selectedGoalId,
      mapaPadraoId: preferencias?.ilhas?.mapaPadraoId,
      ultimoMapaAcessadoId: obterUltimoMapaAcessado(),
    });
  }, [objetivos, selectedGoalId, preferencias?.ilhas?.mapaPadraoId]);

  useEffect(() => {
    if (goalIdAtivo) {
      salvarUltimoMapaAcessado(goalIdAtivo);
    }
  }, [goalIdAtivo]);

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
      <Sidebar activeItem="Ilhas" onNavegar={onNavegar} onLogout={onLogout} />
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
              onVoltarPainel={() => onNavegar('Início')}
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
              temaOceano={preferencias?.ilhas?.estiloOceano || preferencias?.ilhas?.temaOceano || 'oceano-noturno'}
              exibirBarco={preferencias?.ilhas?.exibirBarco !== false}
              exibirProgressoNos={preferencias?.ilhas?.exibirProgressoNos !== false}
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
          tarefaFocoId={tarefaDestacadaId}
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
          onClose={() => {
            setSelectedStageId(null);
            setTarefaDestacadaId(null);
            onLimparFocoTarefa?.();
          }}
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

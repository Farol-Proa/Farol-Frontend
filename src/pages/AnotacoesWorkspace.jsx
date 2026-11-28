import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';
import BlockNoteEditor from '../components/Editor/BlockNoteEditor';
import PainelGuiaEstudo from './Anotacoes/PainelGuiaEstudo';
import { notasAPI } from '../dashboard/notasApi';
import {
  dadosAtualizacaoNota,
  estadoInicialNotas,
  extrairPreviaDocumento,
  extrairTextoDocumento,
  notasReducer,
  rascunhoNotasSujo,
} from '../dashboard/notasState';
import './AnotacoesWorkspace.css';

function encontrarIlhaEMapa(objetivos, etapaId) {
  if (!etapaId) return { ilha: null, mapa: null };
  for (const objetivo of objetivos) {
    const ilha = (objetivo.etapas ?? []).find((etapa) => String(etapa.id) === String(etapaId));
    if (ilha) return { ilha, mapa: objetivo };
  }
  return { ilha: null, mapa: null };
}

function formatarDataAmigavel(isoString) {
  if (!isoString) return '';
  try {
    const data = new Date(isoString);
    if (Number.isNaN(data.getTime())) return '';
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function AnotacoesWorkspace({
  objetivos = [],
  contexto = null,
  onNavegar = () => {},
  onLogout = () => {},
  onNotasRascunhoSujo = () => {},
  onRegistrarDescarteNota = () => {},
  onCarregarIlha = async () => {},
  onSalvarConteudo = async () => {},
}) {
  const [estado, dispatch] = useReducer(notasReducer, estadoInicialNotas);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroContexto, setFiltroContexto] = useState(() => {
    if (contexto?.etapaId != null) return `ilha:${contexto.etapaId}`;
    if (contexto?.objetivoId != null) return `mapa:${contexto.objetivoId}`;
    return 'todas';
  });
  const [guiaAberto, setGuiaAberto] = useState(true);
  const [visaoMobile, setVisaoMobile] = useState('editor'); // 'lista' | 'editor' | 'guia'
  const [notaParaExcluir, setNotaParaExcluir] = useState(null);
  const seletorVinculoRef = useRef(null);

  // Carregar notas da API
  useEffect(() => {
    let cancelado = false;
    dispatch({ tipo: 'carregamento-iniciado' });

    notasAPI
      .listar()
      .then((notas) => {
        if (!cancelado) {
          dispatch({ tipo: 'carregamento-concluido', notas });

          // Se tiver contexto inicial com etapaId, tenta selecionar ou criar nota para ela
          if (contexto?.etapaId != null) {
            const notaCorrespondente = notas.find(
              (n) => String(n.etapaId) === String(contexto.etapaId)
            );
            if (notaCorrespondente) {
              dispatch({ tipo: 'selecionar-nota', nota: notaCorrespondente });
            } else {
              dispatch({
                tipo: 'criar-rascunho',
                etapaId: contexto.etapaId,
                objetivoId: contexto.objetivoId ?? null,
              });
            }
          } else if (notas.length > 0 && !estado.idSelecionado && !estado.notaNova) {
            // Seleciona a primeira nota automaticamente para abrir a área de trabalho pronta
            dispatch({ tipo: 'selecionar-nota', nota: notas[0] });
          }
        }
      })
      .catch((erro) => {
        if (!cancelado) {
          dispatch({
            tipo: 'carregamento-falhou',
            mensagem: erro.message || 'Não foi possível carregar suas anotações.',
          });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [contexto?.etapaId, contexto?.objetivoId]);

  // Se a nota selecionada tiver uma ilha vinculada, carrega os detalhes atualizados da ilha
  useEffect(() => {
    if (estado.etapaId != null) {
      onCarregarIlha(estado.etapaId).catch(() => {});
    }
  }, [estado.etapaId, onCarregarIlha]);

  const rascunhoSujo = rascunhoNotasSujo(estado);

  // Sincroniza estado de rascunho sujo com o App pai
  useEffect(() => {
    onNotasRascunhoSujo?.(rascunhoSujo);
  }, [onNotasRascunhoSujo, rascunhoSujo]);

  useEffect(() => {
    onRegistrarDescarteNota?.(() => dispatch({ tipo: 'descartar-rascunho' }));
    return () => onRegistrarDescarteNota?.(null);
  }, [onRegistrarDescarteNota]);

  // Alerta antes de fechar a janela com alterações pendentes
  useEffect(() => {
    if (!rascunhoSujo) return undefined;
    const avisarAntesDeSair = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', avisarAntesDeSair);
    return () => window.removeEventListener('beforeunload', avisarAntesDeSair);
  }, [rascunhoSujo]);

  function confirmarDescarte() {
    return !rascunhoSujo || window.confirm('Há alterações não salvas nesta nota. Deseja descartá-las?');
  }

  function handleCriarNota() {
    if (!confirmarDescarte()) return;

    // Se estiver filtrando por ilha específica, vincula automaticamente
    let etapaId = null;
    let objetivoId = null;
    if (filtroContexto.startsWith('ilha:')) {
      etapaId = Number(filtroContexto.slice(5));
    } else if (filtroContexto.startsWith('mapa:')) {
      objetivoId = Number(filtroContexto.slice(5));
    }

    dispatch({ tipo: 'criar-rascunho', etapaId, objetivoId });
    setVisaoMobile('editor');
  }

  function handleSelecionarNota(nota) {
    if (nota.id === estado.idSelecionado && !estado.notaNova) return;
    if (!confirmarDescarte()) return;
    dispatch({ tipo: 'selecionar-nota', nota });
    setVisaoMobile('editor');
  }

  async function handleSalvarNota(e) {
    e?.preventDefault?.();
    if (!estado.titulo.trim() || !rascunhoSujo || estado.conflito || estado.salvando) return;

    dispatch({ tipo: 'salvamento-iniciado' });
    try {
      const nota = estado.notaNova
        ? await notasAPI.criar({
            titulo: estado.titulo.trim(),
            conteudo: estado.conteudo,
            objetivoId: estado.objetivoId,
            etapaId: estado.etapaId,
          })
        : await notasAPI.atualizar(
            estado.idSelecionado,
            dadosAtualizacaoNota({ ...estado, titulo: estado.titulo.trim() }),
          );
      dispatch({ tipo: estado.notaNova ? 'nota-criada' : 'nota-atualizada', nota });
    } catch (erro) {
      dispatch({
        tipo: 'salvamento-falhou',
        conflito: erro.status === 409,
        mensagem: erro.message || 'Não foi possível salvar a anotação.',
      });
    }
  }

  async function handleConfirmarExclusao() {
    if (!notaParaExcluir) return;
    dispatch({ tipo: 'exclusao-iniciada' });
    try {
      await notasAPI.remover(notaParaExcluir.id);
      dispatch({ tipo: 'nota-excluida', id: notaParaExcluir.id });
      setNotaParaExcluir(null);
    } catch (erro) {
      dispatch({
        tipo: 'exclusao-falhou',
        mensagem: erro.message || 'Não foi possível excluir a anotação.',
      });
    }
  }

  // Filtragem e busca de notas
  const notasFiltradas = useMemo(() => {
    let lista = estado.notas;

    // Filtro por contexto
    if (filtroContexto === 'vinculadas') {
      lista = lista.filter((n) => n.etapaId != null || n.objetivoId != null);
    } else if (filtroContexto === 'independentes') {
      lista = lista.filter((n) => n.etapaId == null && n.objetivoId == null);
    } else if (filtroContexto.startsWith('mapa:')) {
      const mapId = Number(filtroContexto.slice(5));
      lista = lista.filter((n) => n.objetivoId === mapId);
    } else if (filtroContexto.startsWith('ilha:')) {
      const ilhaId = Number(filtroContexto.slice(5));
      lista = lista.filter((n) => n.etapaId === ilhaId);
    }

    // Busca por termo
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase().trim();
      lista = lista.filter((n) => {
        const tituloMatch = (n.titulo || '').toLowerCase().includes(termo);
        const textoMatch = extrairTextoDocumento(n.conteudo).toLowerCase().includes(termo);
        return tituloMatch || textoMatch;
      });
    }

    return lista;
  }, [estado.notas, filtroContexto, termoBusca]);

  // Identificar Ilha e Mapa vinculados à nota em edição
  const { ilha: ilhaVinculada, mapa: mapaVinculado } = useMemo(() => {
    return encontrarIlhaEMapa(objetivos, estado.etapaId);
  }, [objetivos, estado.etapaId]);

  const notaSelecionada = estado.notas.find((n) => n.id === estado.idSelecionado);
  const temNotaAtiva = estado.notaNova || notaSelecionada != null;
  const chaveEditor = estado.notaNova ? `nova-${estado.chaveEditorNovo}` : `nota-${estado.idSelecionado}`;

  // Seletor de vínculo: valor formatado
  const valorVinculoAtual = estado.etapaId != null
    ? `ilha:${estado.etapaId}`
    : estado.objetivoId != null
      ? `mapa:${estado.objetivoId}`
      : 'independente';

  function handleAlterarVinculo(e) {
    const valor = e.target.value;
    if (valor.startsWith('ilha:')) {
      const id = Number(valor.slice(5));
      dispatch({ tipo: 'alterar-associacao', objetivoId: null, etapaId: id });
    } else if (valor.startsWith('mapa:')) {
      const id = Number(valor.slice(5));
      dispatch({ tipo: 'alterar-associacao', objetivoId: id, etapaId: null });
    } else {
      dispatch({ tipo: 'alterar-associacao', objetivoId: null, etapaId: null });
    }
  }

  // Estatísticas do Workspace
  const totalNotas = estado.notas.length;
  const totalVinculadas = estado.notas.filter((n) => n.etapaId != null).length;

  return (
    <div className="anotacoes-workspace-root">
      {/* Sidebar Principal do Farol */}
      <Sidebar activeItem="Anotações" onNavegar={onNavegar} onLogout={onLogout} />

      {/* Área de Trabalho Principal */}
      <div className="anotacoes-workspace-main">
        {/* Barra Superior do Workspace */}
        <header className="anotacoes-topbar">
          <div className="flex items-center gap-3 min-w-0">
            <span className="anotacoes-brand-icon">
              <Icon name="notebook" size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight truncate">
                  Anotações
                </h1>
                <span className="anotacoes-badge-status">Workspace</span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Caderno de aprendizado pessoal integrado ao Guia das Ilhas
              </p>
            </div>
          </div>

          {/* Estatísticas e Ações de Topo */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 mr-2 border-r border-[#1E293B] pr-3">
              <span className="font-semibold text-slate-200">{totalNotas}</span> {totalNotas === 1 ? 'nota' : 'notas'}
              <span className="text-slate-600">·</span>
              <span className="font-semibold text-sky-400">{totalVinculadas}</span> com Ilha
            </div>

            {/* Alternador de painel do Guia no desktop */}
            <button
              type="button"
              onClick={() => setGuiaAberto((prev) => !prev)}
              className={`hidden md:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                guiaAberto
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                  : 'border-[#26395C] bg-[#0A1128] text-slate-300 hover:bg-[#102040]'
              }`}
              title={guiaAberto ? 'Recolher Guia da Ilha' : 'Exibir Guia da Ilha'}
            >
              <Icon name="bookOpen" size={14} />
              <span>{guiaAberto ? 'Ocultar Guia' : 'Ver Guia da Ilha'}</span>
              {ilhaVinculada && <span className="anotacoes-ponto-ilha" />}
            </button>

            {/* Botão de Criação de Nota */}
            <button
              type="button"
              onClick={handleCriarNota}
              className="anotacoes-botao-nova"
              title="Criar nova anotação"
            >
              <Icon name="edit" size={14} />
              <span>Nova Anotação</span>
            </button>
          </div>
        </header>

        {/* Barra de Navegação Mobile (telas pequenas) */}
        <div className="anotacoes-mobile-nav md:hidden">
          <button
            type="button"
            onClick={() => setVisaoMobile('lista')}
            className={`anotacoes-mobile-nav-btn ${visaoMobile === 'lista' ? 'ativo' : ''}`}
          >
            <Icon name="list" size={14} />
            <span>Lista ({notasFiltradas.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setVisaoMobile('editor')}
            className={`anotacoes-mobile-nav-btn ${visaoMobile === 'editor' ? 'ativo' : ''}`}
          >
            <Icon name="edit" size={14} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setVisaoMobile('guia')}
            className={`anotacoes-mobile-nav-btn ${visaoMobile === 'guia' ? 'ativo' : ''}`}
          >
            <Icon name="bookOpen" size={14} />
            <span>Guia da Ilha</span>
            {ilhaVinculada && <span className="anotacoes-ponto-ilha" />}
          </button>
        </div>

        {/* Corpo do Workspace: Grid de 3 Colunas */}
        <div className="anotacoes-grid-container">
          {/* ========================================================= */}
          {/* COLUNA 1: LISTA DE ANOTAÇÕES (SIDEBAR INTERNA)           */}
          {/* ========================================================= */}
          <aside className={`anotacoes-coluna-lista ${visaoMobile !== 'lista' ? 'oculto-mobile' : ''}`}>
            {/* Campo de Busca em Tempo Real */}
            <div className="anotacoes-busca-wrapper">
              <span className="anotacoes-busca-icone">
                <Icon name="target" size={14} />
              </span>
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar por título ou conteúdo..."
                className="anotacoes-busca-input"
                aria-label="Buscar anotações"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="anotacoes-busca-limpar"
                  title="Limpar busca"
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>

            {/* Filtro Contextual */}
            <div className="anotacoes-filtro-wrapper">
              <label className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Filtrar:</span>
                <span className="text-slate-500">{notasFiltradas.length} encontradas</span>
              </label>
              <select
                value={filtroContexto}
                onChange={(e) => setFiltroContexto(e.target.value)}
                className="anotacoes-filtro-select"
                aria-label="Filtrar por contexto"
              >
                <option value="todas">Todas as anotações</option>
                <option value="vinculadas">Apenas vinculadas a Ilhas</option>
                <option value="independentes">Apenas notas independentes</option>
                {objetivos.map((obj) => (
                  <optgroup key={`mapa-${obj.id}`} label={`Mapa · ${obj.nome || obj.titulo}`}>
                    <option value={`mapa:${obj.id}`}>Notas do Mapa {obj.nome || obj.titulo}</option>
                    {(obj.etapas ?? []).map((etp) => (
                      <option key={`ilha-${etp.id}`} value={`ilha:${etp.id}`}>
                        ↳ Ilha: {etp.texto ?? etp.titulo}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Lista de Cards de Anotações */}
            <div className="anotacoes-cards-lista" role="tablist">
              {estado.carregando && (
                <div className="anotacoes-estado-msg">
                  <span className="anotacoes-spinner" />
                  <p>Carregando anotações…</p>
                </div>
              )}

              {!estado.carregando && estado.erro && (
                <div className="anotacoes-card-erro">
                  <p>{estado.erro}</p>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ tipo: 'carregamento-iniciado' });
                      notasAPI.listar().then(
                        (notas) => dispatch({ tipo: 'carregamento-concluido', notas }),
                        (erro) => dispatch({ tipo: 'carregamento-falhou', mensagem: erro.message })
                      );
                    }}
                    className="anotacoes-btn-tentar"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {!estado.carregando && !estado.erro && notasFiltradas.length === 0 && (
                <div className="anotacoes-estado-vazio-lista">
                  <Icon name="notebook" size={24} className="text-slate-600 mb-2" />
                  <p className="font-semibold text-slate-300">Nenhuma anotação encontrada</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {termoBusca
                      ? `Nenhum resultado para "${termoBusca}".`
                      : 'Crie uma anotação para começar seu caderno de estudos.'}
                  </p>
                  {termoBusca ? (
                    <button
                      type="button"
                      onClick={() => setTermoBusca('')}
                      className="mt-3 text-xs text-sky-400 hover:underline"
                    >
                      Limpar filtro de busca
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCriarNota}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                    >
                      <Icon name="edit" size={12} />
                      <span>Criar primeira anotação</span>
                    </button>
                  )}
                </div>
              )}

              {!estado.carregando &&
                notasFiltradas.map((nota) => {
                  const ativa = estado.idSelecionado === nota.id && !estado.notaNova;
                  const { ilha, mapa } = encontrarIlhaEMapa(objetivos, nota.etapaId);
                  const previa = extrairPreviaDocumento(nota.conteudo);

                  return (
                    <div
                      key={nota.id}
                      className={`anotacoes-item-card ${ativa ? 'ativo' : ''}`}
                      onClick={() => handleSelecionarNota(nota)}
                      role="tab"
                      aria-selected={ativa}
                      tabIndex={0}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="anotacoes-item-titulo truncate">
                          {nota.titulo || <span className="italic opacity-60">Sem título</span>}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotaParaExcluir(nota);
                          }}
                          className="anotacoes-item-btn-excluir"
                          title={`Excluir "${nota.titulo || 'Sem título'}"`}
                          aria-label={`Excluir anotação ${nota.titulo}`}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>

                      <p className="anotacoes-item-previa line-clamp-2">{previa}</p>

                      <div className="anotacoes-item-rodape">
                        {ilha ? (
                          <span
                            className="anotacoes-badge-ilha"
                            title={`Vinculada à Ilha ${ilha.texto ?? ilha.titulo} (${mapa?.nome ?? ''})`}
                          >
                            <Icon name="map" size={11} />
                            <span className="truncate max-w-[130px]">{ilha.texto ?? ilha.titulo}</span>
                          </span>
                        ) : nota.objetivoId ? (
                          <span className="anotacoes-badge-mapa">
                            <Icon name="target" size={11} />
                            <span>Mapa</span>
                          </span>
                        ) : (
                          <span className="anotacoes-badge-independente">Independente</span>
                        )}

                        <span className="anotacoes-item-data">
                          {formatarDataAmigavel(nota.atualizadoEm || nota.criadoEm)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUNA 2: ÁREA CENTRAL DE EDIÇÃO                         */}
          {/* ========================================================= */}
          <main className={`anotacoes-coluna-editor ${visaoMobile !== 'editor' ? 'oculto-mobile' : ''}`}>
            {temNotaAtiva ? (
              <div className="anotacoes-editor-container">
                {/* Cabeçalho do Editor */}
                <div className="anotacoes-editor-cabecalho">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Campo de Título da Nota */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={estado.titulo}
                        onChange={(e) => dispatch({ tipo: 'editar-titulo', titulo: e.target.value })}
                        placeholder="Título da anotação..."
                        className="anotacoes-titulo-input"
                        aria-label="Título da anotação"
                        disabled={estado.salvando}
                        maxLength={200}
                      />
                    </div>

                    {/* Barra de Status e Ações de Salvamento */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {/* Indicador de Status de Salvamento */}
                      <div className="anotacoes-status-salvamento">
                        {estado.salvando ? (
                          <span className="anotacoes-status-badge salvando">
                            <span className="anotacoes-mini-spinner" />
                            <span>Salvando...</span>
                          </span>
                        ) : estado.conflito ? (
                          <span className="anotacoes-status-badge conflito" title="Versão alterada em outra sessão">
                            <Icon name="flame" size={12} />
                            <span>Conflito (409)</span>
                          </span>
                        ) : estado.erro ? (
                          <span className="anotacoes-status-badge erro" title={estado.erro}>
                            <Icon name="flame" size={12} />
                            <span>Erro ao salvar</span>
                          </span>
                        ) : rascunhoSujo ? (
                          <span className="anotacoes-status-badge pendente">
                            <span className="anotacoes-ponto-pendente" />
                            <span>Alterações pendentes</span>
                          </span>
                        ) : (
                          <span className="anotacoes-status-badge salvo">
                            <Icon name="check" size={12} />
                            <span>Salvo</span>
                          </span>
                        )}
                      </div>

                      {/* Botão de Salvar Manual */}
                      <button
                        type="button"
                        onClick={handleSalvarNota}
                        disabled={estado.salvando || !rascunhoSujo || !estado.titulo.trim() || estado.conflito}
                        className="anotacoes-btn-salvar"
                        title="Salvar alterações"
                      >
                        {estado.salvando ? 'Salvando…' : 'Salvar'}
                      </button>

                      {/* Botão de Excluir Nota */}
                      {notaSelecionada && (
                        <button
                          type="button"
                          onClick={() => setNotaParaExcluir(notaSelecionada)}
                          className="anotacoes-btn-excluir-editor"
                          title="Excluir nota"
                          aria-label="Excluir nota"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seletor de Vínculo com a Ilha */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B]">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Icon name="map" size={13} className="text-sky-400" />
                      <span>Vínculo com Ilha:</span>
                    </label>

                    <select
                      ref={seletorVinculoRef}
                      value={valorVinculoAtual}
                      onChange={handleAlterarVinculo}
                      className="anotacoes-vinculo-select"
                      aria-label="Vincular anotação a uma ilha"
                    >
                      <option value="independente">Nenhuma (Nota independente)</option>
                      {objetivos.map((obj) => (
                        <optgroup key={`vinculo-obj-${obj.id}`} label={`Mapa: ${obj.nome || obj.titulo}`}>
                          <option value={`mapa:${obj.id}`}>Mapa completo ({obj.nome || obj.titulo})</option>
                          {(obj.etapas ?? []).map((etp) => (
                            <option key={`vinculo-etp-${etp.id}`} value={`ilha:${etp.id}`}>
                              ↳ Ilha: {etp.texto ?? etp.titulo}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {ilhaVinculada && (
                      <span className="text-[11px] text-sky-400 flex items-center gap-1">
                        <Icon name="sparkles" size={11} />
                        <span>Guia sincronizado ao lado</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Aviso de Conflito Concorrente */}
                {estado.conflito && (
                  <div className="anotacoes-alerta-conflito" role="alert">
                    <Icon name="flame" size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-200 text-xs">Conflito de Versão (409)</p>
                      <p className="text-[11px] text-amber-100/90 mt-0.5">
                        Esta anotação foi modificada em outra sessão. Seu rascunho local está preservado para que você não perca seu texto. Copie suas alterações antes de recarregar.
                      </p>
                    </div>
                  </div>
                )}

                {/* Editor BlockNote */}
                <div className="anotacoes-editor-corpo">
                  <BlockNoteEditor
                    key={chaveEditor}
                    initialContent={estado.conteudo}
                    onDocumentChange={(conteudo) => dispatch({ tipo: 'editar-conteudo', conteudo })}
                    readOnly={estado.salvando}
                  />
                </div>
              </div>
            ) : (
              /* Estado Vazio Quando Nenhuma Nota Está Selecionada */
              <div className="anotacoes-editor-vazio-container">
                <div className="anotacoes-editor-vazio-box">
                  <span className="anotacoes-editor-vazio-estrela">✦</span>
                  <h2 className="text-base font-bold text-white mt-2">
                    {estado.notas.length ? 'Selecione uma anotação' : 'Seu espaço pessoal de anotações'}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    {estado.notas.length
                      ? 'Escolha uma anotação na lista à esquerda para abrir, editar e estudar junto ao Guia da Ilha.'
                      : 'Crie sua primeira anotação para registrar insights, resumos e associá-la às Ilhas do seu roadmap.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleCriarNota}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 shadow-md transition"
                  >
                    <Icon name="edit" size={14} />
                    <span>Criar nova anotação</span>
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* ========================================================= */}
          {/* COLUNA 3: PAINEL CONTEXTUAL DO GUIA DE CONTEÚDO DA ILHA  */}
          {/* ========================================================= */}
          <div className={`anotacoes-coluna-guia ${visaoMobile !== 'guia' ? 'oculto-mobile' : ''}`}>
            <PainelGuiaEstudo
              ilha={ilhaVinculada}
              mapaNome={mapaVinculado?.nome || mapaVinculado?.titulo || ''}
              onNavegar={onNavegar}
              onVincularIlha={() => {
                setVisaoMobile('editor');
                seletorVinculoRef.current?.focus?.();
              }}
              aberto={guiaAberto}
              onAlternarAberto={() => setGuiaAberto((prev) => !prev)}
            />
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {notaParaExcluir && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setNotaParaExcluir(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#26395C] bg-[#0D1930] p-5 text-slate-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-excluir"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <Icon name="trash" size={20} />
              <h3 id="titulo-excluir" className="text-sm font-bold text-white">
                Excluir anotação?
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir <strong>“{notaParaExcluir.titulo || 'Sem título'}”</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNotaParaExcluir(null)}
                className="rounded-lg border border-[#26395C] bg-[#102040] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-[#1E3156] transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusao}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 shadow transition"
              >
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

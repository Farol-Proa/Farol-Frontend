import { useEffect, useReducer } from 'react';
import BlockNoteEditor from '../../components/Editor/BlockNoteEditor';
import { notasAPI } from '../../dashboard/notasApi';
import {
  dadosAtualizacaoNota,
  estadoInicialNotas,
  notasReducer,
  rascunhoNotasSujo,
} from '../../dashboard/notasState';
import './Notas.css';

function nomeMapa(objetivos, id) {
  return objetivos.find((objetivo) => String(objetivo.id) === String(id))?.nome ?? `Mapa ${id}`;
}

function nomeIlha(objetivos, id) {
  for (const objetivo of objetivos) {
    const ilha = (objetivo.etapas ?? []).find((etapa) => String(etapa.id) === String(id));
    if (ilha) return { nome: ilha.texto ?? ilha.titulo, mapa: objetivo.nome };
  }
  return { nome: `Ilha ${id}`, mapa: '' };
}

function rotuloAssociacao(nota, objetivos) {
  if (nota.etapaId != null) {
    const ilha = nomeIlha(objetivos, nota.etapaId);
    return ilha.mapa ? `Ilha · ${ilha.nome} · ${ilha.mapa}` : `Ilha · ${ilha.nome}`;
  }
  if (nota.objetivoId != null) return `Mapa · ${nomeMapa(objetivos, nota.objetivoId)}`;
  return 'Independente';
}

function valorDoVinculo(objetivoId, etapaId) {
  if (etapaId != null) return `ilha:${etapaId}`;
  if (objetivoId != null) return `mapa:${objetivoId}`;
  return 'independente';
}

function dadosDoVinculo(valor) {
  if (valor.startsWith('mapa:')) {
    return { objetivoId: Number(valor.slice(5)), etapaId: null };
  }
  if (valor.startsWith('ilha:')) {
    return { objetivoId: null, etapaId: Number(valor.slice(5)) };
  }
  return { objetivoId: null, etapaId: null };
}

function contextoInicial(contexto) {
  return {
    objetivoId: contexto?.objetivoId ?? null,
    etapaId: contexto?.etapaId ?? null,
  };
}

function Notas({
  objetivos = [],
  contexto = null,
  onNavegar,
  onRascunhoSujo,
  onRegistrarDescarte,
}) {
  const [estado, dispatch] = useReducer(notasReducer, estadoInicialNotas);
  const filtroEtapaId = contexto?.etapaId ?? null;
  const filtroObjetivoId = filtroEtapaId == null ? contexto?.objetivoId ?? null : null;
  const valorFiltro = filtroEtapaId != null
    ? `ilha:${filtroEtapaId}`
    : filtroObjetivoId != null
      ? `mapa:${filtroObjetivoId}`
      : 'todas';

  useEffect(() => {
    let cancelado = false;
    const filtros = {};
    if (filtroObjetivoId != null) filtros.objetivoId = filtroObjetivoId;
    if (filtroEtapaId != null) filtros.etapaId = filtroEtapaId;

    dispatch({ tipo: 'carregamento-iniciado' });
    notasAPI.listar(filtros)
      .then((notas) => {
        if (!cancelado) dispatch({ tipo: 'carregamento-concluido', notas });
      })
      .catch((erro) => {
        if (!cancelado) {
          dispatch({
            tipo: 'carregamento-falhou',
            mensagem: erro.message || 'Não foi possível carregar suas notas.',
          });
        }
      });

    return () => {
      cancelado = true;
    };
  }, [filtroObjetivoId, filtroEtapaId]);

  const rascunhoSujo = rascunhoNotasSujo(estado);

  useEffect(() => {
    onRascunhoSujo?.(rascunhoSujo);
  }, [onRascunhoSujo, rascunhoSujo]);

  useEffect(() => {
    onRegistrarDescarte?.(() => dispatch({ tipo: 'descartar-rascunho' }));
    return () => onRegistrarDescarte?.(null);
  }, [onRegistrarDescarte]);

  useEffect(() => {
    if (!rascunhoSujo) return undefined;
    const avisarAntesDeSair = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', avisarAntesDeSair);
    return () => window.removeEventListener('beforeunload', avisarAntesDeSair);
  }, [rascunhoSujo]);

  function confirmarDescarte() {
    return !rascunhoSujo || window.confirm('Há alterações não salvas. Deseja descartá-las?');
  }

  function criarNota() {
    if (!confirmarDescarte()) return;
    dispatch({ tipo: 'criar-rascunho', ...contextoInicial(contexto) });
  }

  function selecionarNota(nota) {
    if (nota.id === estado.idSelecionado && !estado.notaNova) return;
    if (!confirmarDescarte()) return;
    dispatch({ tipo: 'selecionar-nota', nota });
  }

  async function salvarNota(event) {
    event.preventDefault();
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
        mensagem: erro.message || 'Não foi possível salvar a nota.',
      });
    }
  }

  async function excluirNota() {
    const nota = estado.notas.find((item) => item.id === estado.idSelecionado);
    if (!nota) return;
    const textoConfirmacao = rascunhoSujo
      ? `Excluir “${nota.titulo}” e descartar as alterações não salvas?`
      : `Excluir “${nota.titulo}”?`;
    if (!window.confirm(textoConfirmacao)) return;

    dispatch({ tipo: 'exclusao-iniciada' });
    try {
      await notasAPI.remover(nota.id);
      dispatch({ tipo: 'nota-excluida', id: nota.id });
    } catch (erro) {
      dispatch({
        tipo: 'exclusao-falhou',
        mensagem: erro.message || 'Não foi possível excluir a nota.',
      });
    }
  }

  function alterarFiltro(event) {
    const valor = event.target.value;
    if (valor === 'todas') {
      onNavegar('Anotações');
      return;
    }
    if (valor.startsWith('mapa:')) {
      onNavegar('Anotações', { objetivoId: Number(valor.slice(5)) });
      return;
    }
    if (valor.startsWith('ilha:')) {
      onNavegar('Anotações', { etapaId: Number(valor.slice(5)) });
    }
  }

  const notaSelecionada = estado.notas.find((nota) => nota.id === estado.idSelecionado);
  const mostrarEditor = estado.notaNova || notaSelecionada != null;
  const novoVinculo = valorDoVinculo(estado.objetivoId, estado.etapaId);
  const chaveEditor = estado.notaNova
    ? `nova-${estado.chaveEditorNovo}`
    : `nota-${estado.idSelecionado}`;

  return (
    <article className="painel-card notas-card min-w-0" id="anotacoes">
      <header className="notas-cabecalho">
        <div>
          <span className="notas-eyebrow">ESPAÇO PESSOAL</span>
          <h2>Anotações</h2>
          <p>Guarde suas ideias em documentos organizados por blocos.</p>
        </div>
        <div className="notas-acoes-cabecalho">
          <label>
            <span>Mostrar</span>
            <select value={valorFiltro} onChange={alterarFiltro} aria-label="Filtrar notas por contexto">
              <option value="todas">Todas as notas</option>
              {objetivos.map((objetivo) => (
                <optgroup key={`mapa-${objetivo.id}`} label={`Mapa · ${objetivo.nome}`}>
                  <option value={`mapa:${objetivo.id}`}>Notas do mapa</option>
                  {(objetivo.etapas ?? []).map((ilha) => (
                    <option key={ilha.id} value={`ilha:${ilha.id}`}>
                      Ilha · {ilha.texto ?? ilha.titulo}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button type="button" className="notas-botao-principal" onClick={criarNota}>
            Nova nota
          </button>
        </div>
      </header>

      {(estado.erro || estado.sucesso) && (
        <div className="notas-feedback" aria-live="polite">
          {estado.erro && <p role="alert">{estado.erro}</p>}
          {estado.sucesso && <p role="status">{estado.sucesso}</p>}
          {estado.erro && (
            <button
              type="button"
              onClick={() => {
                dispatch({ tipo: 'carregamento-iniciado' });
                const filtros = {};
                if (filtroObjetivoId != null) filtros.objetivoId = filtroObjetivoId;
                if (filtroEtapaId != null) filtros.etapaId = filtroEtapaId;
                notasAPI.listar(filtros).then(
                  (notas) => dispatch({ tipo: 'carregamento-concluido', notas }),
                  (erro) => dispatch({
                    tipo: 'carregamento-falhou',
                    mensagem: erro.message || 'Não foi possível carregar suas notas.',
                  }),
                );
              }}
              disabled={estado.carregando || estado.salvando}
            >
              Tentar carregar novamente
            </button>
          )}
        </div>
      )}

      <div className="notas-layout">
        <aside className="notas-lista" aria-label="Lista de notas">
          <div className="notas-lista-topo">
            <h3>{filtroEtapaId != null ? 'Notas da ilha' : filtroObjetivoId != null ? 'Notas do mapa' : 'Suas notas'}</h3>
            <span>{estado.notas.length}</span>
          </div>
          {estado.carregando && <p role="status" className="notas-vazio">Carregando notas…</p>}
          {!estado.carregando && estado.notas.length === 0 && (
            <p className="notas-vazio">Nenhuma nota neste contexto. Crie uma para começar.</p>
          )}
          <ul>
            {estado.notas.map((nota) => (
              <li key={nota.id}>
                <button
                  type="button"
                  className={`notas-item ${estado.idSelecionado === nota.id ? 'selecionada' : ''}`}
                  aria-pressed={estado.idSelecionado === nota.id}
                  onClick={() => selecionarNota(nota)}
                >
                  <strong>{nota.titulo || 'Sem título'}</strong>
                  <span>{rotuloAssociacao(nota, objetivos)}</span>
                  <small>{nota.atualizadoEm ? new Date(nota.atualizadoEm).toLocaleDateString('pt-BR') : ''}</small>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="notas-editor-painel" aria-label="Editor da nota">
          {mostrarEditor ? (
            <>
              <form className="notas-formulario" onSubmit={salvarNota}>
                <label className="notas-titulo-campo">
                  <span>Título</span>
                  <input
                    required
                    maxLength={200}
                    value={estado.titulo}
                    onChange={(event) => dispatch({ tipo: 'editar-titulo', titulo: event.target.value })}
                    placeholder="Dê um título à sua nota"
                    aria-label="Título da nota"
                    disabled={estado.salvando}
                  />
                </label>

                <label className="notas-vinculo-campo">
                  <span>Vínculo</span>
                  {estado.notaNova && contexto == null ? (
                    <select
                      value={novoVinculo}
                      onChange={(event) => dispatch({ tipo: 'alterar-associacao', ...dadosDoVinculo(event.target.value) })}
                      aria-label="Associação da nova nota"
                      disabled={estado.salvando}
                    >
                      <option value="independente">Independente</option>
                      {objetivos.map((objetivo) => (
                        <optgroup key={`opcoes-${objetivo.id}`} label={objetivo.nome}>
                          <option value={`mapa:${objetivo.id}`}>Mapa · {objetivo.nome}</option>
                          {(objetivo.etapas ?? []).map((ilha) => (
                            <option key={ilha.id} value={`ilha:${ilha.id}`}>
                              Ilha · {ilha.texto ?? ilha.titulo}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <span className="notas-vinculo-valor">
                      {rotuloAssociacao({ objetivoId: estado.objetivoId, etapaId: estado.etapaId }, objetivos)}
                    </span>
                  )}
                </label>

                <div className="notas-botoes-editor">
                  {notaSelecionada && (
                    <button type="button" className="notas-botao-secundario perigo" onClick={excluirNota} disabled={estado.salvando}>
                      Excluir
                    </button>
                  )}
                  <button
                    type="submit"
                    className="notas-botao-principal"
                    disabled={estado.salvando || estado.conflito || !estado.titulo.trim() || !rascunhoSujo}
                  >
                    {estado.salvando ? 'Salvando…' : 'Salvar nota'}
                  </button>
                </div>
              </form>
              {estado.conflito && (
                <p role="alert" className="notas-conflito">
                  A versão do servidor não foi carregada nem sobrescrita. Copie seu rascunho antes de sair desta nota.
                </p>
              )}
              <BlockNoteEditor
                key={chaveEditor}
                initialContent={estado.conteudo}
                onDocumentChange={(conteudo) => dispatch({ tipo: 'editar-conteudo', conteudo })}
                readOnly={estado.salvando}
              />
            </>
          ) : (
            <div className="notas-editor-vazio">
              <span aria-hidden="true">✦</span>
              <h3>{estado.notas.length ? 'Selecione uma nota' : 'Comece uma nova nota'}</h3>
              <p>
                {estado.notas.length
                  ? 'Escolha uma nota na lista para abrir e editar seu conteúdo.'
                  : 'Crie um documento independente ou associe-o a um mapa ou ilha.'}
              </p>
              {!estado.notas.length && (
                <button type="button" className="notas-botao-principal" onClick={criarNota}>
                  Criar primeira nota
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

export default Notas;

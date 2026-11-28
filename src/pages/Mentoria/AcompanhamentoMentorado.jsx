import { useState, useEffect, useCallback, useMemo } from 'react';
import { listarObjetivosDoMentorado } from '../../services/mentoriaApi.js';
import Icon from '../../components/Icon.jsx';

function normalizarProgresso(prog) {
  if (typeof prog === 'number' && Number.isFinite(prog)) {
    return Math.max(0, Math.min(100, Math.round(prog)));
  }
  if (prog && typeof prog === 'object' && typeof prog.percentual === 'number' && Number.isFinite(prog.percentual)) {
    return Math.max(0, Math.min(100, Math.round(prog.percentual)));
  }
  return 0;
}

function normalizarPrazo(prazo) {
  if (!prazo) return null;
  if (typeof prazo === 'string') {
    const dataLimpa = prazo.split('T')[0];
    const partes = dataLimpa.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataLimpa;
  }
  if (Array.isArray(prazo) && prazo.length >= 3) {
    const dia = String(prazo[2]).padStart(2, '0');
    const mes = String(prazo[1]).padStart(2, '0');
    const ano = prazo[0];
    return `${dia}/${mes}/${ano}`;
  }
  return null;
}

export default function AcompanhamentoMentorado({
  mentorados = [],
  mentoradoSelecionadoInicial = null,
  onAbrirChat = () => {},
  onCriarOrientacao = () => {},
}) {
  const [mentoradoId, setMentoradoId] = useState(() => {
    return (
      mentoradoSelecionadoInicial?.mentoradoId ||
      mentoradoSelecionadoInicial?.id ||
      mentorados[0]?.mentoradoId ||
      mentorados[0]?.id ||
      null
    );
  });

  const [objetivos, setObjetivos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [ilhaAberta, setIlhaAberta] = useState(null);

  // Sincroniza mentoradoId caso a prop mentoradoSelecionadoInicial mude
  useEffect(() => {
    if (mentoradoSelecionadoInicial?.mentoradoId) {
      setMentoradoId(mentoradoSelecionadoInicial.mentoradoId);
    } else if (mentoradoSelecionadoInicial?.id && !mentoradoId) {
      setMentoradoId(mentoradoSelecionadoInicial.id);
    } else if (!mentoradoId && mentorados.length > 0) {
      setMentoradoId(mentorados[0].mentoradoId || mentorados[0].id);
    }
  }, [mentoradoSelecionadoInicial, mentorados, mentoradoId]);

  const mentoradoAtual = useMemo(() => {
    if (!mentoradoId || mentorados.length === 0) return null;
    return (
      mentorados.find((m) => Number(m.mentoradoId) === Number(mentoradoId)) ||
      mentorados.find((m) => Number(m.id) === Number(mentoradoId)) ||
      mentorados[0] ||
      null
    );
  }, [mentoradoId, mentorados]);

  const carregarObjetivos = useCallback(async () => {
    if (!mentoradoId) {
      setObjetivos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const dados = await listarObjetivosDoMentorado(mentoradoId);
      setObjetivos(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar os objetivos e progresso deste mentorado.');
    } finally {
      setCarregando(false);
    }
  }, [mentoradoId]);

  useEffect(() => {
    if (mentoradoId) {
      carregarObjetivos();
    }
  }, [mentoradoId, carregarObjetivos]);

  // Se o mentor não tem nenhum mentorado vinculado
  if (mentorados.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-[#0D1930] border border-[#26395C] text-center text-slate-400 space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#070C1E] border border-[#1E3156] text-sky-400 flex items-center justify-center mx-auto shadow-inner">
          <Icon name="users" size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Nenhum mentorado vinculado no momento</h3>
          <p className="text-sm max-w-md mx-auto text-slate-400 leading-relaxed">
            Quando você aceitar solicitações de mentoria, a evolução real dos objetivos, ilhas e tarefas dos seus mentorados aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  // Cálculos consolidados de evolução usando dados reais
  const listaObjetivos = Array.isArray(objetivos) ? objetivos : [];
  const todasEtapas = listaObjetivos.flatMap((o) =>
    Array.isArray(o?.etapas) ? o.etapas : (Array.isArray(o?.ilhas) ? o.ilhas : [])
  );
  const todasTarefas = todasEtapas.flatMap((e) => (Array.isArray(e?.tarefas) ? e.tarefas : []));
  const tarefasConcluidas = todasTarefas.filter((t) => Boolean(t?.concluida)).length;
  const totalTarefas = todasTarefas.length;

  const todosTopicos = todasEtapas.flatMap((e) => (Array.isArray(e?.topicos) ? e.topicos : []));
  const topicosConcluidos = todosTopicos.filter((p) => Boolean(p?.concluido)).length;
  const totalTopicos = todosTopicos.length;

  const totalItens = totalTarefas + totalTopicos;
  const itensConcluidos = tarefasConcluidas + topicosConcluidos;
  const percentualGeral = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Seletor do Mentorado e Header */}
      <div className="p-6 rounded-3xl bg-[#0D1930] border border-[#26395C] shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
            {(mentoradoAtual?.mentoradoNome || 'M').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="trending-up" size={14} />
              <span>Evolução do Mentorado</span>
            </span>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={mentoradoId || ''}
                onChange={(e) => setMentoradoId(Number(e.target.value))}
                className="rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-1.5 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-sky-500 shadow-inner"
              >
                {mentorados.map((m) => {
                  const valorOpcao = m.mentoradoId || m.id;
                  return (
                    <option key={valorOpcao} value={valorOpcao}>
                      {m.mentoradoNome} ({m.mentoradoEmail})
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Objetivo da Mentoria: <span className="text-slate-300 italic">"{mentoradoAtual?.objetivo || 'Desenvolvimento contínuo'}"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAbrirChat(mentoradoAtual)}
            className="px-4 py-2 rounded-xl bg-[#1A2C50] hover:bg-sky-600 border border-[#26395C] text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Icon name="message-square" size={14} />
            <span>Chat com Mentorado</span>
          </button>
          <button
            type="button"
            onClick={() => onCriarOrientacao(mentoradoAtual)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Icon name="plus" size={14} />
            <span>Registrar Orientação</span>
          </button>
        </div>
      </div>

      {/* Estado 1: CARREGANDO */}
      {carregando && (
        <div className="p-16 rounded-3xl bg-[#0D1930] border border-[#26395C] text-center text-slate-400 space-y-4 shadow-xl">
          <span className="animate-spin inline-block text-3xl text-sky-400">◌</span>
          <p className="text-sm font-medium text-slate-300">Carregando objetivos, ilhas e tarefas do mentorado...</p>
        </div>
      )}

      {/* Estado 2: ERRO AO CARREGAR */}
      {!carregando && erro && (
        <div className="p-8 rounded-3xl bg-rose-950/60 border border-rose-800 text-rose-200 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-300">
              <Icon name="alert-circle" size={20} />
            </span>
            <h4 className="text-base font-bold text-white">Falha ao consultar evolução do mentorado</h4>
          </div>
          <p className="text-sm text-rose-300">{erro}</p>
          <div>
            <button
              type="button"
              onClick={carregarObjetivos}
              className="px-4 py-2 bg-rose-900/80 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Estado 3: NENHUM DADO DISPONÍVEL */}
      {!carregando && !erro && listaObjetivos.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#0D1930] border border-[#26395C] text-center text-slate-400 space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#070C1E] border border-[#1E3156] text-slate-400 flex items-center justify-center mx-auto">
            <Icon name="target" size={24} />
          </div>
          <h4 className="text-base font-bold text-slate-200">Nenhum objetivo cadastrado pelo mentorado</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Este mentorado ainda não possui mapas ou objetivos criados na plataforma Farol. Você pode sugerir que ele crie o primeiro objetivo ou registrar uma orientação específica.
          </p>
        </div>
      )}

      {/* Estado 4: EVOLUÇÃO CARREGADA COM DADOS REAIS */}
      {!carregando && !erro && listaObjetivos.length > 0 && (
        <div className="space-y-6">
          {/* Métricas Consolidadas do Mentorado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Progresso Geral</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{percentualGeral}%</span>
                <span className="text-xs text-slate-400">concluído</span>
              </div>
              <div className="w-full bg-[#070C1E] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentualGeral}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Objetivos & Mapas</span>
              <p className="text-3xl font-extrabold text-sky-400">{listaObjetivos.length}</p>
              <p className="text-xs text-slate-400">
                {todasEtapas.length} ilha(s) / etapa(s) no total
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Tarefas das Ilhas</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">{tarefasConcluidas}</span>
                <span className="text-xs text-slate-400">de {totalTarefas} finalizadas</span>
              </div>
              <p className="text-xs text-slate-400">atividades práticas das etapas</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Tópicos de Conteúdo</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-400">{topicosConcluidos}</span>
                <span className="text-xs text-slate-400">de {totalTopicos} absorvidos</span>
              </div>
              <p className="text-xs text-slate-400">tópicos teóricos estudados</p>
            </div>
          </div>

          {/* Lista de Objetivos e Ilhas */}
          <div className="space-y-6">
            {listaObjetivos.map((obj) => {
              const etapasDoObj = Array.isArray(obj?.etapas)
                ? obj.etapas
                : Array.isArray(obj?.ilhas)
                ? obj.ilhas
                : [];

              const tarefasDoObj = etapasDoObj.flatMap((e) => (Array.isArray(e?.tarefas) ? e.tarefas : []));
              const concluidasObj = tarefasDoObj.filter((t) => Boolean(t?.concluida)).length;
              const percObj = tarefasDoObj.length > 0 ? Math.round((concluidasObj / tarefasDoObj.length) * 100) : 0;
              const prazoObjFormatado = normalizarPrazo(obj?.prazo);

              return (
                <div
                  key={obj.id}
                  className="p-6 rounded-3xl bg-[#0D1930] border border-[#26395C] shadow-lg space-y-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1E3156] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
                          <Icon name="target" size={18} />
                        </span>
                        <h3 className="text-lg font-bold text-white">{obj.titulo || obj.nome}</h3>
                      </div>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        {obj.descricao || 'Sem descrição cadastrada'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#070C1E] border border-[#26395C] text-slate-300">
                        Prioridade: {obj.prioridade || 'MÉDIA'}
                      </span>
                      {prazoObjFormatado && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#070C1E] border border-[#26395C] text-sky-300">
                          Prazo: {prazoObjFormatado}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-950 border border-sky-700 text-sky-300">
                        {percObj}% concluído
                      </span>
                    </div>
                  </div>

                  {/* Grid de Ilhas / Etapas do Objetivo */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Ilhas e Etapas do Mapa ({etapasDoObj.length})
                    </h4>

                    {etapasDoObj.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-[#070C1E] border border-[#1E3156]">
                        Este objetivo ainda não possui ilhas/etapas criadas.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {etapasDoObj.map((ilha) => {
                          const tarefasIlha = Array.isArray(ilha?.tarefas) ? ilha.tarefas : [];
                          const topicosIlha = Array.isArray(ilha?.topicos) ? ilha.topicos : [];
                          const ilhaTotal = tarefasIlha.length;
                          const ilhaConcluidas = tarefasIlha.filter((t) => Boolean(t?.concluida)).length;
                          const progresso = normalizarProgresso(
                            ilha.progresso ?? (ilhaTotal > 0 ? Math.round((ilhaConcluidas / ilhaTotal) * 100) : 0)
                          );
                          const isAberta = ilhaAberta === ilha.id;

                          return (
                            <div
                              key={ilha.id}
                              className="p-4 rounded-2xl bg-[#070C1E] border border-[#1E3156] hover:border-sky-500/50 transition-all space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-semibold text-slate-200 text-sm truncate" title={ilha.titulo || ilha.texto}>
                                  {ilha.titulo || ilha.texto || 'Ilha sem título'}
                                </h5>
                                <span className="text-xs font-bold text-sky-400 shrink-0">{progresso}%</span>
                              </div>

                              <div className="w-full bg-[#12203E] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-sky-500 h-full rounded-full transition-all"
                                  style={{ width: `${progresso}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                                <span>{ilhaTotal} tarefas • {topicosIlha.length} tópicos</span>
                                <button
                                  type="button"
                                  onClick={() => setIlhaAberta(isAberta ? null : ilha.id)}
                                  className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                                >
                                  {isAberta ? 'Ocultar' : 'Ver detalhes'}
                                </button>
                              </div>

                              {/* Tarefas e Tópicos Expandidos */}
                              {isAberta && (
                                <div className="pt-3 border-t border-[#1E3156] space-y-2.5 max-h-56 overflow-y-auto">
                                  {ilhaTotal === 0 && topicosIlha.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">Nenhuma tarefa ou tópico nesta ilha.</p>
                                  ) : (
                                    <>
                                      {tarefasIlha.map((t) => {
                                        const prazoTarefa = normalizarPrazo(t.prazo);
                                        return (
                                          <div
                                            key={t.id}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-[#0D1930] border border-[#1E3156] text-xs text-slate-300"
                                          >
                                            <span
                                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                t.concluida
                                                  ? 'bg-emerald-600 text-white'
                                                  : 'border border-slate-600 text-transparent'
                                              }`}
                                            >
                                              ✓
                                            </span>
                                            <span className={`flex-1 truncate ${t.concluida ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                              {t.titulo}
                                            </span>
                                            {prazoTarefa && (
                                              <span className="text-[10px] text-slate-400 shrink-0 bg-[#070C1E] px-1.5 py-0.5 rounded">
                                                {prazoTarefa}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}

                                      {topicosIlha.map((p) => (
                                        <div
                                          key={p.id || p.chave}
                                          className="flex items-center gap-2 p-1.5 rounded-lg bg-[#070C1E] border border-[#1E3156]/60 text-xs text-slate-400"
                                        >
                                          <span className="text-indigo-400 text-[10px]">●</span>
                                          <span className={`flex-1 truncate ${p.concluido ? 'line-through text-slate-500' : ''}`}>
                                            {p.titulo}
                                          </span>
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

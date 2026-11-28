import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';
import ChatMentoria from './ChatMentoria.jsx';
import ReunioesMentoria from './ReunioesMentoria.jsx';
import OrientacoesMentoria from './OrientacoesMentoria.jsx';
import AcompanhamentoMentorado from './AcompanhamentoMentorado.jsx';
import {
  responderSolicitacaoMentoria,
  atualizarLinkReuniaoMentor,
} from '../../services/mentoriaApi.js';

export default function MentorWorkspace({
  perfilMentor,
  mentorados = [],
  solicitacoes = [],
  onRecarregar = () => {},
}) {
  const [abaAtiva, setAbaAtiva] = useState('visao-geral'); // 'visao-geral' | 'mentorados' | 'evolucao' | 'chat' | 'reunioes' | 'orientacoes' | 'solicitacoes' | 'perfil'
  const [mentoradoFoco, setMentoradoFoco] = useState(() => mentorados[0] || null);

  // Modais de Solicitação
  const [modalAceitar, setModalAceitar] = useState(null);
  const [linkReuniaoAceite, setLinkReuniaoAceite] = useState(perfilMentor?.linkReuniaoPadrao || '');
  const [respondendo, setRespondendo] = useState(false);

  // Modal Atualizar Link Padrão
  const [modalLink, setModalLink] = useState(null);
  const [novoLink, setNovoLink] = useState('');
  const [salvandoLink, setSalvandoLink] = useState(false);

  const [mensagemStatus, setMensagemStatus] = useState('');

  const mentoradoAtual = mentorados.find((m) => m.id === mentoradoFoco?.id) || mentorados[0] || null;

  async function handleResponder(solicitacaoId, aceitar, link) {
    setRespondendo(true);
    try {
      await responderSolicitacaoMentoria(solicitacaoId, {
        aceitar,
        linkReuniao: link || perfilMentor?.linkReuniaoPadrao || 'https://meet.google.com',
      });
      setModalAceitar(null);
      setMensagemStatus(aceitar ? 'Solicitação aceita! Mentorado vinculado com sucesso.' : 'Solicitação recusada.');
      setTimeout(() => setMensagemStatus(''), 5000);
      onRecarregar();
    } catch (err) {
      alert(err.message || 'Erro ao responder solicitação.');
    } finally {
      setRespondendo(false);
    }
  }

  async function handleSalvarLinkVinculo(e) {
    e.preventDefault();
    if (!modalLink || !novoLink.trim()) return;

    setSalvandoLink(true);
    try {
      await atualizarLinkReuniaoMentor(modalLink.id, novoLink.trim());
      setModalLink(null);
      setNovoLink('');
      setMensagemStatus('Link de reunião do vínculo atualizado com sucesso!');
      setTimeout(() => setMensagemStatus(''), 4000);
      onRecarregar();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar link.');
    } finally {
      setSalvandoLink(false);
    }
  }

  const abas = [
    { id: 'visao-geral', label: 'Visão Geral', icone: 'home' },
    { id: 'mentorados', label: `Meus Mentorados (${mentorados.length})`, icone: 'users' },
    { id: 'evolucao', label: 'Evolução do mentorado', icone: 'trending-up' },
    { id: 'chat', label: 'Chat com Mentorados', icone: 'message-square' },
    { id: 'reunioes', label: 'Agenda & Reuniões', icone: 'calendar' },
    { id: 'orientacoes', label: 'Orientações', icone: 'notebook' },
    { id: 'solicitacoes', label: `Solicitações (${solicitacoes.length})`, icone: 'mail' },
    { id: 'perfil', label: 'Meu Perfil de Mentor', icone: 'user' },
  ];

  return (
    <div className="space-y-6">
      {mensagemStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
          <Icon name="check" size={18} />
          <span>{mensagemStatus}</span>
        </div>
      )}

      {/* Menu Superior do Mentor */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1E3156]">
        {abas.map((aba) => {
          const ativa = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                ativa
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12203E]'
              }`}
            >
              <Icon name={aba.icone} size={16} />
              <span>{aba.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. VISÃO GERAL */}
      {abaAtiva === 'visao-geral' && (
        <div className="space-y-6">
          {/* Card Mentor Info */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0D1930] to-[#15233E] border border-[#26395C] shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
                {(perfilMentor?.nome || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300 uppercase tracking-wider">
                  Mentor Homologado
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">{perfilMentor?.nome}</h2>
                <p className="text-sm text-slate-300">
                  {perfilMentor?.cargo} • {perfilMentor?.area}
                </p>
              </div>
            </div>

            {perfilMentor?.linkReuniaoPadrao && (
              <a
                href={perfilMentor.linkReuniaoPadrao}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Icon name="video" size={16} />
                <span>Minha Sala Virtual Padrão</span>
              </a>
            )}
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-1">
              <span className="text-xs text-slate-400 font-medium">Mentorados Ativos</span>
              <p className="text-3xl font-extrabold text-sky-400">{mentorados.length}</p>
              <p className="text-xs text-slate-500">pessoas sob sua mentoria</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-1">
              <span className="text-xs text-slate-400 font-medium">Solicitações Pendentes</span>
              <p className="text-3xl font-extrabold text-amber-400">{solicitacoes.length}</p>
              <p className="text-xs text-slate-500">aguardando sua resposta</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-1">
              <span className="text-xs text-slate-400 font-medium">Área de Atuação</span>
              <p className="text-xl font-bold text-white truncate">{perfilMentor?.area || 'Geral'}</p>
              <p className="text-xs text-slate-500">{perfilMentor?.cargo || 'Mentor'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-1">
              <span className="text-xs text-slate-400 font-medium">Disponibilidade</span>
              <p className="text-sm font-semibold text-slate-200 mt-1">
                {(perfilMentor?.disponibilidade || []).join(', ') || 'A combinar'}
              </p>
            </div>
          </div>

          {/* Solicitações em Destaque */}
          {solicitacoes.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0D1930] border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Icon name="mail" size={18} />
                  Solicitações Pendentes de Novos Mentorados ({solicitacoes.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setAbaAtiva('solicitacoes')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  Ver todas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solicitacoes.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-[#070C1E] border border-[#26395C] space-y-3"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.mentoradoNome}</h4>
                      <p className="text-xs text-slate-400">{s.mentoradoEmail}</p>
                    </div>
                    <p className="text-xs text-slate-300 italic bg-[#0D1930] p-3 rounded-xl border border-[#1E3156]">
                      "{s.objetivo}"
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleResponder(s.id, false)}
                        className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs font-medium"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalAceitar(s);
                          setLinkReuniaoAceite(perfilMentor?.linkReuniaoPadrao || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                      >
                        Aceitar Mentoria
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista Resumida de Mentorados */}
          <div className="p-6 rounded-3xl bg-[#0D1930] border border-[#26395C] space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Icon name="users" size={18} className="text-sky-400" />
              Seus Mentorados Ativos ({mentorados.length})
            </h3>

            {mentorados.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                Você ainda não possui mentorados ativos. Quando aceitar solicitações, eles aparecerão aqui.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentorados.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#070C1E] border border-[#1E3156] hover:border-sky-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        {(m.mentoradoNome || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-white text-sm truncate">{m.mentoradoNome}</h4>
                        <p className="text-xs text-slate-400 truncate">{m.mentoradoEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1E3156]">
                      <button
                        type="button"
                        onClick={() => {
                          setMentoradoFoco(m);
                          setAbaAtiva('evolucao');
                        }}
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                      >
                        Ver Evolução & Ilhas →
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMentoradoFoco(m);
                          setAbaAtiva('chat');
                        }}
                        className="p-1.5 rounded-lg bg-[#12203E] hover:bg-sky-600 text-slate-300 hover:text-white transition-colors"
                        title="Abrir chat"
                      >
                        <Icon name="message-square" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MEUS MENTORADOS */}
      {abaAtiva === 'mentorados' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#0D1930] border border-[#26395C]">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="users" size={22} className="text-sky-400" />
                Meus Mentorados Conectados
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Gerencie seus mentorados, acesse histórico e salas individuais de reunião.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentorados.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-3xl bg-[#0D1930] border border-[#26395C] space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                      {(m.mentoradoNome || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{m.mentoradoNome}</h3>
                      <p className="text-xs text-slate-400">{m.mentoradoEmail}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Ativo
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070C1E] border border-[#1E3156] text-xs text-slate-300">
                  <strong className="block text-slate-400 mb-0.5">Objetivo Declarado:</strong>
                  {m.objetivo || 'Desenvolvimento contínuo'}
                </div>

                {/* Link de Reunião do Vínculo */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#070C1E] border border-[#1E3156] text-xs">
                  <div className="truncate mr-2">
                    <span className="text-slate-500 block">Link de Reunião:</span>
                    <span className="text-sky-400 truncate block">{m.linkReuniao || 'Padrão do mentor'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalLink(m);
                      setNovoLink(m.linkReuniao || '');
                    }}
                    className="text-xs text-slate-300 hover:text-white underline shrink-0"
                  >
                    Alterar
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E3156]">
                  <button
                    type="button"
                    onClick={() => {
                      setMentoradoFoco(m);
                      setAbaAtiva('evolucao');
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs text-center transition-colors shadow-md"
                  >
                    Acompanhar Evolução
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMentoradoFoco(m);
                      setAbaAtiva('chat');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#1A2C50] hover:bg-sky-600 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Icon name="message-square" size={14} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EVOLUÇÃO DO MENTORADO */}
      {(abaAtiva === 'evolucao' || abaAtiva === 'acompanhamento') && (
        <ErrorBoundary fallbackTitle="Falha ao renderizar a evolução do mentorado">
          <AcompanhamentoMentorado
            mentorados={mentorados}
            mentoradoSelecionadoInicial={mentoradoAtual}
            onAbrirChat={(m) => {
              setMentoradoFoco(m);
              setAbaAtiva('chat');
            }}
            onCriarOrientacao={(m) => {
              setMentoradoFoco(m);
              setAbaAtiva('orientacoes');
            }}
          />
        </ErrorBoundary>
      )}

      {/* 4. CHAT COM MENTORADOS */}
      {abaAtiva === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[750px]">
          {/* Seletor Lateral */}
          <div className="p-4 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-3 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Conversas ({mentorados.length})
            </h3>
            {mentorados.map((m) => {
              const selecionado = mentoradoAtual?.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMentoradoFoco(m)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                    selecionado
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'hover:bg-[#12203E] text-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1A2C50] flex items-center justify-center font-bold text-xs shrink-0">
                    {(m.mentoradoNome || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">{m.mentoradoNome}</p>
                    <p className="text-[11px] opacity-70 truncate">{m.mentoradoEmail}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Área do Chat */}
          <div className="md:col-span-3 h-full">
            {mentoradoAtual ? (
              <ChatMentoria
                vinculoId={mentoradoAtual.id}
                nomeContato={mentoradoAtual.mentoradoNome}
                cargoContato="Mentorado"
                tituloConversa={`Conversa com ${mentoradoAtual.mentoradoNome}`}
              />
            ) : (
              <div className="flex items-center justify-center h-full rounded-2xl bg-[#0D1930] border border-[#26395C] text-slate-400">
                Selecione um mentorado para iniciar o chat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. REUNIÕES */}
      {abaAtiva === 'reunioes' && (
        <div className="space-y-4">
          {mentorados.length > 1 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0D1930] border border-[#26395C] text-xs">
              <span className="text-slate-400">Gerenciando reuniões de:</span>
              <select
                value={mentoradoAtual?.id || ''}
                onChange={(e) => {
                  const achado = mentorados.find((m) => m.id === Number(e.target.value));
                  if (achado) setMentoradoFoco(achado);
                }}
                className="bg-[#070C1E] border border-[#26395C] rounded-lg px-2.5 py-1 text-slate-100 font-semibold"
              >
                {mentorados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.mentoradoNome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mentoradoAtual ? (
            <ReunioesMentoria
              vinculoId={mentoradoAtual.id}
              linkPadrao={mentoradoAtual.linkReuniao || perfilMentor?.linkReuniaoPadrao}
              permiteAgendar={true}
              tituloSeção={`Agenda de Reuniões com ${mentoradoAtual.mentoradoNome}`}
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              Nenhum mentorado vinculado para gerenciar reuniões.
            </div>
          )}
        </div>
      )}

      {/* 6. ORIENTAÇÕES */}
      {abaAtiva === 'orientacoes' && (
        <div className="space-y-4">
          {mentorados.length > 1 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0D1930] border border-[#26395C] text-xs">
              <span className="text-slate-400">Orientações de:</span>
              <select
                value={mentoradoAtual?.id || ''}
                onChange={(e) => {
                  const achado = mentorados.find((m) => m.id === Number(e.target.value));
                  if (achado) setMentoradoFoco(achado);
                }}
                className="bg-[#070C1E] border border-[#26395C] rounded-lg px-2.5 py-1 text-slate-100 font-semibold"
              >
                {mentorados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.mentoradoNome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mentoradoAtual ? (
            <OrientacoesMentoria
              vinculoId={mentoradoAtual.id}
              ehMentor={true}
              tituloSeção={`Orientações Passadas para ${mentoradoAtual.mentoradoNome}`}
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              Nenhum mentorado vinculado para registrar orientações.
            </div>
          )}
        </div>
      )}

      {/* 7. SOLICITAÇÕES */}
      {abaAtiva === 'solicitacoes' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Icon name="mail" size={22} className="text-sky-400" />
              Solicitações de Mentoria ({solicitacoes.length})
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Avalie os objetivos dos interessados e decida se pode orientá-los.
            </p>
          </div>

          {solicitacoes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D1930] border border-[#26395C] text-slate-400">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solicitacoes.map((s) => (
                <div
                  key={s.id}
                  className="p-6 rounded-3xl bg-[#0D1930] border border-[#26395C] space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{s.mentoradoNome}</h3>
                      <p className="text-xs text-slate-400">{s.mentoradoEmail}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                      Pendente
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070C1E] border border-[#1E3156] text-xs text-slate-200">
                    <strong className="block text-slate-400 mb-1">Objetivo Informado pelo Aluno:</strong>
                    "{s.objetivo}"
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleResponder(s.id, false)}
                      className="px-4 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs font-medium"
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalAceitar(s);
                        setLinkReuniaoAceite(perfilMentor?.linkReuniaoPadrao || '');
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md"
                    >
                      Aceitar e Conectar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. MEU PERFIL */}
      {abaAtiva === 'perfil' && (
        <div className="p-8 rounded-3xl bg-[#0D1930] border border-[#26395C] space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon name="user" size={22} className="text-sky-400" />
            Dados do Perfil de Mentor
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-400">Nome e Cargo:</span>
              <p className="text-base font-bold text-white">{perfilMentor?.nome} - {perfilMentor?.cargo}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Área de Atuação:</span>
              <p className="text-sm text-slate-200">{perfilMentor?.area}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Apresentação / Bio:</span>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed bg-[#070C1E] p-3.5 rounded-xl border border-[#1E3156]">
                {perfilMentor?.bio}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Habilidades e Tags:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(perfilMentor?.habilidades || []).map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#12203E] border border-[#1E3156] text-xs text-slate-300">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400">Link Fixo de Reunião Padrão:</span>
              <p className="text-xs text-sky-400 mt-0.5 truncate">{perfilMentor?.linkReuniaoPadrao}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aceitar Solicitação */}
      {modalAceitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Aceitar Mentoria de {modalAceitar.mentoradoNome}</h3>
            <p className="text-xs text-slate-300">
              Confirme ou personalize o link de videoconferência para as reuniões com este mentorado.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Link de Reunião (Google Meet, Zoom, etc.)
              </label>
              <input
                type="url"
                required
                value={linkReuniaoAceite}
                onChange={(e) => setLinkReuniaoAceite(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1E3156]">
              <button
                type="button"
                onClick={() => setModalAceitar(null)}
                className="px-4 py-2 rounded-xl bg-[#1A2C50] text-slate-300 hover:text-white text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={respondendo}
                onClick={() => handleResponder(modalAceitar.id, true, linkReuniaoAceite)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
              >
                {respondendo ? 'Conectando...' : 'Confirmar e Iniciar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atualizar Link do Vínculo */}
      {modalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Alterar Link de Reunião</h3>
            <form onSubmit={handleSalvarLinkVinculo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Novo Link de Reunião
                </label>
                <input
                  type="url"
                  required
                  value={novoLink}
                  onChange={(e) => setNovoLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1E3156]">
                <button
                  type="button"
                  onClick={() => setModalLink(null)}
                  className="px-4 py-2 rounded-xl bg-[#1A2C50] text-slate-300 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoLink}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
                >
                  {salvandoLink ? 'Salvando...' : 'Salvar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

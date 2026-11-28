import { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import ChatMentoria from './ChatMentoria.jsx';
import ReunioesMentoria from './ReunioesMentoria.jsx';
import OrientacoesMentoria from './OrientacoesMentoria.jsx';
import {
  enviarSolicitacaoMentoria,
  cancelarSolicitacaoMentoria,
  encerrarVinculoMentoria,
} from '../../services/mentoriaApi.js';

export default function MentoradoWorkspace({
  vinculoAtivo,
  solicitacaoPendente,
  mentoresDisponiveis = [],
  objetivos = [],
  tarefas = [],
  onRecarregar = () => {},
  onNavegar = () => {},
}) {
  const [abaAtiva, setAbaAtiva] = useState('visao-geral'); // 'visao-geral' | 'meu-mentor' | 'chat' | 'reunioes' | 'orientacoes'
  const [mentorModal, setMentorModal] = useState(null);
  const [objetivoSolicitacao, setObjetivoSolicitacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [buscaMentor, setBuscaMentor] = useState('');
  const [mensagemStatus, setMensagemStatus] = useState('');

  async function handleSolicitar(e) {
    e.preventDefault();
    if (!mentorModal || !objetivoSolicitacao.trim()) {
      alert('Por favor, descreva seus objetivos e o que espera da mentoria.');
      return;
    }

    setEnviando(true);
    try {
      await enviarSolicitacaoMentoria({
        mentorId: mentorModal.id,
        objetivo: objetivoSolicitacao.trim(),
      });
      setMentorModal(null);
      setObjetivoSolicitacao('');
      setMensagemStatus('Solicitação enviada com sucesso! Aguarde a resposta do mentor.');
      setTimeout(() => setMensagemStatus(''), 5000);
      onRecarregar();
    } catch (err) {
      alert(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleCancelarSolicitacao(id) {
    if (!window.confirm('Deseja realmente cancelar esta solicitação de mentoria?')) return;
    try {
      await cancelarSolicitacaoMentoria(id);
      setMensagemStatus('Solicitação cancelada.');
      setTimeout(() => setMensagemStatus(''), 4000);
      onRecarregar();
    } catch (err) {
      alert(err.message || 'Erro ao cancelar solicitação.');
    }
  }

  async function handleEncerrarVinculo(id) {
    if (
      !window.confirm(
        'Deseja realmente encerrar sua mentoria? Todo o histórico de reuniões e orientações será preservado.'
      )
    ) {
      return;
    }
    try {
      await encerrarVinculoMentoria(id);
      setMensagemStatus('Mentoria encerrada.');
      setTimeout(() => setMensagemStatus(''), 4000);
      onRecarregar();
    } catch (err) {
      alert(err.message || 'Erro ao encerrar mentoria.');
    }
  }

  // Se não tem vínculo ativo e tem solicitação pendente
  if (!vinculoAtivo && solicitacaoPendente) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0D1930] to-[#12203E] border border-amber-500/30 shadow-2xl text-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <span className="p-3 rounded-2xl bg-amber-950/70 border border-amber-800">
              <Icon name="clock" size={26} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Solicitação de Mentoria em Análise</h2>
              <p className="text-sm text-slate-300">
                Seu pedido foi enviado e está aguardando a resposta do mentor.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#070C1E] border border-[#26395C] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Mentor Escolhido:</span>
                <p className="text-base font-semibold text-white">
                  {solicitacaoPendente.mentorNome || 'Mentor Farol'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 border border-amber-700 text-amber-300">
                Aguardando Mentor
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400">Seu Objetivo Informado:</span>
              <p className="text-sm text-slate-200 mt-1 italic leading-relaxed">
                "{solicitacaoPendente.objetivo}"
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleCancelarSolicitacao(solicitacaoPendente.id)}
              className="px-4 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-sm font-medium transition-colors"
            >
              Cancelar Solicitação
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem vínculo ativo e não tem solicitação -> Vitrine de Mentores
  if (!vinculoAtivo) {
    const mentoresFiltrados = mentoresDisponiveis.filter((m) => {
      const termo = buscaMentor.toLowerCase();
      return (
        (m.nome || '').toLowerCase().includes(termo) ||
        (m.cargo || '').toLowerCase().includes(termo) ||
        (m.area || '').toLowerCase().includes(termo) ||
        (m.habilidades || []).some((h) => h.toLowerCase().includes(termo))
      );
    });

    return (
      <div className="space-y-6">
        {mensagemStatus && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
            <Icon name="check" size={18} />
            <span>{mensagemStatus}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0D1930] via-[#12203E] to-[#1A2C50] border border-[#26395C] shadow-2xl space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 border border-sky-800 text-sky-300 uppercase tracking-wider">
            Programa de Mentorias Farol
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Conecte-se com Mentores Experientes
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Profissionais voluntários prontos para orientar sua jornada, analisar seus objetivos e
            ajudar você a acelerar sua carreira e aprendizado.
          </p>

          <div className="pt-2">
            <input
              type="text"
              value={buscaMentor}
              onChange={(e) => setBuscaMentor(e.target.value)}
              placeholder="Buscar mentor por nome, cargo, área ou tecnologia..."
              className="w-full max-w-md rounded-2xl bg-[#070C1E] border border-[#26395C] px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>
        </div>

        {/* Grid de Mentores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentoresFiltrados.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl bg-[#0D1930] border border-[#26395C] text-slate-400">
              Nenhum mentor encontrado para os critérios pesquisados.
            </div>
          ) : (
            mentoresFiltrados.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-[#0D1930] border border-[#26395C] hover:border-sky-500/60 transition-all shadow-lg space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {(m.nome || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{m.nome}</h3>
                      <p className="text-xs text-sky-400 font-medium">{m.cargo}</p>
                      <p className="text-xs text-slate-400">{m.area}</p>
                    </div>
                  </div>

                  {m.bio && (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {m.bio}
                    </p>
                  )}

                  {m.habilidades && m.habilidades.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.habilidades.slice(0, 4).map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#12203E] border border-[#1E3156] text-[11px] text-slate-300"
                        >
                          {h}
                        </span>
                      ))}
                      {m.habilidades.length > 4 && (
                        <span className="text-[11px] text-slate-400 self-center">
                          +{m.habilidades.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1E3156] flex items-center justify-between gap-2">
                  {m.linkedin ? (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
                    >
                      <Icon name="external-link" size={13} />
                      <span>LinkedIn</span>
                    </a>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={() => setMentorModal(m)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Solicitar Mentoria</span>
                    <Icon name="arrow-right" size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Solicitação */}
        {mentorModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E3156] pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="users" size={20} className="text-sky-400" />
                  Solicitar Mentoria com {mentorModal.nome}
                </h3>
                <button
                  type="button"
                  onClick={() => setMentorModal(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSolicitar} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#070C1E] border border-[#26395C] text-xs text-slate-300">
                  <strong className="block text-slate-100 mb-1">{mentorModal.cargo} • {mentorModal.area}</strong>
                  {mentorModal.bio}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Qual o seu objetivo principal com esta mentoria? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={objetivoSolicitacao}
                    onChange={(e) => setObjetivoSolicitacao(e.target.value)}
                    placeholder="Descreva suas metas, desafios atuais e em quais áreas você mais precisa de orientação..."
                    className="w-full resize-none rounded-xl bg-[#070C1E] border border-[#26395C] px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#1E3156]">
                  <button
                    type="button"
                    onClick={() => setMentorModal(null)}
                    className="px-4 py-2 rounded-xl border border-[#26395C] bg-[#1A2C50] text-slate-300 hover:text-white text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm shadow-md"
                  >
                    {enviando ? 'Enviando...' : 'Confirmar Envio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // USUÁRIO POSSUI VÍNCULO ATIVO COM UM MENTOR!
  const abas = [
    { id: 'visao-geral', label: 'Visão Geral', icone: 'home' },
    { id: 'meu-mentor', label: 'Meu Mentor', icone: 'user' },
    { id: 'chat', label: 'Chat com o Mentor', icone: 'message-square' },
    { id: 'reunioes', label: 'Reuniões', icone: 'calendar' },
    { id: 'orientacoes', label: 'Orientações', icone: 'target' },
  ];

  return (
    <div className="space-y-6">
      {mensagemStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
          <Icon name="check" size={18} />
          <span>{mensagemStatus}</span>
        </div>
      )}

      {/* Menu de Abas do Mentorado */}
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

      {/* Conteúdo das Abas */}
      {abaAtiva === 'visao-geral' && (
        <div className="space-y-6">
          {/* Card do Mentor */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0D1930] to-[#15233E] border border-[#26395C] shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
                {(vinculoAtivo.mentorNome || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs text-sky-400 font-medium uppercase tracking-wider">
                  Seu Mentor Ativo
                </span>
                <h2 className="text-2xl font-bold text-white">{vinculoAtivo.mentorNome}</h2>
                <p className="text-sm text-slate-300">
                  {vinculoAtivo.mentorCargo} • {vinculoAtivo.mentorArea}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {vinculoAtivo.linkReuniao && (
                <a
                  href={vinculoAtivo.linkReuniao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <Icon name="video" size={16} />
                  <span>Entrar na Sala Virtual</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setAbaAtiva('chat')}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Icon name="message-square" size={16} />
                <span>Abrir Chat</span>
              </button>
            </div>
          </div>

          {/* Cards Rápidos de Status da Mentoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Reuniões e Alinhamentos</span>
              <p className="text-xl font-bold text-white mt-1">Agenda de Mentoria</p>
              <p className="text-xs text-slate-400">
                Acesse horários agendados e entre na sala virtual com seu mentor.
              </p>
              <button
                type="button"
                onClick={() => setAbaAtiva('reunioes')}
                className="pt-1 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
              >
                <span>Ver reuniões</span>
                <Icon name="arrow-right" size={13} />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Orientações do Mentor</span>
              <p className="text-xl font-bold text-white mt-1">Plano de Ação</p>
              <p className="text-xs text-slate-400">
                Consulte feedbacks, tarefas recomendadas e atualize seu status.
              </p>
              <button
                type="button"
                onClick={() => setAbaAtiva('orientacoes')}
                className="pt-1 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <span>Ver orientações</span>
                <Icon name="arrow-right" size={13} />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D1930] border border-[#26395C] space-y-2 shadow-md">
              <span className="text-xs text-slate-400 font-medium">Comunicação Rápida</span>
              <p className="text-xl font-bold text-white mt-1">Chat Direto</p>
              <p className="text-xs text-slate-400">
                Tire dúvidas com seu mentor por mensagens em tempo real.
              </p>
              <button
                type="button"
                onClick={() => setAbaAtiva('chat')}
                className="pt-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <span>Abrir chat</span>
                <Icon name="arrow-right" size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'meu-mentor' && (
        <div className="p-8 rounded-3xl bg-[#0D1930] border border-[#26395C] space-y-6 max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-xl">
              {(vinculoAtivo.mentorNome || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{vinculoAtivo.mentorNome}</h2>
              <p className="text-sm text-sky-400 font-medium">
                {vinculoAtivo.mentorCargo} • {vinculoAtivo.mentorArea}
              </p>
              <p className="text-xs text-slate-400 mt-1">{vinculoAtivo.mentorEmail}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070C1E] border border-[#1E3156] space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Objetivo Inicial Acordado
            </h4>
            <p className="text-sm text-slate-200 italic leading-relaxed">
              "{vinculoAtivo.objetivo || 'Alinhamento geral de desenvolvimento'}"
            </p>
          </div>

          {vinculoAtivo.linkReuniao && (
            <div className="p-4 rounded-xl bg-[#070C1E] border border-[#1E3156] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-400">Link Fixo da Sala de Reunião</h4>
                <p className="text-xs text-sky-300 truncate max-w-sm mt-0.5">{vinculoAtivo.linkReuniao}</p>
              </div>
              <a
                href={vinculoAtivo.linkReuniao}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                Abrir Sala
              </a>
            </div>
          )}

          <div className="pt-6 border-t border-[#1E3156] flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Vínculo iniciado em {new Date(vinculoAtivo.iniciadoEm).toLocaleDateString('pt-BR')}
            </span>
            <button
              type="button"
              onClick={() => handleEncerrarVinculo(vinculoAtivo.id)}
              className="px-4 py-2 rounded-xl border border-rose-800/80 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium transition-colors"
            >
              Encerrar Mentoria
            </button>
          </div>
        </div>
      )}

      {abaAtiva === 'chat' && (
        <div className="h-[750px]">
          <ChatMentoria
            vinculoId={vinculoAtivo.id}
            nomeContato={vinculoAtivo.mentorNome || 'Mentor'}
            cargoContato={vinculoAtivo.mentorCargo}
            tituloConversa={`Conversa com ${vinculoAtivo.mentorNome}`}
          />
        </div>
      )}

      {abaAtiva === 'reunioes' && (
        <ReunioesMentoria
          vinculoId={vinculoAtivo.id}
          linkPadrao={vinculoAtivo.linkReuniao}
          permiteAgendar={false}
        />
      )}

      {abaAtiva === 'orientacoes' && (
        <OrientacoesMentoria
          vinculoId={vinculoAtivo.id}
          ehMentor={false}
          objetivosDisponiveis={objetivos}
        />
      )}
    </div>
  );
}

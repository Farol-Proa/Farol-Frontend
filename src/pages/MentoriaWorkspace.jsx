import { useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import MentoradoWorkspace from './Mentoria/MentoradoWorkspace.jsx';
import MentorWorkspace from './Mentoria/MentorWorkspace.jsx';
import { useMentoriaDados } from './Mentoria/useMentoriaDados.js';
import './MentoriaWorkspace.css';

export default function MentoriaWorkspace({
  onNavegar = () => {},
  onLogout = () => {},
  objetivos = [],
  tarefas = [],
}) {
  const {
    carregando,
    erro,
    papelAtivo,
    setPapelAtivo,
    perfilMentor,
    vinculoAtivo,
    solicitacaoPendente,
    mentoresDisponiveis,
    mentorados,
    solicitacoesMentor,
    recarregar,
  } = useMentoriaDados();

  const usuario = useMemo(() => {
    return JSON.parse(sessionStorage.getItem('usuario') || '{}');
  }, []);

  const ehMentorAprovado = perfilMentor && perfilMentor.status === 'APROVADO';

  return (
    <div className="farol-mentoria-workspace">
      {/* Sidebar principal do Farol */}
      <Sidebar activeItem="Mentoria" onNavegar={onNavegar} onLogout={onLogout} />

      {/* Área de Trabalho Fullscreen da Mentoria */}
      <main className="farol-mentoria-main">
        {/* Header Superior */}
        <header className="farol-mentoria-header">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400">
              <Icon name="users" size={18} />
            </span>
            <div>
              <h1 className="text-base font-bold text-white leading-none">
                {papelAtivo === 'MENTOR' ? 'Workspace do Mentor' : 'Workspace de Mentoria'}
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                {papelAtivo === 'MENTOR'
                  ? 'Acompanhamento, reuniões e orientações aos seus mentorados'
                  : 'Seu espaço para reuniões, chat e orientações com o mentor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de Papel se o usuário for um mentor aprovado */}
            {ehMentorAprovado && (
              <div className="flex items-center bg-[#070C1E] border border-[#26395C] rounded-xl p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPapelAtivo('MENTOR')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    papelAtivo === 'MENTOR'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visão Mentor
                </button>
                <button
                  type="button"
                  onClick={() => setPapelAtivo('MENTORADO')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    papelAtivo === 'MENTORADO'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visão Aluno
                </button>
              </div>
            )}

            {/* Perfil Mini */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#1E3156]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
                {(usuario.nome || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-200">{usuario.nome || 'Usuário'}</p>
                <span className="text-[10px] text-sky-400 font-medium">
                  {papelAtivo === 'MENTOR' ? 'Mentor Farol' : 'Mentorado'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Corpo do Workspace */}
        <div className="farol-mentoria-content">
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <span className="animate-spin text-2xl">◌</span>
              <p className="text-sm">Carregando workspace de mentoria...</p>
            </div>
          ) : erro ? (
            <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm space-y-3">
              <p className="font-semibold">{erro}</p>
              <button
                type="button"
                onClick={recarregar}
                className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800 text-white rounded-xl text-xs font-medium"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ErrorBoundary fallbackTitle="Falha no workspace de mentoria" onRetry={recarregar}>
              {papelAtivo === 'MENTOR' ? (
                <MentorWorkspace
                  perfilMentor={perfilMentor}
                  mentorados={mentorados}
                  solicitacoes={solicitacoesMentor}
                  onRecarregar={recarregar}
                />
              ) : (
                <MentoradoWorkspace
                  vinculoAtivo={vinculoAtivo}
                  solicitacaoPendente={solicitacaoPendente}
                  mentoresDisponiveis={mentoresDisponiveis}
                  objetivos={objetivos}
                  tarefas={tarefas}
                  onRecarregar={recarregar}
                  onNavegar={onNavegar}
                />
              )}
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}

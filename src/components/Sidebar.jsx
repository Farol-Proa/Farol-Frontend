import { useState } from 'react';
import './Sidebar.css';
import Icon from './Icon';

const itensNavegacao = [
  { nome: 'Início', id: 'inicio', icone: 'home' },
  { nome: 'Objetivos', id: 'objetivos', icone: 'target' },
  { nome: 'Ilhas', id: 'ilhas', icone: 'map' },
  { nome: 'Anotações', id: 'anotacoes', icone: 'notebook' },
  { nome: 'Calendário', id: 'calendario', icone: 'calendar' },
  { nome: 'Mentoria', id: 'mentoria', icone: 'users' },
  { nome: 'Planos', id: 'planos', icone: 'creditCard' },
];

function Sidebar({ activeItem = 'Início', onNavegar = () => {}, onLogout = () => {} }) {
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');

  const planoFormatado = (() => {
    const raw = (usuario.plano || usuario.tipoPlano || usuario.planoAssinatura || usuario.role || '').toString().toLowerCase();
    if (raw.includes('anual')) return 'Premium Anual';
    if (raw.includes('premium') || raw.includes('mensal')) return 'Premium Mensal';
    if (usuario.isPremium || usuario.premium) return 'Premium';
    return 'Freemium';
  })();

  function selecionarItem(event, nome) {
    event.preventDefault();
    onNavegar(nome);
  }

  return (
    <>
      <aside className="farol-sidebar" aria-label="Menu lateral">
        <div className="farol-sidebar-panel">
          <div className="farol-sidebar-brand">
            <span className="farol-brand-mark">
              <Icon name="sparkles" size={20} fill="currentColor" />
            </span>
            <span>Farol</span>
          </div>

          <nav aria-label="Navegação principal" className="farol-sidebar-nav">
            <ul>
              {itensNavegacao.map(({ nome, id, icone }) => {
                const ativo = activeItem === nome;

                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={ativo ? 'page' : undefined}
                      className={`farol-nav-link ${ativo ? 'is-active' : ''}`}
                      onClick={(event) => selecionarItem(event, nome)}
                    >
                      <Icon name={icone} size={17} />
                      <span>{nome}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="farol-streak-card">
            <span className="farol-streak-icon">
              <Icon name="flame" size={21} />
            </span>
            <p className="farol-streak-count">Sua Jornada</p>
            <p className="farol-streak-copy">Cada passo conta. Continue iluminando o seu caminho.</p>
          </div>

          <button
            className="farol-settings-link"
            type="button"
            onClick={() => setModalConfigAberto(true)}
            aria-label="Abrir configurações da conta"
          >
            <Icon name="settings" size={17} />
            <span>Configurações</span>
          </button>

          <button className="farol-settings-link" type="button" onClick={onLogout}>
            <Icon name="log-out" size={17} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      {modalConfigAberto && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setModalConfigAberto(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#26395C] bg-[#0D1930] p-6 text-slate-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-config"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1A2944] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#315CF5]/20 text-lg text-blue-400">
                  ⚙️
                </span>
                <div>
                  <h2 id="titulo-config" className="text-base font-bold text-white">
                    Configurações da Conta
                  </h2>
                  <p className="text-xs text-slate-400">Preferências e detalhes do seu perfil</p>
                </div>
              </div>
              <button
                type="button"
                className="text-lg text-slate-400 hover:text-white"
                onClick={() => setModalConfigAberto(false)}
                aria-label="Fechar configurações"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3.5">
                <span className="text-slate-400">Nome</span>
                <p className="mt-0.5 text-sm font-semibold text-slate-200">
                  {usuario.nome || 'Usuário Farol'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3.5">
                <span className="text-slate-400">E-mail</span>
                <p className="mt-0.5 text-sm font-semibold text-slate-200">
                  {usuario.email || 'Não informado'}
                </p>
              </div>

              <div className="rounded-xl border border-blue-900/40 bg-gradient-to-r from-blue-950/40 to-[#0B1730] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      Plano Atual
                    </span>
                    <p className="mt-0.5 text-sm font-bold text-white">{planoFormatado}</p>
                    <p className="text-[11px] text-slate-400">
                      {planoFormatado === 'Freemium'
                        ? 'Até 4 objetivos ativos e ilhas'
                        : 'Recursos ampliados e mentoria'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalConfigAberto(false);
                      onNavegar('Planos');
                    }}
                    className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-[#10234A] transition hover:bg-yellow-300"
                  >
                    Ver Planos →
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#1A2944] pt-4">
              <button
                type="button"
                className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                onClick={() => {
                  setModalConfigAberto(false);
                  onLogout();
                }}
              >
                Sair da conta
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                onClick={() => setModalConfigAberto(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

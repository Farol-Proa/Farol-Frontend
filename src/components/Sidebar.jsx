<<<<<<< HEAD
import './Sidebar.css';
import Icon from './Icon';

const itensNavegacao = [
  { nome: 'Início', id: 'inicio', icone: 'home' },
  { nome: 'Objetivos', id: 'objetivos', icone: 'target' },
  { nome: 'Ilhas', id: 'ilhas', icone: 'map' },
  { nome: 'Anotações', id: 'anotacoes', icone: 'notebook' },
  { nome: 'Calendário', id: 'calendario', icone: 'calendar' },
  { nome: 'Mentoria', id: 'mentoria', icone: 'users' },
];

function Sidebar({ activeItem = 'Início', onNavegar = () => {} }) {
  function selecionarItem(event, nome) {
    event.preventDefault();
    // O App controla a troca de tela e o destino de rolagem para manter o painel como SPA.
    onNavegar(nome);
  }

  return (
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
          <p className="farol-streak-count">7 dias</p>
          <p className="farol-streak-copy">de sequência. Continue iluminando o caminho.</p>
        </div>

        <button className="farol-settings-link" type="button">
          <Icon name="settings" size={17} />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
=======
function Sidebar({ secaoAtiva = "inicio", onNavegar }) {
    const secoes = [
        { id: "inicio", nome: "Início", icone: "⌂" },
        { id: "objetivos", nome: "Objetivos", icone: "◎" },
        { id: "mapas", nome: "Mapas", icone: "♧" },
        { id: "anotacoes", nome: "Anotações", icone: "☷" },
        { id: "calendario", nome: "Calendário", icone: "▦" },
        { id: "mentoria", nome: "Mentoria", icone: "♙" },
    ];

    return (
        <aside className="flex w-[190px] shrink-0 flex-col border-r border-white/10 bg-[#050a13] px-3.5 py-5 text-white max-[950px]:w-[155px] max-[600px]:w-full max-[600px]:p-3">
            <div className="mb-[35px] flex items-center gap-2.5 max-[600px]:mb-3">
                <div className="grid size-[38px] place-items-center rounded-full bg-[#315cf5] text-xl text-yellow-300">
                    ✦
                </div>

                <h2 className="text-xl font-bold">Farol</h2>
            </div>

            <nav className="grid gap-2.5">
                {secoes.map((secao) => (
                    <button
                        key={secao.id}
                        type="button"
                        onClick={() => onNavegar?.(secao.id)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            secaoAtiva === secao.id
                                ? "bg-[#315cf5] text-white"
                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        <span>{secao.icone}</span>
                        <span>{secao.nome}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-8">
                <div className="mb-4 rounded-xl bg-[#142342] p-4 text-center">
                    <div className="mb-3 text-4xl text-yellow-300">♜</div>
                    <strong className="text-lg">7 dias</strong>
                </div>

                <button
                    type="button"
                    onClick={() => onNavegar?.("configuracao")}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                    ⚙ Configuração
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
>>>>>>> 6f50cc8b7da94677539000e3a19ac311b172477f

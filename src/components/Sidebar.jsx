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

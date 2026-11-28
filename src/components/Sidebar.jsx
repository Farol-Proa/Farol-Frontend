import { useState, useEffect } from 'react';
import './Sidebar.css';
import Icon from './Icon';
import FarolLuz from './FarolLuz';
import { obterDadosIntensivo, obterCacheIntensivo } from '../services/intensivoApi';

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
  const [intensivo, setIntensivo] = useState(() => obterCacheIntensivo());

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const dados = await obterDadosIntensivo();
      if (ativo && dados) {
        setIntensivo(dados);
      }
    }

    carregar();

    function onAtualizacao() {
      carregar();
    }

    window.addEventListener('farol:intensivo-atualizado', onAtualizacao);
    return () => {
      ativo = false;
      window.removeEventListener('farol:intensivo-atualizado', onAtualizacao);
    };
  }, []);

  function selecionarItem(event, nome) {
    event.preventDefault();
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

        <div className="farol-streak-card" aria-label="Status do Intensivo Farol">
          <div className="farol-streak-visual">
            <FarolLuz
              nivelLuz={intensivo?.nivelLuz ?? 0}
              concluiuHoje={Boolean(intensivo?.concluiuHoje)}
              className="farol-luz-sidebar"
            />
          </div>
          <div className="farol-streak-info">
            <p className="farol-streak-count">
              <span className="farol-streak-number">{intensivo?.diasConsecutivos ?? 0}</span>
              <span className="farol-streak-label">
                {(intensivo?.diasConsecutivos ?? 0) === 1 ? 'dia de luz' : 'dias de luz'}
              </span>
            </p>
            <p className="farol-streak-copy">
              {intensivo?.concluiuHoje
                ? 'Sua constância ilumina sua jornada.'
                : (intensivo?.diasConsecutivos ?? 0) > 0
                  ? 'Mantenha sua luz acesa hoje.'
                  : 'Conclua uma tarefa para acender seu farol.'}
            </p>
          </div>
        </div>

        <button
          className={`farol-settings-link ${activeItem === 'Configurações' ? 'is-active' : ''}`}
          type="button"
          onClick={(event) => selecionarItem(event, 'Configurações')}
          aria-current={activeItem === 'Configurações' ? 'page' : undefined}
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
  );
}

export default Sidebar;

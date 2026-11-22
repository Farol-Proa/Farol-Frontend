import { useState } from 'react';
import { avancarMesCalendario } from '../dashboard/taskDates';
import Sidebar from '../components/Sidebar';
import './Painel.css';
import Calendario from './Painel/Calendario';
import Notas from './Painel/Notas';
import Objetivos from './Painel/Objetivos';
import Tarefas from './Painel/Tarefas';

function chaveDataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function Painel({
  objetivos,
  tarefas,
  activeItem,
  onNavegar,
  onLogout,
  contextoNotas,
  onNotasRascunhoSujo,
  onRegistrarDescarteNota,
  onAlternarTarefa,
  onRemoverTarefa,
  carregando,
  erro,
}) {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const [dataSelecionada, setDataSelecionada] = useState(() => chaveDataLocal(new Date()));
  const [mesExibido, setMesExibido] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  function mudarMes(diferenca) {
    const proximoEstado = avancarMesCalendario(mesExibido, diferenca);
    setMesExibido(proximoEstado.mesExibido);
    setDataSelecionada(proximoEstado.dataSelecionada);
  }

  const totalItens = tarefas.length;
  const itensConcluidos = tarefas.filter((tarefa) => tarefa.concluida).length;
  const progressoGeral = totalItens === 0 ? 0 : Math.round((itensConcluidos / totalItens) * 100);

  return (
    <div className="painel painel-farol bg-farol-dashboard text-farol-text flex max-[600px]:flex-col">
      <Sidebar activeItem={activeItem} onNavegar={onNavegar} onLogout={onLogout} />

      <main className="painel-main min-w-0 flex-1" id="inicio">
        <header className="painel-topbar">
          <div>
            <span className="painel-eyebrow">SEU ESPAÇO, SEU RITMO</span>
            <h1>{activeItem || 'Início'}</h1>
          </div>
          <div className="painel-avatar" aria-label={`Perfil de ${usuario.nome || 'usuário'}`}>
            {usuario.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
        </header>

        <section className="painel-welcome">
          <div>
            <span className="painel-eyebrow">BEM-VINDO DE VOLTA</span>
            <h2>Olá, {usuario.nome?.split(' ')[0] || 'visitante'}!</h2>
            <p>“Qualquer ideia é estupidamente útil”</p>
          </div>

          <div className="painel-greeting">
            <strong>Minha jornada começa hoje.</strong>
            <span aria-hidden="true">☀</span>
            <p>Bom dia!</p>
          </div>
        </section>

        {erro && (
          <p role="alert" className="painel-card">
            {erro}
          </p>
        )}
        {carregando && (
          <p role="status" className="text-xs text-farol-muted">
            Carregando seus dados...
          </p>
        )}

        <section className="painel-grid">
          <Notas
            key={contextoNotas?.etapaId != null
              ? `ilha-${contextoNotas.etapaId}`
              : contextoNotas?.objetivoId != null
                ? `mapa-${contextoNotas.objetivoId}`
                : 'todas'}
            objetivos={objetivos}
            contexto={contextoNotas}
            onNavegar={onNavegar}
            onRascunhoSujo={onNotasRascunhoSujo}
            onRegistrarDescarte={onRegistrarDescarteNota}
          />

          <Calendario
            mesExibido={mesExibido}
            dataSelecionada={dataSelecionada}
            tarefas={tarefas}
            onMudarMes={mudarMes}
            onSelecionarData={setDataSelecionada}
          />

          <article className="painel-card painel-journey min-w-0 p-4 text-center" id="objetivos">
            <h3>Minha Jornada</h3>
            <div className="painel-journey-ring" style={{ '--progresso': `${progressoGeral}%` }}>
              <span>{progressoGeral}%</span>
            </div>
            <p className="text-xs leading-relaxed text-farol-muted">
              {totalItens === 0
                ? 'Adicione tarefas às etapas dos seus objetivos para acompanhar seu progresso.'
                : `Você concluiu ${itensConcluidos} de ${totalItens} tarefas.`}
            </p>
          </article>
        </section>

        <section className="painel-grid-secondary">
          <Objetivos objetivos={objetivos} onNavegar={onNavegar} />

          <Tarefas
            tarefas={tarefas}
            onAlternarTarefa={onAlternarTarefa}
            onRemoverTarefa={onRemoverTarefa}
          />
        </section>
      </main>
    </div>
  );
}

export default Painel;

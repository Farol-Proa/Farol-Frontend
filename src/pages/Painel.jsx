import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Painel.css';
import Calendario from './Painel/Calendario';
import Notas from './Painel/Notas';
import Objetivos from './Painel/Objetivos';
import Tarefas from './Painel/Tarefas';

function Painel({
  objetivos,
  notas,
  tarefas,
  activeItem,
  onNavegar,
  onAbrirObjetivo,
  onAdicionarObjetivo,
  onAlternarObjetivo,
  onRemoverObjetivo,
  onAdicionarEtapa,
  onAlternarEtapa,
  onRemoverEtapa,
  onAdicionarNota,
  onAlternarNota,
  onRemoverNota,
  onAdicionarTarefa,
  onAlternarTarefa,
  onRemoverTarefa,
}) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toLocaleDateString('en-CA'));
  const [mesExibido, setMesExibido] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  function mudarMes(diferenca) {
    setMesExibido(
      (mesAtual) => new Date(mesAtual.getFullYear(), mesAtual.getMonth() + diferenca, 1),
    );
  }

  const totalEtapas = objetivos.reduce((total, objetivo) => total + objetivo.etapas.length, 0);
  const etapasConcluidas = objetivos.reduce(
    (total, objetivo) => total + objetivo.etapas.filter((etapa) => etapa.concluida).length,
    0,
  );
  const totalItens = tarefas.length + totalEtapas;
  const itensConcluidos = tarefas.filter((tarefa) => tarefa.concluida).length + etapasConcluidas;
  // O progresso geral inclui tarefas e etapas; o de cada objetivo considera apenas suas etapas.
  const progressoGeral = totalItens === 0 ? 0 : Math.round((itensConcluidos / totalItens) * 100);

  return (
    <div className="painel bg-farol-dashboard text-farol-text flex max-[600px]:flex-col">
      <Sidebar activeItem={activeItem} onNavegar={onNavegar} />

      <main className="min-w-0 flex-1 p-[22px] max-[600px]:p-3.5" id="inicio">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="m-0 text-[26px]">{activeItem || 'Início'}</h1>
          <div className="grid size-9 place-items-center rounded-full bg-farol-primary">R</div>
        </header>

        <section className="mb-4 flex items-center justify-between gap-5 rounded-[18px] bg-farol-dashboard-card px-6 py-5 max-[600px]:items-start max-[600px]:flex-col">
          <div>
            <h2 className="mb-3 mt-0 text-[22px]">Olá, visitante!</h2>
            <p className="text-xs text-farol-muted">“Qualquer ideia é estupidamente útil”</p>
          </div>

          <div className="grid gap-3.5 text-right max-[600px]:text-left">
            <strong>Minha jornada começa hoje.</strong>
            <span className="text-xs text-farol-muted">Bom dia! ☀️</span>
          </div>
        </section>

        <section className="grid grid-cols-[1.2fr_1fr_1fr] gap-3.5 max-[950px]:grid-cols-2 max-[600px]:grid-cols-1">
          <Notas
            notas={notas}
            onAdicionarNota={onAdicionarNota}
            onAlternarNota={onAlternarNota}
            onRemoverNota={onRemoverNota}
          />

          <Calendario
            mesExibido={mesExibido}
            dataSelecionada={dataSelecionada}
            tarefas={tarefas}
            onMudarMes={mudarMes}
            onSelecionarData={setDataSelecionada}
          />

          <article className="painel-card min-w-0 p-4 text-center" id="objetivos">
            <h3>Minha Jornada</h3>
            <div className="progresso">
              <span>{progressoGeral}%</span>
              <div className="barra-progresso">
                <div
                  className="barra-progresso-preenchida"
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-farol-muted">
              {totalItens === 0
                ? 'Comece adicionando seu primeiro objetivo.'
                : `Você concluiu ${itensConcluidos} de ${totalItens} itens.`}
            </p>
          </article>

          <Objetivos
            objetivos={objetivos}
            onAbrirObjetivo={onAbrirObjetivo}
            onAdicionarObjetivo={onAdicionarObjetivo}
            onAlternarObjetivo={onAlternarObjetivo}
            onRemoverObjetivo={onRemoverObjetivo}
            onAdicionarEtapa={onAdicionarEtapa}
            onAlternarEtapa={onAlternarEtapa}
            onRemoverEtapa={onRemoverEtapa}
          />

          <Tarefas
            tarefas={tarefas}
            dataSelecionada={dataSelecionada}
            onAdicionarTarefa={onAdicionarTarefa}
            onAlternarTarefa={onAlternarTarefa}
            onRemoverTarefa={onRemoverTarefa}
          />
        </section>
      </main>
    </div>
  );
}

export default Painel;

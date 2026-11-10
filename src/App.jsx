import { useState } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import LandingPage from './pages/LandingPage';
import Painel from './pages/Painel';
import Autenticacao from './pages/Autenticacao';

function App() {
  const [mostrarPainel, setMostrarPainel] = useState(false);
  const [mostrarAutenticacao, setMostrarAutenticacao] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState('Início');
  const dadosDashboard = useDadosDashboard();

  if (!mostrarPainel && !mostrarAutenticacao) {
    return <LandingPage onEntrar={() => setMostrarPainel(true)} />;
  }

  if (mostrarAutenticacao) {
    return <Autenticacao />;
  }

  function navegar(destino) {
    setPaginaAtiva(destino);
    if (destino === 'Ilhas') return;

    const secoes = {
      Início: 'inicio',
      Objetivos: 'objetivos',
      Anotações: 'anotacoes',
      Calendário: 'calendario',
      Mentoria: 'mentoria',
    };

    // Espera o painel reaparecer antes de tentar rolar até uma seção dele.
    window.requestAnimationFrame(() => {
      const secao = document.getElementById(secoes[destino]);
      if (destino === 'Início') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        secao?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  return (
    <>
      {/* hidden mantém o estado local do painel ao alternar entre as telas. */}
      <div hidden={paginaAtiva === 'Ilhas'}>
        <Painel
          objetivos={dadosDashboard.objetivos}
          notas={dadosDashboard.notas}
          tarefas={dadosDashboard.tarefas}
          activeItem={paginaAtiva}
          onNavegar={navegar}
          onAdicionarObjetivo={dadosDashboard.adicionarObjetivo}
          onAlternarObjetivo={dadosDashboard.alternarObjetivo}
          onRemoverObjetivo={dadosDashboard.removerObjetivo}
          onAdicionarEtapa={dadosDashboard.adicionarEtapa}
          onAlternarEtapa={dadosDashboard.alternarEtapa}
          onRemoverEtapa={dadosDashboard.removerEtapa}
          onAdicionarNota={dadosDashboard.adicionarNota}
          onAlternarNota={dadosDashboard.alternarNota}
          onRemoverNota={dadosDashboard.removerNota}
          onAdicionarTarefa={dadosDashboard.adicionarTarefa}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
          onRemoverTarefa={dadosDashboard.removerTarefa}
        />
      </div>

      {paginaAtiva === 'Ilhas' && <Ilhas onNavegar={navegar} />}
    </>
  );
}

export default App;

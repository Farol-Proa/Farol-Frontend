import { useState } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import LandingPage from './pages/LandingPage';
import MapaObjetivo from './pages/MapaObjetivo';
import Painel from './pages/Painel';
import Autenticacao from './pages/Autenticacao';

function App() {
  const [mostrarPainel, setMostrarPainel] = useState(false);
  const [mostrarAutenticacao, setMostrarAutenticacao] = useState(false);
  const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
  const [paginaAtiva, setPaginaAtiva] = useState('Início');
  const dadosDashboard = useDadosDashboard();

  if (!mostrarPainel && !mostrarAutenticacao) {
    return <LandingPage onEntrar={() => setMostrarAutenticacao(true)} />;
  }

  if (mostrarAutenticacao) {
    return <Autenticacao />;
  }

  const objetivoSelecionado = dadosDashboard.objetivos.find(
    (objetivo) => objetivo.id === objetivoSelecionadoId,
  );

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
      <div hidden={Boolean(objetivoSelecionado) || paginaAtiva === 'Ilhas'}>
        <Painel
          {...dadosDashboard}
          activeItem={paginaAtiva}
          onNavegar={navegar}
          onAbrirObjetivo={(id) => setObjetivoSelecionadoId(id)}
        />
      </div>

      {paginaAtiva === 'Ilhas' && !objetivoSelecionado && <Ilhas onNavegar={navegar} />}

      {objetivoSelecionado && (
        <MapaObjetivo
          objetivo={objetivoSelecionado}
          onVoltar={() => setObjetivoSelecionadoId(null)}
          onAlternarEtapa={dadosDashboard.alternarEtapa}
        />
      )}
    </>
  );
}

export default App;

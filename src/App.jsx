import { useState, useEffect } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import LandingPage from './pages/LandingPage';
import Painel from './pages/Painel';
import Autenticacao from './pages/Autenticacao';


function tokenEstaValido(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(
        token.split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return payload.exp * 1000 > Date.now();

  } catch {
    return false;
  }
}

function App() {
  const [mostrarPainel, setMostrarPainel] = useState(() =>
    tokenEstaValido(sessionStorage.getItem("token")));
  const [mostrarAutenticacao, setMostrarAutenticacao] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState('Início');
  const dadosDashboard = useDadosDashboard();

  function fazerLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    setMostrarPainel(false);
    setMostrarAutenticacao(false);
    setPaginaAtiva('Início');
  }

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token || !mostrarPainel) return;

    try {
      const payload = JSON.parse(
        atob(
          token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      const tempoRestante = payload.exp * 1000 - Date.now();

      if (tempoRestante <= 0) {
        fazerLogout();
        return;
      }

      const temporizador = setTimeout(() => {
        fazerLogout();
      }, tempoRestante);

      return () => clearTimeout(temporizador);

    } catch {
      fazerLogout();
    }
  }, [mostrarPainel]);

  if (!mostrarPainel && !mostrarAutenticacao) {
    return <LandingPage onEntrar={() => setMostrarAutenticacao(true)} />;
  }

  if (mostrarAutenticacao) {
    return (
      <Autenticacao
        onLoginSuccess={() => {
          setMostrarAutenticacao(false);
          setMostrarPainel(true);
        }}
      />
    );
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
          onLogout={fazerLogout}
        />
      </div>

      {paginaAtiva === 'Ilhas' && <Ilhas onNavegar={navegar} />}
    </>
  );
}

export default App;

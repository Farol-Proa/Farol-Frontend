import { useState, useEffect } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import LandingPage from './pages/LandingPage';
import MapaObjetivo from './pages/MapaObjetivo';
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
  const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
  const [paginaAtiva, setPaginaAtiva] = useState('Início');
  const dadosDashboard = useDadosDashboard();

  function fazerLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    setMostrarPainel(false);
    setMostrarAutenticacao(false);
    setObjetivoSelecionadoId(null);
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
          onLogout={fazerLogout}
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

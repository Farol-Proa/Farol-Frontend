import { useState, useEffect, useCallback } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import LandingPage from './pages/LandingPage';
import Painel from './pages/Painel';
import Autenticacao from './pages/Autenticacao';

function tokenEstaValido(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function App() {
  const [mostrarPainel, setMostrarPainel] = useState(() =>
    tokenEstaValido(sessionStorage.getItem('token')),
  );
  const [mostrarAutenticacao, setMostrarAutenticacao] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState('Início');
  const [objetivoSelecionado, setObjetivoSelecionado] = useState(null);
  const [abrirModalObjetivo, setAbrirModalObjetivo] = useState(false);
  const [authLink, setAuthLink] = useState(() => {
    const parametros = new URLSearchParams(window.location.search);
    const verificationToken = parametros.get('verify');
    const resetToken = parametros.get('reset');
    return verificationToken || resetToken ? { verificationToken, resetToken } : null;
  });
  const dadosDashboard = useDadosDashboard();

  const finalizarLinkAutenticacao = useCallback(() => {
    setAuthLink(null);
    setMostrarAutenticacao(true);
  }, []);

  function fazerLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');

    setMostrarPainel(false);
    setMostrarAutenticacao(false);
    setPaginaAtiva('Início');
  }

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token || !mostrarPainel) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

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

  if (!mostrarPainel && !mostrarAutenticacao && !authLink) {
    return <LandingPage onEntrar={() => setMostrarAutenticacao(true)} />;
  }

  if (mostrarAutenticacao || authLink) {
    return (
      <Autenticacao
        initialVerificationToken={authLink?.verificationToken}
        initialResetToken={authLink?.resetToken}
        onAuthLinkHandled={finalizarLinkAutenticacao}
        onLoginSuccess={() => {
          setMostrarAutenticacao(false);
          setAuthLink(null);
          setMostrarPainel(true);
          dadosDashboard.recarregarObjetivos();
        }}
      />
    );
  }

  function navegar(destino, opcoes = {}) {
    setPaginaAtiva(destino);

    if (destino === 'Ilhas') {
      setObjetivoSelecionado(opcoes.objetivoId ?? null);
      setAbrirModalObjetivo(opcoes.abrirModal ?? false);
      return;
    }

    const secoes = {
      Início: 'inicio',
      Objetivos: 'objetivos',
      Anotações: 'anotacoes',
      Calendário: 'calendario',
      Mentoria: 'mentoria',
    };

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
          onAdicionarNota={dadosDashboard.adicionarNota}
          onAlternarNota={dadosDashboard.alternarNota}
          onRemoverNota={dadosDashboard.removerNota}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
          onRemoverTarefa={dadosDashboard.removerTarefa}
          carregando={dadosDashboard.carregando}
          erro={dadosDashboard.erro}
          onLogout={fazerLogout}
        />
      </div>

      {paginaAtiva === 'Ilhas' && (
        <Ilhas
          onNavegar={navegar}
          objetivoSelecionado={objetivoSelecionado}
          abrirModalObjetivo={abrirModalObjetivo}
          objetivos={dadosDashboard.objetivos}
          onAdicionarObjetivo={dadosDashboard.adicionarObjetivo}
          onRemoverObjetivo={dadosDashboard.removerObjetivo}
          onAdicionarEtapa={dadosDashboard.adicionarEtapa}
          onAdicionarTarefa={dadosDashboard.adicionarTarefa}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
          onRemoverTarefa={dadosDashboard.removerTarefa}
          carregando={dadosDashboard.carregando}
          erro={dadosDashboard.erro}
        />
      )}
    </>
  );
}

export default App;

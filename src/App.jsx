import { useState, useEffect, useCallback, useRef } from 'react';
import { useDadosDashboard } from './dashboard/useDadosDashboard';
import Ilhas from './pages/Ilhas';
import CalendarioWorkspace from './pages/CalendarioWorkspace';
import LandingPage from './pages/LandingPage';
import Painel from './pages/Painel';
import Autenticacao from './pages/Autenticacao';
import CadastroMentor from './pages/CadastroMentor';
import LoginMentor from './pages/LoginMentor';
import PainelMentor from './pages/Painel/PainelMentoria';
import ConfirmarMentor from './pages/ConfirmarMentor';

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
  const [mostrarAutenticacao, setMostrarAutenticacao] = useState(() => {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get('entrar') === 'true';
  });
  const [paginaAtiva, setPaginaAtiva] = useState(() => {
    if (window.location.pathname === '/planos' && tokenEstaValido(sessionStorage.getItem('token'))) {
      return 'Planos';
    }
    return 'Início';
  });
  const [objetivoSelecionado, setObjetivoSelecionado] = useState(null);
  const [etapaSelecionadaInicial, setEtapaSelecionadaInicial] = useState(null);
  const [tarefaFocoId, setTarefaFocoId] = useState(null);
  const [contextoNotas, setContextoNotas] = useState(null);
  const [notasSujo, setNotasSujo] = useState(false);
  const descarteNotaRef = useRef(() => { });
  const [abrirModalObjetivo, setAbrirModalObjetivo] = useState(false);
  const [abrirModalIa, setAbrirModalIa] = useState(false);
  const [authLink, setAuthLink] = useState(() => {
    const parametros = new URLSearchParams(window.location.search);
    const verificationToken = parametros.get('verify');
    const resetToken = parametros.get('reset');
    return verificationToken || resetToken ? { verificationToken, resetToken } : null;
  });
  const dadosDashboard = useDadosDashboard();
  const { limparObjetivos, recarregarObjetivos } = dadosDashboard;

  const finalizarLinkAutenticacao = useCallback(() => {
    setAuthLink(null);
    setMostrarAutenticacao(true);
  }, []);

  const atualizarEstadoRascunhoNota = useCallback((sujo) => {
    setNotasSujo(sujo);
  }, []);

  const registrarDescarteNota = useCallback((descarte) => {
    descarteNotaRef.current = descarte ?? (() => { });
  }, []);

  const fazerLogout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    descarteNotaRef.current();
    setNotasSujo(false);
    limparObjetivos();

    window.history.replaceState(null, '', '/');

    setMostrarPainel(false);
    setMostrarAutenticacao(false);
    setPaginaAtiva('Início');
  }, [limparObjetivos]);

  useEffect(() => {
    const verificarSessaoNavegador = () => {
      if (!tokenEstaValido(sessionStorage.getItem('token'))) {
        setMostrarPainel(false);
        setMostrarAutenticacao(false);
        setPaginaAtiva('Início');
      }
    };

    window.addEventListener('pageshow', verificarSessaoNavegador);
    window.addEventListener('popstate', verificarSessaoNavegador);
    return () => {
      window.removeEventListener('pageshow', verificarSessaoNavegador);
      window.removeEventListener('popstate', verificarSessaoNavegador);
    };
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token');

    if (!token || !mostrarPainel) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

      const tempoRestante = payload.exp * 1000 - Date.now();

      if (tempoRestante <= 0) {
        const temporizador = setTimeout(fazerLogout, 0);
        return () => clearTimeout(temporizador);
      }

      const temporizador = setTimeout(() => {
        fazerLogout();
      }, tempoRestante);

      return () => clearTimeout(temporizador);
    } catch {
      const temporizador = setTimeout(fazerLogout, 0);
      return () => clearTimeout(temporizador);
    }
  }, [mostrarPainel, fazerLogout]);

  useEffect(() => {
    const tratarSessaoExpirada = () => {
      fazerLogout();
      setMostrarAutenticacao(true);
    };
    window.addEventListener('farol:auth-expired', tratarSessaoExpirada);
    return () => window.removeEventListener('farol:auth-expired', tratarSessaoExpirada);
  }, [fazerLogout]);

  const caminhoAtual = window.location.pathname;

  if (caminhoAtual === '/confirmar-mentor') {
    return <ConfirmarMentor />;
  }

  if (caminhoAtual === '/cadastro-mentor') {
    return <CadastroMentor />;
  }

  if (caminhoAtual === '/login-mentor') {
    return <LoginMentor onLoginSucesso={() => { window.location.pathname = '/painel-mentor'; }} />;
  }

  if (caminhoAtual === '/painel-mentor' || caminhoAtual === '/painelMentoria') {
    if (!tokenEstaValido(sessionStorage.getItem('token'))) {
      return <LoginMentor onLoginSucesso={() => { window.location.pathname = '/painel-mentor'; }} />;
    }
    return <PainelMentor onLogout={fazerLogout} />;
  }

  if (caminhoAtual === '/planos') {
    if (!tokenEstaValido(sessionStorage.getItem('token'))) {
      window.location.replace('/#planos');
      return <LandingPage onEntrar={() => setMostrarAutenticacao(true)} />;
    }
  }

  if (caminhoAtual === '/login' || caminhoAtual === '/cadastro') {
    return (
      <Autenticacao
        onLoginSuccess={() => {
          window.location.href = '/';
        }}
      />
    );
  }

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
          recarregarObjetivos();
        }}
      />
    );
  }

  function navegar(destino, opcoes = {}) {
    if (notasSujo) {
      const confirmar = window.confirm('Há alterações não salvas na nota. Deseja descartá-las?');
      if (!confirmar) return;
      descarteNotaRef.current();
      setNotasSujo(false);
    }

    setPaginaAtiva(destino);

    if (destino === 'Planos') {
      window.history.replaceState(null, '', '/planos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (window.location.pathname === '/planos') {
      window.history.replaceState(null, '', '/');
    }

    if (destino === 'Ilhas') {
      setObjetivoSelecionado(opcoes.objetivoId ?? null);
      setEtapaSelecionadaInicial(opcoes.etapaId ?? null);
      setTarefaFocoId(opcoes.tarefaId ?? null);
      setAbrirModalObjetivo(opcoes.abrirModal ?? false);
      setAbrirModalIa(opcoes.abrirModalIa ?? false);
      return;
    }

    if (destino === 'Calendário') {
      return;
    }

    if (destino === 'Anotações') {
      const etapaId = opcoes.etapaId ?? null;
      const objetivoId = etapaId == null ? opcoes.objetivoId ?? null : null;
      setContextoNotas(etapaId == null && objetivoId == null ? null : { objetivoId, etapaId });
    }

    const secoes = {
      Início: 'inicio',
      Objetivos: 'objetivos',
      Anotações: 'anotacoes',
      Calendário: 'calendario',
      Mentoria: 'mentoria',
      Planos: 'inicio',
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

  function sairPainel() {
    if (notasSujo) {
      if (!window.confirm('Há alterações não salvas na nota. Deseja descartá-las e sair?')) return;
      descarteNotaRef.current();
      setNotasSujo(false);
    }
    fazerLogout();
  }

  return (
    <>
      {/* hidden mantém o estado local do painel ao alternar entre as telas. */}
      <div hidden={paginaAtiva === 'Ilhas' || paginaAtiva === 'Calendário'}>
        <Painel
          objetivos={dadosDashboard.objetivos}
          tarefas={dadosDashboard.tarefas}
          activeItem={paginaAtiva}
          onNavegar={navegar}
          contextoNotas={contextoNotas}
          onNotasRascunhoSujo={atualizarEstadoRascunhoNota}
          onRegistrarDescarteNota={registrarDescarteNota}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
          onRemoverTarefa={dadosDashboard.removerTarefa}
          carregando={dadosDashboard.carregando}
          erro={dadosDashboard.erro}
          onLogout={sairPainel}
        />
      </div>

      {paginaAtiva === 'Ilhas' && (
        <Ilhas
          onNavegar={navegar}
          onLogout={sairPainel}
          objetivoSelecionado={objetivoSelecionado}
          etapaSelecionadaInicial={etapaSelecionadaInicial}
          tarefaFocoId={tarefaFocoId}
          onLimparFocoTarefa={() => {
            setEtapaSelecionadaInicial(null);
            setTarefaFocoId(null);
          }}
          abrirModalObjetivo={abrirModalObjetivo}
          abrirModalIa={abrirModalIa}
          objetivos={dadosDashboard.objetivos}
          onAdicionarObjetivo={dadosDashboard.adicionarObjetivo}
          onGerarObjetivoIa={dadosDashboard.gerarObjetivoIa}
          onRemoverObjetivo={dadosDashboard.removerObjetivo}
          onAdicionarEtapa={dadosDashboard.adicionarEtapa}
          onAdicionarTarefa={dadosDashboard.adicionarTarefa}
          onAtualizarPrazoTarefa={dadosDashboard.atualizarPrazoTarefa}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
          onRemoverTarefa={dadosDashboard.removerTarefa}
          onAtualizarTarefa={dadosDashboard.atualizarTarefa}
          onAtualizarIlha={dadosDashboard.atualizarIlha}
          onRemoverIlha={dadosDashboard.removerIlha}
          onAtualizarPosicaoIlha={dadosDashboard.atualizarPosicaoIlha}
          onCriarConexao={dadosDashboard.criarConexao}
          onRemoverConexao={dadosDashboard.removerConexao}
          onConcluirTopico={dadosDashboard.concluirTopico}
          onCriarTopico={dadosDashboard.criarTopico}
          onAtualizarTopico={dadosDashboard.atualizarTopico}
          onRemoverTopico={dadosDashboard.removerTopico}
          onSalvarConteudo={dadosDashboard.salvarConteudo}
          onCarregarMapa={dadosDashboard.carregarMapa}
          onCarregarIlha={dadosDashboard.carregarIlha}
          carregando={dadosDashboard.carregando}
          erro={dadosDashboard.erro}
        />
      )}

      {paginaAtiva === 'Calendário' && (
        <CalendarioWorkspace
          tarefas={dadosDashboard.tarefas}
          onNavegar={navegar}
          onLogout={sairPainel}
          onAlternarTarefa={dadosDashboard.alternarTarefa}
        />
      )}
    </>
  );
}

export default App;

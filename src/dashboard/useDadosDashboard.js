import { useCallback, useEffect, useRef, useState } from 'react';
import { requisicaoAPI } from '../services/api';
import { criarServicoNotas } from './notasApi';
import { mapearArvoreObjetivos } from './objectiveTree';
import { criarControleSessao } from './sessionVersion';

const notasAPI = criarServicoNotas(requisicaoAPI);

export function useDadosDashboard() {
  const [objetivos, setObjetivos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [carregandoNotas, setCarregandoNotas] = useState(false);
  const [operacaoNotaPendente, setOperacaoNotaPendente] = useState(false);
  const [erroNotas, setErroNotas] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [versaoDados, setVersaoDados] = useState(0);
  const [versaoNotas, setVersaoNotas] = useState(0);
  const controleSessaoNotas = useRef(null);
  if (controleSessaoNotas.current == null) controleSessaoNotas.current = criarControleSessao();

  const recarregarObjetivos = useCallback(() => {
    setVersaoDados((versao) => versao + 1);
  }, []);

  const recarregarNotas = useCallback(() => {
    setNotas([]);
    setVersaoNotas((versao) => versao + 1);
  }, []);

  const limparNotas = useCallback(() => {
    controleSessaoNotas.current.invalidar();
    setNotas([]);
    setErroNotas('');
    setCarregandoNotas(false);
    setOperacaoNotaPendente(false);
    setVersaoNotas((versao) => versao + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function carregarObjetivos() {
      if (!sessionStorage.getItem('token')) {
        setObjetivos([]);
        return;
      }

      setCarregando(true);
      setErro('');

      try {
        const resposta = await requisicaoAPI('/objetivos/arvore');
        const objetivosFormatados = mapearArvoreObjetivos(resposta ?? []);

        if (!cancelado) setObjetivos(objetivosFormatados);
      } catch (erroCarregamento) {
        if (!cancelado)
          setErro(erroCarregamento.message || 'Não foi possível carregar seus objetivos.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarObjetivos();
    return () => {
      cancelado = true;
    };
  }, [versaoDados]);

  useEffect(() => {
    let cancelado = false;

    async function carregarNotas() {
      if (!sessionStorage.getItem('token')) {
        setNotas([]);
        setErroNotas('');
        return;
      }

      setCarregandoNotas(true);
      setErroNotas('');

      try {
        const resposta = await notasAPI.listar();
        if (!cancelado) setNotas(resposta ?? []);
      } catch (erroCarregamento) {
        if (!cancelado)
          setErroNotas(erroCarregamento.message || 'Não foi possível carregar suas notas.');
      } finally {
        if (!cancelado) setCarregandoNotas(false);
      }
    }

    carregarNotas();
    return () => {
      cancelado = true;
    };
  }, [versaoNotas]);

  async function adicionarObjetivo({ titulo, descricao, prioridade }) {
    const criado = await requisicaoAPI('/objetivos', {
      method: 'POST',
      body: JSON.stringify({ titulo, descricao, prioridade }),
    });
    recarregarObjetivos();
    return criado;
  }

  async function removerObjetivo(id) {
    await requisicaoAPI(`/objetivos/${id}`, { method: 'DELETE' });
    recarregarObjetivos();
  }

  async function adicionarEtapa(objetivoId, { titulo, descricao }) {
    const criada = await requisicaoAPI(`/objetivos/${objetivoId}/etapas`, {
      method: 'POST',
      body: JSON.stringify({ titulo, descricao }),
    });
    recarregarObjetivos();
    return criada;
  }

  async function adicionarTarefa(etapaId, { titulo, prazo }) {
    await requisicaoAPI(`/etapas/${etapaId}/tarefas`, {
      method: 'POST',
      body: JSON.stringify({ titulo, prazo: prazo || null }),
    });
    recarregarObjetivos();
  }

  async function atualizarPrazoTarefa(id, prazo) {
    await requisicaoAPI(`/tarefas/${id}/prazo`, {
      method: 'PATCH',
      body: JSON.stringify({ prazo: prazo || null }),
    });
    recarregarObjetivos();
  }

  async function alternarTarefa(id, concluida) {
    await requisicaoAPI(`/tarefas/${id}/conclusao`, {
      method: 'PATCH',
      body: JSON.stringify({ concluida: !concluida }),
    });
    recarregarObjetivos();
  }

  async function removerTarefa(id) {
    await requisicaoAPI(`/tarefas/${id}`, { method: 'DELETE' });
    recarregarObjetivos();
  }

  async function adicionarNota(texto) {
    if (!texto.trim()) return;
    const sessao = controleSessaoNotas.current.capturar();
    setOperacaoNotaPendente(true);
    setErroNotas('');
    try {
      const criada = await notasAPI.criar(texto.trim());
      if (controleSessaoNotas.current.aindaAtual(sessao)) {
        setNotas((atuais) =>
          atuais.some((nota) => nota.id === criada.id) ? atuais : [...atuais, criada],
        );
      }
    } catch (erroOperacao) {
      if (controleSessaoNotas.current.aindaAtual(sessao))
        setErroNotas(erroOperacao.message || 'Não foi possível salvar a nota. Tente novamente.');
      throw erroOperacao;
    } finally {
      if (controleSessaoNotas.current.aindaAtual(sessao)) setOperacaoNotaPendente(false);
    }
  }

  async function persistirAtualizacaoNota(nota, texto, concluida = nota.concluida) {
    const sessao = controleSessaoNotas.current.capturar();
    setOperacaoNotaPendente(true);
    setErroNotas('');
    try {
      const atualizada = await notasAPI.atualizar(nota, texto, concluida);
      if (controleSessaoNotas.current.aindaAtual(sessao))
        setNotas((atuais) => atuais.map((item) => (item.id === nota.id ? atualizada : item)));
    } catch (erroOperacao) {
      if (controleSessaoNotas.current.aindaAtual(sessao))
        setErroNotas(erroOperacao.message || 'Não foi possível atualizar a nota. Tente novamente.');
      throw erroOperacao;
    } finally {
      if (controleSessaoNotas.current.aindaAtual(sessao)) setOperacaoNotaPendente(false);
    }
  }

  async function atualizarNota(id, texto) {
    const nota = notas.find((item) => item.id === id);
    if (!nota) return;
    return persistirAtualizacaoNota(nota, texto.trim());
  }

  async function alternarNota(id) {
    const nota = notas.find((item) => item.id === id);
    if (!nota) return;
    return persistirAtualizacaoNota(nota, nota.texto, !nota.concluida);
  }
  async function removerNota(id) {
    const sessao = controleSessaoNotas.current.capturar();
    setOperacaoNotaPendente(true);
    setErroNotas('');
    try {
      await notasAPI.remover(id);
      if (controleSessaoNotas.current.aindaAtual(sessao))
        setNotas((atuais) => atuais.filter((nota) => nota.id !== id));
    } catch (erroOperacao) {
      if (controleSessaoNotas.current.aindaAtual(sessao))
        setErroNotas(erroOperacao.message || 'Não foi possível excluir a nota. Tente novamente.');
      throw erroOperacao;
    } finally {
      if (controleSessaoNotas.current.aindaAtual(sessao)) setOperacaoNotaPendente(false);
    }
  }

  const tarefas = objetivos.flatMap((objetivo) =>
    objetivo.etapas.flatMap((etapa) =>
      etapa.tarefas.map((tarefa) => ({
        ...tarefa,
        objetivoId: objetivo.id,
        objetivoNome: objetivo.nome,
        etapaId: etapa.id,
        etapaNome: etapa.texto,
      })),
    ),
  );

  return {
    objetivos,
    notas,
    carregandoNotas,
    operacaoNotaPendente,
    erroNotas,
    tarefas,
    carregando,
    erro,
    adicionarObjetivo,
    removerObjetivo,
    adicionarEtapa,
    adicionarTarefa,
    atualizarPrazoTarefa,
    alternarTarefa,
    removerTarefa,
    recarregarObjetivos,
    adicionarNota,
    atualizarNota,
    alternarNota,
    removerNota,
    recarregarNotas,
    limparNotas,
  };
}

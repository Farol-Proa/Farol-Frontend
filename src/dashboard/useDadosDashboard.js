import { useCallback, useEffect, useRef, useState } from 'react';
import { mapasAPI } from '../services/mapasApi';
import { mapearArvoreObjetivos } from './objectiveTree';

export function useDadosDashboard() {
  const [objetivos, setObjetivos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [versaoDados, setVersaoDados] = useState(0);
  const filasPosicao = useRef(new Map());
  const posicoesConfirmadas = useRef(new Map());

  const recarregarObjetivos = useCallback(() => {
    setVersaoDados((versao) => versao + 1);
  }, []);

  const limparObjetivos = useCallback(() => {
    setObjetivos([]);
    setErro('');
    setCarregando(false);
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
        const resposta = await mapasAPI.arvore();
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

  async function adicionarObjetivo({ titulo, descricao, prioridade }) {
    const criado = await mapasAPI.criarMapa({ titulo, descricao, prioridade });
    recarregarObjetivos();
    return criado;
  }

  async function gerarObjetivoIa(dados) {
    const criado = await mapasAPI.gerarComIa(dados);
    recarregarObjetivos();
    return criado;
  }

  async function removerObjetivo(id) {
    await mapasAPI.removerMapa(id);
    recarregarObjetivos();
  }

  async function adicionarEtapa(objetivoId, { titulo, descricao }) {
    const criada = await mapasAPI.criarIlha(objetivoId, { titulo, descricao });
    recarregarObjetivos();
    return criada;
  }

  async function adicionarTarefa(etapaId, { titulo, prazo, obrigatoria = true }) {
    await mapasAPI.criarTarefa(etapaId, { titulo, prazo: prazo || null, obrigatoria });
    recarregarObjetivos();
  }

  async function atualizarPrazoTarefa(id, prazo) {
    await mapasAPI.atualizarPrazo(id, prazo);
    recarregarObjetivos();
  }

  async function alternarTarefa(id, concluida) {
    await mapasAPI.concluirTarefa(id, !concluida);
    recarregarObjetivos();
  }

  async function removerTarefa(id) {
    await mapasAPI.removerTarefa(id);
    recarregarObjetivos();
  }

  async function atualizarIlha(id, dados) {
    const resposta = await mapasAPI.atualizarIlha(id, dados);
    recarregarObjetivos();
    return resposta;
  }

  const carregarIlha = useCallback(async (id) => {
    const resposta = await mapasAPI.ilha(id);
    setObjetivos((atuais) => atuais.map((objetivo) => ({
      ...objetivo,
      etapas: objetivo.etapas.map((etapa) => {
        if (String(etapa.id) !== String(id)) return etapa;
        const atualizada = { ...etapa };
        if (resposta.titulo !== undefined) atualizada.texto = resposta.titulo;
        for (const campo of ['descricao', 'status', 'ordem', 'prazo']) {
          if (resposta[campo] !== undefined) atualizada[campo] = resposta[campo];
        }
        if (Number.isFinite(resposta.posicaoX) && Number.isFinite(resposta.posicaoY)) {
          atualizada.posicao = { x: resposta.posicaoX, y: resposta.posicaoY };
        }
        if (resposta.conteudo !== undefined) atualizada.conteudo = resposta.conteudo;
        return atualizada;
      }),
    })));
    return resposta;
  }, []);

  const carregarMapa = useCallback(async (id) => {
    const resposta = await mapasAPI.mapa(id);
    const [detalhe] = mapearArvoreObjetivos([resposta]);
    if (detalhe) setObjetivos((atuais) => atuais.map((item) => String(item.id) === String(id) ? detalhe : item));
    return resposta;
  }, []);

  async function removerIlha(id) {
    await mapasAPI.removerIlha(id);
    recarregarObjetivos();
  }

  const atualizarPosicaoIlha = useCallback((id, posicao) => new Promise((resolve, reject) => {
    const chave = String(id);
    let fila = filasPosicao.current.get(chave);
    if (!fila) {
      fila = { emAndamento: false, pendente: null, promessas: [] };
      filasPosicao.current.set(chave, fila);
    }
    fila.pendente = posicao;
    fila.promessas.push({ resolve, reject });

    async function persistirUltimaPosicao() {
      if (fila.emAndamento) return;
      fila.emAndamento = true;
      while (fila.pendente) {
        const proxima = fila.pendente;
        fila.pendente = null;
        try {
          await mapasAPI.atualizarPosicao(id, proxima);
          posicoesConfirmadas.current.set(chave, proxima);
          if (!fila.pendente) {
            setObjetivos((atuais) => atuais.map((objetivo) => ({
              ...objetivo,
              etapas: objetivo.etapas.map((etapa) => String(etapa.id) === chave ? { ...etapa, posicao: proxima } : etapa),
            })));
            fila.promessas.splice(0).forEach(({ resolve: concluir }) => concluir());
          }
        } catch (error) {
          if (fila.pendente) continue;
          const confirmada = posicoesConfirmadas.current.get(chave);
          if (confirmada) {
            setObjetivos((atuais) => atuais.map((objetivo) => ({
              ...objetivo,
              etapas: objetivo.etapas.map((etapa) => String(etapa.id) === chave ? { ...etapa, posicao: confirmada } : etapa),
            })));
          }
          fila.promessas.splice(0).forEach(({ reject: falhar }) => falhar(error));
        }
      }
      fila.emAndamento = false;
      if (!fila.promessas.length) filasPosicao.current.delete(chave);
    }
    persistirUltimaPosicao();
  }), []);

  async function criarConexao(mapaId, origemId, destinoId) {
    await mapasAPI.criarConexao(mapaId, origemId, destinoId);
    recarregarObjetivos();
  }

  async function removerConexao(id) {
    await mapasAPI.removerConexao(id);
    recarregarObjetivos();
  }

  async function salvarConteudo(ilhaId, conteudo) {
    await mapasAPI.salvarConteudo(ilhaId, conteudo);
    recarregarObjetivos();
  }

  async function concluirTopico(ilhaId, topicoId, concluido) {
    await mapasAPI.concluirTopico(ilhaId, topicoId, concluido);
    recarregarObjetivos();
  }

  async function criarTopico(ilhaId, dados) {
    await mapasAPI.criarTopico(ilhaId, dados);
    recarregarObjetivos();
  }

  async function atualizarTopico(ilhaId, topicoId, dados) {
    await mapasAPI.atualizarTopico(ilhaId, topicoId, dados);
    recarregarObjetivos();
  }

  async function removerTopico(ilhaId, topicoId) {
    await mapasAPI.removerTopico(ilhaId, topicoId);
    recarregarObjetivos();
  }

  async function atualizarTarefa(id, dados) {
    await mapasAPI.atualizarTarefa(id, dados);
    recarregarObjetivos();
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
    tarefas,
    carregando,
    erro,
    adicionarObjetivo,
    gerarObjetivoIa,
    removerObjetivo,
    adicionarEtapa,
    adicionarTarefa,
    atualizarPrazoTarefa,
    alternarTarefa,
    removerTarefa,
    atualizarIlha,
    carregarIlha,
    carregarMapa,
    removerIlha,
    atualizarPosicaoIlha,
    criarConexao,
    removerConexao,
    salvarConteudo,
    concluirTopico,
    criarTopico,
    atualizarTopico,
    removerTopico,
    atualizarTarefa,
    recarregarObjetivos,
    limparObjetivos,
  };
}

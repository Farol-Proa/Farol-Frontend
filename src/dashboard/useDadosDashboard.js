import { useCallback, useEffect, useState } from 'react';
import { requisicaoAPI } from '../services/api';

function formatarTarefa(tarefa) {
  return {
    id: tarefa.id,
    texto: tarefa.titulo,
    descricao: tarefa.descricao,
    concluida: Boolean(tarefa.concluida),
  };
}

export function useDadosDashboard() {
  const [objetivos, setObjetivos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [versaoDados, setVersaoDados] = useState(0);

  const recarregarObjetivos = useCallback(() => {
    setVersaoDados((versao) => versao + 1);
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
        const resposta = await requisicaoAPI('/objetivos');
        const objetivosFormatados = await Promise.all(
          (resposta ?? []).map(async (objetivo) => {
            const etapas = await requisicaoAPI(`/objetivos/${objetivo.id}/etapas`);
            const etapasFormatadas = await Promise.all(
              (etapas ?? []).map(async (etapa) => {
                const tarefas = await requisicaoAPI(`/etapas/${etapa.id}/tarefas`);
                return {
                  id: etapa.id,
                  texto: etapa.titulo,
                  descricao: etapa.descricao,
                  status: etapa.status,
                  ordem: etapa.ordem,
                  prazo: etapa.prazo,
                  tarefas: (tarefas ?? []).map(formatarTarefa),
                };
              }),
            );

            return {
              id: objetivo.id,
              nome: objetivo.titulo,
              descricao: objetivo.descricao,
              status: objetivo.status,
              prazo: objetivo.prazo,
              prioridade: objetivo.prioridade,
              etapas: etapasFormatadas,
            };
          }),
        );

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

  async function adicionarTarefa(etapaId, titulo) {
    await requisicaoAPI(`/etapas/${etapaId}/tarefas`, {
      method: 'POST',
      body: JSON.stringify({ titulo }),
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

  function adicionarNota(texto) {
    if (texto.trim())
      setNotas((atuais) => [...atuais, { id: crypto.randomUUID(), texto, concluida: false }]);
  }

  function alternarNota(id) {
    setNotas((atuais) =>
      atuais.map((nota) => (nota.id === id ? { ...nota, concluida: !nota.concluida } : nota)),
    );
  }

  function removerNota(id) {
    setNotas((atuais) => atuais.filter((nota) => nota.id !== id));
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
    tarefas,
    carregando,
    erro,
    adicionarObjetivo,
    removerObjetivo,
    adicionarEtapa,
    adicionarTarefa,
    alternarTarefa,
    removerTarefa,
    recarregarObjetivos,
    adicionarNota,
    alternarNota,
    removerNota,
  };
}

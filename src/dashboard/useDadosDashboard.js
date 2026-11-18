import { useRef, useState, useEffect } from 'react';
import { requisicaoAPI } from '../services/api';

export function useDadosDashboard() {
  // O hook fica em App para manter os dados do painel enquanto as telas alternam.
  // Os dados de exemplo usam IDs atÃ© 3; novos itens avanÃ§am a partir do 4.
  const proximoId = useRef(4);

  const [objetivos, setObjetivos] = useState([
    {
      id: 1,
      nome: 'Meu primeiro objetivo',
      concluido: false,
      etapas: [
        { id: 1, texto: 'Primeira etapa', concluida: false },
        { id: 2, texto: 'Segunda etapa', concluida: false },
      ],
    },
  ]);
  const [notas, setNotas] = useState([
    { id: 1, texto: 'Revisar resumo do TCC', concluida: true },
    { id: 2, texto: 'Enviar e-mail para o orientador', concluida: false },
    { id: 3, texto: 'Consolidar anotaÃ§Ãµes da semana', concluida: false },
  ]);
  const [tarefas, setTarefas] = useState([]);
  const [versaoDados, setVersaoDados] = useState(0);

  useEffect(() => {

    async function carregarObjetivos() {
      const token = sessionStorage.getItem('token');

      if (!token) return;

      try {
        const resposta = await requisicaoAPI('/objetivos');

        const objetivosFormatados = await Promise.all(
          resposta.map(async (objetivo) => {
            const etapas = await requisicaoAPI(
              `/objetivos/${objetivo.id}/etapas`
            );

            const etapasFormatadas = await Promise.all(
              etapas.map(async (etapa) => {
                let tarefas = [];

                try {
                  tarefas = await requisicaoAPI(
                    `/etapas/${etapa.id}/tarefas`
                  );
                } catch (erro) {
                  console.error(
                    `Erro ao carregar tarefas da etapa ${etapa.id}:`,
                    erro
                  );
                }

                return {
                  id: etapa.id,
                  texto: etapa.titulo,
                  concluida: etapa.status === 'CONCLUIDA',
                  tarefas: tarefas.map((tarefa) => ({
                    id: tarefa.id,
                    texto: tarefa.titulo,
                    concluida: tarefa.concluida,
                    etapaId: etapa.id,
                  })),
                };
              })
            );

            return {
              id: objetivo.id,
              nome: objetivo.titulo,
              concluido: objetivo.status === 'CONCLUIDO',
              etapas: etapasFormatadas,
            };
          })
        );

        setObjetivos(objetivosFormatados);
      } catch (erro) {
        console.error('Erro ao carregar objetivos:', erro);
      }
    }


    carregarObjetivos();
  }, [versaoDados]);

  function gerarId() {
    // Gera o ID fora do atualizador de estado, que o StrictMode pode chamar duas vezes em desenvolvimento.
    return proximoId.current++;
  }

  function adicionarObjetivo(nome) {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    const id = gerarId();
    setObjetivos((atuais) => [
      ...atuais,
      {
        id,
        nome: nomeLimpo,
        concluido: false,
        etapas: [],
      },
    ]);
  }

  function alternarObjetivo(id) {
    setObjetivos((atuais) =>
      atuais.map((objetivo) =>
        objetivo.id === id ? { ...objetivo, concluido: !objetivo.concluido } : objetivo,
      ),
    );
  }

  function removerObjetivo(id) {
    setObjetivos((atuais) => atuais.filter((objetivo) => objetivo.id !== id));
  }

  function adicionarEtapa(idObjetivo, texto) {
    const textoLimpo = texto.trim();
    if (!textoLimpo) return;

    const idEtapa = gerarId();
    setObjetivos((atuais) =>
      atuais.map((objetivo) =>
        objetivo.id === idObjetivo
          ? {
            ...objetivo,
            etapas: [...objetivo.etapas, { id: idEtapa, texto: textoLimpo, concluida: false }],
          }
          : objetivo,
      ),
    );
  }

  function alternarEtapa(idObjetivo, idEtapa) {
    setObjetivos((atuais) =>
      atuais.map((objetivo) =>
        objetivo.id === idObjetivo
          ? {
            ...objetivo,
            etapas: objetivo.etapas.map((etapa) =>
              etapa.id === idEtapa ? { ...etapa, concluida: !etapa.concluida } : etapa,
            ),
          }
          : objetivo,
      ),
    );
  }

  function removerEtapa(idObjetivo, idEtapa) {
    setObjetivos((atuais) =>
      atuais.map((objetivo) =>
        objetivo.id === idObjetivo
          ? {
            ...objetivo,
            etapas: objetivo.etapas.filter((etapa) => etapa.id !== idEtapa),
          }
          : objetivo,
      ),
    );
  }

  function adicionarNota(texto) {
    if (!texto.trim()) return;

    const id = gerarId();
    setNotas((atuais) => [...atuais, { id, texto, concluida: false }]);
  }

  function alternarNota(id) {
    setNotas((atuais) =>
      atuais.map((nota) => (nota.id === id ? { ...nota, concluida: !nota.concluida } : nota)),
    );
  }

  function removerNota(id) {
    setNotas((atuais) => atuais.filter((nota) => nota.id !== id));
  }

  function adicionarTarefa({ texto, data, horario, prioridade }) {
    const textoLimpo = texto.trim();
    if (!textoLimpo) return;

    const id = gerarId();
    setTarefas((atuais) => [
      ...atuais,
      {
        id,
        texto: textoLimpo,
        concluida: false,
        data,
        horario,
        prioridade,
      },
    ]);
  }


  async function alternarTarefa(id) {
    const tarefa = tarefasDasIlhas.find(
      (item) => item.id === id
    );

    if (!tarefa) return;

    try {
      await requisicaoAPI(`/tarefas/${id}/conclusao`, {
        method: 'PATCH',
        body: JSON.stringify({
          concluida: !tarefa.concluida,
        }),
      });

      setObjetivos((atuais) =>
        atuais.map((objetivo) => ({
          ...objetivo,
          etapas: objetivo.etapas.map((etapa) => ({
            ...etapa,
            tarefas: etapa.tarefas.map((item) =>
              item.id === id
                ? { ...item, concluida: !item.concluida }
                : item
            ),
          })),
        }))
      );
    } catch (erro) {
      console.error('Erro ao atualizar tarefa:', erro);
    }
  }


  async function removerTarefa(id) {
    try {
      await requisicaoAPI(`/tarefas/${id}`, {
        method: 'DELETE',
      });

      setObjetivos((atuais) =>
        atuais.map((objetivo) => ({
          ...objetivo,
          etapas: objetivo.etapas.map((etapa) => ({
            ...etapa,
            tarefas: etapa.tarefas.filter(
              (tarefa) => String(tarefa.id) !== String(id)
            ),
          })),
        }))
      );
    } catch (erro) {
      console.error('Erro ao excluir tarefa:', erro);
      alert(erro.message || 'Não foi possível excluir a tarefa.');
    }
  }



  const tarefasDasIlhas = objetivos.flatMap((objetivo) =>
    (objetivo.etapas || []).flatMap((etapa) =>
      (etapa.tarefas || []).map((tarefa) => ({
        ...tarefa,
        objetivoId: objetivo.id,
        objetivoNome: objetivo.nome,
        etapaId: etapa.id,
        etapaNome: etapa.texto,
      }))
    )
  );

  function recarregarObjetivos() {
    setVersaoDados((atual) => atual + 1);
  }

  return {
    objetivos,
    notas,
    tarefas: tarefasDasIlhas,
    adicionarObjetivo,
    alternarObjetivo,
    removerObjetivo,
    recarregarObjetivos,
    adicionarEtapa,
    alternarEtapa,
    removerEtapa,
    adicionarNota,
    alternarNota,
    removerNota,
    adicionarTarefa,
    alternarTarefa,
    removerTarefa,
  };
}


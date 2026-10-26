import { useRef, useState } from 'react';

export function useDadosDashboard() {
  // O hook fica em App para manter os dados enquanto Painel e MapaObjetivo alternam de tela.
  // Os dados de exemplo usam IDs até 3; novos itens avançam a partir do 4.
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
    { id: 3, texto: 'Consolidar anotações da semana', concluida: false },
  ]);
  const [tarefas, setTarefas] = useState([]);

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

  function alternarTarefa(id) {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa,
      ),
    );
  }

  function removerTarefa(id) {
    setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id));
  }

  return {
    objetivos,
    notas,
    tarefas,
    adicionarObjetivo,
    alternarObjetivo,
    removerObjetivo,
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

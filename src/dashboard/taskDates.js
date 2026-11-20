export function mapearTarefa(tarefa) {
  const mapeada = {
    id: tarefa.id,
    texto: tarefa.titulo,
    descricao: tarefa.descricao,
    concluida: Boolean(tarefa.concluida),
    prazo: tarefa.prazo ?? '',
  };

  if (tarefa.status !== undefined) mapeada.status = tarefa.status;

  return mapeada;
}

export function filtrarTarefasPorPrazo(tarefas, prazo) {
  if (!prazo) return [];
  return tarefas.filter((tarefa) => tarefa.prazo === prazo);
}

export function formatarPrazo(prazo) {
  if (!prazo) return '';
  const [ano, mes, dia] = prazo.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function avancarMesCalendario(mesExibido, diferenca) {
  return {
    mesExibido: new Date(mesExibido.getFullYear(), mesExibido.getMonth() + diferenca, 1),
    dataSelecionada: '',
  };
}

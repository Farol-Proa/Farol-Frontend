export function extrairDataCivil(prazo) {
  if (!prazo || typeof prazo !== 'string') return '';
  const trimmed = prazo.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

export function formatarHorarioPrazo(prazo) {
  if (!prazo || typeof prazo !== 'string') return '';
  const trimmed = prazo.trim();
  const match = trimmed.match(/[T\s](\d{2}:\d{2})/);
  return match ? match[1] : '';
}

export function mapearTarefa(tarefa) {
  const mapeada = {
    id: tarefa.id,
    texto: tarefa.titulo,
    descricao: tarefa.descricao,
    concluida: Boolean(tarefa.concluida),
    prazo: tarefa.prazo ?? '',
  };

  if (tarefa.obrigatoria !== undefined) mapeada.obrigatoria = Boolean(tarefa.obrigatoria);
  if (tarefa.status !== undefined) mapeada.status = tarefa.status;

  return mapeada;
}

export function filtrarTarefasPorPrazo(tarefas, prazo) {
  if (!prazo || !Array.isArray(tarefas)) return [];
  const dataAlvo = extrairDataCivil(prazo);
  if (!dataAlvo) return [];
  return tarefas.filter((tarefa) => extrairDataCivil(tarefa.prazo) === dataAlvo);
}

export function formatarPrazo(prazo) {
  const dataCivil = extrairDataCivil(prazo);
  if (!dataCivil) return '';
  const [ano, mes, dia] = dataCivil.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function avancarMesCalendario(mesExibido, diferenca) {
  return {
    mesExibido: new Date(mesExibido.getFullYear(), mesExibido.getMonth() + diferenca, 1),
    dataSelecionada: '',
  };
}

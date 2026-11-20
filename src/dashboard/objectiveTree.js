import { mapearTarefa } from './taskDates.js';

export function mapearArvoreObjetivos(objetivos = []) {
  return objetivos.map((objetivo) => ({
    id: objetivo.id,
    nome: objetivo.titulo,
    descricao: objetivo.descricao,
    status: objetivo.status,
    prazo: objetivo.prazo,
    prioridade: objetivo.prioridade,
    etapas: (objetivo.etapas ?? []).map((etapa) => ({
      id: etapa.id,
      texto: etapa.titulo,
      descricao: etapa.descricao,
      status: etapa.status,
      ordem: etapa.ordem,
      prazo: etapa.prazo,
      tarefas: (etapa.tarefas ?? []).map(mapearTarefa),
    })),
  }));
}

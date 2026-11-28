import { mapearTarefa } from './taskDates.js';
import { normalizarConteudoIlha } from './conteudoIlha.js';

export function percentualProgressoObjetivo(objetivo) {
  const percentual = objetivo?.progresso?.percentual;
  return Number.isFinite(percentual) ? percentual : null;
}

function mapearTopico(topico) {
  const mapeado = {
    ...topico,
    titulo: topico.titulo ?? topico.title,
    descricao: topico.descricao ?? topico.description,
    concluido: Boolean(topico.concluido ?? topico.progresso?.concluido),
  };
  if (topico.obrigatorio !== undefined || topico.required !== undefined) {
    mapeado.obrigatorio = Boolean(topico.obrigatorio ?? topico.required);
  }
  return mapeado;
}

export function mapearArvoreObjetivos(objetivos = []) {
  return objetivos.map((objetivo) => ({
    id: objetivo.id,
    nome: objetivo.titulo,
    descricao: objetivo.descricao,
    status: objetivo.status,
    prazo: objetivo.prazo,
    prioridade: objetivo.prioridade,
    progresso: objetivo.progresso,
    conexoes: (objetivo.conexoes ?? []).map((conexao) => ({
      id: conexao.id,
      origemEtapaId: conexao.origemEtapaId ?? conexao.origemId,
      destinoEtapaId: conexao.destinoEtapaId ?? conexao.destinoId,
    })),
    etapas: (objetivo.etapas ?? objetivo.ilhas ?? []).map((etapa) => ({
      id: etapa.id,
      texto: etapa.titulo,
      descricao: etapa.descricao,
      status: etapa.status,
      ordem: etapa.ordem,
      prazo: etapa.prazo,
      posicao: etapa.posicao ?? (
        Number.isFinite(etapa.posicaoX) && Number.isFinite(etapa.posicaoY)
          ? { x: etapa.posicaoX, y: etapa.posicaoY }
          : null
      ),
      conteudo: normalizarConteudoIlha(etapa.conteudo),
      topicos: (etapa.topicos ?? etapa.conteudo?.topicos ?? etapa.conteudo?.topics ?? []).map(mapearTopico),
      progresso: typeof etapa.progresso === 'number'
        ? { percentual: etapa.progresso, concluida: Boolean(etapa.concluida) }
        : etapa.progresso ?? null,
      tarefas: (etapa.tarefas ?? []).map(mapearTarefa),
    })),
  }));
}

import { requisicaoAPI } from './api.js';

export async function obterPerfilMentorAtual() {
  try {
    return await requisicaoAPI('/mentoria/perfil-atual');
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function obterVinculoAtivoMentorado() {
  return await requisicaoAPI('/mentoria/meu-vinculo');
}

export async function listarMentoresDisponiveis() {
  return await requisicaoAPI('/mentoria/mentores');
}

export async function listarMinhasSolicitacoes() {
  return await requisicaoAPI('/mentoria/solicitacoes/minhas');
}

export async function enviarSolicitacaoMentoria({ mentorId, objetivo }) {
  return await requisicaoAPI('/mentoria/solicitacoes', {
    method: 'POST',
    body: JSON.stringify({ mentorId, objetivo }),
  });
}

export async function cancelarSolicitacaoMentoria(id) {
  return await requisicaoAPI(`/mentoria/solicitacoes/${id}/cancelar`, {
    method: 'POST',
  });
}

export async function encerrarVinculoMentoria(id) {
  return await requisicaoAPI(`/mentoria/vinculos/${id}/encerrar`, {
    method: 'POST',
  });
}

export async function listarSolicitacoesDoMentor() {
  return await requisicaoAPI('/mentoria/mentor/solicitacoes');
}

export async function responderSolicitacaoMentoria(id, { aceitar, linkReuniao }) {
  return await requisicaoAPI(`/mentoria/mentor/solicitacoes/${id}/responder`, {
    method: 'POST',
    body: JSON.stringify({ aceitar, linkReuniao }),
  });
}

export async function listarMentoradosDoMentor() {
  return await requisicaoAPI('/mentoria/mentor/mentorados');
}

export async function atualizarLinkReuniaoMentor(vinculoId, linkReuniao) {
  return await requisicaoAPI(`/mentoria/mentor/vinculos/${vinculoId}/link`, {
    method: 'PATCH',
    body: JSON.stringify({ linkReuniao }),
  });
}

export async function listarMensagensMentoria(vinculoId) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/mensagens`);
}

export async function enviarMensagemMentoria(vinculoId, conteudo) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/mensagens`, {
    method: 'POST',
    body: JSON.stringify({ conteudo }),
  });
}

export async function listarReunioesMentoria(vinculoId) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/reunioes`);
}

export async function criarReuniaoMentoria(vinculoId, { titulo, pauta, dataHora, duracaoMinutos, linkReuniao }) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/reunioes`, {
    method: 'POST',
    body: JSON.stringify({ titulo, pauta, dataHora, duracaoMinutos, linkReuniao }),
  });
}

export async function atualizarStatusReuniao(reuniaoId, status) {
  return await requisicaoAPI(`/mentoria/reunioes/${reuniaoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function listarOrientacoesMentoria(vinculoId) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/orientacoes`);
}

export async function criarOrientacaoMentoria(vinculoId, { titulo, conteudo, recomendacoes, objetivoId, prazo }) {
  return await requisicaoAPI(`/mentoria/vinculos/${vinculoId}/orientacoes`, {
    method: 'POST',
    body: JSON.stringify({ titulo, conteudo, recomendacoes, objetivoId, prazo }),
  });
}

export async function atualizarStatusOrientacao(orientacaoId, status) {
  return await requisicaoAPI(`/mentoria/orientacoes/${orientacaoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function listarObjetivosDoMentorado(mentoradoId) {
  return await requisicaoAPI(`/mentoria/mentor/mentorados/${mentoradoId}/objetivos`);
}

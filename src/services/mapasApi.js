import { requisicaoAPI } from './api.js';

// Mantém rotas e formatos do módulo de mapas fora dos componentes React.
export function criarServicoMapas(request = requisicaoAPI) {
  const json = (method, body) => ({ method, body: JSON.stringify(body) });
  return {
    arvore: () => request('/objetivos/arvore'),
    mapa: (id) => request(`/objetivos/${id}`),
    criarMapa: (dados) => request('/objetivos', json('POST', dados)),
    gerarComIa: (dados) => request('/objetivos/gerar', json('POST', dados)),
    atualizarMapa: (id, dados) => request(`/objetivos/${id}`, json('PUT', dados)),
    removerMapa: (id) => request(`/objetivos/${id}`, { method: 'DELETE' }),
    criarIlha: (mapaId, dados) => request(`/objetivos/${mapaId}/etapas`, json('POST', dados)),
    ilha: (id) => request(`/etapas/${id}`),
    atualizarIlha: (id, dados) => request(`/etapas/${id}`, json('PUT', dados)),
    removerIlha: (id) => request(`/etapas/${id}`, { method: 'DELETE' }),
    atualizarPosicao: (id, { x, y }) => request(`/etapas/${id}/posicao`, json('PATCH', { x, y })),
    listarConexoes: (mapaId) => request(`/objetivos/${mapaId}/conexoes`),
    criarConexao: (mapaId, origemEtapaId, destinoEtapaId) => request(`/objetivos/${mapaId}/conexoes`, json('POST', { origemEtapaId, destinoEtapaId })),
    removerConexao: (id) => request(`/conexoes/${id}`, { method: 'DELETE' }),
    conteudo: (ilhaId) => request(`/etapas/${ilhaId}/conteudo`),
    salvarConteudo: (ilhaId, conteudo) => request(`/etapas/${ilhaId}/conteudo`, json('PUT', { conteudo })),
    listarTopicos: (ilhaId) => request(`/etapas/${ilhaId}/topicos`),
    criarTopico: (ilhaId, dados) => request(`/etapas/${ilhaId}/topicos`, json('POST', dados)),
    atualizarTopico: (ilhaId, topicoId, dados) => request(`/etapas/${ilhaId}/topicos/${topicoId}`, json('PUT', dados)),
    removerTopico: (ilhaId, topicoId) => request(`/etapas/${ilhaId}/topicos/${topicoId}`, { method: 'DELETE' }),
    concluirTopico: (ilhaId, topicoId, concluido) => request(`/etapas/${ilhaId}/topicos/${topicoId}/progresso`, json('PATCH', { concluido })),
    listarTarefas: (ilhaId) => request(`/etapas/${ilhaId}/tarefas`),
    criarTarefa: (ilhaId, dados) => request(`/etapas/${ilhaId}/tarefas`, json('POST', dados)),
    atualizarTarefa: (id, dados) => request(`/tarefas/${id}`, json('PUT', dados)),
    concluirTarefa: (id, concluida) => request(`/tarefas/${id}/conclusao`, json('PATCH', { concluida })),
    atualizarPrazo: (id, prazo) => request(`/tarefas/${id}/prazo`, json('PATCH', { prazo: prazo || null })),
    removerTarefa: (id) => request(`/tarefas/${id}`, { method: 'DELETE' }),
  };
}

export const mapasAPI = criarServicoMapas();

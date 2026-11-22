import { requisicaoAPI } from '../services/api.js';

function validarAssociacao({ objetivoId, etapaId }) {
  if (objetivoId != null && etapaId != null) {
    throw new TypeError('Uma nota só pode ser associada a um mapa ou a uma ilha.');
  }
}

function corpoDaNota({ titulo, conteudo, objetivoId = null, etapaId = null }) {
  validarAssociacao({ objetivoId, etapaId });
  return { titulo, conteudo, objetivoId, etapaId };
}

export function criarServicoNotas(requisicao = requisicaoAPI) {
  return {
    listar({ objetivoId, etapaId } = {}) {
      const filtros = new URLSearchParams();
      if (objetivoId != null) filtros.set('objetivoId', objetivoId);
      if (etapaId != null) filtros.set('etapaId', etapaId);
      const query = filtros.toString();
      return requisicao(`/notas${query ? `?${query}` : ''}`);
    },
    buscar(id) {
      return requisicao(`/notas/${id}`);
    },
    criar(dados) {
      return requisicao('/notas', {
        method: 'POST',
        body: JSON.stringify(corpoDaNota(dados)),
      });
    },
    atualizar(id, dados) {
      if (!Object.hasOwn(dados, 'objetivoId') || !Object.hasOwn(dados, 'etapaId')) {
        throw new TypeError('Informe objetivoId e etapaId explicitamente ao atualizar uma nota.');
      }

      const { revisao } = dados;
      const corpo = corpoDaNota(dados);
      return requisicao(`/notas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...corpo, revisao }),
      });
    },
    remover(id) {
      return requisicao(`/notas/${id}`, { method: 'DELETE' });
    },
  };
}

export const notasAPI = criarServicoNotas();

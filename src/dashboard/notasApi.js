export function criarServicoNotas(requisicaoAPI) {
  function atualizar(nota, texto, concluida = nota.concluida) {
    return requisicaoAPI(`/notas/${nota.id}`, {
      method: 'PUT',
      body: JSON.stringify({ texto, concluida }),
    });
  }

  return {
    listar() {
      return requisicaoAPI('/notas');
    },
    criar(texto) {
      return requisicaoAPI('/notas', {
        method: 'POST',
        body: JSON.stringify({ texto, concluida: false }),
      });
    },
    atualizar,
    alternar(nota) {
      return atualizar(nota, nota.texto, !nota.concluida);
    },
    remover(id) {
      return requisicaoAPI(`/notas/${id}`, { method: 'DELETE' });
    },
  };
}

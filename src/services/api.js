const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api';

export async function requisicaoAPI(endpoint, opcoes = {}) {
  const token = sessionStorage.getItem('token');

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opcoes.headers,
    },
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    let mensagem = textoErro;

    try {
      const dadosErro = JSON.parse(textoErro);
      mensagem = dadosErro.erro || dadosErro.detail || dadosErro.message || dadosErro.mensagem || textoErro;
    } catch {
      // Algumas respostas de erro não usam JSON.
    }

    if (resposta.status === 401) {
      window.dispatchEvent(new CustomEvent('farol:auth-expired'));
      throw new Error('Sua sessão expirou. Entre novamente para continuar.');
    }

    const erro = new Error(mensagem || 'Erro ao comunicar com o servidor.');
    erro.status = resposta.status;
    throw erro;
  }

  if (resposta.status === 204) {
    return null;
  }

  const texto = await resposta.text();

  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

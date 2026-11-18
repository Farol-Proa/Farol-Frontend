const API_URL = 'http://localhost:8080/api';

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
        const mensagem = await resposta.text();
        throw new Error(mensagem || 'Erro ao comunicar com o servidor.');
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
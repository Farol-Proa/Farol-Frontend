export function criarControleSessao() {
  let versao = 0;

  return {
    capturar: () => versao,
    invalidar: () => {
      versao += 1;
    },
    aindaAtual: (captura) => captura === versao,
  };
}

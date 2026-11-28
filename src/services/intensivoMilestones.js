const PREFIXO_CHAVE = 'farol:marcos_visualizados:';

export function obterChaveUsuario(usuarioId) {
  return `${PREFIXO_CHAVE}${usuarioId || 'padrao'}`;
}

export function obterMarcosVisualizados(usuarioId) {
  try {
    const chave = obterChaveUsuario(usuarioId);
    const salvos = sessionStorage.getItem(chave);
    if (!salvos) return [];
    return JSON.parse(salvos);
  } catch {
    return [];
  }
}

export function marcarMarcoVisualizado(usuarioId, dias) {
  try {
    const chave = obterChaveUsuario(usuarioId);
    const atuais = obterMarcosVisualizados(usuarioId);
    if (!atuais.includes(dias)) {
      atuais.push(dias);
      sessionStorage.setItem(chave, JSON.stringify(atuais));
    }
  } catch {
    // sessionStorage indisponível
  }
}

export function obterProximoMarcoParaCelebrar(usuarioId, marcos = []) {
  if (!Array.isArray(marcos) || marcos.length === 0) return null;
  const visualizados = obterMarcosVisualizados(usuarioId);

  // Encontrar o marco desbloqueado mais recente que ainda não foi visto
  const desbloqueadosNaoVistos = marcos
    .filter((m) => m.desbloqueado && !visualizados.includes(m.dias))
    .sort((a, b) => b.dias - a.dias);

  return desbloqueadosNaoVistos[0] || null;
}

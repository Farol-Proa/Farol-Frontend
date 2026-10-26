export function calcularProgressoEtapas(etapas = []) {
  if (etapas.length === 0) {
    return 0;
  }

  const etapasConcluidas = etapas.filter((etapa) => etapa.concluida).length;
  return Math.round((etapasConcluidas / etapas.length) * 100);
}

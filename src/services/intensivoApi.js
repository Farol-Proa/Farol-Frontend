import { requisicaoAPI } from './api.js';

let cacheIntensivo = null;

export function obterCacheIntensivo() {
  if (cacheIntensivo) return cacheIntensivo;
  try {
    const salvo = sessionStorage.getItem('farol:intensivo_cache');
    if (salvo) {
      cacheIntensivo = JSON.parse(salvo);
      return cacheIntensivo;
    }
  } catch {
    // sessionStorage indisponível
  }
  return null;
}

export async function obterDadosIntensivo() {
  try {
    const dados = await requisicaoAPI('/intensivo');
    if (dados) {
      cacheIntensivo = dados;
      try {
        sessionStorage.setItem('farol:intensivo_cache', JSON.stringify(dados));
      } catch {
        // quota excedida ou sessionStorage bloqueado
      }
    }
    return dados;
  } catch (erro) {
    console.warn('Falha ao carregar dados do intensivo:', erro?.message || erro);
    return obterCacheIntensivo();
  }
}

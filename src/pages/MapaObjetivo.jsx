<<<<<<< HEAD:src/pages/MapaObjetivo.jsx
import { calcularProgressoEtapas } from '../objetivos/progresso';

function MapaObjetivo({ objetivo, onVoltar, onAlternarEtapa }) {
  if (!objetivo) {
    return null;
  }

  const etapas = objetivo.etapas || [];
  const concluidas = etapas.filter((etapa) => etapa.concluida).length;
  const progresso = calcularProgressoEtapas(etapas);

  return (
    <main className="min-h-screen overflow-hidden bg-farol-dashboard text-white">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">Farol</p>
          <p className="mt-1 text-sm text-slate-400">Sua jornada, no seu ritmo</p>
        </div>
=======

import { useMemo } from "react";
import Sidebar from "../components/Sidebar";

function MapaIlha({ ilha, onVoltar }) {
  if (!ilha) {
    return null;
  }

  const etapas = ilha.etapas || [];
  const concluidas = etapas.filter((etapa) => etapa.concluida).length;
  const indiceAtual = etapas.findIndex((etapa) => !etapa.concluida);

  const progresso =
    etapas.length === 0
      ? 0
      : Math.round((concluidas / etapas.length) * 100);

  const posicoes = useMemo(
    () => [
      { left: "12%", top: "8%" },
      { left: "35%", top: "66%" },
      { left: "44%", top: "8%" },
      { left: "65%", top: "48%" },
      { left: "76%", top: "10%" },
      { left: "23%", top: "38%" },
    ],
    [],
  );

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#070c16] text-white">
      <Sidebar
        secaoAtiva="mapas"
        onNavegar={(secao) => {
          if (secao === "inicio") {
            onVoltar();
          }
        }}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Farol
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Sua jornada, no seu ritmo
            </p>
          </div>
>>>>>>> 6f50cc8b7da94677539000e3a19ac311b172477f:src/pages/MapaIlha.jsx

          <button
            type="button"
            onClick={onVoltar}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:bg-white/5"
          >
            ← Voltar ao painel
          </button>
        </header>

<<<<<<< HEAD:src/pages/MapaObjetivo.jsx
      {/* Conteúdo principal */}
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Meu roadmap
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{objetivo.nome}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Todo grande objetivo começa com um pequeno passo. Continue avançando e ilumine seu
            caminho.
          </p>
        </section>

        {/* Cartão de progresso */}
        <section className="mb-12 rounded-3xl border border-white/10 bg-farol-dashboard-card p-6 shadow-xl md:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">Progresso da Ilha</p>
              <p className="mt-2 text-3xl font-bold text-white">{progresso}%</p>
            </div>

            <p className="text-sm text-slate-300">
              {concluidas} de {etapas.length} etapas concluídas
            </p>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </section>

        {/* Caminho do roadmap */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Caminho até seu objetivo</h2>
            <p className="mt-2 text-sm text-slate-400">
              Cada etapa concluída aproxima você do seu destino.
            </p>
          </div>

          {etapas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-12 text-center">
              <p className="text-lg font-semibold">Sua jornada começa aqui</p>
              <p className="mt-2 text-sm text-slate-400">
                Volte ao painel para adicionar as primeiras etapas desta Ilha.
=======
        <div className="px-4 py-5 md:px-7">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Meu mapa
              </p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                {ilha.nome}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Explore as ilhas e avance rumo ao seu objetivo.
>>>>>>> 6f50cc8b7da94677539000e3a19ac311b172477f:src/pages/MapaIlha.jsx
              </p>
            </div>

<<<<<<< HEAD:src/pages/MapaObjetivo.jsx
              <div className="relative space-y-6">
                {etapas.map((etapa, index) => (
                  <article
                    key={etapa.id}
                    className={`relative ml-12 rounded-2xl border p-5 transition md:ml-16 md:p-6 ${
                      etapa.concluida
                        ? 'border-emerald-400/40 bg-emerald-400/10'
                        : 'border-white/10 bg-farol-dashboard-card hover:border-cyan-400/50'
                    }`}
                  >
                    <span
                      className={`absolute -left-[3.1rem] top-6 flex h-10 w-10 items-center justify-center rounded-full border-4 border-farol-dashboard text-sm font-bold md:-left-[4.1rem] md:h-12 md:w-12 ${
                        etapa.concluida
                          ? 'bg-emerald-400 text-farol-dashboard'
                          : 'bg-cyan-400 text-farol-dashboard'
                      }`}
=======
            <div className="min-w-40 rounded-xl border border-white/10 bg-[#12203e] px-4 py-3">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-300">Seu progresso</span>
                <strong className="text-cyan-300">{progresso}%</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {concluidas} de {etapas.length} etapas concluídas
              </p>
            </div>
          </div>

          <section className="relative overflow-hidden rounded-2xl border border-blue-400/20 bg-[#142fc4] shadow-2xl">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-950/40" />

            <div className="relative grid min-h-[520px] grid-cols-1 md:grid-cols-[100px_minmax(0,1fr)]">
              <div className="flex items-center justify-center border-b border-white/10 bg-[#07142a]/80 p-4 md:border-b-0 md:border-r">
                <div className="text-center">
                  <div className="text-6xl drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] md:text-7xl">
                    🗼
                  </div>
                  <p className="mt-2 text-xs font-bold text-white">Farol</p>
                  <p className="mt-1 text-[10px] text-blue-200">
                    Seu ponto de partida
                  </p>
                </div>
              </div>

              <div className="relative min-w-0 p-4 md:p-6">
                {etapas.length === 0 ? (
                  <div className="grid min-h-[400px] place-items-center text-center">
                    <div className="max-w-sm rounded-2xl border border-white/20 bg-[#102b78]/80 p-6">
                      <div className="text-5xl">🏝️</div>
                      <h2 className="mt-4 text-xl font-bold">
                        Sua jornada começa aqui
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-blue-100">
                        Volte ao painel e adicione as primeiras etapas deste
                        objetivo para preencher seu mapa.
                      </p>
                      <button
                        type="button"
                        onClick={onVoltar}
                        className="mt-4 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-yellow-200"
                      >
                        Adicionar etapas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative min-h-[440px]">
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 800 440"
                      preserveAspectRatio="none"
                      aria-hidden="true"
>>>>>>> 6f50cc8b7da94677539000e3a19ac311b172477f:src/pages/MapaIlha.jsx
                    >
                      {etapas.map((etapa, index) => {
                        if (index === etapas.length - 1) {
                          return null;
                        }

<<<<<<< HEAD:src/pages/MapaObjetivo.jsx
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                      Etapa {index + 1}
                    </p>
                    <h3 className="text-lg font-semibold">{etapa.texto}</h3>

                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-cyan-400"
                        checked={etapa.concluida}
                        onChange={() => onAlternarEtapa(objetivo.id, etapa.id)}
                      />
                      <span className={etapa.concluida ? 'text-emerald-300' : 'text-slate-400'}>
                        {etapa.concluida ? 'Etapa concluída' : 'Marcar etapa como concluída'}
                      </span>
                    </label>
                  </article>
                ))}
=======
                        const inicio = posicoes[index % posicoes.length];
                        const fim = posicoes[(index + 1) % posicoes.length];

                        const x1 = parseFloat(inicio.left) * 8;
                        const y1 = parseFloat(inicio.top) * 4.4;
                        const x2 = parseFloat(fim.left) * 8;
                        const y2 = parseFloat(fim.top) * 4.4;
                        const meioX = (x1 + x2) / 2;
                        const meioY = (y1 + y2) / 2;

                        return (
                          <path
                            key={`caminho-${etapa.id}`}
                            d={`M ${x1} ${y1} Q ${meioX} ${meioY - 35} ${x2} ${y2}`}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="3"
                            strokeDasharray="7 7"
                            strokeLinecap="round"
                            opacity="0.9"
                          />
                        );
                      })}
                    </svg>

                    {etapas.map((etapa, index) => {
                      const posicao = posicoes[index % posicoes.length];
                      const atual = index === indiceAtual;

                      return (
                        <article
                          key={etapa.id}
                          style={{
                            left: posicao.left,
                            top: posicao.top,
                          }}
                          className={`absolute z-10 w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border-2 p-3 text-slate-950 shadow-xl transition duration-300 hover:scale-105 sm:w-[205px] ${
                            etapa.concluida
                              ? "border-green-200 bg-green-300"
                              : atual
                                ? "border-yellow-200 bg-[#8df276] ring-4 ring-yellow-300/30"
                                : "border-green-300 bg-[#83ed70]"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="rounded-full bg-green-950/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider">
                              {etapa.concluida
                                ? "Concluída"
                                : atual
                                  ? "Próxima etapa"
                                  : `Ilha ${index + 1}`}
                            </span>
                            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green-950/10 text-sm font-black">
                              {etapa.concluida ? "✓" : index + 1}
                            </span>
                          </div>

                          <h3 className="break-words text-sm font-extrabold leading-snug">
                            {etapa.texto}
                          </h3>

                          <p className="mt-2 text-[10px] leading-4 text-green-950/70">
                            {etapa.concluida
                              ? "Você conquistou esta ilha!"
                              : atual
                                ? "Continue sua jornada"
                                : "Etapa da sua jornada"}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
>>>>>>> 6f50cc8b7da94677539000e3a19ac311b172477f:src/pages/MapaIlha.jsx
              </div>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Minhas jornadas
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Objetivo atual
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {etapas.length} ilhas
              </span>
            </div>

            <div className="flex flex-wrap items-stretch gap-3">
              <div className="min-w-[180px] max-w-[260px] rounded-xl border border-yellow-200/50 bg-yellow-300 px-4 py-3 text-slate-950 shadow-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  Jornada atual
                </p>
                <p className="mt-1 font-extrabold">{ilha.nome}</p>
                <p className="mt-2 text-xs font-medium">
                  {progresso}% concluído
                </p>
              </div>

              <button
                type="button"
                onClick={onVoltar}
                className="grid min-h-24 w-20 place-items-center rounded-xl border border-blue-400/30 bg-[#142342] text-3xl text-blue-300 transition hover:border-cyan-300 hover:bg-[#1a3158]"
                title="Voltar ao painel para gerenciar objetivos"
                aria-label="Voltar ao painel para gerenciar objetivos"
              >
                +
              </button>
            </div>
          </section>

          <p className="mt-4 text-center text-xs text-slate-500">
            {etapas.length > 0 && concluidas === etapas.length
              ? "Parabéns! Você explorou todas as ilhas desta jornada."
              : "Um passo de cada vez. Continue iluminando seu caminho."}
          </p>
        </div>
      </main>
    </div>
  );
}

export default MapaObjetivo;

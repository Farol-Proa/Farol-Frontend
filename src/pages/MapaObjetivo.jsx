
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
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
            Farol
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Sua jornada, no seu ritmo
          </p>
        </div>

        <button
          type="button"
          onClick={onVoltar}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:bg-white/5"
        >
          ← Voltar ao painel
        </button>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            Meu roadmap
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {objetivo.nome}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Todo grande objetivo começa com um pequeno passo. Continue avançando e ilumine seu
            caminho.
          </p>
        </section>

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
              </p>
            </div>
          ) : (
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute bottom-8 left-6 top-8 w-1 rounded-full bg-slate-700 md:left-8" />

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
                    >
                      {etapa.concluida ? '✓' : index + 1}
                    </span>

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
                        {etapa.concluida
                          ? 'Etapa concluída'
                          : 'Marcar etapa como concluída'}
                      </span>
                    </label>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default MapaObjetivo;

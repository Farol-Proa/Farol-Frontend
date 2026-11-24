
export default function ConviteMentores() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="relative overflow-hidden rounded-2xl border border-[#26395C] bg-gradient-to-r from-[#101E3B] via-[#12264A] to-[#0B1426] p-7 md:p-10">

        {/* Elemento decorativo */}
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-blue-400/10" />
        <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border border-blue-400/10" />

        <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">

          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Para quem quer compartilhar conhecimento
            </span>

            <h2 className="mt-3 text-2xl font-bold leading-tight text-white md:text-3xl">
              Sua experiência pode iluminar{" "}
              <span className="text-yellow-400">
                novos caminhos.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              Compartilhe seus conhecimentos, ajude pessoas a superar
              desafios e faça parte de uma comunidade que acredita
              no poder da orientação.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/cadastro-mentor"
                className="rounded-xl bg-[#315CF5] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Quero ser mentor
                <span className="ml-2">→</span>
              </a>

              <a
                href="/login-mentor"
                className="rounded-xl border border-slate-500/60 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
              >
                Já sou mentor? Entrar
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Mentoria voluntária · Compartilhe conhecimento ·
              Transforme jornadas.
            </p>
          </div>

          {/* Ilustração */}
          <div className="hidden shrink-0 items-center justify-center md:flex">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border border-blue-400/20 bg-[#315CF5]/10 text-7xl">
              🧭
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

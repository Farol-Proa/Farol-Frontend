
import React from "react";

function Lighthouse({ className = "" }) {
  return (
    <svg
      viewBox="0 0 220 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M75 215L94 55H128L148 215H75Z" fill="#E8EAF0" />
      <path d="M94 55H128L135 105H88L94 55Z" fill="#CBD3E0" />
      <path d="M88 105H135L148 215H75L88 105Z" fill="#F4F5F8" />
      <path d="M91 125H139L142 145H87L91 125Z" fill="#193B91" />
      <path d="M83 180H144L148 215H75L83 180Z" fill="#193B91" />
      <path d="M83 215H148L164 230H65L83 215Z" fill="#10265E" />
      <path d="M87 55L111 27L136 55H87Z" fill="#F5F6FA" />
      <path d="M111 27L136 55H111V27Z" fill="#AAB7CC" />
      <path d="M81 55H142V65H81V55Z" fill="#F6B91A" />
      <path d="M91 65H132V91H91V65Z" fill="#172B68" />
      <path d="M99 72H107V88H99V72Z" fill="#FFE35A" />
      <path d="M116 72H124V88H116V72Z" fill="#FFE35A" />
      <path d="M103 27H119V19H103V27Z" fill="#F6B91A" />
      <path d="M111 4L118 19H104L111 4Z" fill="#F6B91A" />
      <path d="M133 61L220 28V91L136 77L133 61Z" fill="#FFD84A" opacity=".18" />
      <path d="M82 230C58 224 35 231 20 240H184C168 225 145 222 128 230H82Z" fill="#315CF5" />
    </svg>
  );
}

function CompassIllustration() {
  return (
    <svg viewBox="0 0 320 170" className="h-full w-full" fill="none">
      <path
        d="M30 130C75 65 110 40 160 45C220 50 260 85 292 25"
        stroke="#4B83FF"
        strokeWidth="2"
        strokeDasharray="7 8"
      />
      <circle cx="160" cy="83" r="53" stroke="#3975F5" strokeWidth="8" />
      <circle cx="160" cy="83" r="39" stroke="#80A9FF" strokeWidth="2" />
      <path d="M160 25L174 83L160 72L146 83L160 25Z" fill="#FFB52E" />
      <path d="M160 141L146 83L160 94L174 83L160 141Z" fill="#F5F7FF" />
      <path d="M102 83H218M160 25V141" stroke="#80A9FF" strokeWidth="1.5" opacity=".5" />
      <circle cx="160" cy="83" r="7" fill="#FFCF39" />
      <path d="M54 35L60 48L73 54L60 60L54 73L48 60L35 54L48 48L54 35Z" fill="#FFCF39" />
      <path d="M265 105L270 116L281 121L270 126L265 137L260 126L249 121L260 116L265 105Z" fill="#FFCF39" />
    </svg>
  );
}

function IslandIllustration() {
  return (
    <svg viewBox="0 0 320 170" className="h-full w-full" fill="none">
      <path d="M34 119C62 91 95 91 122 104C157 78 202 86 224 103C260 88 284 105 292 121H34Z" fill="#087BD9" />
      <path d="M45 116C76 91 109 88 144 104C174 81 221 89 248 109C267 104 283 109 292 121C261 139 83 143 45 116Z" fill="#28B8E8" />
      <path d="M78 103C104 74 136 67 170 78C201 65 234 78 256 105C220 120 110 126 78 103Z" fill="#F5C15D" />
      <path d="M105 86C119 62 145 50 177 57C205 56 224 70 239 91C201 108 136 108 105 86Z" fill="#39B84A" />
      <path d="M157 61L169 16H183L195 61H157Z" fill="#F3F4F6" />
      <path d="M169 16H183L186 36H165L169 16Z" fill="#C7D1E0" />
      <path d="M165 36H186L195 61H157L165 36Z" fill="#E9EDF4" />
      <path d="M163 35H188V41H163V35Z" fill="#FFCA35" />
      <path d="M161 16L176 2L191 16H161Z" fill="#F6F7FA" />
      <path d="M159 16H193V21H159V16Z" fill="#FFCA35" />
      <path d="M144 62C135 43 128 35 119 30" stroke="#6A442B" strokeWidth="3" />
      <path d="M119 30C101 20 96 28 103 39C111 45 124 41 119 30Z" fill="#24A64B" />
      <path d="M119 30C120 12 135 11 136 24C135 35 126 39 119 30Z" fill="#39C45D" />
      <path d="M207 66C214 48 223 40 234 36" stroke="#6A442B" strokeWidth="3" />
      <path d="M234 36C251 24 258 33 250 44C243 51 231 47 234 36Z" fill="#24A64B" />
      <path d="M234 36C235 18 220 17 218 30C219 41 227 45 234 36Z" fill="#39C45D" />
    </svg>
  );
}

const plans = [
  {
    id: "freemium",
    name: "Freemium",
    description: "Comece sua jornada no Farol.",
    price: "Grátis",
    period: "",
    features: [
      "Até 4 objetivos ativos",
      "Anotações",
      "Calendário",
      "Acompanhamento de progresso",
      "Organização em Ilhas",
    ],
    button: "Começar gratuitamente",
    illustration: "compass",
  },
  {
    id: "premium-mensal",
    name: "Premium Mensal",
    description: "Tenha mais recursos na sua jornada.",
    price: "R$ 14,90",
    period: "/mês",
    features: [
      "Até 8 objetivos ativos",
      "Temas personalizados",
      "Backup automático",
      "Mentoria com profissionais voluntários",
    ],
    button: "Assinar Premium",
    illustration: "island",
  },
  {
    id: "premium-anual",
    name: "Premium Anual",
    description: "Continue evoluindo com economia.",
    price: "R$ 99,00",
    period: "/ano",
    equivalent: "Equivalente a R$ 8,25 por mês",
    features: [
      "Todos os benefícios do Premium",
      "Pagamento anual",
      "Mais economia ao longo do ano",
    ],
    button: "Escolher plano anual",
    illustration: "lighthouse",
    featured: true,
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
      <path
        d="M5 12.5L9.5 17L19 7"
        stroke="#FFAD28"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Planos({ onSelectPlan }) {
  const handleSelect = (planId) => {
    onSelectPlan?.(planId);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050D20] text-white">
      {/* Cabeçalho */}
      <header className="relative z-10 border-b border-blue-900/70 bg-[#07132F]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <Lighthouse className="h-12 w-10" />
            <span className="text-3xl font-extrabold tracking-tight">Farol</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-blue-100 md:flex">
            <a href="/" className="border-b-4 border-[#FFAD28] px-2 py-4 text-blue-400">
              Início
            </a>
            <a href="#recursos" className="transition hover:text-yellow-300">
              Recursos
            </a>
            <a href="#planos" className="transition hover:text-yellow-300">
              Planos
            </a>
          </nav>

          <a
            href="/login"
            className="rounded-full border-2 border-blue-500 px-5 py-2.5 text-sm font-bold transition hover:bg-blue-600"
          >
            Entrar
          </a>
        </div>
      </header>

      {/* Banner principal */}
      <section className="relative overflow-hidden border-b border-blue-900/50 bg-gradient-to-br from-[#103A9D] via-[#09266C] to-[#061536]">
        <div className="absolute -left-20 top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-12 text-center md:flex-row md:px-12 md:py-16 md:text-left">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-blue-300">
              Sua jornada começa aqui
            </p>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Escolha o plano ideal
              <br />
              para <span className="text-[#FFDB36]">sua jornada!</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-blue-100 md:mx-0 md:text-lg">
              Continue evoluindo, organize seus objetivos e alcance seus sonhos
              com o Farol.
            </p>
            <div className="mx-auto mt-5 h-1.5 w-40 rotate-[-2deg] rounded-full bg-[#FFAD28] md:mx-0" />
          </div>

          <div className="relative flex h-52 w-56 items-center justify-center md:h-64 md:w-64">
            <div className="absolute h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />
            <Lighthouse className="relative h-full w-full drop-shadow-[0_0_25px_rgba(255,205,70,0.25)]" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-5 w-full bg-gradient-to-t from-[#050D20] to-transparent" />
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-blue-400">
            Encontre seu caminho
          </p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Nossos <span className="text-[#FFDB36]">planos</span>
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Escolha como deseja continuar sua evolução.
          </p>
        </div>

        <div className="grid items-stretch gap-7 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col overflow-visible rounded-3xl border bg-gradient-to-b from-[#102B62] to-[#0A1B3D] shadow-xl transition duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? "border-2 border-[#FF9D28] shadow-[0_0_30px_rgba(255,157,40,0.13)]"
                  : "border-blue-800 hover:border-blue-500"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 right-5 z-10 rounded-full bg-gradient-to-r from-yellow-300 to-orange-500 px-5 py-2 text-xs font-extrabold text-[#15264A] shadow-lg sm:text-sm">
                  ★ Melhor economia
                </div>
              )}

              {/* Ilustração */}
              <div className="flex h-44 items-center justify-center overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#1551CF] to-[#0D2B79] px-8">
                {plan.illustration === "compass" && <CompassIllustration />}
                {plan.illustration === "island" && <IslandIllustration />}
                {plan.illustration === "lighthouse" && (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="absolute h-28 w-28 rounded-full bg-yellow-300/80 blur-[1px]" />
                    <IslandIllustration />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="text-2xl font-extrabold">{plan.name}</h3>
                <p className="mt-1 min-h-6 text-sm text-blue-200 sm:text-base">
                  {plan.description}
                </p>

                <div className="mt-5 flex flex-wrap items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight sm:text-[2.6rem]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base font-medium text-blue-200">
                      {plan.period}
                    </span>
                  )}
                </div>

                {plan.equivalent && (
                  <p className="mt-1 text-sm text-blue-200">{plan.equivalent}</p>
                )}

                <div className="my-5 h-px bg-blue-700/80" />

                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-blue-100 sm:text-base">
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelect(plan.id)}
                  className="mt-8 w-full rounded-full border-2 border-yellow-300 bg-gradient-to-r from-[#FFB52E] to-[#FF8A22] px-5 py-3.5 text-sm font-extrabold text-[#10234A] shadow-lg transition hover:scale-[1.02] hover:brightness-110 active:scale-[.98] sm:text-base"
                >
                  {plan.button}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Aviso inferior */}
        <div className="relative mt-9 flex items-center gap-4 overflow-hidden rounded-3xl border border-blue-800 bg-gradient-to-r from-[#102A61] to-[#0B1C42] px-5 py-5 sm:px-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-extrabold">
            i
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-white">
              Sua jornada continua no seu ritmo.
            </h3>
            <p className="mt-1 text-sm text-blue-200">
              Escolha o plano que combina com seus objetivos e continue
              construindo seu caminho com o Farol.
            </p>
          </div>
          <div className="absolute -bottom-12 -right-8 h-24 w-48 rotate-[-12deg] rounded-[50%] bg-blue-600/50" />
        </div>
      </section>

      <footer className="border-t border-blue-900/60 px-5 py-7 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Farol — Que ilumina o seu caminho!
      </footer>
    </main>
  );
}

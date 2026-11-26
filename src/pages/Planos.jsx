import React, { useState } from 'react';

const plans = [
  {
    id: 'freemium',
    name: 'Freemium',
    tagline: 'Instrumentos essenciais de navegação pessoal',
    price: 'Grátis',
    period: '',
    description: 'Ideal para quem está começando a estruturar suas primeiras metas com clareza.',
    features: [
      'Até 4 objetivos ativos simultâneos',
      'Mapas e Ilhas visuais no canvas',
      'Anotações e documentos com BlockNote',
      'Calendário de tarefas e prazos civis',
      'Acompanhamento de progresso em tempo real',
    ],
  },
  {
    id: 'premium-mensal',
    name: 'Premium Mensal',
    tagline: 'Mais flexibilidade e recursos avançados',
    price: 'R$ 14,90',
    period: '/mês',
    description: 'Para quem busca acelerar metas com auxílio de IA e mentoria com profissionais voluntários.',
    features: [
      'Até 8 objetivos ativos simultâneos',
      'Geração de trilhas com Inteligência Artificial',
      'Mentoria com profissionais voluntários',
      'Backup automático e histórico de versões',
      'Temas e personalizações exclusivas de interface',
    ],
  },
  {
    id: 'premium-anual',
    name: 'Premium Anual',
    tagline: 'Evolução contínua com a melhor economia',
    price: 'R$ 99,00',
    period: '/ano',
    equivalent: 'Equivalente a R$ 8,25 por mês (45% de economia)',
    description: 'Todos os benefícios do Premium com desconto anual garantido para sua jornada completa.',
    features: [
      'Todos os benefícios do plano Premium Mensal',
      'Economia de R$ 79,80 ao longo de 12 meses',
      'Suporte e novidades com prioridade',
      'Acesso antecipado a novos módulos da plataforma',
    ],
    featured: true,
  },
];

const comparativo = [
  { recurso: 'Objetivos ativos simultâneos', freemium: 'Até 4', mensal: 'Até 8', anual: 'Até 8' },
  { recurso: 'Criação de Ilhas e conexões visuais', freemium: '✓ Ilimitado', mensal: '✓ Ilimitado', anual: '✓ Ilimitado' },
  { recurso: 'Anotações estruturadas (BlockNote)', freemium: '✓ Incluído', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Calendário e prazos de tarefas', freemium: '✓ Incluído', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Geração de objetivos por IA', freemium: '—', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Mentoria com profissionais voluntários', freemium: '—', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Backup automático e histórico', freemium: '—', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Temas e personalização visual', freemium: '—', mensal: '✓ Incluído', anual: '✓ Incluído' },
  { recurso: 'Condição comercial', freemium: 'Gratuito', mensal: 'R$ 14,90/mês', anual: 'R$ 99,00/ano (-45%)' },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Planos({ usuario }) {
  const [modalHomologacao, setModalHomologacao] = useState(false);
  const [planoSelecionadoModal, setPlanoSelecionadoModal] = useState('');

  const usuarioReal = usuario || JSON.parse(sessionStorage.getItem('usuario') || '{}');

  const planoAtivoId = (() => {
    const raw = (usuarioReal.plano || usuarioReal.tipoPlano || usuarioReal.planoAssinatura || usuarioReal.role || '').toString().toLowerCase();
    if (raw.includes('anual')) return 'premium-anual';
    if (raw.includes('premium') || raw.includes('mensal')) return 'premium-mensal';
    if (usuarioReal.isPremium || usuarioReal.premium) return 'premium-mensal';
    return 'freemium';
  })();

  const handleUpgrade = (plano) => {
    setPlanoSelecionadoModal(plano.name);
    setModalHomologacao(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Cabeçalho da página interna */}
      <div className="rounded-2xl border border-[#1E2E4A] bg-[#0A1428] p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Assinatura e Recursos
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-white">
              Planos do Farol
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Confira seu plano atual, recursos disponíveis e opções para expandir sua jornada.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-900/50 bg-[#0E1E3A] px-4 py-3">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Seu plano atual
              </p>
              <p className="text-sm font-extrabold text-white">
                {planoAtivoId === 'freemium'
                  ? 'Freemium (Gratuito)'
                  : planoAtivoId === 'premium-anual'
                    ? 'Premium Anual'
                    : 'Premium Mensal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid com os 3 cards dos planos */}
      <section aria-label="Opções de planos" className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {plans.map((plan) => {
          const ehPlanoAtual = plan.id === planoAtivoId;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 ${
                ehPlanoAtual
                  ? 'border-2 border-yellow-400/80 bg-gradient-to-b from-[#12244A] to-[#0A1630] shadow-[0_0_25px_rgba(255,223,54,0.12)]'
                  : plan.featured
                    ? 'border-blue-500/50 bg-gradient-to-b from-[#0F2248] to-[#081328] hover:border-blue-400'
                    : 'border-[#1C2C4A] bg-[#091326] hover:border-slate-600'
              }`}
            >
              {/* Badges superiores */}
              <div className="mb-4 flex items-center justify-between min-h-[28px]">
                {ehPlanoAtual ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-3 py-1 text-xs font-extrabold text-yellow-300">
                    ✓ Seu plano atual
                  </span>
                ) : plan.featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-extrabold text-amber-300">
                    ★ Melhor economia
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    Modalidade base
                  </span>
                )}
              </div>

              {/* Informações de preço e cabeçalho */}
              <div>
                <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs font-medium text-slate-400">{plan.tagline}</p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-semibold text-slate-400">
                      {plan.period}
                    </span>
                  )}
                </div>

                {plan.equivalent && (
                  <p className="mt-1 text-xs font-semibold text-amber-300">
                    {plan.equivalent}
                  </p>
                )}

                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {plan.description}
                </p>

                <div className="my-5 h-px bg-white/10" />

                {/* Lista de benefícios */}
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckIcon />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ação do card */}
              <div className="mt-6 pt-4 border-t border-white/5">
                {ehPlanoAtual ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 text-xs font-bold text-slate-400 cursor-default"
                  >
                    ✓ Plano em uso
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade(plan)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#FFB52E] to-[#FF8A22] py-2.5 text-xs font-extrabold text-[#10234A] shadow-md transition hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
                  >
                    {plan.id === 'freemium' ? 'Plano gratuito' : 'Fazer upgrade →'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Tabela comparativa de benefícios */}
      <section aria-labelledby="titulo-comparativo" className="rounded-2xl border border-[#1E2E4A] bg-[#0A1428] p-6 shadow-lg">
        <h3 id="titulo-comparativo" className="text-lg font-bold text-white mb-4">
          Comparativo detalhado de recursos
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2E4A] text-slate-400">
                <th className="pb-3 font-semibold">Recurso / Funcionalidade</th>
                <th className="pb-3 font-semibold text-center w-32">Freemium</th>
                <th className="pb-3 font-semibold text-center w-36">Premium Mensal</th>
                <th className="pb-3 font-semibold text-center w-36 text-amber-400">Premium Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparativo.map((linha) => (
                <tr key={linha.recurso} className="hover:bg-white/[0.02]">
                  <td className="py-3 text-slate-200 font-medium">{linha.recurso}</td>
                  <td className="py-3 text-center text-slate-300">{linha.freemium}</td>
                  <td className="py-3 text-center text-slate-300">{linha.mensal}</td>
                  <td className="py-3 text-center font-semibold text-amber-300">{linha.anual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nota de transparência sobre preservação de dados */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-900/40 bg-[#081224] p-4 text-xs text-slate-300 leading-relaxed">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold">
          ℹ
        </span>
        <p>
          <strong className="text-white">Preservação integral de dados:</strong> O Farol garante que nenhuma alteração ou eventual transição de plano exclui objetivos, Ilhas, anotações ou tarefas criadas. Todas as suas informações permanecem seguras e preservadas.
        </p>
      </div>

      {/* MODAL DE HOMOLOGAÇÃO DE PAGAMENTO */}
      {modalHomologacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-blue-500/30 bg-[#0A1633] p-7 shadow-2xl text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl text-amber-300 border border-amber-400/20">
                  ✦
                </div>
                <div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-500/20">
                    {planoSelecionadoModal}
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Assinatura em homologação
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalHomologacao(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Estamos finalizando a integração segura com nosso gateway de pagamentos online (PIX e cartão de crédito) para ativação imediata.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-white">Você já está utilizando os recursos do Farol:</p>
              <p>• Suas metas, etapas e Ilhas continuam plenamente ativas.</p>
              <p>• Assim que a contratação online for liberada, você receberá uma notificação prioritária no seu e-mail cadastrado com condições exclusivas para membros pioneiros!</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalHomologacao(false)}
                className="rounded-xl bg-[#FFDF36] px-6 py-2.5 text-xs font-extrabold text-[#101827] transition hover:bg-yellow-300"
              >
                Entendido, fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

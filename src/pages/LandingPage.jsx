import { useState, useEffect } from 'react';
import Header from '../components/Header';
import heroFarol from '/images/hero_farol.png';
import heroHome from '/images/foto-da-home.png';
import heroObjetivo from '/images/hero_objetivo.png';
import Check from '/images/check.svg';
import ConviteMentores from '../components/ConviteMentores';

import './LandingPage.css';

function LandingPage({ onEntrar }) {
  const [modalHomologacao, setModalHomologacao] = useState(false);
  const [planoSelecionadoModal, setPlanoSelecionadoModal] = useState('');
  const [mostrarComparativo, setMostrarComparativo] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#planos') {
      const el = document.getElementById('planos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const abrirModalPlano = (nomePlano) => {
    setPlanoSelecionadoModal(nomePlano);
    setModalHomologacao(true);
  };
  return (
    <div className="landing-page min-h-screen bg-farol-background text-farol-text">
      <Header onEntrar={onEntrar} />

      <main
        id="farol"
        className="hero relative isolate flex min-h-svh w-full items-center px-[6.2%] pt-32.5 pb-17.5"
        style={{ '--hero-imagem': `url("${heroFarol}")` }}
      >
        <section className="relative z-1 w-full max-w-152.5 min-w-0">
          <span className="text-[11px] font-bold tracking-[1.4px] text-farol-accent">
            <span className="mr-2 text-[15px]">•</span>
            SUA VIDA, COM MAIS DIREÇÃO
          </span>

          <h1 className="hero-title my-6">
            Menos à deriva.
            <br />
            Mais perto do
            <br />
            <span className="text-farol-accent">seu horizonte.</span>
          </h1>

          <p className="hero-description mb-6.5 max-w-120 text-base leading-[1.8] text-farol-muted">
            Anote ideias, organize o dia e trace rotas para seus objetivos. O Farol ilumina o
            caminho. Você conduz a jornada.
          </p>

          <div className="hero-actions flex flex-wrap gap-3.5">
            <button className="button-primary" type="button" onClick={onEntrar}>
              Começar minha jornada <span>→</span>
            </button>
            <a className="button-secondary" href="#como-funciona">
              Conhecer o Farol <span>→</span>
            </a>
          </div>

          <p className="mt-6.5 text-xs leading-[1.6] text-farol-muted max-[760px]:text-[11px]">
            Um espaço para suas notas, seus planos e seu próximo passo.
          </p>
        </section>
      </main>

      <ConviteMentores />

      <section
        id="recursos"
        className="resources-section relative bg-farol-background px-[6.2%] pt-18 pb-16 text-farol-text"
      >
        <div className="mb-8 grid grid-cols-[1.2fr_1fr] items-center gap-10">
          <h2 className="m-0 text-[clamp(22px,2.2vw,32px)] leading-[1.2]">
            Não é sobre fazer mais.
            <br />É sobre saber para onde ir.
          </h2>
          <p className="m-0 text-sm leading-[1.8] text-farol-muted">
            Entre uma ideia, uma tarefa e um sonho, existe um caminho. O Farol ajuda você a dar
            sentido a cada passo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4.5">
          <article className="feature-card min-w-0">
            <span className="mb-3.5 block text-[25px] text-farol-primary-hover">✎</span>
            <h3 className="mb-3 text-base font-semibold">Ideias em um porto seguro</h3>
            <p className="m-0 text-sm leading-[1.8] text-farol-muted">
              Guarde pensamentos, lembretes e descobertas antes que se percam no dia.
            </p>
          </article>

          <article className="feature-card min-w-0">
            <span className="mb-3.5 block text-[25px] text-farol-primary-hover">☷</span>
            <h3 className="mb-3 text-base font-semibold">Objetivos com um caminho</h3>
            <p className="m-0 text-sm leading-[1.8] text-farol-muted">
              Transforme planos distantes em etapas que você consegue enxergar e percorrer.
            </p>
          </article>

          <article className="feature-card min-w-0">
            <span className="mb-3.5 block text-[25px] text-farol-primary-hover">▦</span>
            <h3 className="mb-3 text-base font-semibold">Um dia com mais clareza</h3>
            <p className="m-0 text-sm leading-[1.8] text-farol-muted">
              Reúna tarefas, compromissos e prioridades sem perder a visão do todo.
            </p>
          </article>
        </div>

        {/* landing-home porque é a parte que mostra a print da home :P*/}
        {/* ================================================== */}
      </section>
      <section className="landing-home min-h-screen pt-10 flex-none order-2 self-stretch grow-0">
        <div className="landing-home-grid" aria-hidden="true" />
        <div className="landing-home_apresentacao flex flex-col items-center p-0 gap[18px]">
          <span className="text-[20px] font-bold tracking-[1.4px] text-farol-accent">
            <span className="mr-2 text-[24px]">•</span>
            Conheca seu farol
          </span>
          <h2 className="my-6 text-center text-[clamp(30px,3.5vw,46px)] leading-[1.15] tracking-[-1px]">
            Tudo o que importa.
            <br />
            Um lugar para se encontrar
          </h2>
          <p className="hero-description mb-6.5 w-full max-w-[680px] text-center text-[18px] leading-[1.5] text-[#A5B2CD]">
            Notas, calendário, tarefas e objetivos se encontram em uma visão clara da sua vida. Do
            que precisa de atenção hoje ao que você quer conquistar amanhã.
          </p>
        </div>
        <div className="landing-home-showcase relative z-10 mx-auto w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/15 bg-farol-background">
          <div className="flex h-11 items-center justify-between border-b border-white/10 bg-farol-sidebar px-4 text-[11px] text-farol-muted">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-[#5474c8]" />
              <span className="size-2 rounded-full bg-[#5474c8]/70" />
              <span className="size-2 rounded-full bg-[#5474c8]/45" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2">farol.app / painel</span>
            <span className="text-[9px] font-semibold tracking-[0.12em] text-farol-text-subtle max-[480px]:hidden">
              VISÃO GERAL
            </span>
          </div>
          <img
            className="block h-auto w-full object-contain"
            src={heroHome}
            alt="Prévia da tela inicial do Farol"
          />
        </div>
      </section>
      {/* Rotas e objetivos =P */}
      {/* =================================================================================== */}

      <section className="landing-vida" id="vida">
        <div className="landing-vida__container">
          <div className="landing-vida__cabecalho">
            <div>
              <span className="landing-vida__etiqueta">NA VIDA, NO SEU RITMO</span>

              <h2>
                O Farol acompanha a vida.
                <br />
                Não só a lista de tarefas.
              </h2>
            </div>

            <p>Estudos, trabalho, cuidar de si. Cada parte do seu dia merece direção.</p>
          </div>

          <div className="landing-vida__cards">
            <article className="landing-vida__card">
              <h3>✧ Nos estudos</h3>
              <p>Uma rota para aprender, sem perder seus descobrimentos.</p>
              <ul>
                <li>Resumo de TCC</li>
                <li>Plano de revisão</li>
                <li>Anotações de aula</li>
              </ul>
            </article>

            <article className="landing-vida__card">
              <h3>▣ No trabalho</h3>
              <p>Clareza para os projetos e os detalhes de cada dia.</p>
              <ul>
                <li>Ideias para projetos</li>
                <li>Próximas entregas</li>
                <li>Notas de reunião</li>
              </ul>
            </article>

            <article className="landing-vida__card">
              <h3>♡ Na vida pessoal</h3>
              <p>Espaço para o que você quer viver, além das tarefas.</p>
              <ul>
                <li>Planejar uma viagem</li>
                <li>Começar um novo hábito</li>
                <li>Lembrar de quem importa</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-rotas-objetivos bg-color-farol-background flex flex-row items-center gap-16 py-24 px-22">
        <img className="block h-auto w-176 object-contain" src={heroObjetivo}></img>

        <div className="landing-home_rotas-objetivos flex w-124 flex-col items-start gap-6 p-0">
          {/* Section label */}
          <span className="flex items-center gap-2.5 text-xs font-semibold uppercase leading-[15px] text-farol-accent">
            <span className="size-1.5 rounded-[2px] bg-farol-accent" />
            02 / Rotas e objetivos
          </span>

          {/* Heading */}
          <h2 className="text-[clamp(30px,3.5vw,44px)] font-bold leading-[1.12] tracking-[-1px] text-farol-text">
            Seu objetivo é o<br /> destino. As ilhas são os passos.
          </h2>

          {/* Description */}
          <p className="w-full max-w-[680px] text-lg font-normal leading-[1.5] text-farol-muted">
            Um plano grande fica mais possível quando você consegue ver o caminho. Divida a jornada
            em etapas e reconheça o que já conquistou.
          </p>

          {/* Benefits */}
          <ul className="landing-routes__benefits flex flex-col gap-5">
            <li className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1D2B48]">
                <img src={Check} alt="" aria-hidden="true" className="size-[15px]" />
              </span>

              <div className="flex flex-col gap-[3px]">
                <strong className="text-[17px] font-semibold leading-[1.5] text-farol-text">
                  Trace sua rota
                </strong>

                <p className="text-[15px] font-normal leading-[1.5] text-farol-muted">
                  Dê forma ao objetivo, uma etapa de cada vez.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1D2B48]">
                <img src={Check} alt="" aria-hidden="true" className="size-[15px]" />
              </span>

              <div className="flex flex-col gap-[3px]">
                <strong className="text-[17px] font-semibold leading-[1.5] text-farol-text">
                  Acompanhe seu progresso
                </strong>

                <p className="text-[15px] font-normal leading-[1.5] text-farol-muted">
                  Visualize cada conquista e perceba o quanto já avançou.
                </p>
              </div>
            </li>
          </ul>

          {/* Mensagem */}
          <p className="text-base font-normal leading-5 text-farol-accent">
            Uma ilha de cada vez. No seu ritmo.
          </p>
        </div>
      </section>

      <section className="landing-planos" id="planos">
        <div className="landing-planos__container">
          <h2>Nossos Planos</h2>

          <div className="landing-planos__cards">
            <article className="landing-planos__card flex flex-col justify-between">
              <div>
                <h3>Grátis</h3>
                <div className="landing-planos__preco">R$0,00</div>

                <p>Comece sua jornada no Farol sem nenhum custo.</p>

                <ul>
                  <li>Até 4 objetivos ativos</li>
                  <li>Anotações e documentos com BlockNote</li>
                  <li>Calendário de tarefas e prazos</li>
                  <li>Organização visual em Ilhas</li>
                </ul>
              </div>

              <button
                type="button"
                className="button-primary mt-6 w-full text-center cursor-pointer justify-center"
                onClick={onEntrar}
              >
                Começar gratuitamente <span aria-hidden="true">→</span>
              </button>
            </article>

            <article className="landing-planos__card flex flex-col justify-between">
              <div>
                <h3>Mensal</h3>

                <div className="landing-planos__preco">
                  R$14,90 <small>a.m</small>
                </div>

                <p>Mais recursos e flexibilidade para seus planos avançados.</p>

                <ul>
                  <li>Até 8 objetivos ativos simultâneos</li>
                  <li>Geração de trilhas com Inteligência Artificial</li>
                  <li>Acesso a mentorias com profissionais</li>
                  <li>Temas e personalizações exclusivas</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => abrirModalPlano('Premium Mensal')}
                className="button-secondary mt-6 w-full text-center justify-center flex items-center cursor-pointer"
              >
                Escolher plano Mensal <span aria-hidden="true">→</span>
              </button>
            </article>

            <article className="landing-planos__card flex flex-col justify-between">
              <div>
                <div className="landing-planos__titulo-anual">
                  <h3>Anual</h3>
                  <span>R$99,00 a.a</span>
                </div>

                <div className="landing-planos__preco">
                  R$8,25 <small>a.m</small>
                </div>

                <p>Continue evoluindo com a melhor economia ao longo do ano.</p>

                <ul>
                  <li>Todos os benefícios do plano Mensal</li>
                  <li>Equivalente a R$8,25 por mês</li>
                  <li>Economia garantida em 12 meses</li>
                  <li>Suporte e novidades com prioridade</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => abrirModalPlano('Premium Anual')}
                className="button-primary mt-6 w-full text-center justify-center flex items-center cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #FFB52E, #FF8A22)',
                  color: '#10234A',
                  fontWeight: 800,
                }}
              >
                Escolher plano Anual <span aria-hidden="true">→</span>
              </button>
            </article>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setMostrarComparativo((prev) => !prev)}
              className="inline-flex items-center gap-2 font-semibold text-yellow-300 hover:text-yellow-200 transition cursor-pointer text-sm"
            >
              {mostrarComparativo
                ? 'Recolher comparativo detalhado ↑'
                : 'Comparar todos os recursos e planos detalhados ↓'}
            </button>
          </div>

          {mostrarComparativo && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
              <h3 className="text-base font-bold text-white mb-4">
                Comparativo detalhado de benefícios
              </h3>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 font-semibold">Recurso</th>
                    <th className="pb-3 font-semibold text-center w-28">Grátis</th>
                    <th className="pb-3 font-semibold text-center w-32">Mensal</th>
                    <th className="pb-3 font-semibold text-center w-32 text-amber-300">Anual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Objetivos ativos simultâneos', 'Até 4', 'Até 8', 'Até 8'],
                    ['Criação de Ilhas e conexões', '✓ Ilimitado', '✓ Ilimitado', '✓ Ilimitado'],
                    ['Anotações com BlockNote', '✓ Incluído', '✓ Incluído', '✓ Incluído'],
                    ['Calendário e prazos civis', '✓ Incluído', '✓ Incluído', '✓ Incluído'],
                    ['Geração de metas por IA', '—', '✓ Incluído', '✓ Incluído'],
                    ['Mentoria com voluntários', '—', '✓ Incluído', '✓ Incluído'],
                    ['Backup automático', '—', '✓ Incluído', '✓ Incluído'],
                    ['Temas personalizados', '—', '✓ Incluído', '✓ Incluído'],
                    ['Valor da assinatura', 'R$ 0,00', 'R$ 14,90/mês', 'R$ 99,00/ano (-45%)'],
                  ].map(([recurso, gratis, mensal, anual]) => (
                    <tr key={recurso} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-slate-200 font-medium">{recurso}</td>
                      <td className="py-2.5 text-center text-slate-300">{gratis}</td>
                      <td className="py-2.5 text-center text-slate-300">{mensal}</td>
                      <td className="py-2.5 text-center font-semibold text-amber-300">{anual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-title"
        className="landing-faq grid grid-cols-1 items-start gap-12 px-[6.2%] py-24 lg:grid-cols-[minmax(0,396px)_minmax(0,1fr)] lg:gap-x-[104px]"
      >
        {/* Introdução */}
        <div className="landing-faq__intro flex flex-col items-start gap-[22px]">
          <span className="flex items-center gap-2.5 text-xs font-semibold uppercase leading-[15px] text-farol-accent">
            <span className="size-1.5 rounded-[2px] bg-farol-accent" />
            Antes de zarpar
          </span>

          <h2
            id="faq-title"
            className="text-[clamp(30px,3.5vw,44px)] font-bold leading-[1.12] tracking-[-1px] text-farol-text"
          >
            Um pouco mais de clareza.
          </h2>

          <p className="text-lg font-normal leading-[1.5] text-farol-muted">
            Respostas para encontrar seu ponto de partida no Farol.
          </p>
        </div>

        {/* Perguntas e respostas */}
        <div className="landing-faq__list w-full border-y border-[#293957]">
          <article className="landing-faq__item flex flex-col gap-[13px] border-b border-[#293957] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              O Farol é só para grandes objetivos?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              Não. Você pode começar por uma nota, um lembrete ou o planejamento da semana. Os
              pequenos passos também fazem parte da jornada.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] border-b border-[#293957] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Como funcionam as ilhas e as rotas?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              O objetivo é o destino. As ilhas representam etapas do caminho, e as rotas ajudam a
              visualizar como uma etapa se conecta à próxima.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] border-b border-[#293957] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Posso organizar estudos, trabalho e vida pessoal?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              Essa é a proposta: reunir o que importa no dia a dia sem deixar seus planos de longo
              prazo fora de vista.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Por onde eu começo?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              Registre o que está na sua cabeça, escolha algo que merece atenção e defina um próximo
              passo possível. Não é preciso planejar tudo de uma vez.
            </p>
          </article>
        </div>
      </section>

      <footer
        id="como-funciona"
        className="site-footer flex min-h-15.5 flex-wrap items-center justify-between gap-5 border-t border-farol-footer-border px-[6.2%] py-6 text-[11px] text-farol-muted"
      >
        <span className="font-bold tracking-[1px] text-farol-footer-label">
          DA IDEIA AO PRÓXIMO PASSO
        </span>
        <span>01 Capture o que importa</span>
        <span>02 Encontre sua direção</span>
        <span>03 Avance no seu ritmo</span>
      </footer>

      {/* MODAL DE HOMOLOGAÇÃO DE PAGAMENTO */}
      {modalHomologacao && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
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
              Estamos finalizando a integração segura com nosso gateway de pagamentos online (PIX e cartão de crédito).
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300 leading-relaxed space-y-2">
              <p className="font-semibold text-white">Enquanto isso, você já pode começar a usar o Farol:</p>
              <p>• Crie sua conta gratuita no plano <strong>Freemium</strong> agora mesmo.</p>
              <p>• Comece a estruturar seus objetivos, etapas e Ilhas imediatamente.</p>
              <p>• Você receberá um convite prioritário por e-mail com condições especiais para membros pioneiros assim que o checkout estiver liberado!</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalHomologacao(false);
                  onEntrar();
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-[#FFB52E] to-[#FF8A22] px-5 py-3 text-sm font-extrabold text-[#10234A] shadow-lg transition hover:scale-[1.02] text-center cursor-pointer"
              >
                Começar grátis no Freemium →
              </button>
              <button
                type="button"
                onClick={() => setModalHomologacao(false)}
                className="rounded-full border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 text-center cursor-pointer"
              >
                Voltar aos planos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;

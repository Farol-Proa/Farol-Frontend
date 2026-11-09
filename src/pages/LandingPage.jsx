import Header from '../components/Header';
import heroFarol from '/images/hero_farol.png';
import heroHome from '/images/foto-da-home.png';
import heroObjetivo from '/images/hero_objetivo.png';
import Check from '/images/check.svg';

import './LandingPage.css';

function LandingPage({ onEntrar }) {
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
            <a className="button-primary" href="#jornada">
              Começar minha jornada <span>→</span>
            </a>
            <a className="button-secondary" href="#como-funciona">
              Conhecer o Farol <span>→</span>
            </a>
          </div>

          <p className="mt-6.5 text-xs leading-[1.6] text-farol-muted max-[760px]:text-[11px]">
            Um espaço para suas notas, seus planos e seu próximo passo.
          </p>
        </section>
      </main>

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
        <div className='landing-home_apresentacao flex flex-col items-center p-0 gap[18px]'>
          <span className="text-[20px] font-bold tracking-[1.4px] text-farol-accent">
            <span className="mr-2 text-[24px]">•</span>
            Conheca seu farol
          </span>
          <h2 className="my-6 text-center text-[clamp(30px,3.5vw,46px)] leading-[1.15] tracking-[-1px]">Tudo o que importa.<br />
            Um lugar para se encontrar
          </h2>
          <p className="hero-description mb-6.5 w-full max-w-[680px] text-center text-[18px] leading-[1.5] text-[#A5B2CD]">
            Notas, calendário, tarefas e objetivos se encontram em uma visão clara da sua vida. Do que precisa de atenção hoje ao que você quer conquistar amanhã.
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
            <span className="text-[9px] font-semibold tracking-[0.12em] text-farol-text-subtle max-[480px]:hidden">VISÃO GERAL</span>
          </div>
          <img className="block h-auto w-full object-contain" src={heroHome} alt="Prévia da tela inicial do Farol" />
        </div>
      </section>
      {/* Rotas e objetivos =P */}
      {/* =================================================================================== */}

      <section className='landing-rotas-objetivos bg-color-farol-background flex flex-row items-center gap-16 py-24 px-22'>
        <img className='block h-auto w-176 object-contain' src={heroObjetivo}></img>

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
            Um plano grande fica mais possível quando você consegue ver o caminho.
            Divida a jornada em etapas e reconheça o que já conquistou.
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
              Não. Você pode começar por uma nota, um lembrete ou o planejamento da semana.
              Os pequenos passos também fazem parte da jornada.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] border-b border-[#293957] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Como funcionam as ilhas e as rotas?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              O objetivo é o destino. As ilhas representam etapas do caminho, e as rotas
              ajudam a visualizar como uma etapa se conecta à próxima.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] border-b border-[#293957] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Posso organizar estudos, trabalho e vida pessoal?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              Essa é a proposta: reunir o que importa no dia a dia sem deixar seus planos
              de longo prazo fora de vista.
            </p>
          </article>

          <article className="landing-faq__item flex flex-col gap-[13px] py-6">
            <h3 className="text-xl font-medium leading-[25px] text-farol-text">
              Por onde eu começo?
            </h3>

            <p className="text-base font-normal leading-[1.5] text-farol-muted">
              Registre o que está na sua cabeça, escolha algo que merece atenção e defina
              um próximo passo possível. Não é preciso planejar tudo de uma vez.
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
    </div>
  );
}

export default LandingPage;

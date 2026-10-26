import Header from '../components/Header';
import heroFarol from '/images/hero_farol.png';
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

import { useEffect, useState } from 'react';
import Logo from './Logo';

function Header({ onEntrar }) {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`site-header fixed left-0 top-0 z-[1000] flex min-h-[74px] w-full items-center justify-between gap-6 px-[6.2%] py-3 ${scrollPosition > 50 ? 'site-header-scrolled' : ''}`}
    >
      <a
        className="brand-link flex items-center gap-2.5 text-2xl font-bold text-farol-text no-underline"
        href="#farol"
        aria-label="Farol, início"
      >
        <Logo className="h-10 w-auto" />
      </a>

      <nav className="header-nav flex items-center gap-[26px]" aria-label="Navegação principal">
        <a className="text-xs text-farol-muted no-underline hover:text-white" href="#farol">
          O Farol
        </a>
        <a className="text-xs text-farol-muted no-underline hover:text-white" href="#recursos">
          Recursos
        </a>
        <a className="text-xs text-farol-muted no-underline hover:text-white" href="#como-funciona">
          Como funciona
        </a>
      </nav>

      <div className="header-actions flex items-center gap-[26px]">
        <button
          className="cursor-pointer border-0 bg-transparent text-xs text-farol-muted hover:text-white"
          type="button"
          onClick={onEntrar}
        >
          Entrar
        </button>
        <a className="header-cta button-primary" href="#jornada">
          Começar agora <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}

export default Header;

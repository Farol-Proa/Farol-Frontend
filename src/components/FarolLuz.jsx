import { useId } from 'react';
import './FarolLuz.css';

/**
 * Componente visual do Farol com Luz Progressiva do Intensivo Farol.
 * Níveis de iluminação (0 a 5):
 *  - Nível 0: Farol apagado (0 dias)
 *  - Nível 1: Luz inicial (1-2 dias)
 *  - Nível 2: Luz crescente (3-6 dias)
 *  - Nível 3: Luz forte com reflexo oceânico (7-13 dias)
 *  - Nível 4: Luz intensa com halo expansivo (14-29 dias)
 *  - Nível 5: Farol plenamente iluminado (30+ dias)
 */
function FarolLuz({ nivelLuz = 0, concluiuHoje = false, className = '' }) {
  const nivelNormalizado = Math.min(Math.max(Number(nivelLuz) || 0, 0), 5);

  // Gera IDs exclusivos para esta instância do SVG, evitando colisões com instâncias em contêineres ocultos
  const idInstancia = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const idCeuNoturno = `fl_${idInstancia}_ceuNoturno`;
  const idMarOceano = `fl_${idInstancia}_marOceano`;
  const idTorreFarol = `fl_${idInstancia}_torreFarol`;
  const idFaixasTorre = `fl_${idInstancia}_faixasTorre`;
  const idFeixeLuzNivel1 = `fl_${idInstancia}_feixeLuzNivel1`;
  const idFeixeLuzNivel2 = `fl_${idInstancia}_feixeLuzNivel2`;
  const idFeixeLuzNivel3 = `fl_${idInstancia}_feixeLuzNivel3`;
  const idFeixeLuzNivel4 = `fl_${idInstancia}_feixeLuzNivel4`;
  const idFeixeLuzNivel5 = `fl_${idInstancia}_feixeLuzNivel5`;
  const idHaloNivel1 = `fl_${idInstancia}_haloNivel1`;
  const idHaloNivel2 = `fl_${idInstancia}_haloNivel2`;
  const idHaloNivel3 = `fl_${idInstancia}_haloNivel3`;
  const idHaloNivel4 = `fl_${idInstancia}_haloNivel4`;
  const idHaloNivel5 = `fl_${idInstancia}_haloNivel5`;
  const idReflexoOceano = `fl_${idInstancia}_reflexoOceano`;

  const descricoesNivel = [
    'Farol apagado. Conclua uma tarefa hoje para acender seu farol.',
    'Luz inicial. Feixe discreto e acolhedor iluminando o primeiro passo.',
    'Luz crescente. Halo visível e feixe estendido sobre o horizonte.',
    'Luz forte. Feixe amplo com reflexo dourado sobre o oceano.',
    'Luz intensa. Halo radiante e feixe poderoso cortando a noite.',
    'Farol pleno. Iluminação máxima com constância inabalável.',
  ];

  return (
    <div
      className={`farol-luz-container nivel-${nivelNormalizado} ${concluiuHoje ? 'hoje-concluido' : 'hoje-pendente'} ${className}`}
      role="img"
      aria-label={`Farol do Intensivo: nível ${nivelNormalizado} de iluminação. ${descricoesNivel[nivelNormalizado]}`}
    >
      <svg
        className="farol-luz-svg"
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradiente do céu noturno oceânico */}
          <linearGradient id={idCeuNoturno} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#080d24" />
            <stop offset="70%" stopColor="#0f1938" />
            <stop offset="100%" stopColor="#142145" />
          </linearGradient>

          {/* Gradiente das ondas do oceano */}
          <linearGradient id={idMarOceano} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#131e3d" />
            <stop offset="100%" stopColor="#0a1024" />
          </linearGradient>

          {/* Gradiente da torre do farol */}
          <linearGradient id={idTorreFarol} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2c3c6e" />
            <stop offset="35%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#3b4f88" />
            <stop offset="100%" stopColor="#1e294b" />
          </linearGradient>

          <linearGradient id={idFaixasTorre} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e2c56" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          {/* Gradientes do feixe de luz progressivo */}
          <linearGradient id={idFeixeLuzNivel1} x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.75)" />
            <stop offset="40%" stopColor="rgba(251, 191, 36, 0.35)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>

          <linearGradient id={idFeixeLuzNivel2} x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="rgba(254, 243, 199, 0.9)" />
            <stop offset="30%" stopColor="rgba(251, 191, 36, 0.55)" />
            <stop offset="75%" stopColor="rgba(245, 158, 11, 0.2)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0)" />
          </linearGradient>

          <linearGradient id={idFeixeLuzNivel3} x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="25%" stopColor="rgba(254, 240, 138, 0.75)" />
            <stop offset="60%" stopColor="rgba(251, 191, 36, 0.4)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>

          <linearGradient id={idFeixeLuzNivel4} x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="rgba(254, 240, 138, 0.85)" />
            <stop offset="55%" stopColor="rgba(251, 191, 36, 0.5)" />
            <stop offset="85%" stopColor="rgba(56, 189, 248, 0.25)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
          </linearGradient>

          <linearGradient id={idFeixeLuzNivel5} x1="0" y1="0.5" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="rgba(255, 247, 237, 0.95)" />
            <stop offset="45%" stopColor="rgba(251, 191, 36, 0.7)" />
            <stop offset="75%" stopColor="rgba(56, 189, 248, 0.45)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </linearGradient>

          {/* Halos radiantes progressivos */}
          <radialGradient id={idHaloNivel1} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.6)" />
            <stop offset="50%" stopColor="rgba(251, 191, 36, 0.25)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>

          <radialGradient id={idHaloNivel2} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(254, 243, 199, 0.75)" />
            <stop offset="40%" stopColor="rgba(251, 191, 36, 0.45)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>

          <radialGradient id={idHaloNivel3} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="35%" stopColor="rgba(254, 240, 138, 0.6)" />
            <stop offset="70%" stopColor="rgba(251, 191, 36, 0.3)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>

          <radialGradient id={idHaloNivel4} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="rgba(254, 240, 138, 0.8)" />
            <stop offset="60%" stopColor="rgba(251, 191, 36, 0.45)" />
            <stop offset="85%" stopColor="rgba(56, 189, 248, 0.2)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
          </radialGradient>

          <radialGradient id={idHaloNivel5} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="rgba(255, 251, 235, 0.95)" />
            <stop offset="45%" stopColor="rgba(251, 191, 36, 0.65)" />
            <stop offset="75%" stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </radialGradient>

          {/* Gradiente do reflexo na água */}
          <radialGradient id={idReflexoOceano} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.5)" />
            <stop offset="40%" stopColor="rgba(251, 191, 36, 0.25)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>
        </defs>

        {/* Fundo do Céu Noturno */}
        <rect width="320" height="200" rx="16" fill={`url(#${idCeuNoturno})`} />

        {/* Estrelas do Céu Noturno */}
        <g className="farol-estrelas" opacity="0.65">
          <circle cx="160" cy="30" r="1" fill="#e2e8f0" />
          <circle cx="210" cy="22" r="1.5" fill="#f8fafc" />
          <circle cx="270" cy="35" r="1" fill="#cbd5e1" />
          <circle cx="185" cy="55" r="1.2" fill="#f8fafc" />
          <circle cx="245" cy="65" r="1" fill="#e2e8f0" />
          <circle cx="295" cy="80" r="1.5" fill="#fde047" />
          <circle cx="140" cy="75" r="0.8" fill="#94a3b8" />
          <circle cx="45" cy="40" r="1.2" fill="#cbd5e1" />
          <circle cx="65" cy="25" r="1.5" fill="#f8fafc" />
          <circle cx="30" cy="80" r="1" fill="#94a3b8" />
        </g>

        {/* Lua sutil ou brilho cósmico */}
        <circle cx="270" cy="35" r="14" fill="rgba(254, 240, 138, 0.08)" />

        {/* Oceano Noturno na Base */}
        <path
          d="M 0 165 C 50 162 100 168 150 165 C 200 162 250 167 320 165 L 320 200 L 0 200 Z"
          fill={`url(#${idMarOceano})`}
        />

        {/* Ilha rochosa sob o Farol */}
        <path
          d="M 30 185 C 45 162 65 158 90 158 C 115 158 135 165 155 185 C 160 190 150 195 130 195 L 40 195 Z"
          fill="#0f172a"
        />
        <path
          d="M 45 182 C 60 166 75 163 90 163 C 105 163 125 168 140 182 Z"
          fill="#1e293b"
          opacity="0.7"
        />

        {/* ========================================================
            FEIXE DE LUZ PROGRESSIVO (De acordo com o nível)
            ======================================================== */}
        {nivelNormalizado === 1 && (
          <path
            className="feixe-luz feixe-nivel-1"
            d="M 90 92 L 180 78 L 175 106 L 90 94 Z"
            fill={`url(#${idFeixeLuzNivel1})`}
          />
        )}

        {nivelNormalizado === 2 && (
          <path
            className="feixe-luz feixe-nivel-2"
            d="M 90 91 L 235 68 L 225 116 L 90 95 Z"
            fill={`url(#${idFeixeLuzNivel2})`}
          />
        )}

        {nivelNormalizado === 3 && (
          <path
            className="feixe-luz feixe-nivel-3"
            d="M 90 90 L 285 55 L 270 128 L 90 96 Z"
            fill={`url(#${idFeixeLuzNivel3})`}
          />
        )}

        {nivelNormalizado === 4 && (
          <path
            className="feixe-luz feixe-nivel-4"
            d="M 90 89 L 320 42 L 305 142 L 90 97 Z"
            fill={`url(#${idFeixeLuzNivel4})`}
          />
        )}

        {nivelNormalizado === 5 && (
          <path
            className="feixe-luz feixe-nivel-5"
            d="M 90 88 L 335 32 L 315 152 L 90 98 Z"
            fill={`url(#${idFeixeLuzNivel5})`}
          />
        )}

        {/* ========================================================
            HALO LUMINOSO PROGRESSIVO (Centrado na lanterna do Farol)
            ======================================================== */}
        {nivelNormalizado === 1 && (
          <circle
            className="halo-luz halo-nivel-1"
            cx="90"
            cy="93"
            r="28"
            fill={`url(#${idHaloNivel1})`}
          />
        )}

        {nivelNormalizado === 2 && (
          <circle
            className="halo-luz halo-nivel-2"
            cx="90"
            cy="93"
            r="46"
            fill={`url(#${idHaloNivel2})`}
          />
        )}

        {nivelNormalizado === 3 && (
          <circle
            className="halo-luz halo-nivel-3"
            cx="90"
            cy="93"
            r="68"
            fill={`url(#${idHaloNivel3})`}
          />
        )}

        {nivelNormalizado === 4 && (
          <circle
            className="halo-luz halo-nivel-4"
            cx="90"
            cy="93"
            r="95"
            fill={`url(#${idHaloNivel4})`}
          />
        )}

        {nivelNormalizado === 5 && (
          <>
            <circle
              className="halo-luz halo-nivel-5-externo"
              cx="90"
              cy="93"
              r="125"
              fill={`url(#${idHaloNivel5})`}
            />
            <circle
              className="halo-luz halo-nivel-5-interno"
              cx="90"
              cy="93"
              r="55"
              fill={`url(#${idHaloNivel4})`}
            />
          </>
        )}

        {/* ========================================================
            REFLEXO NO OCEANO (A partir do nível 3)
            ======================================================== */}
        {nivelNormalizado >= 3 && (
          <g className={`reflexo-agua reflexo-nivel-${nivelNormalizado}`}>
            <ellipse
              cx="160"
              cy="176"
              rx={nivelNormalizado === 3 ? '50' : nivelNormalizado === 4 ? '75' : '100'}
              ry="5"
              fill={`url(#${idReflexoOceano})`}
              opacity={nivelNormalizado === 3 ? '0.45' : nivelNormalizado === 4 ? '0.7' : '0.9'}
            />
            <ellipse
              cx="190"
              cy="184"
              rx={nivelNormalizado === 3 ? '35' : nivelNormalizado === 4 ? '55' : '75'}
              ry="4"
              fill={`url(#${idReflexoOceano})`}
              opacity={nivelNormalizado === 3 ? '0.35' : nivelNormalizado === 4 ? '0.6' : '0.8'}
            />
          </g>
        )}

        {/* ========================================================
            ESTRUTURA DO FAROL (Torre, Galeria, Lanterna, Cúpula)
            ======================================================== */}
        {/* Base da torre */}
        <polygon points="76,165 104,165 101,135 79,135" fill={`url(#${idTorreFarol})`} />

        {/* Faixa azul intermediária */}
        <polygon points="79,135 101,135 99,118 81,118" fill={`url(#${idFaixasTorre})`} />

        {/* Segmento superior da torre */}
        <polygon points="81,118 99,118 97,105 83,105" fill={`url(#${idTorreFarol})`} />

        {/* Janelas da torre */}
        <rect x="88" y="142" width="4" height="7" rx="2" fill="#0f172a" />
        <rect x="88" y="122" width="4" height="6" rx="2" fill="#0f172a" />

        {/* Galeria / Passadiço do Farol */}
        <rect x="74" y="103" width="32" height="3" rx="1.5" fill="#475569" />
        {/* Grade de proteção da galeria */}
        <line x1="76" y1="100" x2="104" y2="100" stroke="#64748b" strokeWidth="1" />
        <line x1="78" y1="100" x2="78" y2="103" stroke="#64748b" strokeWidth="1" />
        <line x1="84" y1="100" x2="84" y2="103" stroke="#64748b" strokeWidth="1" />
        <line x1="90" y1="100" x2="90" y2="103" stroke="#64748b" strokeWidth="1" />
        <line x1="96" y1="100" x2="96" y2="103" stroke="#64748b" strokeWidth="1" />
        <line x1="102" y1="100" x2="102" y2="103" stroke="#64748b" strokeWidth="1" />

        {/* Sala da Lanterna (Vidro) */}
        <rect
          x="80"
          y="85"
          width="20"
          height="16"
          rx="1"
          fill={nivelNormalizado === 0 ? 'rgba(30, 41, 59, 0.85)' : 'rgba(254, 240, 138, 0.25)'}
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* LÂMPADA / NÚCLEO LUMINOSO CENTRAL */}
        {nivelNormalizado === 0 ? (
          <circle cx="90" cy="93" r="3.5" fill="#475569" />
        ) : (
          <g className="farol-lampada">
            <circle
              cx="90"
              cy="93"
              r={nivelNormalizado <= 2 ? '4' : nivelNormalizado <= 4 ? '5.5' : '7'}
              fill={nivelNormalizado <= 2 ? '#fef08a' : '#ffffff'}
            />
            <circle
              cx="90"
              cy="93"
              r={nivelNormalizado <= 2 ? '7' : nivelNormalizado <= 4 ? '10' : '14'}
              fill={nivelNormalizado <= 2 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(254, 240, 138, 0.7)'}
            />
          </g>
        )}

        {/* Cúpula / Teto do Farol */}
        <path
          d="M 78 85 C 78 74 102 74 102 85 Z"
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Esfera decorativa e cata-vento no topo */}
        <circle cx="90" cy="73" r="2" fill="#64748b" />
        <line x1="90" y1="73" x2="90" y2="67" stroke="#64748b" strokeWidth="1.2" />

        {/* Detalhe comemorativo especial para Nível 5 */}
        {nivelNormalizado === 5 && (
          <g className="coroa-farol-pleno">
            <polygon
              points="90,62 92,66 96,66 93,69 94,73 90,70 86,73 87,69 84,66 88,66"
              fill="#fbbf24"
            />
          </g>
        )}

        {/* Ondas sutis na água */}
        <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" fill="none">
          <path d="M 12 178 Q 28 175 44 178 T 76 178" />
          <path d="M 170 174 Q 185 172 200 174 T 230 174" />
          <path d="M 220 188 Q 240 185 260 188 T 300 188" />
          <path d="M 80 190 Q 95 188 110 190 T 140 190" />
        </g>
      </svg>
    </div>
  );
}

export default FarolLuz;

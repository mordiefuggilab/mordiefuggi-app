"use client";

// Vestito di Natale della homepage (tre ipotesi grafiche da far scegliere a Sandro).
//
// NATALE_SCELTA: l'ipotesi che va online (1, 2 o 3). null = homepage normale.
// Le decorazioni si spengono da sole il 7 gennaio 2027 (dopo l'Epifania),
// senza toccare il codice. La card del Menù delle Vigilie ha la sua scadenza (2/1/2027).
//
// Solo nelle anteprime (non in produzione) compare in basso un selettore
// "Ipotesi 1 · 2 · 3" e si può forzare l'ipotesi con ?natale=1 / 2 / 3 / 0.

import { useEffect, useState } from 'react';

export const NATALE_SCELTA = null;
export const NATALE_INIZIO = new Date('2026-11-01T00:00:00+01:00');
export const NATALE_FINE = new Date('2027-01-07T00:00:00+01:00');
export const nataleAttivo = (ora = new Date()) => ora >= NATALE_INIZIO && ora < NATALE_FINE;

const ANTEPRIMA = process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production';

export function useNatale() {
  const [v, setV] = useState(0);
  useEffect(() => {
    let scelta = NATALE_SCELTA || 0;
    if (ANTEPRIMA) {
      const p = new URLSearchParams(window.location.search).get('natale');
      if (p !== null && ['0', '1', '2', '3'].includes(p)) scelta = Number(p);
    }
    // Letto dopo il primo disegno: la pagina è statica e la data/URL esistono solo nel browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setV(nataleAttivo() ? scelta : 0);
  }, []);
  const cambia = (n) => {
    setV(n);
    const url = new URL(window.location.href);
    url.searchParams.set('natale', String(n));
    window.history.replaceState(null, '', url);
  };
  return [v, cambia];
}

// Classi da applicare alla homepage per ogni ipotesi.
export function temaNatale(v) {
  if (v === 1) return { root: 'bg-[#EEF2EF]', h1: '', logo: '', card: '' };
  if (v === 2) return { root: 'bg-[#F7F1E6] pt-16', h1: '', logo: '', card: '' };
  if (v === 3) return {
    root: 'bg-[#21573D]',
    h1: 'text-white',
    logo: '!text-white',
    card: 'ring-2 ring-[#C9A97A]/70',
  };
  return { root: 'bg-[#EFEFED]', h1: '', logo: '', card: '' };
}

// Cappellino di Babbo Natale in SVG (leggero, nessuna immagine da scaricare).
export function Cappellino({ className = '', oro = false }) {
  const rosso = oro ? '#C9A97A' : '#C62828';
  const ombra = oro ? '#9C7B4E' : '#8E1B1B';
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <path d="M8 44 C10 26 24 8 46 6 C54 5 58 10 56 16 C52 12 46 14 44 20 C42 28 50 36 56 44 Z" fill={rosso} />
      <path d="M44 20 C42 28 50 36 56 44 L48 44 C44 36 40 28 44 20 Z" fill={ombra} opacity="0.55" />
      <circle cx="56" cy="17" r="6.5" fill="#FFFFFF" stroke="#E4E4E4" strokeWidth="1" />
      <rect x="2" y="40" width="60" height="14" rx="7" fill="#FFFFFF" stroke="#E4E4E4" strokeWidth="1" />
      <path d="M10 47 h44" stroke="#EDEDED" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const STILE = `
@keyframes mf-neve { 0% { transform: translate3d(0,-10vh,0); } 100% { transform: translate3d(var(--dx),110vh,0); } }
@keyframes mf-luce { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
@keyframes mf-stella { 0%,100% { opacity: .9; transform: scale(1); } 50% { opacity: .25; transform: scale(.7); } }
.mf-fiocco { position:absolute; top:0; border-radius:9999px; will-change:transform; animation: mf-neve linear infinite; }
.mf-luce { animation: mf-luce 1.8s ease-in-out infinite; }
.mf-stella { transform-origin:center; transform-box: fill-box; animation: mf-stella 3s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .mf-fiocco, .mf-luce, .mf-stella { animation: none !important; } .mf-fiocco { display:none; } }
`;

// Numeri "casuali" fissi, così la pagina è uguale ad ogni apertura.
const rnd = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

function Neve({ quanti = 18, colore = '#FFFFFF', opacita = 0.85 }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
      {Array.from({ length: quanti }, (_, i) => {
        const size = 3 + Math.round(rnd(i, 1) * 5);
        return (
          <span
            key={i}
            className="mf-fiocco"
            style={{
              left: `${Math.round(rnd(i, 2) * 100)}%`,
              width: size, height: size,
              background: colore,
              opacity: opacita * (0.5 + rnd(i, 3) * 0.5),
              animationDuration: `${9 + rnd(i, 4) * 9}s`,
              animationDelay: `-${rnd(i, 5) * 18}s`,
              '--dx': `${Math.round((rnd(i, 6) - 0.5) * 60)}px`,
            }}
          />
        );
      })}
    </div>
  );
}

function Fiocco({ x, y, r, colore, op }) {
  const bracci = [0, 60, 120];
  return (
    <g transform={`translate(${x} ${y})`} stroke={colore} strokeWidth="1.6" strokeLinecap="round" opacity={op} fill="none">
      {bracci.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={`M0 ${-r} V${r}`} />
          <path d={`M${-r * 0.3} ${-r * 0.7} L0 ${-r * 0.45} L${r * 0.3} ${-r * 0.7}`} />
          <path d={`M${-r * 0.3} ${r * 0.7} L0 ${r * 0.45} L${r * 0.3} ${r * 0.7}`} />
        </g>
      ))}
    </g>
  );
}

// Ipotesi 1: fiocchi di neve disegnati in alto + neve leggera che scende.
function DecorNeve() {
  const fiocchi = [
    { x: 352, y: 122, r: 14, op: 0.5 }, { x: 372, y: 200, r: 7, op: 0.35 },
    { x: 205, y: 22, r: 7, op: 0.3 }, { x: 330, y: 245, r: 10, op: 0.3 },
    { x: 14, y: 140, r: 8, op: 0.25 },
  ];
  return (
    <>
      <svg viewBox="0 0 390 380" className="absolute top-0 inset-x-0 w-full -z-10 pointer-events-none" aria-hidden="true">
        {fiocchi.map((f, i) => <Fiocco key={i} {...f} colore="#2E7D32" />)}
      </svg>
      <Neve quanti={16} colore="#A9BDB2" opacita={0.75} />
    </>
  );
}

// Ipotesi 2: festone di lucine colorate in cima alla pagina.
function DecorLucine() {
  const colori = ['#D32F2F', '#C9A97A', '#2E7D32', '#1E88E5', '#D32F2F', '#C9A97A', '#2E7D32'];
  const punti = [];
  const curva = (x0, x1) => {
    for (let k = 1; k <= 5; k++) {
      const t = k / 6;
      const cx = (x0 + x1) / 2;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const y = (1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 42 + t * t * 6;
      punti.push({ x, y });
    }
  };
  curva(0, 130); curva(130, 260); curva(260, 390);
  return (
    <svg viewBox="0 0 390 70" className="absolute top-0 inset-x-0 w-full pointer-events-none" aria-hidden="true">
      <path d="M0 6 Q65 42 130 6 Q195 42 260 6 Q325 42 390 6" stroke="#3E4A3F" strokeWidth="1.6" fill="none" />
      {punti.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${(i % 2 ? 1 : -1) * 12})`}>
          <rect x="-2.5" y="-1" width="5" height="5" rx="1" fill="#5B5B5B" />
          <ellipse
            className="mf-luce"
            cx="0" cy="11" rx="5" ry="8"
            fill={colori[i % colori.length]}
            style={{ animationDelay: `${(i % 4) * 0.45}s` }}
          />
          <ellipse cx="-1.5" cy="8" rx="1.3" ry="2.6" fill="#FFFFFF" opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

// Ipotesi 3: notte di Natale verde scuro, stelle d'oro e colline innevate.
function DecorNotte() {
  const stelle = Array.from({ length: 22 }, (_, i) => ({
    x: Math.round(rnd(i, 7) * 390), y: Math.round(rnd(i, 8) * 520), r: 1 + rnd(i, 9) * 2.2,
  }));
  return (
    <>
      <svg viewBox="0 0 390 520" className="fixed top-0 inset-x-0 w-full -z-10 pointer-events-none" aria-hidden="true">
        {stelle.map((s, i) => (
          <circle key={i} className="mf-stella" cx={s.x} cy={s.y} r={s.r} fill="#E9D3A8" style={{ animationDelay: `${(i % 6) * 0.5}s` }} />
        ))}
        <path className="mf-stella" transform="translate(336 64)" d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z" fill="#C9A97A" />
      </svg>
      <svg viewBox="0 0 390 120" preserveAspectRatio="none" className="fixed bottom-0 inset-x-0 w-full h-[110px] -z-10 pointer-events-none" aria-hidden="true">
        <path d="M0 70 Q90 30 190 66 T390 52 V120 H0 Z" fill="#2F6B4C" />
        <path d="M0 92 Q110 58 220 90 T390 84 V120 H0 Z" fill="#E8EFEA" opacity="0.92" />
      </svg>
      <Neve quanti={20} colore="#FFFFFF" opacita={0.8} />
    </>
  );
}

export function NataleDecor({ v }) {
  if (!v) return null;
  return (
    <>
      <style>{STILE}</style>
      {v === 1 && <DecorNeve />}
      {v === 2 && <DecorLucine />}
      {v === 3 && <DecorNotte />}
    </>
  );
}

// Piccola scritta di auguri sopra il titolo.
export function AuguriNatale({ v }) {
  if (!v) return null;
  if (v === 1) return <p className="inline-block mb-3 bg-[#C62828] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Buone Feste</p>;
  if (v === 2) return <p className="mb-7 text-[11px] font-black uppercase tracking-[0.25em] text-[#C62828]">✦ Buon Natale ✦</p>;
  return <p className="mb-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#C9A97A]">Buone Feste · Natale 2026</p>;
}

// Selettore visibile solo nelle anteprime, per provare le ipotesi dal telefono.
export function SelettoreNatale({ v, onCambia }) {
  if (!ANTEPRIMA || !nataleAttivo()) return null;
  const voci = [[0, 'Senza'], [1, 'Ipotesi 1'], [2, 'Ipotesi 2'], [3, 'Ipotesi 3']];
  return (
    <div className="fixed bottom-3 inset-x-3 z-40 bg-[#111111]/90 backdrop-blur rounded-2xl p-1.5 flex gap-1 shadow-2xl">
      {voci.map(([n, label]) => (
        <button
          key={n}
          onClick={() => onCambia(n)}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide ${v === n ? 'bg-[#C9A97A] text-[#111111]' : 'text-white/80'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

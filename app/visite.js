"use client";

// Contatore visite dell'app, salvato su Supabase (tabella `visite`).
// Non salva dati personali: solo data/ora, tipo di evento e da dove arriva la visita
// (utm_source del link della campagna, oppure il sito di provenienza, oppure "diretto").
//
// Tabella da creare una volta sola in Supabase (SQL Editor):
export const SQL_VISITE = `create table public.visite (
  id bigint generated always as identity primary key,
  creato timestamptz not null default now(),
  tipo text not null,
  fonte text
);
alter table public.visite enable row level security;
create policy "visite inserimento" on public.visite for insert to anon
  with check (tipo in ('visita', 'vigilie', 'vigilie_whatsapp'));
create policy "visite lettura" on public.visite for select to anon using (true);`;

import { useEffect, useState } from 'react';

const DASHBOARD_VERCEL = 'https://vercel.com/mordiefuggilabs-projects/mordiefuggi-app/analytics';

const fonteVisita = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get('utm_source')) return p.get('utm_source').toLowerCase().slice(0, 40);
    if (p.get('fbclid')) return 'facebook/instagram';
    if (document.referrer) {
      const h = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (h && h !== window.location.hostname.replace(/^www\./, '')) return h.slice(0, 60);
    }
  } catch { /* nessuna fonte */ }
  return 'diretto';
};

export async function registraEvento(supabase, tipo, { unaVoltaPerSessione = false } = {}) {
  try {
    if (unaVoltaPerSessione) {
      const k = 'mf_evento_' + tipo;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    }
  } catch { /* storage non disponibile: conta comunque */ }
  try {
    await supabase.from('visite').insert([{ tipo, fonte: fonteVisita() }]);
  } catch { /* il contatore non deve mai bloccare l'app */ }
}

const giornoRoma = (d) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }); // AAAA-MM-GG
const etichetta = (g) => new Date(g + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });

function Box({ t, v, sub }) {
  return (
  <div className="bg-white rounded-2xl p-4 shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t}</p>
    <p className="text-3xl font-black text-[#2E7D32] leading-tight">{v}</p>
    {sub && <p className="text-[10px] text-gray-400 font-bold">{sub}</p>}
  </div>
  );
}

export function VisiteAdmin({ supabase }) {
  const [stato, setStato] = useState('carico'); // carico | ok | manca
  const [righe, setRighe] = useState([]);
  const [totale, setTotale] = useState(0);
  const [ora, setOra] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const da = new Date(Date.now() - 30 * 864e5).toISOString();
      const tutte = [];
      for (let p = 0; p < 50; p++) {
        const { data, error } = await supabase.from('visite').select('creato,tipo,fonte').gte('creato', da).order('creato').range(p * 1000, p * 1000 + 999);
        if (error) { if (vivo) setStato('manca'); return; }
        tutte.push(...data);
        if (data.length < 1000) break;
      }
      const { count } = await supabase.from('visite').select('id', { count: 'exact', head: true }).eq('tipo', 'visita');
      if (!vivo) return;
      setRighe(tutte); setTotale(count || 0); setOra(Date.now()); setStato('ok');
    })();
    return () => { vivo = false; };
  }, [supabase]);

  const oggi = giornoRoma(ora);
  const ieri = giornoRoma(ora - 864e5);
  const sett = new Set(Array.from({ length: 7 }, (_, i) => giornoRoma(ora - i * 864e5)));
  const conta = (tipo, filtro) => righe.filter(r => r.tipo === tipo && filtro(giornoRoma(r.creato))).length;
  const giorni = Array.from({ length: 14 }, (_, i) => giornoRoma(ora - i * 864e5));
  const fonti = Object.entries(righe.filter(r => r.tipo === 'visita' && sett.has(giornoRoma(r.creato)))
    .reduce((a, r) => { a[r.fonte || 'diretto'] = (a[r.fonte || 'diretto'] || 0) + 1; return a; }, {}))
    .sort((a, b) => b[1] - a[1]);


  return (
    <div className="space-y-4">
      {stato === 'carico' && <p className="text-xs font-bold text-gray-400">Carico le visite…</p>}

      {stato === 'manca' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <p className="font-black uppercase italic text-sm">Contatore da attivare</p>
          <p className="text-xs text-gray-500">Manca la tabella <b>visite</b> su Supabase. Apri Supabase → SQL Editor, incolla questo testo e premi Run (una volta sola):</p>
          <pre className="text-[10px] bg-gray-50 p-3 rounded-xl overflow-x-auto whitespace-pre">{SQL_VISITE}</pre>
        </div>
      )}

      {stato === 'ok' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Box t="Visite oggi" v={conta('visita', g => g === oggi)} sub={`ieri ${conta('visita', g => g === ieri)}`} />
            <Box t="Ultimi 7 giorni" v={conta('visita', g => sett.has(g))} sub={`totale ${totale}`} />
            <Box t="Menù Vigilie aperto" v={conta('vigilie', g => sett.has(g))} sub="ultimi 7 giorni" />
            <Box t="Invii WhatsApp Vigilie" v={conta('vigilie_whatsapp', g => sett.has(g))} sub="ultimi 7 giorni" />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Da dove arrivano (7 giorni)</p>
            {fonti.length ? fonti.map(([f, n]) => (
              <div key={f} className="flex justify-between py-1.5 border-b border-gray-50 text-sm"><span className="font-bold">{f}</span><span className="font-black text-[#2E7D32]">{n}</span></div>
            )) : <p className="text-xs text-gray-400">Ancora nessuna visita.</p>}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Giorno per giorno</p>
            <div className="grid grid-cols-4 text-[9px] font-black uppercase text-gray-400 pb-1"><span>Giorno</span><span className="text-right">Visite</span><span className="text-right">Vigilie</span><span className="text-right">WhatsApp</span></div>
            {giorni.map(g => (
              <div key={g} className="grid grid-cols-4 py-1.5 border-b border-gray-50 text-xs">
                <span className="font-bold">{etichetta(g)}</span>
                <span className="text-right font-black text-[#2E7D32]">{conta('visita', x => x === g)}</span>
                <span className="text-right font-bold">{conta('vigilie', x => x === g)}</span>
                <span className="text-right font-bold">{conta('vigilie_whatsapp', x => x === g)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <a href={DASHBOARD_VERCEL} target="_blank" rel="noopener noreferrer" className="block text-center bg-[#111] text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl">Statistiche complete su Vercel ↗</a>
      <p className="text-[10px] text-gray-400 text-center">Una visita = una persona che apre il sito (contata una volta per sessione).</p>
    </div>
  );
}

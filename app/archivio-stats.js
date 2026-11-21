"use client";

// Riepilogo degli ordini dall'inizio a oggi, mostrato in Gestione → Archivio.
// Legge tutta la tabella `ordini` (a pagine da 1000, così non si ferma al limite di Supabase)
// e conta gli ordini in totale, per cliente, per mese e per settimana (lunedì–domenica, ora di Roma).

import { useEffect, useState } from 'react';

const TZ = 'Europe/Rome';
const giorno = (d) => new Date(d).toLocaleDateString('sv-SE', { timeZone: TZ }); // AAAA-MM-GG
const euro = (n) => '€ ' + n.toFixed(2).replace('.', ',');
const fmtGiorno = (g) => new Date(g + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtMese = (m) => { const s = new Date(m + '-15T12:00:00').toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }); return s[0].toUpperCase() + s.slice(1); };

// lunedì della settimana del giorno g (AAAA-MM-GG)
const lunedi = (g) => {
  const d = new Date(g + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};
const piuGiorni = (g, n) => { const d = new Date(g + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtSettimana = (l) => {
  const a = new Date(l + 'T12:00:00'), b = new Date(piuGiorni(l, 6) + 'T12:00:00');
  const o = { day: 'numeric', month: 'short' };
  return `${a.toLocaleDateString('it-IT', o)} – ${b.toLocaleDateString('it-IT', o)} ${b.getFullYear()}`;
};

// stesso cliente = stesso telefono (ultime 9 cifre); se manca, stesso nome
const chiaveCliente = (o) => {
  const t = String(o.telefono || '').replace(/\D/g, '');
  if (t.length >= 6) return 't' + t.slice(-9);
  return 'n' + String(o.cliente || 'senza nome').trim().toLowerCase();
};

const raggruppa = (lista, chiave) => {
  const m = {};
  lista.forEach(o => {
    const k = chiave(o);
    if (!m[k]) m[k] = { n: 0, euro: 0 };
    m[k].n += 1;
    m[k].euro += parseFloat(o.totale) || 0;
  });
  return m;
};

function Box({ t, v, sub }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t}</p>
      <p className="text-3xl font-black text-[#C9A97A] leading-tight">{v}</p>
      {sub && <p className="text-[10px] text-gray-400 font-bold">{sub}</p>}
    </div>
  );
}

function Riga({ a, b, n, e, max }) {
  return (
    <div className="py-2 border-b border-gray-50">
      <div className="flex justify-between items-baseline gap-2 text-xs">
        <div className="min-w-0"><p className="font-bold truncate">{a}</p>{b && <p className="text-[10px] text-gray-400 truncate">{b}</p>}</div>
        <div className="text-right shrink-0"><span className="font-black text-[#C9A97A]">{n}</span><span className="text-[10px] text-gray-400 font-bold ml-2">{euro(e)}</span></div>
      </div>
      {max > 0 && <div className="h-1 bg-gray-50 rounded-full mt-1"><div className="h-1 bg-[#C9A97A]/60 rounded-full" style={{ width: `${Math.max(3, (n / max) * 100)}%` }} /></div>}
    </div>
  );
}

function Sezione({ titolo, colonne, children, tutte, setTutte, nascoste }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2"><span>{titolo}</span><span>{colonne}</span></div>
      {children}
      {nascoste > 0 && (
        <button onClick={() => setTutte(!tutte)} className="w-full mt-3 text-[10px] font-black uppercase tracking-widest text-[#C9A97A]">
          {tutte ? 'Mostra meno' : `Mostra tutti (+${nascoste})`}
        </button>
      )}
    </div>
  );
}

export function ArchivioStats({ supabase, aggiorna }) {
  const [stato, setStato] = useState('carico'); // carico | ok | errore
  const [ordini, setOrdini] = useState([]);
  const [aperto, setAperto] = useState(true);
  const [tuttiClienti, setTuttiClienti] = useState(false);
  const [tutteSett, setTutteSett] = useState(false);
  const [cerca, setCerca] = useState('');
  const [ora, setOra] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const tutte = [];
      for (let p = 0; p < 100; p++) {
        const { data, error } = await supabase.from('ordini').select('cliente,telefono,totale,stato,created_at').order('created_at').range(p * 1000, p * 1000 + 999);
        if (error) { if (vivo) setStato('errore'); return; }
        tutte.push(...data);
        if (data.length < 1000) break;
      }
      if (vivo) { setOrdini(tutte); setOra(Date.now()); setStato('ok'); }
    })();
    return () => { vivo = false; };
  }, [supabase, aggiorna]);

  if (stato === 'carico') return <p className="text-xs font-bold text-gray-400 mb-4">Calcolo il riepilogo ordini…</p>;
  if (stato === 'errore') return <p className="text-xs font-bold text-red-400 mb-4">Non riesco a leggere gli ordini per il riepilogo.</p>;
  if (!ordini.length) return <p className="text-xs font-bold text-gray-400 mb-4">Ancora nessun ordine.</p>;

  const oggi = giorno(ora);
  const tot = ordini.reduce((a, o) => a + (parseFloat(o.totale) || 0), 0);
  const primo = giorno(ordini[0].created_at);
  const inCorso = ordini.filter(o => o.stato !== 'pronto').length;

  // per cliente
  const clientiMap = {};
  ordini.forEach(o => {
    const k = chiaveCliente(o);
    const c = clientiMap[k] || (clientiMap[k] = { nome: '', tel: '', n: 0, euro: 0, ultimo: '' });
    c.n += 1;
    c.euro += parseFloat(o.totale) || 0;
    c.ultimo = giorno(o.created_at);
    if (o.cliente) c.nome = String(o.cliente).trim(); // tiene il nome usato più di recente
    if (o.telefono) c.tel = String(o.telefono);
  });
  const clienti = Object.values(clientiMap).sort((a, b) => b.n - a.n || b.euro - a.euro);
  const q = cerca.trim().toLowerCase();
  const clientiFiltrati = q ? clienti.filter(c => c.nome.toLowerCase().includes(q) || c.tel.includes(q)) : clienti;
  const clientiVisti = tuttiClienti || q ? clientiFiltrati : clientiFiltrati.slice(0, 10);
  const ritorno = clienti.filter(c => c.n > 1).length;

  // per mese, tutti i mesi dal primo ordine (anche quelli a zero)
  const mesiMap = raggruppa(ordini, o => giorno(o.created_at).slice(0, 7));
  const mesi = [];
  for (let m = primo.slice(0, 7), fine = oggi.slice(0, 7); m <= fine;) {
    mesi.unshift(m);
    const [y, mm] = m.split('-').map(Number);
    m = mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`;
  }
  const maxMese = Math.max(...mesi.map(m => mesiMap[m]?.n || 0), 1);

  // per settimana, tutte le settimane dal primo ordine (anche quelle a zero)
  const settMap = raggruppa(ordini, o => lunedi(giorno(o.created_at)));
  const settimane = [];
  for (let l = lunedi(primo), fine = lunedi(oggi); l <= fine; l = piuGiorni(l, 7)) settimane.unshift(l);
  const settViste = tutteSett ? settimane : settimane.slice(0, 8);
  const maxSett = Math.max(...settimane.map(l => settMap[l]?.n || 0), 1);

  const meseCorr = oggi.slice(0, 7);
  const settCorr = lunedi(oggi);

  return (
    <div className="space-y-3 mb-6">
      <button onClick={() => setAperto(!aperto)} className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">
        <span>Riepilogo ordini dall&apos;inizio</span><span>{aperto ? 'Nascondi ▲' : 'Mostra ▼'}</span>
      </button>

      {aperto && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Box t="Ordini totali" v={ordini.length} sub={`dal ${fmtGiorno(primo)}`} />
            <Box t="Incasso totale" v={euro(tot)} sub={`media ${euro(tot / ordini.length)} a ordine`} />
            <Box t="Clienti diversi" v={clienti.length} sub={`${ritorno} hanno ordinato più volte`} />
            <Box t="Questa settimana" v={settMap[settCorr]?.n || 0} sub={`questo mese ${mesiMap[meseCorr]?.n || 0}`} />
          </div>
          {inCorso > 0 && <p className="text-[10px] text-gray-400 px-1">Nel conto ci sono anche {inCorso} ordini ancora in Live.</p>}

          <Sezione titolo="Per cliente" colonne="Ordini · Speso" tutte={tuttiClienti} setTutte={setTuttiClienti} nascoste={q ? 0 : clientiFiltrati.length - clientiVisti.length}>
            <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca nome o telefono" className="w-full mb-2 px-3 py-2 rounded-xl bg-gray-50 text-xs outline-none" />
            {clientiVisti.map((c, i) => (
              <Riga key={i} a={c.nome || 'Senza nome'} b={`${c.tel ? c.tel + ' · ' : ''}ultimo ordine ${fmtGiorno(c.ultimo)}`} n={c.n} e={c.euro} max={0} />
            ))}
            {!clientiVisti.length && <p className="text-xs text-gray-400 py-2">Nessun cliente trovato.</p>}
          </Sezione>

          <Sezione titolo="Per mese" colonne="Ordini · Incasso">
            {mesi.map(m => <Riga key={m} a={fmtMese(m)} n={mesiMap[m]?.n || 0} e={mesiMap[m]?.euro || 0} max={maxMese} />)}
          </Sezione>

          <Sezione titolo="Per settimana" colonne="Ordini · Incasso" tutte={tutteSett} setTutte={setTutteSett} nascoste={settimane.length - settViste.length}>
            {settViste.map(l => <Riga key={l} a={fmtSettimana(l)} b={l === settCorr ? 'settimana in corso' : null} n={settMap[l]?.n || 0} e={settMap[l]?.euro || 0} max={maxSett} />)}
          </Sezione>

          <p className="text-[10px] text-gray-400 text-center px-2">Contano tutti gli ordini ancora salvati. Un ordine eliminato col cestino qui sotto sparisce anche da questi numeri.</p>
        </>
      )}
    </div>
  );
}

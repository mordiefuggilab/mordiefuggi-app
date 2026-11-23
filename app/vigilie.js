"use client";

// Menù d'asporto delle Vigilie (Natale e Capodanno 2026).
// I testi sono gli stessi del menù stampato: se cambia un piatto o un prezzo, va cambiato qui.
// La card in homepage sparisce da sola il 2 gennaio 2027 (decisione di Sandro).

import { useEffect, useState } from 'react';
import { ChevronLeft, Phone, MessageCircle, Download, CalendarDays, Plus, Minus, CheckCircle, ShoppingBag } from 'lucide-react';

export const VIGILIE_FINE = new Date('2027-01-02T00:00:00+01:00');
export const vigilieAttivo = (ora = new Date()) => ora < VIGILIE_FINE;

const TELEFONO = '347 7725848';
const TELEFONO_LINK = 'tel:+393477725848';
const WHATSAPP = '393477725848';

const MENU = [
  { sezione: 'Antipasti', piatti: [
    { nome: 'Insalata di mare', prezzo: '9,00' },
    { nome: 'Carpaccio di spada', prezzo: '8,50' },
    { nome: 'Carpaccio di tonno', prezzo: '9,50' },
    { nome: 'Polpette di melanzane e scamorza', dettaglio: '6 pezzi', prezzo: '7,50' },
    { nome: 'Crocchette di patate', dettaglio: '10 pezzi', prezzo: '7,00' },
    { nome: 'Quiche gorgonzola, pere e noci', dettaglio: 'intera, consigliata per 5–8 persone', prezzo: '22,00' },
    { nome: 'Quiche speck, brie e champignon freschi', dettaglio: 'intera, consigliata per 5–8 persone', prezzo: '22,00' },
  ]},
  { sezione: 'Primi piatti', piatti: [
    { nome: 'Ravioli ai crostacei', dettaglio: 'con salsa di pomodorini gialli, pomodorini confit e scorfano', prezzo: '9,50' },
    { nome: 'Taieddhra', dettaglio: 'riso, patate e cozze al forno', prezzo: '9,00' },
    { nome: 'Conchiglioni con zucchine, gamberi e salmone', prezzo: '9,00' },
    { nome: 'Mezzi paccheri alla crema di stracciatella', dettaglio: 'scorza di limone e pepe, granella di pistacchio e speck croccante', prezzo: '8,50' },
    { nome: 'Lasagna ai funghi porcini', dettaglio: 'bianca, con ragù di carne e scamorza affumicata', prezzo: '9,00' },
    { nome: 'Nidi di tagliatelle al forno', dettaglio: 'con ragù di cervo', prezzo: '8,50' },
  ]},
  { sezione: 'Secondi piatti', piatti: [
    { nome: 'Filetto di orata in crosta di pistacchi', dettaglio: 'con miele e arancia', prezzo: '9,00' },
    { nome: 'Gamberoni al brandy', dettaglio: '4 pezzi', prezzo: '9,50' },
    { nome: 'Salmone agli agrumi', prezzo: '9,50' },
    { nome: 'Baccalà al forno con patate', prezzo: '9,00' },
    { nome: 'Baccalà al sugo', prezzo: '9,00' },
    { nome: 'Arrosto di arista', dettaglio: 'con mele, prugne e castagne', prezzo: '9,00' },
    { nome: 'Costine di agnello', dettaglio: 'con patate al forno', prezzo: '9,00' },
  ]},
  { sezione: 'Contorni', piatti: [
    { nome: 'Rape stufate', prezzo: '5,00' },
    { nome: 'Cicorine saltate con olive nere', prezzo: '5,00' },
    { nome: 'Caponata', prezzo: '5,00' },
    { nome: 'Patate al forno', prezzo: '5,00' },
    { nome: 'Carote colorate (pastanache) al forno', prezzo: '5,00' },
    { nome: 'Tortini di patate e formaggio al forno', prezzo: '4,50' },
  ]},
];

const DATE = [
  { id: 'natale', festa: 'Vigilia di Natale', ritiro: 'giovedì 24 dicembre', entro: '22 dicembre',
    giorno: '24/12', chiusura: new Date('2026-12-23T00:00:00+01:00') },
  { id: 'capodanno', festa: 'Vigilia di Capodanno', ritiro: 'giovedì 31 dicembre', entro: '29 dicembre',
    giorno: '31/12', chiusura: new Date('2026-12-30T00:00:00+01:00') },
];

const euro = (n) => '€ ' + n.toFixed(2).replace('.', ',');
const prezzoNum = (p) => parseFloat(p.prezzo.replace(',', '.'));
const unita = (p, q) => (p.dettaglio?.startsWith('intera') ? (q === 1 ? 'quiche intera' : 'quiche intere') : (q === 1 ? 'porzione' : 'porzioni'));

// Card della homepage, nello stile delle altre card ma con la foto della tavolata.
export function VigilieCard({ onOpen, className = '' }) {
  return (
    <button
      onClick={onOpen}
      className={`relative overflow-hidden rounded-[2.5rem] shadow-xl text-left text-white bg-[#1B4332] min-h-[180px] ${className}`}
      aria-label="Apri il Menù delle Vigilie di Natale e Capodanno"
    >
      <img src="/vigilie/cena.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332] via-[#1B4332]/85 to-[#1B4332]/20" />
      <div className="relative p-6 pr-24">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A97A]">Novità · da asporto</p>
        <p className="font-bold text-2xl uppercase italic leading-tight mt-2">Menù delle Vigilie</p>
        <p className="text-sm font-bold italic text-white/80 mt-1">Natale e Capodanno 2026</p>
        <span className="inline-block mt-4 bg-[#C9A97A] text-[#1B4332] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">Scopri il menù →</span>
      </div>
    </button>
  );
}

function Quantita({ q, onAdd, onRemove, disabled }) {
  return (
    <div className="flex items-center gap-2 bg-[#F8F9FA] p-1.5 rounded-[2rem] border border-gray-100 shrink-0">
      {q > 0 && <button onClick={onRemove} aria-label="Togli" className="w-9 h-9 flex items-center justify-center bg-white text-[#C9A97A] rounded-full border border-gray-100"><Minus size={16} /></button>}
      {q > 0 && <span className="font-black text-sm w-4 text-center">{q}</span>}
      <button onClick={onAdd} disabled={disabled} aria-label="Aggiungi" className={`w-9 h-9 flex items-center justify-center text-white rounded-full ${disabled ? 'bg-gray-300' : 'bg-[#1B4332]'}`}><Plus size={16} /></button>
    </div>
  );
}

export function VigilieView({ onBack, onEvento = () => {} }) {
  const [step, setStep] = useState('menu'); // 'menu' | 'vassoio' | 'inviato'
  const [qta, setQta] = useState({});       // { nomePiatto: quantità }
  const [cliente, setCliente] = useState({ nome: '', telefono: '', vigilia: '', note: '' });
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => { onEvento('vigilie'); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ora = new Date();
  const aperte = DATE.filter(d => ora < d.chiusura);
  const prenotabile = aperte.length > 0;
  const tutti = MENU.flatMap(s => s.piatti);
  const righe = tutti.filter(p => qta[p.nome] > 0).map(p => ({ ...p, q: qta[p.nome], tot: prezzoNum(p) * qta[p.nome] }));
  const nPezzi = righe.reduce((a, r) => a + r.q, 0);
  const totale = righe.reduce((a, r) => a + r.tot, 0);
  const cambia = (nome, d) => setQta(prev => {
    const n = Math.max(0, Math.min(30, (prev[nome] || 0) + d));
    const next = { ...prev, [nome]: n };
    if (!n) delete next[nome];
    return next;
  });
  const vig = DATE.find(d => d.id === cliente.vigilia);
  const valido = righe.length && cliente.nome.trim() && cliente.telefono.trim() && vig && ora < vig.chiusura && privacy;
  const vai = (s) => { setStep(s); window.scrollTo(0, 0); };

  const invia = () => {
    const testo = [
      '*PRENOTAZIONE · MENÙ DELLE VIGILIE*',
      `🎄 ${vig.festa}: ritiro ${vig.ritiro} entro le 16:00`,
      `👤 ${cliente.nome.trim()}`,
      `📞 ${cliente.telefono.trim()}`,
      '',
      '🛒 *Ordine*',
      ...righe.map(r => `• ${r.q} ${unita(r, r.q)} · ${r.nome} (${euro(r.tot)})`),
      '',
      `💶 *Totale: ${euro(totale)}*`,
      ...(cliente.note.trim() ? ['', `📝 *Note:* ${cliente.note.trim()}`] : []),
      '',
      '📲 Invia questo messaggio: la prenotazione è valida dopo la nostra conferma.',
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(testo)}`, '_blank');
    if (step !== 'inviato') onEvento('vigilie_whatsapp');
    vai('inviato');
  };

  // --- Conferma ---
  if (step === 'inviato') return (
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left animate-in fade-in">
      <div className="bg-white rounded-[3rem] p-10 text-center border-4 border-[#1B4332] max-w-md mx-auto mt-10">
        <CheckCircle size={60} className="text-[#1B4332] mx-auto mb-4" />
        <h3 className="text-2xl font-black uppercase italic">Quasi fatto!</h3>
        <p className="text-sm font-bold text-gray-500 mt-3">Invia il messaggio che si è aperto su WhatsApp: ti rispondiamo noi per confermare la prenotazione.</p>
        <p className="text-xs text-gray-400 mt-3">WhatsApp non si è aperto? Chiamaci al {TELEFONO}.</p>
        <button onClick={invia} className="mt-6 w-full bg-[#2E7D32] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"><MessageCircle size={16} /> Riapri WhatsApp</button>
        <button onClick={() => { setQta({}); setCliente({ nome: '', telefono: '', vigilia: '', note: '' }); setPrivacy(false); onBack(); }} className="mt-3 w-full bg-[#EFEFED] py-4 rounded-2xl font-black uppercase text-xs">Torna alla Home</button>
      </div>
    </div>
  );

  // --- Vassoio ---
  if (step === 'vassoio') return (
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left animate-in fade-in">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => vai('menu')} className="mb-6 bg-white p-2 rounded-full border shadow-sm" aria-label="Torna al menù"><ChevronLeft size={24} /></button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A97A]">Menù delle Vigilie</p>
        <h2 className="text-3xl font-black mb-6 uppercase italic">Vassoio</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            {righe.map(r => (
              <div key={r.nome} className="flex justify-between items-center gap-3 py-3 border-b border-gray-100">
                <div>
                  <p className="font-bold text-sm leading-snug">{r.nome}</p>
                  <p className="text-xs text-gray-400">{r.q} {unita(r, r.q)} · {euro(r.tot)}</p>
                </div>
                <Quantita q={r.q} onAdd={() => cambia(r.nome, 1)} onRemove={() => cambia(r.nome, -1)} />
              </div>
            ))}
            {!righe.length && <p className="text-sm font-bold text-gray-400 py-2">Il vassoio è vuoto.</p>}
            <p className="text-2xl font-black text-right pt-4 text-[#1B4332]">Totale: {euro(totale)}</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 space-y-4 shadow-sm">
            <p className="font-black uppercase italic text-sm">Per quale Vigilia?</p>
            <div className="grid grid-cols-2 gap-3">
              {DATE.map(d => {
                const chiusa = ora >= d.chiusura;
                const sel = cliente.vigilia === d.id;
                return (
                  <button key={d.id} disabled={chiusa} onClick={() => setCliente({ ...cliente, vigilia: d.id })}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${chiusa ? 'opacity-40 border-transparent bg-gray-50' : sel ? 'border-[#1B4332] bg-[#1B4332] text-white' : 'border-transparent bg-gray-50'}`}>
                    <p className="font-black text-xs uppercase italic">{d.festa}</p>
                    <p className={`text-[11px] mt-1 ${sel ? 'text-white/80' : 'text-gray-400'}`}>{chiusa ? 'Prenotazioni chiuse' : `Ritiro ${d.giorno} entro le 16:00`}</p>
                  </button>
                );
              })}
            </div>
            <input type="text" placeholder="Nome e cognome" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} />
            <input type="tel" placeholder="Cellulare" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} />
            <textarea placeholder="Note (allergie, richieste particolari...)" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none h-24 text-sm" value={cliente.note} onChange={(e) => setCliente({ ...cliente, note: e.target.value })} />
            <label className="flex gap-3 items-center"><input type="checkbox" className="w-5 h-5" checked={privacy} onChange={() => setPrivacy(!privacy)} /><span className="text-[10px] text-gray-400 font-bold uppercase italic leading-tight">Autorizzo il trattamento dati.</span></label>
          </div>

          <p className="text-[11px] text-gray-500 font-bold text-center px-4">Premendo il pulsante si apre WhatsApp con il riepilogo: invialo e ti confermiamo noi la prenotazione.</p>
          <button onClick={invia} disabled={!valido}
            className={`w-full py-6 rounded-[2.5rem] font-black text-lg uppercase italic shadow-xl transition-all flex items-center justify-center gap-3 ${valido ? 'bg-[#2E7D32] text-white' : 'bg-gray-300 opacity-50'}`}>
            <MessageCircle size={22} /> Prenota su WhatsApp
          </button>
        </div>
      </div>
    </div>
  );

  // --- Menù ---
  return (
    <div className="min-h-screen bg-[#EFEFED] text-left animate-in fade-in pb-32">
      <div className="relative h-64 overflow-hidden">
        <img src="/vigilie/cena.jpg" alt="Tavola apparecchiata per una cena delle feste" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-[#1B4332]/60 to-transparent" />
        <button onClick={onBack} className="absolute top-6 left-6 bg-white p-2 rounded-full border shadow-sm" aria-label="Indietro"><ChevronLeft size={24} /></button>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A97A]">Cucina delle Feste · da asporto</p>
          <h2 className="text-3xl font-black uppercase italic leading-tight mt-1">Menù delle Vigilie</h2>
          <p className="text-sm font-bold italic text-white/80">Natale e Capodanno 2026</p>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <p className="text-sm font-bold italic text-gray-500 text-center px-2">Il menù lo componete voi, piatto per piatto: le giuste quantità ve le consigliamo noi.</p>

        <div className="bg-[#1B4332] text-white rounded-[2rem] p-6 space-y-4 shadow-sm">
          {DATE.map(d => (
            <div key={d.festa} className="flex gap-4 items-start">
              <div className="bg-white/10 p-3 rounded-2xl text-[#C9A97A]"><CalendarDays size={22} /></div>
              <div>
                <p className="font-black uppercase italic">{d.festa}</p>
                {ora < d.chiusura
                  ? <p className="text-sm text-white/85">Prenotazioni entro e non oltre il <b className="text-[#C9A97A]">{d.entro}</b></p>
                  : <p className="text-sm text-[#C9A97A] font-bold">Prenotazioni chiuse</p>}
                <p className="text-sm text-white/85">Ritiro {d.ritiro} entro le ore 16:00</p>
              </div>
            </div>
          ))}
        </div>

        {prenotabile && <p className="text-xs font-bold text-[#1B4332] text-center px-4">Aggiungete i piatti con il <b>+</b>, poi aprite il vassoio e inviate la prenotazione su WhatsApp.</p>}

        {MENU.map(({ sezione, piatti }) => (
          <section key={sezione} className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A97A] mb-3">{sezione}</h3>
            <ul className="divide-y divide-gray-100">
              {piatti.map(p => (
                <li key={p.nome} className="flex justify-between items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-snug">{p.nome}</p>
                    {p.dettaglio && <p className="text-xs italic text-gray-400 mt-0.5">{p.dettaglio}</p>}
                    <p className="font-black text-sm text-[#1B4332] mt-1">€ {p.prezzo}</p>
                  </div>
                  {prenotabile && <Quantita q={qta[p.nome] || 0} onAdd={() => cambia(p.nome, 1)} onRemove={() => cambia(p.nome, -1)} />}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs font-bold italic text-gray-500 text-center">Tutti i prezzi si intendono a porzione, tranne le quiche, che sono intere.</p>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm space-y-3">
          <p className="font-black uppercase italic text-center">Preferite parlarci?</p>
          <a href={TELEFONO_LINK} className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white text-xs font-black px-6 py-4 rounded-2xl uppercase tracking-widest shadow-md"><Phone size={16} /> Chiama il {TELEFONO}</a>
          <a href="/vigilie/menu-vigilie-2026.jpg" download="Menu delle Vigilie 2026 - Mordi e Fuggi.jpg" className="w-full flex items-center justify-center gap-2 bg-[#EFEFED] text-[#1B4332] text-xs font-black px-6 py-4 rounded-2xl uppercase tracking-widest"><Download size={16} /> Scarica il menù</a>
          <p className="text-[11px] text-gray-400 text-center pt-2">Mordi e Fuggi · Via Lequile, 90 · Lecce</p>
          <p className="text-[11px] text-gray-400 text-center">Informazioni su allergeni e intolleranze disponibili su richiesta.</p>
        </div>
      </div>

      {nPezzi > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-2xl mx-auto">
          <button onClick={() => vai('vassoio')} className="w-full bg-[#1B4332] text-white py-5 rounded-[2.5rem] font-black shadow-2xl flex justify-between items-center px-8">
            <span className="flex items-center gap-2"><ShoppingBag size={20} className="text-[#C9A97A]" /> {nPezzi} {nPezzi === 1 ? 'piatto' : 'piatti'} · Vassoio</span>
            <span>{euro(totale)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

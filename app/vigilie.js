"use client";

// Menù d'asporto delle Vigilie (Natale e Capodanno 2026).
// I testi sono gli stessi del menù stampato: se cambia un piatto o un prezzo, va cambiato qui.
// La card in homepage sparisce da sola dopo l'ultimo ritiro (31/12/2026 ore 16:00).

import { ChevronLeft, Phone, MessageCircle, Download, CalendarDays } from 'lucide-react';

export const VIGILIE_FINE = new Date('2026-12-31T16:00:00+01:00');
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
  { festa: 'Vigilia di Natale', ritiro: 'giovedì 24 dicembre', entro: '22 dicembre' },
  { festa: 'Vigilia di Capodanno', ritiro: 'giovedì 31 dicembre', entro: '29 dicembre' },
];

// Card della homepage, nello stile delle altre card ma con la foto della tavolata.
export function VigilieCard({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="relative overflow-hidden rounded-[2.5rem] shadow-xl text-left text-white bg-[#1B4332] min-h-[180px]"
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

export function VigilieView({ onBack }) {
  const msg = encodeURIComponent('Ciao! Vorrei prenotare dal Menù delle Vigilie per la Vigilia di ');
  return (
    <div className="min-h-screen bg-[#EFEFED] text-left animate-in fade-in">
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
                <p className="text-sm text-white/85">Prenotazioni entro e non oltre il <b className="text-[#C9A97A]">{d.entro}</b></p>
                <p className="text-sm text-white/85">Ritiro {d.ritiro} entro le ore 16:00</p>
              </div>
            </div>
          ))}
        </div>

        {MENU.map(({ sezione, piatti }) => (
          <section key={sezione} className="bg-white rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A97A] mb-3">{sezione}</h3>
            <ul className="divide-y divide-gray-100">
              {piatti.map(p => (
                <li key={p.nome} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="font-bold text-sm leading-snug">{p.nome}</p>
                    {p.dettaglio && <p className="text-xs italic text-gray-400 mt-0.5">{p.dettaglio}</p>}
                  </div>
                  <p className="font-black text-sm text-[#1B4332] whitespace-nowrap">€ {p.prezzo}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs font-bold italic text-gray-500 text-center">Tutti i prezzi si intendono a porzione, tranne le quiche, che sono intere.</p>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm space-y-3">
          <p className="font-black uppercase italic text-center">Per informazioni e prenotazioni</p>
          <a href={TELEFONO_LINK} className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white text-xs font-black px-6 py-4 rounded-2xl uppercase tracking-widest shadow-md"><Phone size={16} /> Chiama il {TELEFONO}</a>
          <a href={`https://wa.me/${WHATSAPP}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] text-white text-xs font-black px-6 py-4 rounded-2xl uppercase tracking-widest shadow-md"><MessageCircle size={16} /> Scrivici su WhatsApp</a>
          <a href="/vigilie/menu-vigilie-2026.jpg" download="Menu delle Vigilie 2026 - Mordi e Fuggi.jpg" className="w-full flex items-center justify-center gap-2 bg-[#EFEFED] text-[#1B4332] text-xs font-black px-6 py-4 rounded-2xl uppercase tracking-widest"><Download size={16} /> Scarica il menù</a>
          <p className="text-[11px] text-gray-400 text-center pt-2">Mordi e Fuggi · Via Lequile, 90 · Lecce</p>
          <p className="text-[11px] text-gray-400 text-center">Informazioni su allergeni e intolleranze disponibili su richiesta.</p>
        </div>
      </div>
    </div>
  );
}

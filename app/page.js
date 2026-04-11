"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Utensils, ChevronLeft, Plus, Minus, Search, Eye, EyeOff,
  CheckCircle, Settings, MapPin, Phone, Clock, PartyPopper, Briefcase, Trash2, AlertTriangle, Calendar, Users, Star, Check, History
} from 'lucide-react';

const supabaseUrl = 'https://gvqjifmulwtdmmaqsxom.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWppZm11bHd0ZG1tYXFzeG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzM2NDYsImV4cCI6MjA5MDgwOTY0Nn0.Zo94L4yyn7GxgEfY9Fd2owm_vLFfru2O42HwBDMlZZk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LISTA_ALLERGENI = ["Glutine", "Lattosio", "Uova", "Frutta a guscio", "Pesce", "Crostacei", "Soia", "Sedano", "Senape", "Arachidi"];
const TUO_NUMERO_WHATSAPP = "393457093827";
const LINK_MAPPA_RISTORANTE = "https://www.google.com/maps/place/Mordi+e+Fuggi+%7C+Tavola+Calda+Pinseria/@40.3419837,18.156145,17z/data=!3m1!4b1!4m6!3m5!1s0x13442f248ad1542b:0xe46d945aa4373575!8m2!3d40.3419796!4d18.1587199!16s%2Fg%2F11clyz3d31?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D";

export default function MordieFuggiApp() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [piattiGiorno, setPiattiGiorno] = useState([]);
  const [ordini, setOrdini] = useState([]);
  const [adminTab, setAdminTab] = useState('live');
  const [activeFilter, setActiveFilter] = useState("Tutti");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const ADMIN_PASSWORD = "mordi2026"; 

  const [userData, setUserData] = useState({ nome: '', telefono: '', orario: '' });
  const [newPiatto, setNewPiatto] = useState({ 
    nome: '', 
    prezzo: '', 
    categoria: 'Primi', 
    stock: 10, 
    immagine: '🥘', 
    allergeni: [] 
  });

  useEffect(() => { 
    fetchPiatti(); 
    const subscription = supabase
      .channel('ordini_cambiamenti')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordini' }, () => {
        fetchOrdini();
      })
      .subscribe();

    if (isAdminAuthenticated) fetchOrdini();
    return () => { supabase.removeChannel(subscription); };
  }, [isAdminAuthenticated]);

  async function fetchPiatti() {
    const { data } = await supabase.from('piatti').select('*').order('created_at', { ascending: false });
    if (data) setPiattiGiorno(data);
  }

  async function fetchOrdini() {
    const { data } = await supabase.from('ordini').select('*').order('created_at', { ascending: false });
    if (data) setOrdini(data);
  }

  async function aggiornaStatoOrdine(id, nuovoStato) {
    await supabase.from('ordini').update({ stato: nuovoStato }).eq('id', id);
    fetchOrdini();
  }

  async function eliminaOrdine(id) {
    if(confirm("Eliminare definitivamente l'ordine?")) {
      await supabase.from('ordini').delete().eq('id', id);
      fetchOrdini();
    }
  }

  async function togglePiattoAttivo(id, statoAttuale) {
    await supabase.from('piatti').update({ attivo: !statoAttuale }).eq('id', id);
    fetchPiatti();
  }

  async function eliminaPiatto(id) {
    if(confirm("Eliminare il piatto dal menu?")) {
      await supabase.from('piatti').delete().eq('id', id);
      fetchPiatti();
    }
  }

  async function aggiornaStockPiatto(id, attualeStock, variazione) {
    const nuovoStock = attualeStock + variazione;
    if (nuovoStock < 0) return;
    const { error } = await supabase.from('piatti').update({ stock: nuovoStock }).eq('id', id);
    if (!error) fetchPiatti();
  }

  const handleAllergeneToggle = (all) => {
    setNewPiatto(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(all) ? prev.allergeni.filter(a => a !== all) : [...prev.allergeni, all]
    }));
  };

  async function confermaPrenotazione() {
    try {
      const dettaglioOrdine = cart.map(item => `${item.nome} (x${item.qty})`).join(', ');
      const totale = cart.reduce((acc, item) => acc + (parseFloat(item.prezzo) * item.qty), 0);

      const { error: dbError } = await supabase.from('ordini').insert([{
        cliente: userData.nome,
        telefono: userData.telefono,
        orario: userData.orario,
        dettaglio: dettaglioOrdine,
        totale: totale,
        stato: 'da_preparare'
      }]);

      if (dbError) throw dbError;

      const msg = `*ORDINE MORDIEFUGGI*%0A%0A👤 *Cliente:* ${userData.nome}%0A⏰ *Orario Ritiro:* ${userData.orario}%0A🛒 *Piatti:* ${dettaglioOrdine}%0A💰 *Totale:* €${totale.toFixed(2)}`;
      
      setOrderPlaced(true);
      fetchPiatti();
      window.open(`https://wa.me/${TUO_NUMERO_WHATSAPP}?text=${msg}`, '_blank');
      
    } catch (err) { alert("Errore connessione."); }
  }

  const getOrariDisponibili = () => {
    const orari = [];
    const day = new Date().getDay();
    let start, end;

    if (day >= 1 && day <= 5) { start = 12.5; end = 15.5; }
    else if (day === 6) { start = 12; end = 14.5; }
    else return [];

    for (let t = start; t <= end; t += 0.25) {
      const h = Math.floor(t);
      const m = (t - h) * 60;
      orari.push(`${h}:${m === 0 ? '00' : m}`);
    }
    return orari;
  };

  const addToCart = (p) => {
    const current = cart.find(item => item.id === p.id);
    if (p.stock > (current?.qty || 0)) {
      if (current) setCart(cart.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      else setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    if (item?.qty > 1) setCart(cart.map(i => i.id === id ? { ...i, qty: item.qty - 1 } : i));
    else setCart(cart.filter(i => i.id !== id));
  };

  if (view === 'admin') {
    const ordiniLive = ordini.filter(o => o.stato === 'da_preparare');
    const ordiniArchivio = ordini.filter(o => o.stato === 'pronto');

    return (
      <div className="min-h-screen bg-[#F4F4F4] p-6 text-left">
        <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
        <h2 className="text-3xl font-black italic text-[#2E7D32] mb-8 uppercase text-left">Gestione</h2>
        <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-2xl">
          <button onClick={() => setAdminTab('live')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'live' ? 'bg-[#2E7D32] text-white shadow-md' : 'text-gray-500'}`}>
            <Clock size={14}/> Live ({ordiniLive.length})
          </button>
          <button onClick={() => setAdminTab('archivio')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'archivio' ? 'bg-[#C9A97A] text-white shadow-md' : 'text-gray-500'}`}>
            <History size={14}/> Archivio
          </button>
        </div>
        {adminTab === 'live' ? (
          <>
            <div className="space-y-4 mb-8">
              {ordiniLive.length === 0 ? <p className="text-gray-400 italic text-sm">Nessun ordine in arrivo...</p> : 
                ordiniLive.map(o => (
                  <div key={o.id} className="p-5 rounded-[2rem] bg-white shadow-sm border-l-8 border-[#2E7D32]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-sm uppercase">{o.cliente}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black">{o.orario}</span>
                    </div>
                    <p className="text-gray-500 text-xs font-bold mb-4">{o.dettaglio}</p>
                    <button onClick={() => aggiornaStatoOrdine(o.id, 'pronto')} className="w-full bg-[#2E7D32] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter">Segna come Pronto</button>
                  </div>
                ))
              }
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-8">
              <h3 className="text-xs font-black uppercase text-[#C9A97A] mb-4 tracking-widest italic">Nuovo Piatto</h3>
              <input type="text" placeholder="Nome Piatto" className="w-full p-4 bg-gray-50 rounded-2xl font-bold mb-4" value={newPiatto.nome} onChange={e => setNewPiatto({...newPiatto, nome: e.target.value})} />
              <div className="p-4 bg-gray-50 rounded-2xl mb-4 text-left">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 italic">Seleziona Allergeni:</p>
                <div className="flex flex-wrap gap-2">
                  {LISTA_ALLERGENI.map(all => (
                    <button key={all} onClick={() => handleAllergeneToggle(all)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${newPiatto.allergeni.includes(all) ? 'bg-[#C9A97A] text-white border-transparent' : 'bg-white text-gray-400 border-gray-100'}`}>{all}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="number" placeholder="Prezzo €" className="p-4 bg-gray-50 rounded-2xl font-bold" value={newPiatto.prezzo} onChange={e => setNewPiatto({...newPiatto, prezzo: e.target.value})} />
                <input type="number" placeholder="Stock" className="p-4 bg-gray-50 rounded-2xl font-bold" value={newPiatto.stock} onChange={e => setNewPiatto({...newPiatto, stock: e.target.value})} />
              </div>
              <button onClick={async () => {
                  await supabase.from('piatti').insert([{...newPiatto, prezzo: parseFloat(newPiatto.prezzo), stock: parseInt(newPiatto.stock), allergeni: newPiatto.allergeni.join(", "), attivo: true}]);
                  fetchPiatti(); alert("Piatto Pubblicato!");
              }} className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black uppercase italic shadow-md">Aggiungi al Menu</button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-widest italic px-2">Piatti in Menu</h3>
              {piattiGiorno.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm">
                  <div className="text-left leading-tight">
                    <p className="font-black text-xs uppercase">{p.nome}</p>
                    <div className="flex items-center gap-3 mt-2 bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
                      <button onClick={() => aggiornaStockPiatto(p.id, p.stock, -1)} className="text-[#C9A97A] active:scale-90"><Minus size={14} strokeWidth={3} /></button>
                      <span className="text-[10px] font-black w-6 text-center text-gray-600">{p.stock}</span>
                      <button onClick={() => aggiornaStockPiatto(p.id, p.stock, 1)} className="text-[#2E7D32] active:scale-90"><Plus size={14} strokeWidth={3} /></button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePiattoAttivo(p.id, p.attivo)} className={`p-2 rounded-xl ${p.attivo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{p.attivo ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
                    <button onClick={() => eliminaPiatto(p.id)} className="p-2 bg-red-50 text-red-400 rounded-xl"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4 mb-8">
            {ordiniArchivio.map(o => (
              <div key={o.id} className="p-4 rounded-2xl bg-white border border-gray-100 flex justify-between items-center">
                <div className="text-left leading-tight">
                  <p className="font-black text-[10px] uppercase text-gray-400">{new Date(o.created_at).toLocaleDateString('it-IT')}</p>
                  <p className="font-bold text-sm">{o.cliente} - €{o.totale}</p>
                  <p className="text-[10px] text-gray-400 italic">{o.dettaglio}</p>
                </div>
                <button onClick={() => eliminaOrdine(o.id)} className="text-red-300 p-2"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === 'catering') return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-left animate-in slide-in-from-right">
      <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border border-gray-200"><ChevronLeft size={24}/></button>
      <div className="flex items-center gap-3 mb-2"><PartyPopper size={28} className="text-[#2E7D32]" /><h2 className="text-3xl font-black italic text-[#2E7D32] uppercase">Catering</h2></div>
      <p className="text-gray-400 font-bold text-xs uppercase mb-8 italic tracking-widest">Portiamo il gusto dove vuoi tu</p>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 text-left">
        <div className="space-y-4">
          <div><label className="text-[10px] font-black uppercase text-[#C9A97A] ml-2 italic text-left">Referente</label><input type="text" placeholder="Nome e Cognome" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold shadow-inner mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black uppercase text-[#C9A97A] ml-2 italic">Telefono</label><input type="tel" placeholder="Cellulare" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold shadow-inner mt-1" /></div>
              <div><label className="text-[10px] font-black uppercase text-[#C9A97A] ml-2 italic">Data Evento</label><input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold shadow-inner mt-1" /></div>
          </div>
          <div><label className="text-[10px] font-black uppercase text-[#C9A97A] ml-2 italic">Note Speciali</label><textarea placeholder="Dettagli evento, numero persone, budget..." className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold h-32 shadow-inner mt-1" /></div>
        </div>
        <button onClick={() => {alert('Richiesta ricevuta!'); setView('home');}} className="w-full bg-[#2E7D32] text-white py-6 rounded-3xl font-black uppercase italic shadow-xl">Invia Richiesta</button>
      </div>
    </div>
  );

  if (view === 'contatti') return (
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left animate-in fade-in">
      <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border border-[#DEDEDE]"><ChevronLeft size={24}/></button>
      <h2 className="text-3xl font-black mb-8 italic uppercase text-left">Dove siamo</h2>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-8 text-left">
        <div className="flex gap-4">
          <MapPin className="text-[#2E7D32]" size={28} />
          <div className="text-left">
            <p className="font-black text-lg uppercase leading-tight">Via Lequile, 90</p>
            <p className="text-gray-400 text-sm font-bold italic">73100 Lecce (LE)</p>
            <a href={LINK_MAPPA_RISTORANTE} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-[#2E7D32] text-white text-[10px] font-black px-6 py-3 rounded-full uppercase tracking-widest shadow-md">Apri Mappa</a>
          </div>
        </div>
        <div className="flex gap-4 border-t pt-8 text-left">
          <Clock className="text-gray-400" size={28} />
          <div className="text-sm font-bold text-gray-600">
            <p className="text-[#C9A97A] font-black uppercase text-[10px] mb-2 italic">Orari Cucina</p>
            <p>Lun-Ven: 12:30 - 15:30</p><p>Sabato: 12:00 - 14:30</p>
          </div>
        </div>
        <div className="flex gap-4 border-t pt-8 text-left">
          <Phone className="text-[#C9A97A]" size={28} />
          <div>
            <p className="text-[10px] font-black uppercase text-[#C9A97A] mb-1 italic">Ordini telefonici</p>
            <p className="font-black text-xl">+39 376 0815909</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === 'lavora') return (
    <div className="min-h-screen bg-[#111111] p-6 text-white text-left animate-in slide-in-from-bottom">
      <button onClick={() => setView('home')} className="mb-6 bg-white/10 p-2 rounded-full"><ChevronLeft size={24}/></button>
      <h2 className="text-3xl font-bold mb-8 text-[#C9A97A] italic uppercase tracking-tighter text-left">Entra nel Team</h2>
      <div className="space-y-4">
        <input type="text" placeholder="Nome" className="w-full bg-white/10 p-4 rounded-2xl text-white font-bold border-none shadow-inner" />
        <textarea placeholder="Parlaci di te..." className="w-full bg-white/10 p-4 rounded-2xl text-white font-bold h-32 border-none shadow-inner" />
        <button onClick={() => {alert('Candidatura inviata!'); setView('home');}} className="w-full bg-[#C9A97A] text-[#111111] font-black py-5 rounded-3xl uppercase italic shadow-lg">Invia CV</button>
      </div>
    </div>
  );

  if (view === 'menu') return (
    <div className="min-h-screen bg-white p-6 pb-40 text-left animate-in fade-in">
      <button onClick={() => setView('home')} className="flex items-center gap-2 text-[#606060] mb-6 font-bold bg-[#EFEFED] px-4 py-2 rounded-full w-fit"><ChevronLeft size={20} /> Home</button>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {["Tutti", "Primi", "Secondi", "Contorni", "Bevande"].map(cat => (
          <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-[#2E7D32] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{cat}</button>
        ))}
      </div>
      {piattiGiorno.filter(p => (activeFilter === "Tutti" || p.categoria === activeFilter) && p.attivo).map(p => {
        const inCart = cart.find(item => item.id === p.id)?.qty || 0;
        return (
          <div key={p.id} className="rounded-[2.5rem] p-5 border bg-[#F8F9FA] border-[#EFEFED] shadow-sm mb-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <span className="text-4xl">{p.immagine || "🥘"}</span>
              <div className="text-left leading-tight"><p className="font-black text-[#111111] text-sm uppercase">{p.nome}</p><span className="text-[#2E7D32] font-black text-sm">€{parseFloat(p.prezzo).toFixed(2)}</span><p className="text-[10px] font-bold text-gray-400">Disp: {p.stock - inCart}</p></div>
            </div>
            <button onClick={() => addToCart(p)} disabled={p.stock - inCart <= 0} className={`p-4 text-white rounded-[1.5rem] shadow-lg ${p.stock - inCart <= 0 ? 'bg-gray-300' : 'bg-[#2E7D32]'}`}><Plus size={20} /></button>
          </div>
        );
      })}
      {cart.length > 0 && <div className="fixed bottom-6 left-6 right-6"><button onClick={() => setView('cart')} className="w-full bg-[#2E7D32] text-white py-6 rounded-[2.5rem] font-black shadow-2xl flex justify-between px-8 items-center border-t border-white/20"><div className="text-left"><span className="text-[10px] uppercase opacity-80 block font-bold italic">Vassoio</span><span className="text-lg uppercase italic">{cart.reduce((a, b) => a + b.qty, 0)} Piatti</span></div><span className="text-2xl font-black">€{cart.reduce((a, b) => a + (b.prezzo * b.qty), 0).toFixed(2)}</span></button></div>}
    </div>
  );

  if (view === 'cart') {
    const isFormValid = userData.nome.trim() !== '' && userData.telefono.trim() !== '' && userData.orario !== '';
    const total = cart.reduce((acc, item) => acc + (parseFloat(item.prezzo) * item.qty), 0);
    return (
      <div className="min-h-screen bg-[#EFEFED] p-6 text-left">
        <button onClick={() => setView('menu')} className="mb-6 bg-white p-2 rounded-full border border-[#DEDEDE]"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black mb-6 italic text-left">Il tuo vassoio</h2>
        {!orderPlaced ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm">
              {cart.map(item => (<div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 text-left"><div className="flex-1"><p className="font-black text-xs uppercase">{item.nome} (x{item.qty})</p></div><div className="flex items-center gap-4"><button onClick={() => removeFromCart(item.id)} className="text-[#2E7D32]"><Minus size={16}/></button><button onClick={() => addToCart(item)} className="text-[#2E7D32]"><Plus size={16}/></button></div></div>))}
              <p className="text-2xl font-black text-right pt-4 text-[#2E7D32]">Totale: €{total.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-6 space-y-4 shadow-sm text-left">
              <input type="text" placeholder="Nome" className="w-full p-4 bg-[#F8F9FA] rounded-xl border-none font-bold text-sm shadow-inner" value={userData.nome} onChange={(e) => setUserData({...userData, nome: e.target.value})} />
              <input type="tel" placeholder="Cellulare (es. 39345...)" className="w-full p-4 bg-[#F8F9FA] rounded-xl border-none font-bold text-sm shadow-inner" value={userData.telefono} onChange={(e) => setUserData({...userData, telefono: e.target.value})} />
              <div className="flex items-center gap-2 bg-[#F8F9FA] p-4 rounded-xl shadow-inner">
                <Clock size={16} className="text-gray-400" />
                <select 
                  className="bg-transparent border-none font-bold text-sm w-full outline-none appearance-none"
                  value={userData.orario}
                  onChange={(e) => setUserData({...userData, orario: e.target.value})}
                >
                  <option value="">Seleziona Orario Ritiro</option>
                  {getOrariDisponibili().map(ora => (
                    <option key={ora} value={ora}>{ora}</option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={confermaPrenotazione} disabled={!isFormValid} className={`w-full py-6 rounded-[2.5rem] font-black text-xl uppercase italic shadow-xl ${isFormValid ? 'bg-[#2E7D32] text-white' : 'bg-gray-300 text-gray-500'}`}>Ordina ora</button>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center border-4 border-[#2E7D32]">
            <CheckCircle size={60} className="text-[#2E7D32] mx-auto mb-4" /><h3 className="text-3xl font-black uppercase italic">Prenotato!</h3>
            <button onClick={() => {setView('home'); setCart([]); setOrderPlaced(false);}} className="mt-6 w-full bg-[#EFEFED] py-4 rounded-2xl font-black text-[#606060] uppercase text-xs">Torna alla Home</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFED] p-6 font-sans text-[#111111] text-left animate-in fade-in">
      <header className="flex justify-between items-center mb-10">
        <div className="text-2xl font-bold tracking-tighter text-[#2E7D32]">mordi<span className="text-[#C9A97A] italic text-xl mx-0.5">e</span>fuggi</div>
        <button onClick={() => { const pass = prompt("Password Admin:"); if (pass === ADMIN_PASSWORD) { setIsAdminAuthenticated(true); setView('admin'); } else alert("Errata!"); }} className="p-2 bg-white rounded-full border border-[#DEDEDE] text-[#606060] shadow-sm active:scale-95 transition-all"><Settings size={20}/></button>
      </header>
      <h1 className="text-4xl font-extrabold mb-10 leading-[1.1] italic uppercase tracking-tighter text-left">Cucina fresca,<br />ritmo <span className="text-[#C9A97A]">veloce</span>.</h1>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => setView('menu')} className="bg-white p-6 rounded-[2.5rem] border border-[#DEDEDE] flex items-center gap-6 shadow-sm active:scale-95 transition-all text-left"><div className="bg-[#2E7D32]/10 p-4 rounded-2xl text-[#2E7D32]"><Utensils size={32} /></div><div className="font-bold text-xl uppercase tracking-tighter">Menù del Giorno</div></button>
        <button onClick={() => setView('catering')} className="bg-white p-6 rounded-[2.5rem] border border-[#DEDEDE] flex items-center gap-6 shadow-sm active:scale-95 transition-all text-left"><div className="bg-[#C9A97A]/10 p-4 rounded-2xl text-[#C9A97A]"><PartyPopper size={32} /></div><div className="font-bold text-xl uppercase tracking-tighter">Catering & Eventi</div></button>
        <button onClick={() => setView('contatti')} className="bg-white p-6 rounded-[2.5rem] border border-[#DEDEDE] flex items-center gap-6 shadow-sm active:scale-95 transition-all text-left"><div className="bg-gray-100 p-4 rounded-2xl text-gray-400"><MapPin size={32} /></div><div className="font-bold text-xl uppercase tracking-tighter">Dove Siamo</div></button>
        <button onClick={() => setView('lavora')} className="bg-[#111111] text-white p-6 rounded-[2.5rem] flex items-center gap-6 active:scale-95 shadow-xl mt-4 text-left"><div className="bg-white/10 p-4 rounded-2xl text-[#C9A97A]"><Briefcase size={32} /></div><div className="font-bold text-xl uppercase tracking-tighter">Lavora con noi</div></button>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Utensils, ChevronLeft, Plus, Minus, Eye,
  CheckCircle, Settings, MapPin, Phone, Clock, PartyPopper, Briefcase, Trash2, ClipboardList, History, Lock, Power
} from 'lucide-react';

// --- CONFIGURAZIONE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvqjifmulwtdmmaqsxom.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWppZm11bHd0ZG1tYXFzeG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzM2NDYsImV4cCI6MjA5MDgwOTY0Nn0.Zo94L4yyn7GxgEfY9Fd2owm_vLFfru2O42HwBDMlZZk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LISTA_ALLERGENI = ["Glutine", "Lattosio", "Uova", "Frutta a guscio", "Pesce", "Crostacei", "Soia", "Sedano", "Senape", "Arachidi"];
const TUO_NUMERO_WHATSAPP = "393760815909";
const LINK_MAPPA_RISTORANTE = "https://www.google.com/maps/place/Mordi+e+Fuggi+%7C+Tavola+Calda+Pinseria/@40.3419837,18.156145,17z/data=!3m1!4b1!4m6!3m5!1s0x13442f248ad1542b:0xe46d945aa4373575!8m2!3d40.3419796!4d18.1587199!16s%2Fg%2F11clyz3d31?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D";
const ADMIN_PASSWORD = "mordi2026";

const CATEGORY_ORDER = { 'Primi': 1, 'Secondi': 2, 'Contorni': 3, 'Bevande': 4 };
const CATEGORY_EMOJI = { 'Primi': '🍝', 'Secondi': '🍗', 'Contorni': '🥗', 'Bevande': '🥤', 'default': '🥘' };

export default function MordieFuggiApp() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [piattiGiorno, setPiattiGiorno] = useState([]);
  const [ordini, setOrdini] = useState([]);
  const [richiesteCatering, setRichiesteCatering] = useState([]);
  const [adminTab, setAdminTab] = useState('live');
  const [activeFilter, setActiveFilter] = useState("Tutti");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("Tutti");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isCucinaAperta, setIsCucinaAperta] = useState(true);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPass, setLoginPass] = useState("");

  const [userData, setUserData] = useState({ nome: '', telefono: '', orario: '' });
  const [newPiatto, setNewPiatto] = useState({ nome: '', prezzo: '', categoria: 'Primi', stock: 10, immagine: '🥘', allergeni: [] });
  
  const [candidatura, setCandidatura] = useState({ nome: '', telefono: '', messaggio: '' });

  const prevOrdiniCount = useRef(0);

  useEffect(() => { 
    fetchPiatti(); 
    fetchImpostazioni();
    fetchOrdini();
    const subscription = supabase
      .channel('db_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordini' }, fetchOrdini)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'piatti' }, fetchPiatti)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'impostazioni' }, fetchImpostazioni)
      .subscribe();

    if (isAdminAuthenticated) { fetchCatering(); }
    return () => { 
      supabase.removeChannel(subscription); 
    };
  }, [isAdminAuthenticated]);

  const fetchPiatti = async () => {
    const { data } = await supabase.from('piatti').select('*');
    if (data) setPiattiGiorno(data);
  };

  const fetchImpostazioni = async () => {
    const { data } = await supabase.from('impostazioni').select('*').eq('chiave', 'cucina_aperta').single();
    if (data) setIsCucinaAperta(data.valore === 'true');
  };

  const toggleCucina = async () => {
    const nuovoStato = !isCucinaAperta;
    await supabase.from('impostazioni').update({ valore: nuovoStato.toString() }).eq('chiave', 'cucina_aperta');
    setIsCucinaAperta(nuovoStato);
  };

  const fetchOrdini = async () => {
    const { data } = await supabase.from('ordini').select('*').order('created_at', { ascending: false });
    if (data) {
      if (isAdminAuthenticated && view === 'admin' && data.length > prevOrdiniCount.current && prevOrdiniCount.current !== 0) {
        playNotificationSound();
      }
      prevOrdiniCount.current = data.length;
      setOrdini(data);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.log("Audio non abilitato", e); }
  };

  const fetchCatering = async () => {
    const { data } = await supabase.from('richieste_catering').select('*').order('created_at', { ascending: false });
    if (data) setRichiesteCatering(data);
  };

  const getEmoji = (cat) => CATEGORY_EMOJI[cat] || CATEGORY_EMOJI.default;

  const filteredAndSortedMenu = useMemo(() => {
    return piattiGiorno
      .filter(p => (activeFilter === "Tutti" || p.categoria === activeFilter) && p.attivo)
      .sort((a, b) => (CATEGORY_ORDER[a.categoria] || 99) - (CATEGORY_ORDER[b.categoria] || 99));
  }, [piattiGiorno, activeFilter]);

  const handleAllergeneToggle = (all) => {
    setNewPiatto(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(all) ? prev.allergeni.filter(a => a !== all) : [...prev.allergeni, all]
    }));
  };

  const addToCart = (p) => {
    if (!isCucinaAperta) return;
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

  const handleUpdateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    const { error } = await supabase.from('piatti').update({ stock: newStock }).eq('id', id);
    if (!error) fetchPiatti();
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    const { error } = await supabase.from('piatti').update({ attivo: !currentStatus }).eq('id', id);
    if (!error) fetchPiatti();
  };

  const getOrariDisponibili = () => {
    const orari = [];
    const day = new Date().getDay();
    let start, end;
    if (day >= 1 && day <= 5) { start = 12.5; end = 15.5; }
    else if (day === 6) { start = 12; end = 14.5; }
    else return [];

    const conteggioSlot = ordini
      .filter(o => o.stato === 'da_preparare')
      .reduce((acc, curr) => {
        acc[curr.orario] = (acc[curr.orario] || 0) + 1;
        return acc;
      }, {});
    for (let t = start; t <= end; t += 0.25) {
      const h = Math.floor(t);
      const m = (t - h) * 60;
      const fascia = `${h}:${m === 0 ? '00' : m}`;
      if ((conteggioSlot[fascia] || 0) < 3) {
        orari.push(fascia);
      }
    }
    return orari;
  };

  // --- VISTA ADMIN ---
  if (view === 'admin') {
    const ordiniLive = ordini.filter(o => o.stato === 'da_preparare');
    const ordiniArchivio = ordini.filter(o => o.stato === 'pronto');
    return (
      <div className="min-h-screen bg-[#F4F4F4] p-6 text-left">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('home')} className="bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
          <button onClick={toggleCucina} className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase shadow-sm transition-all ${isCucinaAperta ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
             <Power size={14} /> {isCucinaAperta ? 'Cucina Aperta' : 'Cucina in Pausa'}
          </button>
        </div>
        <h2 className="text-3xl font-black italic text-[#2E7D32] mb-8 uppercase">Gestione</h2>
        <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-2xl">
          <button onClick={() => setAdminTab('live')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'live' ? 'bg-[#2E7D32] text-white shadow-md' : 'text-gray-500'}`}><Clock size={14}/> Live</button>
          <button onClick={() => setAdminTab('catering')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'catering' ? 'bg-[#2E7D32] text-white shadow-md' : 'text-gray-500'}`}><ClipboardList size={14}/> Catering</button>
          <button onClick={() => setAdminTab('archivio')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'archivio' ? 'bg-[#C9A97A] text-white shadow-md' : 'text-gray-500'}`}><History size={14}/> Archivio</button>
        </div>

        {adminTab === 'live' && (
          <>
            <div className="space-y-4 mb-8">
              {ordiniLive.map(o => (
                <div key={o.id} className="p-5 rounded-[2rem] bg-white shadow-sm border-l-8 border-[#2E7D32]">
                  <div className="flex justify-between items-start mb-2"><span className="font-black text-sm uppercase">{o.cliente}</span><span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black">{o.orario}</span></div>
                  <p className="text-gray-500 text-xs font-bold mb-4">{o.dettaglio}</p>
                  <button onClick={() => supabase.from('ordini').update({ stato: 'pronto' }).eq('id', o.id).then(fetchOrdini)} className="w-full bg-[#2E7D32] text-white py-3 rounded-xl text-[10px] font-black uppercase">Segna Pronto</button>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-8">
              <h3 className="text-xs font-black uppercase text-[#C9A97A] mb-4 italic">Nuovo Piatto</h3>
              <input type="text" placeholder="Nome" className="w-full p-4 bg-gray-50 rounded-2xl font-bold mb-4 shadow-inner outline-none" value={newPiatto.nome} onChange={e => setNewPiatto({...newPiatto, nome: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold mb-4 shadow-inner outline-none appearance-none" value={newPiatto.categoria} onChange={e => setNewPiatto({...newPiatto, categoria: e.target.value})}><option value="Primi">Primi</option><option value="Secondi">Secondi</option><option value="Contorni">Contorni</option><option value="Bevande">Bevande</option></select>
              <div className="p-4 bg-gray-50 rounded-2xl mb-4 text-left shadow-inner">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 italic">Allergeni:</p>
                <div className="flex flex-wrap gap-2">
                  {LISTA_ALLERGENI.map(all => (
                    <button key={all} onClick={() => handleAllergeneToggle(all)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${newPiatto.allergeni.includes(all) ? 'bg-[#C9A97A] text-white border-transparent' : 'bg-white text-gray-400 border-gray-100'}`}>{all}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4"><input type="number" placeholder="Prezzo" className="p-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none" value={newPiatto.prezzo} onChange={e => setNewPiatto({...newPiatto, prezzo: e.target.value})} /><input type="number" placeholder="Stock" className="p-4 bg-gray-50 rounded-2xl font-bold shadow-inner outline-none" value={newPiatto.stock} onChange={e => setNewPiatto({...newPiatto, stock: e.target.value})} /></div>
              
              <button onClick={async () => { 
                  if(!newPiatto.nome || !newPiatto.prezzo) return alert("Compila tutto"); 
                  const payload = {
                    nome: newPiatto.nome,
                    categoria: newPiatto.categoria,
                    prezzo: parseFloat(newPiatto.prezzo),
                    stock: parseInt(newPiatto.stock),
                    allergeni: newPiatto.allergeni.join(", "),
                    attivo: true,
                    immagine: '🥘'
                  };
                  const { error } = await supabase.from('piatti').insert([payload]);
                  if (!error) {
                    await fetchPiatti();
                    setNewPiatto({nome:'', prezzo:'', categoria:'Primi', stock:10, immagine:'🥘', allergeni:[]});
                  } else {
                    alert("Errore inserimento!");
                  }
              }} className="w-full bg-[#2E7D32] text-white py-5 rounded-2xl font-black uppercase italic shadow-md">Aggiungi</button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["Tutti", "Primi", "Secondi", "Contorni", "Bevande"].map(cat => (
                  <button key={cat} onClick={() => setAdminCategoryFilter(cat)} className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase transition-all whitespace-nowrap ${adminCategoryFilter === cat ? 'bg-[#C9A97A] text-white shadow-sm' : 'bg-white text-gray-400 border border-gray-100'}`}>{cat}</button>
                ))}
              </div>
              <input type="text" placeholder="Cerca piatti..." className="w-full p-4 bg-white rounded-2xl font-bold text-sm shadow-sm outline-none" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
              {piattiGiorno.filter(p => (adminCategoryFilter === "Tutti" || p.categoria === adminCategoryFilter)).filter(p => p.nome.toLowerCase().includes(searchQuery)).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getEmoji(p.categoria)}</span>
                    <div className="text-left">
                      <p className="font-black text-xs uppercase leading-tight">{p.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[9px] font-black text-[#C9A97A] uppercase">{p.categoria}</p>
                        <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-xl">
                          <button onClick={() => handleUpdateStock(p.id, p.stock, -1)} className="p-1 text-red-500 hover:bg-white rounded-md shadow-sm transition-all"><Minus size={12} /></button>
                          <span className="text-[10px] font-black w-6 text-center">{p.stock}</span>
                          <button onClick={() => handleUpdateStock(p.id, p.stock, 1)} className="p-1 text-green-500 hover:bg-white rounded-md shadow-sm transition-all"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleVisibility(p.id, p.attivo)} className={`p-2 rounded-xl transition-all shadow-sm ${p.attivo ? 'text-green-600 bg-green-50 border border-green-100' : 'text-gray-300 bg-gray-50 border border-gray-100'}`}>
                      <Eye size={18}/>
                    </button>
                    <button onClick={() => confirm("Eliminare?") && supabase.from('piatti').delete().eq('id', p.id).then(fetchPiatti)} className="p-2 text-red-400 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors border border-red-50">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {adminTab === 'catering' && richiesteCatering.map(r => (
          <div key={r.id} className="p-5 rounded-[2rem] bg-white shadow-sm border-l-8 border-[#C9A97A] mb-4">
            <p className="font-black text-sm uppercase">{r.referente}</p>
            <p className="text-[10px] font-black text-[#C9A97A] mb-2">{r.tipo_evento} - {r.data_evento}</p>
            <div className="flex gap-2"><a href={`https://wa.me/${r.telefono}`} className="flex-1 bg-[#2E7D32] text-white py-2 rounded-xl text-center text-[10px] font-black uppercase">Contatta</a><button onClick={() => supabase.from('richieste_catering').delete().eq('id', r.id).then(fetchCatering)} className="p-2 text-red-400"><Trash2 size={16}/></button></div>
          </div>
        ))}
        {adminTab === 'archivio' && ordiniArchivio.map(o => (<div key={o.id} className="p-4 rounded-2xl bg-white flex justify-between items-center mb-2"><div className="text-left leading-tight"><p className="font-bold text-sm">{o.cliente}</p><p className="text-[10px] text-gray-400 italic">{o.dettaglio}</p></div><button onClick={() => supabase.from('ordini').delete().eq('id', o.id).then(fetchOrdini)} className="text-red-300"><Trash2 size={16}/></button></div>))}
      </div>
    );
  }

  // --- VISTA CATERING ---
  if (view === 'catering') {
    const inviaCatering = async () => {
      const nomeCat = document.getElementById('cat-nome')?.value;
      const tipoCat = document.getElementById('cat-tipo')?.value;
      const telCat = document.getElementById('cat-tel')?.value;
      const dataCat = document.getElementById('cat-data')?.value;
      const noteCat = document.getElementById('cat-note')?.value;
      if(!nomeCat || !tipoCat || !telCat) return alert("Campi obbligatori mancanti!");
      await supabase.from('richieste_catering').insert([{ referente: nomeCat, tipo_evento: tipoCat, telefono: telCat, data_evento: dataCat, note: noteCat }]);
      window.open(`https://wa.me/${TUO_NUMERO_WHATSAPP}?text=*RICHIESTA CATERING*%0A👤 *Referente:* ${nomeCat}%0A🎉 *Evento:* ${tipoCat}%0A📅 *Data:* ${dataCat}%0A📝 *Note:* ${noteCat}%0A%0A📲 *Invia questo messaggio per confermare la richiesta!*`, '_blank');
      setView('home');
    };
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6 text-left">
        <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border shadow-sm"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black italic text-[#2E7D32] uppercase mb-8">Catering</h2>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-4">
          <input id="cat-nome" type="text" placeholder="Referente *" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <select id="cat-tipo" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none appearance-none">
            <option value="">Tipo Evento *</option>
            <option value="Meeting">Meeting</option>
            <option value="Cena">Cena</option>
            <option value="Ricorrenza">Ricorrenza</option>
            <option value="Altro">Altro</option>
          </select>
          <input id="cat-tel" type="tel" placeholder="Cellulare *" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <input id="cat-data" type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" />
          <textarea id="cat-note" placeholder="Note..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-32 outline-none" />
          <button onClick={inviaCatering} className="w-full bg-[#2E7D32] text-white py-6 rounded-3xl font-black uppercase italic shadow-xl">Invia Richiesta</button>
        </div>
      </div>
    );
  }

  // --- VISTA MENU ---
  if (view === 'menu') return (
    <div className="min-h-screen bg-white p-6 pb-40 text-left">
      <button onClick={() => setView('home')} className="flex items-center gap-2 text-[#606060] mb-6 font-bold bg-[#EFEFED] px-4 py-2 rounded-full"><ChevronLeft size={20} /> Home</button>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">{["Tutti", "Primi", "Secondi", "Contorni", "Bevande"].map(cat => (<button key={cat} onClick={() => setActiveFilter(cat)} className={`px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all ${activeFilter === cat ? 'bg-[#2E7D32] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{cat}</button>))}</div>
      {filteredAndSortedMenu.map(p => {
        const inCart = cart.find(item => item.id === p.id)?.qty || 0;
        return (
          <div key={p.id} className={`rounded-[2.5rem] p-5 border shadow-sm mb-4 flex justify-between items-center transition-opacity ${!isCucinaAperta ? 'opacity-60 grayscale' : 'bg-[#F8F9FA] border-[#EFEFED]'}`}>
            <div className="flex gap-4 items-center">
              <span className="text-4xl">{getEmoji(p.categoria)}</span>
              <div className="text-left leading-tight">
                <p className="font-black text-sm uppercase">{p.nome}</p>
                {p.allergeni && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.allergeni.split(', ').map((all, idx) => (
                      <span key={idx} className="text-[8px] font-bold text-gray-400 uppercase border border-gray-200 px-1.5 py-0.5 rounded-md">{all}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#2E7D32] font-black text-sm">€{parseFloat(p.prezzo).toFixed(2)}</span>
                  <span className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 uppercase">Disp: {p.stock}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-gray-100">
              {inCart > 0 && <button onClick={() => removeFromCart(p.id)} className="w-10 h-10 flex items-center justify-center bg-gray-100 text-[#C9A97A] rounded-full"><Minus size={18}/></button>}
              {inCart > 0 && <span className="font-black text-sm">{inCart}</span>}
              <button onClick={() => addToCart(p)} disabled={!isCucinaAperta || p.stock - inCart <= 0} className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${!isCucinaAperta || p.stock - inCart <= 0 ? 'bg-gray-300' : 'bg-[#2E7D32]'}`}><Plus size={18}/></button>
            </div>
          </div>
        );
      })}
      {!isCucinaAperta && <div className="fixed bottom-6 left-6 right-6 bg-red-600 text-white p-5 rounded-[2rem] text-center shadow-2xl animate-bounce"><p className="font-black uppercase italic text-xs tracking-widest">Cucina in pausa. Torneremo operativi a breve!</p></div>}
      {cart.length > 0 && isCucinaAperta && <div className="fixed bottom-6 left-6 right-6"><button onClick={() => setView('cart')} className="w-full bg-[#2E7D32] text-white py-6 rounded-[2.5rem] font-black shadow-2xl flex justify-between px-8"><span>{cart.reduce((a, b) => a + b.qty, 0)} Piatti</span><span>€{cart.reduce((a, b) => a + (b.prezzo * b.qty), 0).toFixed(2)}</span></button></div>}
    </div>
  );

  // --- VISTA HOME ---
  if (view === 'home') return (
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left">
      <header className="flex justify-between items-center mb-10">
        <div className="text-2xl font-bold tracking-tighter text-[#2E7D32]">mordi<span className="text-[#C9A97A] italic text-xl mx-0.5">e</span>fuggi</div>
        <button onClick={() => setShowLoginModal(true)} className="p-2 bg-white rounded-full border shadow-sm"><Settings size={20}/></button>
      </header>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center relative shadow-2xl">
            <button onClick={() => {setShowLoginModal(false); setLoginPass("");}} className="absolute top-6 right-6 text-gray-300"><Plus className="rotate-45" /></button>
            <div className="bg-[#2E7D32]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-[#2E7D32]" size={28} /></div>
            <h3 className="text-xl font-black uppercase italic mb-2">Area Riservata</h3>
            <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Password</p>
            <input type="password" autoFocus className="w-full p-5 bg-gray-50 rounded-2xl text-center font-black text-2xl tracking-[1em] outline-none border-2 border-transparent focus:border-[#2E7D32] mb-6 transition-all" value={loginPass} onChange={(e) => { const val = e.target.value; setLoginPass(val); if(val === ADMIN_PASSWORD) { setIsAdminAuthenticated(true); setView('admin'); setShowLoginModal(false); setLoginPass(""); } }} />
          </div>
        </div>
      )}
      <h1 className="text-4xl font-extrabold mb-10 italic uppercase tracking-tighter leading-tight">Cucina fresca,<br />ritmo <span className="text-[#C9A97A]">veloce</span>.</h1>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => setView('menu')} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm"><div className="bg-[#2E7D32]/10 p-4 rounded-2xl text-[#2E7D32]"><Utensils size={32} /></div><div className="font-bold text-xl uppercase italic">Menù del Giorno</div></button>
        <button onClick={() => setView('catering')} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm"><div className="bg-[#C9A97A]/10 p-4 rounded-2xl text-[#C9A97A]"><PartyPopper size={32} /></div><div className="font-bold text-xl uppercase italic">Catering & Eventi</div></button>
        <button onClick={() => setView('contatti')} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm"><div className="bg-gray-100 p-4 rounded-2xl text-gray-400"><MapPin size={32} /></div><div className="font-bold text-xl uppercase italic">Dove Siamo</div></button>
        <button onClick={() => setView('lavora')} className="bg-[#111111] text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-xl mt-4"><div className="bg-white/10 p-4 rounded-2xl text-[#C9A97A]"><Briefcase size={32} /></div><div className="font-bold text-xl uppercase italic">Lavora con noi</div></button>
      </div>
    </div>
  );

  // --- VISTA VASSOIO ---
  if (view === 'cart') {
    const isFormValid = userData.nome && userData.telefono && userData.orario && privacyAccepted && isCucinaAperta;
    return (
      <div className="min-h-screen bg-[#EFEFED] p-6 text-left">
        <button onClick={() => setView('menu')} className="mb-6 bg-white p-2 rounded-full border shadow-sm"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black mb-6 uppercase italic">Vassoio</h2>
        {!orderPlaced ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm">
              {cart.map(item => (<div key={item.id} className="flex justify-between py-2 border-b"><p className="font-black text-xs uppercase">{item.nome} x{item.qty}</p><p className="font-black">€{(item.prezzo * item.qty).toFixed(2)}</p></div>))}
              <p className="text-2xl font-black text-right pt-4 text-[#2E7D32]">Totale: €{cart.reduce((a, b) => a + (b.prezzo * b.qty), 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-6 space-y-4 shadow-sm">
              <input type="text" placeholder="Nome" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" value={userData.nome} onChange={(e) => setUserData({...userData, nome: e.target.value})} />
              <input type="tel" placeholder="Cellulare" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none" value={userData.telefono} onChange={(e) => setUserData({...userData, telefono: e.target.value})} />
              <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none appearance-none" value={userData.orario} onChange={(e) => setUserData({...userData, orario: e.target.value})}><option value="">Orario Ritiro</option>{getOrariDisponibili().map(ora => (<option key={ora} value={ora}>{ora}</option>))}</select>
              <div className="flex gap-3 text-left items-center"><input type="checkbox" className="w-5 h-5" checked={privacyAccepted} onChange={() => setPrivacyAccepted(!privacyAccepted)} /><p className="text-[10px] text-gray-400 font-bold uppercase italic leading-tight">Autorizzo il trattamento dati.</p></div>
            </div>
            <button onClick={async () => { 
              await supabase.from('ordini').insert([{ cliente: userData.nome, telefono: userData.telefono, orario: userData.orario, dettaglio: cart.map(i => `${i.nome} x${i.qty}`).join(', '), totale: cart.reduce((a, b) => a + (b.prezzo * b.qty), 0), stato: 'da_preparare' }]);
              for (const item of cart) { await supabase.from('piatti').update({ stock: item.stock - item.qty }).eq('id', item.id); }
              setOrderPlaced(true);
              window.open(`https://wa.me/${TUO_NUMERO_WHATSAPP}?text=*ORDINE*%0A👤 ${userData.nome}%0A⏰ ${userData.orario}%0A🛒 ${cart.map(i => `${i.nome} x${i.qty}`).join(', ')}%0A%0A📲 *Invia questo messaggio per confermare!*`, '_blank');
            }} disabled={!isFormValid} className={`w-full py-6 rounded-[2.5rem] font-black text-xl uppercase italic shadow-xl transition-all ${isFormValid ? 'bg-[#2E7D32] text-white' : 'bg-gray-300 grayscale opacity-50'}`}>Ordina</button>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center border-4 border-[#2E7D32] animate-in zoom-in"><CheckCircle size={60} className="text-[#2E7D32] mx-auto mb-4" /><h3 className="text-3xl font-black uppercase italic">Prenotato!</h3><button onClick={() => {setView('home'); setCart([]); setOrderPlaced(false);}} className="mt-6 w-full bg-[#EFEFED] py-4 rounded-2xl font-black uppercase text-xs">Torna alla Home</button></div>
        )}
      </div>
    );
  }

  // --- VISTA DOVE SIAMO ---
  if (view === 'contatti') return ( 
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left animate-in fade-in"> 
      <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border border-[#DEDEDE]"><ChevronLeft size={24}/></button> 
      <h2 className="text-3xl font-black mb-8 italic uppercase">Dove siamo</h2> 
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6"> 
          <div className="flex gap-4"> 
            <MapPin className="text-[#2E7D32]" size={28} /> 
            <div className="text-left"> 
              <p className="font-black text-lg uppercase leading-tight">Via Lequile, 90</p> 
              <p className="text-gray-400 text-sm font-bold italic">73100 Lecce (LE)</p> 
            </div> 
          </div>
          <a href={LINK_MAPPA_RISTORANTE} target="_blank" rel="noopener noreferrer" className="w-full text-center italic bg-[#2E7D32] text-white text-[10px] font-black px-6 py-4 rounded-2xl uppercase tracking-widest shadow-md">Apri Mappa</a> 
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex gap-4 items-center"> 
          <Phone className="text-[#2E7D32]" size={28} /> 
          <div className="text-left"><p className="font-black text-lg uppercase leading-tight">Chiamaci</p><p className="text-gray-400 text-sm font-bold italic">+39 376 0815909</p></div> 
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm"> 
          <div className="flex gap-4 items-start mb-6"> 
            <Clock className="text-[#C9A97A]" size={28} /> 
            <div className="text-left"><p className="font-black text-lg uppercase leading-tight">Orari Apertura</p><p className="text-gray-400 text-sm font-bold italic">Sempre freschi</p></div> 
          </div>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-50 pb-2"><span className="font-bold text-xs uppercase">Lun - Ven</span><span className="font-black text-xs text-[#2E7D32]">12:30 - 15:30</span></div>
            <div className="flex justify-between border-b border-gray-50 pb-2"><span className="font-bold text-xs uppercase">Sabato</span><span className="font-black text-xs text-[#2E7D32]">12:00 - 14:30</span></div>
            <div className="flex justify-between text-gray-300"><span className="font-bold text-xs uppercase">Domenica</span><span className="font-black text-xs">Chiuso</span></div>
          </div>
        </div>
      </div> 
    </div> 
  );

  // --- VISTA LAVORA CON NOI ---
  if (view === 'lavora') {
    const inviaCandidatura = async () => {
      if (!candidatura.nome || !candidatura.telefono || !candidatura.messaggio) {
        return alert("Per favore, compila tutti i campi!");
      }
      const { error } = await supabase.from('candidature').insert([
        { nome: candidatura.nome, telefono: candidatura.telefono, messaggio: candidatura.messaggio }
      ]);
      if (error) {
        alert("Errore invio!");
      } else {
        alert('Candidatura ricevuta!');
        setCandidatura({ nome: '', telefono: '', messaggio: '' });
        setView('home');
      }
    };
    return ( 
      <div className="min-h-screen bg-[#111111] p-6 text-white text-left"> 
        <button onClick={() => setView('home')} className="mb-6 bg-white/10 p-2 rounded-full"><ChevronLeft size={24}/></button> 
        <h2 className="text-3xl font-bold mb-8 text-[#C9A97A] italic uppercase">Entra nel Team</h2> 
        <div className="space-y-4"> 
          <input type="text" placeholder="Nome *" className="w-full bg-white/10 p-4 rounded-2xl text-white font-bold outline-none" value={candidatura.nome} onChange={(e) => setCandidatura({...candidatura, nome: e.target.value})} /> 
          <input type="tel" placeholder="Telefono *" className="w-full bg-white/10 p-4 rounded-2xl text-white font-bold outline-none" value={candidatura.telefono} onChange={(e) => setCandidatura({...candidatura, telefono: e.target.value})} /> 
          <textarea placeholder="Parlaci di te *" className="w-full bg-white/10 p-4 rounded-2xl text-white font-bold h-32 outline-none" value={candidatura.messaggio} onChange={(e) => setCandidatura({...candidatura, messaggio: e.target.value})} /> 
          <button onClick={inviaCandidatura} className="w-full bg-[#C9A97A] text-[#111111] font-black py-5 rounded-3xl uppercase italic shadow-2xl">Invia Candidatura</button> 
        </div> 
      </div> 
    );
  }

  return null;
}

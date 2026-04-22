"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Utensils, ChevronLeft, Plus, Minus, Eye,
  CheckCircle, Settings, MapPin, Phone, Clock, PartyPopper, Briefcase, Trash2, ClipboardList, History, Lock, Power, TrendingUp, Download, BookOpen
} from 'lucide-react';

// --- CONFIGURAZIONE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvqjifmulwtdmmaqsxom.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cWppZm11bHd0ZG1tYXFzeG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzM2NDYsImV4cCI6MjA5MDgwOTY0Nn0.Zo94L4yyn7GxgEfY9Fd2owm_vLFfru2O42HwBDMlZZk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const LISTA_ALLERGENI = ["Glutine", "Lattosio", "Uova", "Frutta a guscio", "Pesce", "Crostacei", "Soia", "Sedano", "Senape", "Arachidi", "Aglio", "Cipolla", "Olio di girasole", "Solfiti", "Pepe"];
const TUO_NUMERO_WHATSAPP = "393477725848";
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

  const [userData, setUserData] = useState({ nome: '', telefono: '', orario: '', note: '' });
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
          <button onClick={() => setAdminTab('statistiche')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${adminTab === 'statistiche' ? 'bg-[#2196F3] text-white shadow-md' : 'text-gray-500'}`}>📊 Stats</button>
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
        {adminTab === 'statistiche' && (() => {
  const oggi = new Date();
  oggi.setHours(0,0,0,0);
  const inizioSettimana = new Date(oggi);
  inizioSettimana.setDate(oggi.getDate() - oggi.getDay());
  const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1);

  const parseData = (d) => new Date(d);

  const ordiniOggi = ordini.filter(o => parseData(o.created_at) >= oggi);
  const ordiniSettimana = ordini.filter(o => parseData(o.created_at) >= inizioSettimana);
  const ordiniMese = ordini.filter(o => parseData(o.created_at) >= inizioMese);

  const incasso = (lista) => lista.reduce((a, o) => a + (parseFloat(o.totale) || 0), 0).toFixed(2);

 // Piatti più ordinati
const conteggiopiatti = {};
ordini.forEach(o => {
  if (!o.dettaglio) return;
  o.dettaglio.split(/ x\d+,\s*/).forEach((voce, idx, arr) => {
    const match = voce.match(/^(.+?) x(\d+)$/) || (idx < arr.length - 1 ? [null, voce, '1'] : null);
    if (!match) return;
    const nome = match[1].replace(/[\(\)]/g, '').replace(/,\s*$/, '').trim();
    const qty = parseInt(match[2]) || 1;
    conteggiopiatti[nome] = (conteggiopiatti[nome] || 0) + qty;
  });
});
const topPiatti = Object.entries(conteggiopiatti).sort((a,b) => b[1]-a[1]).slice(0,5);

  // Orario di punta
  const conteggioOrari = {};
  ordini.forEach(o => {
    if (o.orario) conteggioOrari[o.orario] = (conteggioOrari[o.orario] || 0) + 1;
  });
  const orarioPunta = Object.entries(conteggioOrari).sort((a,b) => b[1]-a[1])[0];

  // Ultimi 7 giorni
  const ultimi7 = Array.from({length: 7}, (_, i) => {
    const d = new Date(oggi);
    d.setDate(oggi.getDate() - (6 - i));
    return d;
  });
  const ordiniPerGiorno = ultimi7.map(d => {
    const fine = new Date(d); fine.setHours(23,59,59,999);
    const count = ordini.filter(o => {
      const od = parseData(o.created_at);
      return od >= d && od <= fine;
    }).length;
    return { label: d.toLocaleDateString('it-IT', {weekday:'short'}), count };
  });
  const maxCount = Math.max(...ordiniPerGiorno.map(g => g.count), 1);

  // Export CSV
  const exportCSV = () => {
    const rows = [['Data','Cliente','Telefono','Orario','Dettaglio','Totale','Stato']];
    ordini.forEach(o => {
      rows.push([
        new Date(o.created_at).toLocaleDateString('it-IT'),
        o.cliente || '', o.telefono || '', o.orario || '',
        o.dettaglio || '', o.totale || '', o.stato || ''
      ]);
    });
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ordini_${new Date().toLocaleDateString('it-IT').replace(/\//g,'-')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Incassi */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Oggi', valore: incasso(ordiniOggi), colore: '#2E7D32' },
          { label: 'Settimana', valore: incasso(ordiniSettimana), colore: '#C9A97A' },
          { label: 'Mese', valore: incasso(ordiniMese), colore: '#2196F3' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-[2rem] p-4 text-center shadow-sm">
            <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{item.label}</p>
            <p className="font-black text-lg" style={{color: item.colore}}>€{item.valore}</p>
            <p className="text-[9px] text-gray-300 font-bold">
              {item.label === 'Oggi' ? ordiniOggi.length : item.label === 'Settimana' ? ordiniSettimana.length : ordiniMese.length} ordini
            </p>
          </div>
        ))}
      </div>

      {/* Andamento 7 giorni */}
      <div className="bg-white rounded-[2rem] p-5 shadow-sm overflow-hidden">
      <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">🏆 Piatti più ordinati</p>
        <div className="flex items-end gap-1 h-20">
          {ordiniPerGiorno.map((g, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[8px] font-black text-[#2E7D32]">{g.count > 0 ? g.count : ''}</span>
              <div className="w-full rounded-t-lg bg-[#2E7D32]/20 flex items-end" style={{height:'60px'}}>
                <div className="w-full rounded-t-lg bg-[#2E7D32] transition-all" style={{height: `${(g.count/maxCount)*100}%`, minHeight: g.count > 0 ? '4px' : '0'}}></div>
              </div>
              <span className="text-[8px] font-bold text-gray-400 capitalize">{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top piatti */}
      <div className="bg-white rounded-[2rem] p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase text-gray-400 mb-3 italic">🏆 Piatti più ordinati</p>
        {topPiatti.length === 0 && <p className="text-xs text-gray-300 text-center py-4">Nessun dato</p>}
       {topPiatti.map(([nome, qty], i) => (
  <div key={nome} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
    <div className="flex items-start gap-2 min-w-0 mr-3" style={{flex: '1 1 0', width: 0}}>
      <span className="text-[10px] font-black text-gray-300 shrink-0 mt-0.5">#{i+1}</span>
      <span className="text-xs font-black uppercase leading-tight" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>{nome}</span>
    </div>
    <span className="bg-[#2E7D32]/10 text-[#2E7D32] text-[10px] font-black px-3 py-1 rounded-full shrink-0">{qty} pz</span>
  </div>
))}
      </div>

      {/* Orario di punta */}
      <div className="bg-white rounded-[2rem] p-5 shadow-sm flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 italic">⏰ Orario di punta</p>
          <p className="text-2xl font-black text-[#C9A97A] mt-1">{orarioPunta ? orarioPunta[0] : '--:--'}</p>
        </div>
        {orarioPunta && <span className="bg-[#C9A97A]/10 text-[#C9A97A] text-[10px] font-black px-3 py-2 rounded-full">{orarioPunta[1]} ordini</span>}
      </div>

      {/* Export CSV */}
      <button onClick={exportCSV} className="w-full bg-[#111111] text-white py-5 rounded-[2rem] font-black uppercase italic text-xs flex items-center justify-center gap-3 shadow-xl">
        <Download size={16}/> Esporta Ordini CSV
      </button>
    </div>
  );
})()}
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
  <div className="flex gap-2">
    <button onClick={() => setView('guida')} className="px-3 py-2 bg-white rounded-full border shadow-sm text-[9px] font-black uppercase text-[#2E7D32] tracking-wide flex items-center gap-1"><BookOpen size={14}/> Guida</button>
    <button onClick={() => setShowLoginModal(true)} className="p-2 bg-white rounded-full border shadow-sm"><Settings size={20}/></button>
  </div>
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
              {getOrariDisponibili().length > 0 ? (
  <select 
    className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none appearance-none" 
    value={userData.orario} 
    onChange={(e) => setUserData({...userData, orario: e.target.value})}
  >
    <option value="">Orario Ritiro</option>
    {getOrariDisponibili().map(ora => (
      <option key={ora} value={ora}>{ora}</option>
    ))}
  </select>
) : (
  <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl text-center">
    <p className="text-red-600 font-black text-[10px] uppercase italic">
      Ritiro non disponibile oggi
    </p>
  </div>
)}
<textarea 
                placeholder="Note (es. quantità al peso o variazioni...)" 
                className="w-full p-4 bg-white rounded-xl font-bold outline-none resize-none h-24 text-sm" 
                value={userData.note} 
                onChange={(e) => setUserData({...userData, note: e.target.value})} 
              />
              <div className="flex gap-3 text-left items-center"><input type="checkbox" className="w-5 h-5" checked={privacyAccepted} onChange={() => setPrivacyAccepted(!privacyAccepted)} /><p className="text-[10px] text-gray-400 font-bold uppercase italic leading-tight">Autorizzo il trattamento dati.</p></div>
            </div>
            <button onClick={async () => { 
              await supabase.from('ordini').insert([{ cliente: userData.nome, telefono: userData.telefono, orario: userData.orario, dettaglio: cart.map(i => `${i.nome} x${i.qty}`).join(', '), totale: cart.reduce((a, b) => a + (b.prezzo * b.qty), 0), stato: 'da_preparare' }]);
              for (const item of cart) { await supabase.from('piatti').update({ stock: item.stock - item.qty }).eq('id', item.id); }
              setOrderPlaced(true);
              window.open(`https://wa.me/${TUO_NUMERO_WHATSAPP}?text=*ORDINE*%0A👤 ${userData.nome}%0A⏰ ${userData.orario}%0A🛒 ${cart.map(i => `${i.nome} x${i.qty}`).join(', ')}${userData.note ? `%0A📝 *NOTE:* ${userData.note}` : ''}%0A%0A📲 *Invia questo messaggio per confermare!*`, '_blank');
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
if (view === 'guida') return (
    <div className="min-h-screen bg-[#EFEFED] p-6 text-left">
      <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border shadow-sm"><ChevronLeft size={24}/></button>
      <h2 className="text-3xl font-black italic uppercase text-[#2E7D32] mb-2">Mini guida</h2>
      <p className="text-xs text-gray-400 font-bold uppercase mb-8">Come usare l'app</p>
      <div className="space-y-6">

        {/* SEZIONE 1 — HOME */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#2E7D32]/10 p-3 rounded-2xl"><Utensils size={22} className="text-[#2E7D32]"/></div>
            <div><p className="font-black text-sm uppercase">1. La home</p><p className="text-[10px] text-gray-400 font-bold">Da qui parti sempre</p></div>
          </div>
          <div className="space-y-2">
            {[
              { icon: '🍽️', tit: 'Menù del giorno', desc: 'Vedi i piatti disponibili oggi e aggiungi al vassoio' },
              { icon: '🎉', tit: 'Catering & eventi', desc: 'Richiedi un preventivo per la tua occasione speciale' },
              { icon: '📍', tit: 'Dove siamo', desc: 'Mappa e contatti del locale' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start bg-[#EFEFED] rounded-2xl p-3">
                <span className="text-xl">{item.icon}</span>
                <div><p className="font-black text-xs uppercase">{item.tit}</p><p className="text-[10px] text-gray-500">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* SEZIONE 2 — MENÙ */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#C9A97A]/10 p-3 rounded-2xl"><span className="text-[#C9A97A] text-xl">🥗</span></div>
            <div><p className="font-black text-sm uppercase">2. Il menù del giorno</p><p className="text-[10px] text-gray-400 font-bold">Scegli i tuoi piatti</p></div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#EFEFED] rounded-2xl p-3">
              <p className="font-black text-xs text-[#2E7D32] uppercase mb-1">Filtra per categoria</p>
              <div className="flex gap-1 flex-wrap">
                {['Tutti','Primi','Secondi','Contorni','Bevande'].map(c => (
                  <span key={c} className="bg-white text-[9px] font-black px-2 py-1 rounded-full border border-gray-200">{c}</span>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Tocca una categoria per filtrare i piatti</p>
            </div>
            <div className="bg-[#EFEFED] rounded-2xl p-3">
              <p className="font-black text-xs text-[#2E7D32] uppercase mb-1">Scheda piatto</p>
              <div className="bg-white rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-black text-xs uppercase">Lasagna classica</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {['Glutine','Lattosio','Uova'].map(a => (
                      <span key={a} className="text-[8px] font-bold text-gray-400 border border-gray-200 px-1 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-1 items-center">
                    <span className="text-[#2E7D32] font-black text-xs">€8.50</span>
                    <span className="text-[9px] bg-gray-100 px-2 rounded-full font-bold text-gray-500">Disp: 7</span>
                  </div>
                </div>
                <div className="w-9 h-9 bg-[#2E7D32] rounded-full flex items-center justify-center"><Plus size={18} className="text-white"/></div>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-[10px] text-gray-600">🏷️ <span className="font-bold">Allergeni</span> — etichette grigie sotto il nome</p>
                <p className="text-[10px] text-gray-600">📦 <span className="font-bold">Disp</span> — quantità ancora disponibile</p>
                <p className="text-[10px] text-gray-600">➕ <span className="font-bold">Tocca il +</span> per aggiungere al vassoio</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEZIONE 3 — VASSOIO */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#2E7D32]/10 p-3 rounded-2xl"><span className="text-[#2E7D32] text-xl">🛒</span></div>
            <div><p className="font-black text-sm uppercase">3. Il vassoio</p><p className="text-[10px] text-gray-400 font-bold">Completa il tuo ordine</p></div>
          </div>
          <div className="space-y-2">
            {[
              { n:'1', col:'#2E7D32', tit:'Nome', desc:'Inserisci il tuo nome e cognome' },
              { n:'2', col:'#2E7D32', tit:'Cellulare', desc:'Il tuo numero di telefono (es. 3331234567)' },
              { n:'3', col:'#2E7D32', tit:'Orario ritiro', desc:'Scegli quando vuoi ritirare dal menu a tendina' },
              { n:'4', col:'#C9A97A', tit:'Note (facoltativo)', desc:'Variazioni, quantità al peso, richieste speciali' },
              { n:'5', col:'#C9A97A', tit:'Trattamento dati', desc:'Spunta la casella per accettare — obbligatorio' },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-0.5" style={{background: s.col}}>{s.n}</div>
                <div><p className="font-black text-xs uppercase">{s.tit}</p><p className="text-[10px] text-gray-500">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* AVVISO 13:00 */}
        <div className="bg-[#2E7D32] rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={28} className="text-[#C9A97A] shrink-0"/>
            <p className="font-black text-white text-lg uppercase italic">Ordina entro le 13:00!</p>
          </div>
          <p className="text-white/80 text-xs font-bold leading-relaxed">Dopo le 13:00 i piatti potrebbero non essere più disponibili. Prenota in anticipo per avere la certezza del tuo piatto preferito. Puoi ritirare fino alle 15:00.</p>
        </div>

        {/* SEZIONE 4 — WHATSAPP */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-2xl"><span className="text-xl">💬</span></div>
            <div><p className="font-black text-sm uppercase">4. Conferma su WhatsApp</p><p className="text-[10px] text-gray-400 font-bold">Passaggio fondamentale</p></div>
          </div>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">Dopo aver toccato <span className="font-black text-[#2E7D32]">ORDINA</span>, si apre WhatsApp con il riepilogo del tuo ordine già scritto. <span className="font-black">Devi solo toccare INVIA</span> — è la tua conferma d'ordine!</p>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4">
            <p className="font-black text-xs text-green-800 uppercase mb-2">Se WhatsApp non si apre automaticamente:</p>
            <div className="space-y-3">
              <div>
                <p className="font-black text-[10px] text-gray-700 uppercase mb-1">📱 Android (Chrome)</p>
                <div className="space-y-1">
                  {['Tocca i 3 puntini in alto a destra nel browser','Vai su Impostazioni → Sito web → Popup e reindirizzamenti','Attiva "Consenti"','Torna sull\'app e riprova'].map((s,i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-[#C9A97A] font-black text-[10px] shrink-0">{i+1}.</span>
                      <p className="text-[10px] text-gray-600">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-green-100 pt-3">
                <p className="font-black text-[10px] text-gray-700 uppercase mb-1">🍎 iPhone (Safari)</p>
                <div className="space-y-1">
                  {['Vai su Impostazioni iPhone → Safari','Scorri fino a "Blocca popup"','Disattiva il blocco','Torna sull\'app e riprova'].map((s,i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-[#C9A97A] font-black text-[10px] shrink-0">{i+1}.</span>
                      <p className="text-[10px] text-gray-600">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEZIONE 5 — CATERING */}
        <div className="bg-[#111111] rounded-[2rem] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#C9A97A]/20 p-3 rounded-2xl"><PartyPopper size={22} className="text-[#C9A97A]"/></div>
            <div><p className="font-black text-sm uppercase text-white">5. Catering & eventi</p><p className="text-[10px] text-[#C9A97A] font-bold">Organizziamo noi per te</p></div>
          </div>
          <p className="text-white/70 text-xs leading-relaxed mb-4">Hai un'occasione speciale? Possiamo occuparci di tutto. Contattaci per un preventivo su misura!</p>
          <div className="space-y-2">
            {[
              { icon:'👥', tit:'Cene tra amici', desc:'Menu personalizzato per serate in compagnia' },
              { icon:'👨‍👩‍👧', tit:'Riunioni familiari', desc:'Pranzi e cene per ricorrenze e celebrazioni' },
              { icon:'💼', tit:'Meeting aziendali', desc:'Catering professionale per eventi di lavoro' },
              { icon:'🎊', tit:'Eventi speciali', desc:'Compleanni, anniversari e qualsiasi occasione' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start bg-white/5 rounded-2xl p-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <div><p className="font-black text-xs text-white uppercase">{item.tit}</p><p className="text-[10px] text-white/60">{item.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#C9A97A]/20 rounded-2xl p-3">
            <p className="text-[#C9A97A] font-black text-xs uppercase">Come funziona</p>
            <p className="text-white/70 text-[10px] mt-1 leading-relaxed">Tocca <span className="text-[#C9A97A] font-black">Catering & eventi</span> dalla home, compila il modulo con data e tipo di evento. Ti ricontattiamo noi con una proposta su misura!</p>
          </div>
        </div>

        <div className="h-6"/>
      </div>
    </div>
  );
  return null;
}

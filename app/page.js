"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Utensils, X, ChevronLeft, Plus, Minus, Search,
  CheckCircle, Settings, Eye, EyeOff, MapPin, Phone, Clock, Scale, 
  Briefcase, FileText, Filter, PartyPopper, Calendar, Users, MessageSquare
} from 'lucide-react';

export default function MordieFuggiApp() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminFilter, setAdminFilter] = useState("Tutti");

  // Stato per il modulo Catering
  const [cateringData, setCateringData] = useState({
    nome: '', cellulare: '', data: '', persone: '', tipo: 'Riunioni aziendali, Cene tra amici, Compleanno, Laurea', note: ''
  });

  // --- DATABASE ---
  const [piattiGiorno, setPiattiGiorno] = useState([
    { id: 1, nome: "LASAGNA", prezzo: 0, cat: "Primi", img: "🥘", stock: 15, attivo: true },
    { id: 2, nome: "PARMIGIANA", prezzo: 0, cat: "Primi", img: "🍆", stock: 10, attivo: true },
    { id: 3, nome: "STROZZAPRETI CON CARBONARA DI ASPARAGI", prezzo: 0, cat: "Primi", img: "🍝", stock: 12, attivo: true },
    { id: 4, nome: "PASTA FREDDA CON POMODORINI OLIVE SPECK FUNGHETTI", prezzo: 0, cat: "Primi", img: "🥗", stock: 20, attivo: true },
    { id: 5, nome: "FUSILLI CON GUANCIALE CROCCANTE STRACCIATELLA DATTERINI GIALLI", prezzo: 0, cat: "Primi", img: "🍝", stock: 10, attivo: true },
    { id: 6, nome: "MEZZOPACCHERO CON SUGO DI CERNIA", prezzo: 0, cat: "Primi", img: "🐟", stock: 8, attivo: true },
    { id: 7, nome: "RISOTTO GAMBERETTI E LIMONE", prezzo: 0, cat: "Primi", img: "🍋", stock: 8, attivo: true },
    { id: 8, nome: "SALSICCIA E PATATE AL FORNO", prezzo: 0, cat: "Secondi", img: "🌭", stock: 10, attivo: true },
    { id: 9, nome: "ARROSTO CON VERDURE", prezzo: 0, cat: "Secondi", img: "🍖", stock: 10, attivo: true },
    { id: 10, nome: "POLPETTONCINI RIPIENI AL SUGO", prezzo: 0, cat: "Secondi", img: "🧆", stock: 15, attivo: true },
    { id: 11, nome: "SCALOPPINE AI FUNGHI", prezzo: 0, cat: "Secondi", img: "🍄", stock: 10, attivo: true },
    { id: 12, nome: "SOVRACOSCE DI POLLO AL FORNO CON PATATE", prezzo: 0, cat: "Secondi", img: "🍗", stock: 12, attivo: true },
    { id: 13, nome: "SPADA ALLA PALERMITANA", prezzo: 0, cat: "Secondi", img: "🐟", stock: 6, attivo: true },
    { id: 14, nome: "BOCCONCINI DI POLLO ALLE MANDORLE E SALSA DI SOIA", prezzo: 0, cat: "Secondi", img: "🥢", stock: 10, attivo: true },
    { id: 15, nome: "FILETTI DI MERLUZZO PANATI AL FORNO", prezzo: 0, cat: "Secondi", img: "🐟", stock: 8, attivo: true },
    { id: 16, nome: "CICORINE CON OLIVE NERE", prezzo: 0, cat: "Contorni", img: "🥬", stock: 15, attivo: true },
    { id: 17, nome: "CICORINE LESSE", prezzo: 0, cat: "Contorni", img: "🥬", stock: 15, attivo: true },
    { id: 18, nome: "CICORIE FRESCHE LESSE", prezzo: 0, cat: "Contorni", img: "🥬", stock: 15, attivo: true },
    { id: 19, nome: "SPINACI LESSI", prezzo: 0, cat: "Contorni", img: "🍃", stock: 10, attivo: true },
    { id: 20, nome: "FAGIOLINI LESSI", prezzo: 0, cat: "Contorni", img: "🥗", stock: 10, attivo: true },
    { id: 21, nome: "BARBABIETOLE CON OLIO ACETO E MENTA", prezzo: 0, cat: "Contorni", img: "🏮", stock: 10, attivo: true },
    { id: 22, nome: "CAROTE COLORATE PANATE AL FORNO", prezzo: 0, cat: "Contorni", img: "🥕", stock: 12, attivo: true },
    { id: 23, nome: "ACQUA 50CL NAT", prezzo: 1.0, cat: "Bevande", img: "💧", stock: 100, attivo: true },
    { id: 32, nome: "ICNUSA NON FILTRATA 50CL", prezzo: 4.0, cat: "Bevande", img: "🍺", stock: 24, attivo: true },
    { id: 37, nome: "TENNENTS BIRRA 33CL", prezzo: 3.5, cat: "Bevande", img: "🍺", stock: 24, attivo: true }
  ]);

  const categorie = ["Primi", "Secondi", "Contorni", "Bevande"];

  const filteredPiattiAdmin = useMemo(() => {
    return piattiGiorno.filter(p => {
      const matchSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = adminFilter === "Tutti" || p.cat === adminFilter;
      return matchSearch && matchCat;
    });
  }, [searchTerm, adminFilter, piattiGiorno]);

  const updateStock = (id, delta) => {
    setPiattiGiorno(piattiGiorno.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const togglePiatto = (id) => {
    setPiattiGiorno(piattiGiorno.map(p => p.id === id ? { ...p, attivo: !p.attivo } : p));
  };

  const addToCart = (p) => {
    if (p.stock <= 0) return;
    const exists = cart.find(item => item.id === p.id);
    if (exists) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
    updateStock(p.id, -1);
  };

  const removeFromCart = (id) => {
    const item = cart.find(i => i.id === id);
    if (item.qty > 1) {
      setCart(cart.map(i => i.id === id ? { ...i, qty: item.qty - 1 } : i));
    } else {
      setCart(cart.filter(i => i.id !== id));
    }
    updateStock(id, 1);
  };

  const total = cart.reduce((acc, item) => acc + (item.prezzo * item.qty), 0);
  const hasItemsAtWeight = cart.some(item => item.prezzo === 0);

  // --- VISTA HOME ---
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#EFEFED] p-6 font-sans text-[#111111]">
        <header className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold tracking-tighter text-[#2E7D32]">
            mordi<span className="text-[#C9A97A] italic text-xl mx-0.5">e</span>fuggi
          </div>
          <button onClick={() => setView('admin')} className="p-2 bg-white rounded-full border border-[#DEDEDE] text-[#606060]"><Settings size={20}/></button>
        </header>
        <h1 className="text-4xl font-extrabold mb-8 leading-tight">Cucina fresca,<br />ritmo <span className="text-[#C9A97A]">veloce</span>.</h1>
        <div className="grid grid-cols-1 gap-4">
          <button onClick={() => setView('menu')} className="bg-white p-6 rounded-3xl border border-[#DEDEDE] flex items-center gap-6 active:scale-95 transition-all shadow-sm text-left">
            <div className="bg-[#2E7D32]/10 p-4 rounded-2xl text-[#2E7D32] shadow-inner"><Utensils size={32} /></div>
            <div className="font-bold text-lg">Menù del Giorno</div>
          </button>
          
          <button onClick={() => setView('catering')} className="bg-white p-6 rounded-3xl border border-[#DEDEDE] flex items-center gap-6 active:scale-95 transition-all shadow-sm text-left">
            <div className="bg-[#C9A97A]/20 p-4 rounded-2xl text-[#C9A97A] shadow-inner"><PartyPopper size={32} /></div>
            <div className="font-bold text-lg">Catering & Eventi</div>
          </button>

          <button onClick={() => setView('contatti')} className="bg-white p-6 rounded-3xl border border-[#DEDEDE] flex items-center gap-6 active:scale-95 transition-all shadow-sm text-left">
            <div className="bg-[#2E7D32]/5 p-4 rounded-2xl text-gray-400 shadow-inner"><MapPin size={32} /></div>
            <div className="font-bold text-lg">Dove Siamo</div>
          </button>
          
          <button onClick={() => setView('lavora')} className="bg-black text-white p-6 rounded-3xl flex items-center gap-6 active:scale-95 transition-all shadow-sm text-left mt-2">
            <div className="bg-white/10 p-4 rounded-2xl"><Briefcase size={32} /></div>
            <div className="font-bold text-lg">Lavora con noi</div>
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA CATERING ---
  if (view === 'catering') {
    return (
      <div className="min-h-screen bg-white p-6 font-sans text-[#111111]">
        <button onClick={() => setView('home')} className="mb-6 bg-[#EFEFED] p-2 rounded-full"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black mb-2 text-[#2E7D32] italic">Il tuo evento</h2>
        <p className="text-gray-400 font-bold mb-8 uppercase text-[10px] tracking-widest">Richiedi un preventivo personalizzato</p>

        <div className="space-y-6">
          <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#EFEFED] space-y-4">
            <div className="flex items-center gap-4 text-[#C9A97A] mb-2 font-black text-xs uppercase"><Calendar size={16}/> Quando e quanto?</div>
            <input type="date" className="w-full p-4 rounded-xl border border-[#DEDEDE] font-bold" onChange={(e)=>setCateringData({...cateringData, data: e.target.value})} />
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input type="number" placeholder="Numero invitati (es. 30)" className="w-full pl-12 p-4 rounded-xl border border-[#DEDEDE] font-bold" onChange={(e)=>setCateringData({...cateringData, persone: e.target.value})} />
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#EFEFED] space-y-4">
            <div className="flex items-center gap-4 text-[#C9A97A] mb-2 font-black text-xs uppercase"><Utensils size={16}/> Tipo di evento</div>
            <select className="w-full p-4 rounded-xl border border-[#DEDEDE] font-bold appearance-none bg-white" value={cateringData.tipo} onChange={(e)=>setCateringData({...cateringData, tipo: e.target.value})}>
              <option>Riunioni aziendali, Cene tra amici, Compleanno, Laurea</option>
              <option>Evento pubblico / Sagra</option>
              <option>Altro</option>
            </select>
          </div>

          <div className="bg-[#F8F9FA] p-6 rounded-[2rem] border border-[#EFEFED] space-y-4">
            <div className="flex items-center gap-4 text-[#C9A97A] mb-2 font-black text-xs uppercase"><MessageSquare size={16}/> Contatti e Note</div>
            <input type="text" placeholder="Tuo Nome" className="w-full p-4 rounded-xl border border-[#DEDEDE] font-bold" onChange={(e)=>setCateringData({...cateringData, nome: e.target.value})} />
            <input type="tel" placeholder="Cellulare per ricontatto" className="w-full p-4 rounded-xl border border-[#DEDEDE] font-bold" onChange={(e)=>setCateringData({...cateringData, cellulare: e.target.value})} />
            <textarea placeholder="Hai allergie o richieste particolari sui piatti?" rows="3" className="w-full p-4 rounded-xl border border-[#DEDEDE] font-bold" onChange={(e)=>setCateringData({...cateringData, note: e.target.value})}></textarea>
          </div>

          <button onClick={() => alert('Richiesta inviata! Ti ricontatteremo entro 24 ore.')} className="w-full bg-[#2E7D32] text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-[#2E7D32]/20 active:scale-[0.98] transition-all uppercase italic">
            Ricevi Preventivo
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA MENU ---
  if (view === 'menu') {
    const oggiFull = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
      <div className="min-h-screen bg-white p-6 pb-32 font-sans">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-[#606060] mb-6 font-bold bg-[#EFEFED] px-4 py-2 rounded-full w-fit"><ChevronLeft size={20} /> Home</button>
        <h2 className="text-2xl font-bold italic text-[#2E7D32]">Il gusto di oggi</h2>
        <p className="text-[#C9A97A] font-bold text-xs mb-8 uppercase tracking-widest">{oggiFull}</p>

        {categorie.map(cat => {
          const piattiCat = piattiGiorno.filter(p => p.cat === cat && p.attivo);
          if (piattiCat.length === 0) return null;
          return (
            <div key={cat} className="mb-8">
              <h3 className="text-sm font-black uppercase mb-4 text-[#C9A97A] flex items-center gap-2">
                <div className="h-[2px] w-4 bg-[#C9A97A]"></div> {cat}
              </h3>
              <div className="space-y-4">
                {piattiCat.map(p => (
                  <div key={p.id} className={`rounded-3xl p-5 flex justify-between items-center transition-all ${p.stock === 0 ? 'bg-gray-50 opacity-50 border-gray-100' : 'bg-[#F8F9FA] border border-[#EFEFED]'}`}>
                    <div className="flex gap-4 items-center flex-1 pr-2">
                      <span className="text-4xl">{p.img}</span>
                      <div className="flex-1">
                        <p className="font-bold text-[#111111] leading-tight mb-1 text-sm">{p.nome}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {p.prezzo === 0 ? (
                            <span className="flex items-center gap-1 text-[10px] bg-white border border-[#DEDEDE] px-2 py-0.5 rounded-full text-[#606060] font-bold uppercase"><Scale size={10}/> al peso</span>
                          ) : (
                            <span className="text-[#2E7D32] font-black text-sm">€{p.prezzo.toFixed(2)}</span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${p.stock <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                            {p.stock > 0 ? `Disp: ${p.stock}` : "Esaurito"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => addToCart(p)} disabled={p.stock === 0} className={`p-3 rounded-2xl shadow-md active:scale-90 transition-transform ${p.stock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-[#2E7D32] text-white'}`}>
                      {p.stock === 0 ? <X size={20}/> : <Plus size={20} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {cart.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6">
            <button onClick={() => setView('cart')} className="w-full bg-[#2E7D32] text-white py-5 rounded-3xl font-bold shadow-2xl flex justify-between px-8 items-center active:scale-[0.98] transition-all uppercase tracking-tighter">
              <span className="text-lg font-black">{cart.reduce((a,b)=>a+b.qty,0)} portate</span>
              <span className="text-2xl font-black">{total > 0 ? `€${total.toFixed(2)}` : "Pronto"}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA ADMIN ---
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#111111]">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('home')} className="bg-white p-2 rounded-full border border-[#DEDEDE] shadow-sm text-gray-400"><ChevronLeft size={24}/></button>
          <h2 className="text-xl font-black text-[#2E7D32] uppercase italic">Gestione</h2>
        </div>
        <div className="sticky top-0 z-10 bg-[#F8F9FA] pb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cerca piatto..." className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#DEDEDE] outline-none focus:border-[#2E7D32] font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["Tutti", ...categorie].map(c => (
              <button key={c} onClick={() => setAdminFilter(c)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${adminFilter === c ? 'bg-[#2E7D32] text-white border-[#2E7D32]' : 'bg-white text-gray-400 border-[#DEDEDE]'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {filteredPiattiAdmin.map(p => (
            <div key={p.id} className={`bg-white p-5 rounded-3xl border-2 transition-all ${p.attivo ? 'border-[#2E7D32]' : 'border-transparent opacity-60 shadow-none'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1 pr-4"><p className="text-[9px] font-black text-[#C9A97A] uppercase mb-1">{p.cat}</p><span className="font-bold text-xs">{p.nome}</span></div>
                <button onClick={() => togglePiatto(p.id)} className={`p-3 rounded-xl ${p.attivo ? 'bg-[#2E7D32] text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>{p.attivo ? <Eye size={18}/> : <EyeOff size={18}/>}</button>
              </div>
              <div className="flex justify-between items-center bg-[#F8F9FA] p-3 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase">Stock</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => updateStock(p.id, -1)} className="w-8 h-8 bg-white border rounded-lg font-black">-</button>
                  <span className="text-lg font-black w-8 text-center">{p.stock}</span>
                  <button onClick={() => updateStock(p.id, 1)} className="w-8 h-8 bg-white border rounded-lg font-black text-[#2E7D32]">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ALTRE VISTE (Lavora, Contatti, Carrello) ---
  if (view === 'lavora') {
    return (
      <div className="min-h-screen bg-[#111111] p-6 text-white font-sans">
        <button onClick={() => setView('home')} className="mb-6 bg-white/10 p-2 rounded-full"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-bold mb-2 text-[#C9A97A]">Lavora con noi</h2>
        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-2xl">
          <input type="text" placeholder="Nome e Cognome" className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#C9A97A]" />
          <input type="tel" placeholder="Cellulare" className="w-full bg-white/10 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-[#C9A97A]" />
          <div className="space-y-2">
            <label className="text-[10px] text-[#C9A97A] font-bold uppercase ml-1">Allega il tuo CV (PDF)</label>
            <input type="file" accept=".pdf" className="w-full bg-white/5 border border-dashed border-white/20 p-4 rounded-2xl text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#C9A97A] file:text-[#111111]" />
          </div>
          <button onClick={() => {alert('Candidatura inviata!'); setView('home');}} className="w-full bg-[#C9A97A] text-[#111111] font-black py-5 rounded-2xl shadow-lg mt-4 uppercase tracking-widest">Invia</button>
        </div>
      </div>
    );
  }

  if (view === 'contatti') {
    return (
      <div className="min-h-screen bg-[#EFEFED] p-6 font-sans text-[#111111]">
        <button onClick={() => setView('home')} className="mb-6 bg-white p-2 rounded-full border border-[#DEDEDE] shadow-sm"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black mb-8 italic">Dove siamo</h2>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#DEDEDE] space-y-8">
          <div className="flex gap-4">
            <MapPin className="text-[#2E7D32]" size={28} />
            <div>
              <p className="font-black text-lg">Via Lequile, 90</p>
              <p className="text-gray-400 text-sm mb-4">73100 Lecce (LE)</p>
              <a href="https://www.google.com/maps/search/?api=1&query=Via+Lequile+90+Lecce" target="_blank" rel="noopener noreferrer" className="bg-[#2E7D32] text-white px-6 py-2 rounded-full text-xs font-bold uppercase shadow-lg">Mappa</a>
            </div>
          </div>
          <div className="flex gap-4 border-t pt-8">
            <Phone className="text-[#2E7D32]" size={28} />
            <div>
              <p className="text-[10px] font-black text-[#C9A97A] uppercase tracking-widest">Chiamaci</p>
              <a href="tel:3760815909" className="text-2xl font-black">376 0815909</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'cart') {
    return (
      <div className="min-h-screen bg-[#EFEFED] p-6 font-sans text-[#111111]">
        <button onClick={() => setView('menu')} className="mb-6 bg-white p-2 rounded-full border border-[#DEDEDE]"><ChevronLeft size={24}/></button>
        <h2 className="text-3xl font-black mb-8 italic">Il tuo vassoio</h2>
        {!orderPlaced ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-[#DEDEDE] space-y-6 shadow-sm">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-xs uppercase leading-tight">{item.nome}</p>
                    <p className="text-[9px] text-gray-400 font-black">{item.prezzo === 0 ? "AL PESO" : `€${(item.prezzo * item.qty).toFixed(2)}`}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-[#F8F9FA] px-4 py-2 rounded-2xl border border-[#EFEFED]">
                    <button onClick={() => removeFromCart(item.id)} className="text-[#2E7D32]"><Minus size={18}/></button>
                    <span className="font-black text-sm">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="text-[#2E7D32]"><Plus size={18}/></button>
                  </div>
                </div>
              ))}
              <div className="border-t-2 border-dashed pt-6 flex justify-between items-end font-black text-2xl text-[#2E7D32]">
                <span className="italic">Totale</span>
                <div className="text-right">
                  <p>{total > 0 ? `€${total.toFixed(2)}` : "Pronto"}</p>
                  {hasItemsAtWeight && <p className="text-[9px] text-gray-400 uppercase tracking-tighter">+ quota al peso</p>}
                </div>
              </div>
            </div>
            <button onClick={() => setOrderPlaced(true)} className="w-full bg-[#2E7D32] text-white py-6 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all uppercase italic">Prenota ora</button>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center space-y-8 border-4 border-[#2E7D32] shadow-2xl animate-in fade-in zoom-in duration-300">
            <CheckCircle size={60} className="text-[#2E7D32] mx-auto" />
            <h3 className="text-3xl font-black uppercase italic">Fatto!</h3>
            <p className="text-gray-500 font-medium italic">Ti aspettiamo in Via Lequile 90 per il ritiro.</p>
            <button onClick={() => {setView('home'); setCart([]); setOrderPlaced(false);}} className="w-full bg-[#EFEFED] py-5 rounded-2xl font-black text-[#606060] uppercase text-xs tracking-widest">Torna alla Home</button>
          </div>
        )}
      </div>
    );
  }
}
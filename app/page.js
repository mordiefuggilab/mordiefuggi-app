"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Settings, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

export default function MordieFuggiApp() {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedTable, setSelectedTable] = useState('1');

  useEffect(() => {
    const savedDishes = localStorage.getItem('mordiefuggi_dishes');
    if (savedDishes) {
      setDishes(JSON.parse(savedDishes));
    }
  }, []);

  const loadInitialDishes = () => {
    const initial = [
      { id: 1, name: "Lasagna alla Bolognese", price: 12.00, category: "Primi" },
      { id: 2, name: "Arrosto di Vitello", price: 15.00, category: "Secondi" },
      { id: 3, name: "Tiramisù della Casa", price: 6.00, category: "Dolci" },
      { id: 4, name: "Orecchiette alle Cime di Rapa", price: 10.00, category: "Primi" }
    ];
    setDishes(initial);
    localStorage.setItem('mordiefuggi_dishes', JSON.stringify(initial));
    setActiveTab('menu');
  };

  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => item.id === dish.id ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, {...dish, qty: 1}];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      <header className="bg-emerald-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={28} />
            <h1 className="text-2xl font-black tracking-tighter italic text-white">mordiefuggi</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold opacity-80">Postazione</span>
               <select 
                value={selectedTable} 
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-emerald-700 text-white border-none rounded px-2 py-1 text-sm font-bold focus:ring-2 ring-white"
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Tavolo {n}</option>)}
              </select>
            </div>
            <button onClick={() => setActiveTab('settings')} className="hover:rotate-90 transition-transform p-2">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-40">
        {activeTab === 'menu' ? (
          <div className="grid gap-4">
            <div className="flex justify-between items-end mb-2">
               <h2 className="text-xl font-bold border-b-4 border-emerald-500 pr-4">Menù del Giorno</h2>
               <span className="text-sm text-gray-500 font-medium">{dishes.length} piatti disponibili</span>
            </div>
            
            {dishes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-inner">
                <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-400 font-medium">Il menù è ancora vuoto.</p>
                <button 
                  onClick={loadInitialDishes} 
                  className="mt-4 bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-bold hover:bg-emerald-200 transition-colors"
                >
                  Carica piatti di prova
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {dishes.map(dish => (
                  <div key={dish.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase font-bold mb-1 inline-block">
                        {dish.category}
                      </span>
                      <h3 className="font-bold text-lg leading-tight">{dish.name}</h3>
                      <p className="text-emerald-600 font-black text-xl">€ {dish.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(dish)}
                      className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-700">
              <Settings /> Gestione
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Usa questo tasto per resettare il menù se i piatti non appaiono correttamente.</p>
              <button 
                onClick={loadInitialDishes}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
              >
                RIPRISTINA MENÙ INIZIALE
              </button>
              <button 
                onClick={() => setActiveTab('menu')}
                className="w-full mt-4 text-gray-500 font-bold py-2 hover:text-emerald-600 transition-colors"
              >
                ← Torna al Menù
              </button>
            </div>
          </div>
        )}
      </main>

      {cart.length > 0 && activeTab === 'menu' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md">
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-2 rounded-lg text-slate-900">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-400 leading-none">Tavolo {selectedTable}</p>
                  <p className="font-bold text-lg leading-none">Il tuo ordine</p>
                </div>
              </div>
              <span className="text-white font-black text-2xl">€ {total.toFixed(2)}</span>
            </div>
            <div className="max-h-32 overflow-y-auto mb-6 pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                  <span className="text-sm font-medium"><span className="text-emerald-500 font-bold">{item.qty}x</span> {item.name}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]">
              <CheckCircle2 size={24} /> 
              INVIA ORDINE IN CUCINA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
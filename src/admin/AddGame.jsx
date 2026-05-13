import React, { useState } from "react";
import { Save, X } from "lucide-react";

export default function AddGame({ onAdd, onClose }) {
  const [newGame, setNewGame] = useState({
    title: "",
    price: "",
    category: "Action",
    stock: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // On convertit le prix en nombre avant l'envoi
    onAdd({ ...newGame, id: Date.now(), price: Number(newGame.price) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-orange-500 italic">Nouveau Jeu</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 font-mono">Nom du Produit</label>
            <input 
              required
              placeholder="ex: GTA VI"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-white"
              onChange={(e) => setNewGame({...newGame, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 font-mono">Prix (FCFA)</label>
              <input 
                type="number" required
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-white"
                onChange={(e) => setNewGame({...newGame, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 font-mono">Unités</label>
              <input 
                type="number" required
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-white"
                onChange={(e) => setNewGame({...newGame, stock: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
            <Save size={20} /> ENREGISTRER DANS LA BASE
          </button>
        </form>
      </div>
    </div>
  );
}
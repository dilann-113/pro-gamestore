import React, { useState } from "react";
import { LayoutDashboard, PackagePlus, Trash2, Edit3, TrendingUp, Gamepad2 } from "lucide-react";
import AddGame from "./AddGame";

export default function Dashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [games, setGames] = useState([
    { id: 1, title: "Cyberpunk 2077", price: 25000, category: "RPG", stock: 12 },
    { id: 2, title: "Elden Ring", price: 35000, category: "Action", stock: 8 }
  ]);

  const deleteGame = (id) => setGames(games.filter(g => g.id !== id));

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="text-xl font-bold italic">PRO<span className="text-orange-500">ADMIN</span></h2>
        </div>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl text-orange-500 border border-orange-500/20 shadow-lg">
            <Gamepad2 size={18} /> <span className="text-sm font-bold">Inventaire</span>
          </button>
        </nav>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-8 relative overflow-y-auto">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Gestion Stock</h1>
            <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase mt-2">Libreville Hub • Gabon</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-orange-600 hover:bg-orange-500 px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-orange-600/20"
          >
            <PackagePlus size={18} /> AJOUTER UN PRODUIT
          </button>
        </div>

        {/* TABLEAU */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/20 text-[10px] uppercase tracking-[0.2em] border-b border-white/5">
                <th className="p-6">Produit</th>
                <th className="p-6">Prix</th>
                <th className="p-6">Stock</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {games.map((game) => (
                <tr key={game.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 font-bold">{game.title}</td>
                  <td className="p-6 font-mono text-white/60">{game.price.toLocaleString()} FCFA</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${game.stock < 10 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {game.stock} UNITÉS
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => deleteGame(game.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <AddGame 
            onClose={() => setShowAddForm(false)} 
            onAdd={(game) => setGames([...games, game])} 
          />
        )}
      </main>
    </div>
  );
}
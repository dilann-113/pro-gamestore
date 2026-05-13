import React, { useState, useEffect, useMemo } from "react";
import { 
  Gamepad2, ShoppingCart, Search, Flame, Plus, 
  RefreshCcw, LogOut 
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// Imports des composants
import CartDrawer from "./components/CartDrawer";
import GameDetails from "./components/GameDetails";
import Auth from "./components/Auth";

export default function App() {
  // --- ÉTATS ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  // --- 1. PERSISTANCE DE LA SESSION ---
  useEffect(() => {
    const savedUser = localStorage.getItem("prostore_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("prostore_user");
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("prostore_user", JSON.stringify(userData));
    toast.success(`Content de vous revoir, ${userData.username} !`);
  };

  const handleLogout = () => {
    localStorage.removeItem("prostore_user");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    toast.error("Déconnexion réussie");
  };

  // --- 2. CHARGEMENT DES DONNÉES DEPUIS L'API EN LIGNE ---
  const loadGames = async () => {
    setLoading(true);
    try {
      /** 
       * MISE À JOUR : URL pointant vers ton domaine InfinityFree 
       * selon ton organisation en sous-dossier api_chiro
       */
      const response = await fetch("http://admin113.ct.ws/api_chiro/get_games.php");
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setGames(data);
      } else {
        console.error("Format API invalide", data);
        setGames([]);
      }
    } catch (error) {
      console.error("Erreur de récupération des jeux:", error);
      toast.error("Connexion au catalogue impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadGames();
    }
  }, [isAuthenticated]);

  // --- 3. LOGIQUE DU PANIER ---
  const addToCart = (game) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === game.id);
      if (exists) {
        return prev.map((item) =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...game, quantity: 1 }];
    });
    toast.success(`${game.title} ajouté au panier`);
  };

  // --- 4. FILTRES ET RECHERCHE ---
  const categories = useMemo(() => {
    const cats = games.map((g) => g.category).filter(Boolean);
    return ["Tous", ...new Set(cats)];
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = (game.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "Tous" || game.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, games]);

  // --- 5. RENDU CONDITIONNEL (AUTH) ---
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" />
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Gamepad2 size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">
              Pro<span className="text-indigo-500">Store</span>
            </h1>
          </div>

          <div className="relative flex-1 w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un titre (GTA, FIFA...)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shadow-inner">
                   {user?.username?.[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400">{user?.username}</span>
             </div>

             <button onClick={() => setIsCartOpen(true)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative">
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white animate-pulse">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                )}
             </button>
             
             <button onClick={handleLogout} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4 uppercase tracking-[0.2em] text-[10px]">
            <Flame size={14} className="animate-bounce" /> <span>Libreville • Gabon</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black mb-8 uppercase italic tracking-tighter text-white leading-none">
            Catalogue <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Gaming</span>
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${activeCategory === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <RefreshCcw className="animate-spin text-indigo-500" size={48} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Mise à jour du stock en direct...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.length > 0 ? filteredGames.map((game) => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)} 
                className="group bg-white/5 border border-white/5 rounded-[2.5rem] p-4 hover:bg-white/[0.08] hover:border-white/10 hover:translate-y-[-8px] transition-all duration-500 cursor-pointer"
              >
                <div className="h-48 rounded-[2rem] bg-[#0f172a] mb-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Gamepad2 size={64} className="text-white/5 group-hover:scale-110 group-hover:text-indigo-500/20 transition-all duration-500" />
                  {Number(game.stock) < 10 && (
                    <span className="absolute top-4 right-4 bg-rose-500/20 text-rose-500 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                      Stock limité
                    </span>
                  )}
                </div>
                
                <div className="px-2">
                    <h3 className="text-sm font-black uppercase truncate text-white mb-1">{game.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{game.category}</p>
                    
                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                      <span className="text-lg font-black text-white italic">
                        {Number(game.price).toLocaleString()} 
                        <small className="text-[8px] text-indigo-500 ml-1 not-italic">FCFA</small>
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(game); }} 
                        className="bg-white text-black p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-12 active:scale-90"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Aucun jeu trouvé dans cette catégorie</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* OVERLAYS */}
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          setCart={setCart} 
          user={user} 
          onClose={() => setIsCartOpen(false)} 
        />
      )}
      
      {selectedGame && (
        <GameDetails 
          game={selectedGame} 
          onBack={() => setSelectedGame(null)} 
          onAddToCart={addToCart} 
        />
      )}
    </div>
  );
}
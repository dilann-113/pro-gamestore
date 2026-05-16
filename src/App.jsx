import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Gamepad2, ShoppingCart, Search, Plus,
  RefreshCcw, LogOut, Zap, ChevronRight, X
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from './supabaseClient';
import CartDrawer from "./components/CartDrawer";
import GameDetails from "./components/GameDetails";
import Auth from "./components/Auth";
import UserProfile from "./components/UserProfile";
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [scrolled, setScrolled] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const mainRef = useRef();

  useEffect(() => {
    const savedUser = localStorage.getItem("prostore_user");
    if (savedUser) {
      try {
        const p = JSON.parse(savedUser);
        setUser(p);
        setIsAuthenticated(true);
        const saved = localStorage.getItem(`avatar_${p.email}`);
        if (saved) setAvatarPreview(saved);
      } catch { localStorage.removeItem("prostore_user"); }
    }
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isAuthenticated]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("prostore_user", JSON.stringify(userData));
    const saved = localStorage.getItem(`avatar_${userData.email}`);
    if (saved) setAvatarPreview(saved);
    toast.success(`Bienvenue, ${userData.username} !`);
  };

  const handleLogout = () => {
    localStorage.removeItem("prostore_user");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setIsProfileOpen(false);
    setAvatarPreview(null);
  };

  const loadGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('games').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) setGames(data);
    } catch (e) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated) loadGames(); }, [isAuthenticated]);

  const addToCart = (game) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === game.id);
      if (exists) return prev.map(i => i.id === game.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...game, quantity: 1 }];
    });
    toast.success(`${game.title} ajouté !`);
  };

  const categories = useMemo(() => {
    const cats = games.map(g => g.category).filter(Boolean);
    return ["Tous", ...new Set(cats)];
  }, [games]);

  const filteredGames = useMemo(() => games.filter(game => {
    const matchSearch = (game.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === "Tous" || game.category === activeCategory;
    return matchSearch && matchCat;
  }), [searchTerm, activeCategory, games]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const featuredGame = games[0];

  if (window.location.pathname === '/admin') return <AdminDashboard />;
  if (isProfileOpen) return <UserProfile user={user} onBack={() => setIsProfileOpen(false)} />;
  if (!isAuthenticated) return <><Toaster position="top-right" /><Auth onLoginSuccess={handleLoginSuccess} /></>;

  return (
    <div
      ref={mainRef}
      className="h-screen overflow-y-auto bg-[#07070d] text-white font-sans"
      style={{ scrollbarWidth: "none" }}
    >
      <style>{`
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .card-hover { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; }
        .card-hover:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
      `}</style>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }
      }} />

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#07070d]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.6)]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">

          {/* LOGO */}
          <div className="flex items-center gap-3 mr-4 cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="relative w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Gamepad2 size={20} className="text-white" />
              <div className="absolute inset-0 rounded-2xl bg-indigo-400/20 animate-pulse" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter hidden sm:block">
              Pro<span className="text-indigo-400">Store</span>
            </span>
          </div>

          {/* SEARCH */}
          <div className={`relative flex-1 max-w-lg transition-all duration-300 ${searchFocused ? "max-w-2xl" : ""}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? "text-indigo-400" : "text-white/20"}`} size={16} />
            <input
              type="text"
              placeholder="Rechercher un jeu..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm outline-none text-white placeholder:text-white/20 transition-all duration-300 focus:bg-white/[0.07] focus:border-indigo-500/50 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 ml-auto">
            {/* AVATAR */}
            <button onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 group">
              <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 border border-white/10">
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>}
              </div>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                {user?.username}
              </span>
            </button>

            {/* PANIER */}
            <button onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200">
              <ShoppingCart size={18} className="text-white/70" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-[9px] font-black flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* LOGOUT */}
            <button onClick={handleLogout}
              className="p-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-rose-500/10 hover:border-rose-500/20 text-white/30 hover:text-rose-400 transition-all duration-200">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO FEATURED ── */}
      {featuredGame && !searchTerm && activeCategory === "Tous" && (
        <div className="relative mx-6 mt-6 mb-8 rounded-[2.5rem] overflow-hidden cursor-pointer group" style={{ height: "380px" }}
          onClick={() => setSelectedGame(featuredGame)}>
          {/* BG */}
          {(featuredGame.cover_url || featuredGame.image)
            ? <img src={featuredGame.cover_url || featuredGame.image} alt={featuredGame.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            : <div className={`absolute inset-0 bg-gradient-to-br ${featuredGame.gradient || 'from-indigo-600 to-purple-800'}`} />}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

          {/* Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-300">
            <Zap size={10} className="animate-pulse" /> Nouveauté
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">{featuredGame.category}</p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white mb-4 drop-shadow-2xl">
              {featuredGame.title}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black text-white">
                {Number(String(featuredGame.price).replace(/[^0-9]/g, '')).toLocaleString()}
                <small className="text-xs text-indigo-400 ml-1 font-bold not-italic">FCFA</small>
              </span>
              <button onClick={e => { e.stopPropagation(); addToCart(featuredGame); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-indigo-400 transition-all duration-200 shadow-2xl">
                <Plus size={14} /> Ajouter
              </button>
              <span className="flex items-center gap-1 text-xs text-white/40 font-bold group-hover:text-white/60 transition-colors">
                Voir détails <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-6 pb-24">

        {/* HEADER */}
        {!searchTerm && (
          <div className="mb-8 fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                {activeCategory === "Tous" ? "Tout le catalogue" : activeCategory}
                <span className="ml-3 text-sm font-bold text-white/20">{filteredGames.length} jeux</span>
              </h2>
            </div>

            {/* CATEGORIES — scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results label */}
        {searchTerm && (
          <div className="mb-6 fade-up">
            <p className="text-white/30 text-sm font-bold">
              {filteredGames.length} résultat{filteredGames.length !== 1 ? "s" : ""} pour <span className="text-white">"{searchTerm}"</span>
            </p>
          </div>
        )}

        {/* GRILLE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-indigo-500 border-indigo-500/10 animate-spin" />
              <Gamepad2 size={18} className="absolute inset-0 m-auto text-indigo-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGames.length > 0 ? filteredGames.map((game, idx) => (
              <div key={game.id}
                onClick={() => setSelectedGame(game)}
                className="card-hover cursor-pointer group fade-up"
                style={{ animationDelay: `${Math.min(idx * 40, 400)}ms`, opacity: 0 }}>

                <div className="rounded-[1.8rem] overflow-hidden bg-[#0f0f18] border border-white/[0.05] h-full flex flex-col">
                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden bg-[#13131f]">
                    {(game.cover_url || game.image) ? (
                      <img src={game.cover_url || game.image} alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-600/30 to-purple-800/30'} flex items-center justify-center`}>
                        <Gamepad2 size={40} className="text-white/10" />
                      </div>
                    )}
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Quick add button */}
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(game); }}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-indigo-600/50 hover:bg-white hover:text-black">
                      <Plus size={16} />
                    </button>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/60">
                      {game.category}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-black uppercase truncate text-white/90 group-hover:text-white transition-colors mb-3">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-white">
                        {Number(String(game.price).replace(/[^0-9]/g, '')).toLocaleString()}
                        <small className="text-[8px] text-indigo-400 ml-0.5 font-bold">FCFA</small>
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); addToCart(game); }}
                        className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-200 sm:hidden">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-24 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                  <Search size={24} className="text-white/20" />
                </div>
                <p className="text-white/20 font-bold text-sm">Aucun résultat trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} user={user} onClose={() => setIsCartOpen(false)} />}
      {selectedGame && <GameDetails game={selectedGame} onBack={() => setSelectedGame(null)} onAddToCart={addToCart} />}
    </div>
  );
}
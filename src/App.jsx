import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Gamepad2, ShoppingCart, Search, Plus,
  LogOut, Zap, ChevronRight, X, ArrowUpDown,
  SlidersHorizontal, History, Sparkles, Sliders
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
  
  // 🔥 NOUVELLES OPTIONS DE TRI ET HISTORIQUE
  const [sortBy, setSortBy] = useState("default"); // default, price-asc, price-desc, news
  const [showFilters, setShowFilters] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);

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
    // Charger l'historique des jeux consultés
    const savedRecents = localStorage.getItem("prostore_recents");
    if (savedRecents) setRecentViews(JSON.parse(savedRecents));
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isAuthenticated]);

  // 🔥 Option : Rotation automatique du Hero Banner toutes les 6 secondes
  useEffect(() => {
    if (games.length <= 1 || searchTerm || activeCategory !== "Tous") return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(games.length, 4));
    }, 6000);
    return () => clearInterval(interval);
  }, [games, searchTerm, activeCategory]);

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

  // 🔥 Option : Suivi des jeux récemment consultés (sans doublons, max 5)
  const trackRecentView = (game) => {
    setSelectedGame(game);
    setRecentViews(prev => {
      const filtered = prev.filter(g => g.id !== game.id);
      const updated = [game, ...filtered].slice(0, 5);
      localStorage.setItem("prostore_recents", JSON.stringify(updated));
      return updated;
    });
  };

  const categories = useMemo(() => {
    const cats = games.map(g => g.category).filter(Boolean);
    return ["Tous", ...new Set(cats)];
  }, [games]);

  // 🔥 Traitement combiné : Filtrage + Tri évolué
  const filteredGames = useMemo(() => {
    let result = games.filter(game => {
      const matchSearch = (game.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "Tous" || game.category === activeCategory;
      return matchSearch && matchCat;
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(String(a.price).replace(/[^0-9]/g, '')) - Number(String(b.price).replace(/[^0-9]/g, '')));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(String(b.price).replace(/[^0-9]/g, '')) - Number(String(a.price).replace(/[^0-9]/g, '')));
    } else if (sortBy === "news") {
      result.sort((a, b) => b.id - a.id);
    }
    return result;
  }, [searchTerm, activeCategory, games, sortBy]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const featuredGame = games[heroIndex] || games[0];

  if (window.location.pathname === '/admin') return <AdminDashboard />;
  if (isProfileOpen) return <UserProfile user={user} onBack={() => setIsProfileOpen(false)} />;
  if (!isAuthenticated) return <><Toaster position="top-right" /><Auth onLoginSuccess={handleLoginSuccess} /></>;

  return (
    <div
      ref={mainRef}
      className="h-screen overflow-y-auto bg-[#05050a] text-white font-sans selection:bg-indigo-500/30"
      style={{ scrollbarWidth: "none" }}
    >
      <style>{`
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .card-hover { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(99,102,241,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.7); }
      `}</style>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#0b0b14', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)' }
      }} />

      {/* ── NAVBAR ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#05050a]/85 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.8)]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">

          {/* LOGO */}
          <div className="flex items-center gap-3 mr-4 cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Gamepad2 size={18} className="text-white" />
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-base font-black uppercase tracking-widest hidden sm:block">
              PRO<span className="text-indigo-400 font-medium">STORE</span>
            </span>
          </div>

          {/* SEARCH */}
          <div className={`relative flex-1 max-w-md transition-all duration-500 ${searchFocused ? "max-w-xl" : ""}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchFocused ? "text-indigo-400" : "text-white/20"}`} size={15} />
            <input
              type="text"
              placeholder="Rechercher un jeu, une licence..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl py-2.5 pl-11 pr-4 text-xs outline-none text-white placeholder:text-white/20 transition-all duration-300 focus:bg-white/[0.06] focus:border-indigo-500/40 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.05)]"
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
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 group">
              <div className="w-6 h-6 rounded-xl overflow-hidden shrink-0 border border-white/10">
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-black">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>}
              </div>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                {user?.username}
              </span>
            </button>

            {/* PANIER */}
            <button onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-white/70 hover:text-white transition-all">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-indigo-500 text-[8px] font-black flex items-center justify-center shadow-md shadow-indigo-500/30 animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </button>

            {/* LOGOUT */}
            <button onClick={handleLogout}
              className="p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-rose-500/10 hover:border-rose-500/20 text-white/20 hover:text-rose-400 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO FEATURED DE FILTRAGE CHROMATIQUE AUTOMATIQUE ── */}
      {featuredGame && !searchTerm && activeCategory === "Tous" && (
        <div className="relative mx-6 mt-4 mb-8 rounded-[2rem] overflow-hidden cursor-pointer group" style={{ height: "360px" }}
          onClick={() => trackRecentView(featuredGame)}>
          
          {/* Cover Image */}
          {(featuredGame.cover_url || featuredGame.image)
            ? <img src={featuredGame.cover_url || featuredGame.image} alt={featuredGame.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105" />
            : <div className={`absolute inset-0 bg-gradient-to-br ${featuredGame.gradient || 'from-indigo-900 to-purple-950'}`} />}

          {/* Gradients de fusion cinématiques */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/80 via-transparent to-transparent" />

          {/* Indicateurs de progression du carrousel (discrets en haut à droite) */}
          <div className="absolute top-6 right-6 flex gap-1.5 z-10">
            {games.slice(0, 4).map((_, i) => (
              <div 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setHeroIndex(i); }}
                className={`h-1 rounded-full transition-all duration-500 ${i === heroIndex ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"}`} 
              />
            ))}
          </div>

          {/* Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300">
            <Zap size={9} className="text-indigo-400 animate-pulse" /> À LA UNE
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">{featuredGame.category}</p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-white mb-4 transition-all group-hover:translate-x-1 duration-300">
              {featuredGame.title}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-xl font-black text-white font-mono">
                {Number(String(featuredGame.price).replace(/[^0-9]/g, '')).toLocaleString()}
                <small className="text-[10px] text-indigo-400 ml-1 font-sans font-bold not-italic">FCFA</small>
              </span>
              <button onClick={e => { e.stopPropagation(); addToCart(featuredGame); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all duration-300 shadow-xl">
                <Plus size={12} /> Réserver
              </button>
              <span className="flex items-center gap-1 text-[11px] text-white/40 font-bold group-hover:text-white/70 transition-colors">
                Détails <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPOSANT MAIN ── */}
      <main className="max-w-7xl mx-auto px-6 pb-24">

        {/* SECTION NAVIGATION ET OPTS DE TRI */}
        {!searchTerm && (
          <div className="mb-8 fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                {activeCategory === "Tous" ? "Découvrir" : activeCategory}
                <span className="text-xs font-bold text-white/20">({filteredGames.length})</span>
              </h2>
              
              {/* Actions de tri */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${showFilters ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white"}`}
                >
                  <SlidersHorizontal size={12} /> Filtres
                </button>
              </div>
            </div>

            {/* TIROIR DE TRI AMÉLIORÉ */}
            {showFilters && (
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] mb-4 flex flex-wrap gap-2 items-center text-xs fade-up">
                <span className="text-white/30 text-[9px] font-black uppercase tracking-widest mr-2">Trier par :</span>
                {[
                  { id: "default", label: "Par défaut" },
                  { id: "price-asc", label: "Prix : Moins cher" },
                  { id: "price-desc", label: "Prix : Plus cher" },
                  { id: "news", label: "Plus récent" }
                ].map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => setSortBy(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sortBy === opt.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* CATEGORIES — Barre horizontale fluide */}
            <div className="flex gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-white/[0.02] border border-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.05]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Label de recherche active */}
        {searchTerm && (
          <div className="mb-6 fade-up">
            <p className="text-white/30 text-xs font-bold">
              {filteredGames.length} index trouvé{filteredGames.length !== 1 ? "s" : ""} pour <span className="text-white">"{searchTerm}"</span>
            </p>
          </div>
        )}

        {/* GRILLE PRINCIPALE DES JEUX */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
              <div className="absolute inset-1 rounded-full border border-t-indigo-500 border-indigo-500/5 animate-spin" />
              <Gamepad2 size={14} className="absolute inset-0 m-auto text-indigo-400" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredGames.length > 0 ? filteredGames.map((game, idx) => (
              <div key={game.id}
                onClick={() => trackRecentView(game)}
                className="card-hover cursor-pointer group fade-up bg-[#09090f] border border-white/[0.03] rounded-[1.5rem] overflow-hidden flex flex-col h-full"
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms`, opacity: 0 }}>

                {/* MODULE COMPORTANT L'IMAGE */}
                <div className="relative h-40 overflow-hidden bg-[#11111a]">
                  {(game.cover_url || game.image) ? (
                    <img src={game.cover_url || game.image} alt={game.title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                      <Gamepad2 size={32} className="text-white/5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                  {/* Bouton d'ajout rapide au survol */}
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(game); }}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-md shadow-indigo-600/30 hover:bg-white hover:text-black">
                    <Plus size={14} />
                  </button>

                  {/* Catégorie */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[7.5px] font-black uppercase tracking-wider text-white/50">
                    {game.category}
                  </div>
                </div>

                {/* INFOS DU BLOC */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <h3 className="text-[11px] font-black uppercase truncate text-white/80 group-hover:text-white transition-colors mb-2 tracking-tight">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-white">
                      {Number(String(game.price).replace(/[^0-9]/g, '')).toLocaleString()}
                      <small className="text-[8px] text-indigo-400 ml-0.5 font-sans font-bold">FCFA</small>
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(game); }}
                      className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all sm:hidden">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 flex flex-col items-center gap-3 text-center">
                <Search size={20} className="text-white/10" />
                <p className="text-white/20 font-bold text-xs">Aucun titre ne correspond</p>
              </div>
            )}
          </div>
        )}

        {/* 🔥 SECTION : HISTORIQUE DES JEUX RÉCEMMENT CONSULTÉS */}
        {recentViews.length > 0 && !searchTerm && (
          <div className="mt-16 fade-up">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2 mb-4">
              <History size={12} /> Récemment consultés
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {recentViews.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => setSelectedGame(g)}
                  className="p-2 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/5">
                    <img src={g.cover_url || g.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-tight truncate text-white/50 group-hover:text-white transition-colors flex-1">
                    {g.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} user={user} onClose={() => setIsCartOpen(false)} />}
      {selectedGame && <GameDetails game={selectedGame} onBack={() => setSelectedGame(null)} onAddToCart={addToCart} />}
    </div>
  );
}
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Gamepad2, ShoppingCart, Search, Plus, LogOut,
  Zap, ChevronRight, X, SlidersHorizontal, History,
  TrendingUp, ArrowUpDown, Sparkles, ChevronLeft
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { supabase } from './supabaseClient';
import CartDrawer from "./components/CartDrawer";
import GameDetails from "./components/GameDetails";
import Auth from "./components/Auth";
import UserProfile from "./components/UserProfile";
import AdminDashboard from './admin/AdminDashboard';

const parsePrice = (p) => Number(String(p).replace(/[^0-9]/g, '')) || 0;

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
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);
  const [addedIds, setAddedIds] = useState({});

  const mainRef = useRef();
  const searchRef = useRef();
  const catBarRef = useRef();

  // ── INIT ──
  useEffect(() => {
    const savedUser = localStorage.getItem("prostore_user");
    if (savedUser) {
      try {
        const p = JSON.parse(savedUser);
        setUser(p);
        setIsAuthenticated(true);
        const av = localStorage.getItem(`avatar_${p.email}`);
        if (av) setAvatarPreview(av);
      } catch { localStorage.removeItem("prostore_user"); }
    }
    const recents = localStorage.getItem("prostore_recents");
    if (recents) try { setRecentViews(JSON.parse(recents)); } catch {}
  }, []);

  // ── SCROLL DETECTION ──
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const fn = () => setScrolled(el.scrollTop > 80);
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, [isAuthenticated]);

  // ── HERO AUTO-ROTATE ──
  useEffect(() => {
    if (games.length < 2 || searchTerm || activeCategory !== "Tous") return;
    const t = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => {
        setHeroIndex(p => (p + 1) % Math.min(games.length, 5));
        setHeroTransition(true);
      }, 300);
    }, 7000);
    return () => clearInterval(t);
  }, [games, searchTerm, activeCategory]);

  // ── AUTH ──
  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("prostore_user", JSON.stringify(userData));
    const av = localStorage.getItem(`avatar_${userData.email}`);
    if (av) setAvatarPreview(av);
    toast.success(`Bienvenue, ${userData.username} !`);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("prostore_user");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setIsProfileOpen(false);
    setAvatarPreview(null);
  }, []);

  // ── DATA ──
  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('games').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) setGames(data);
    } catch { toast.error("Erreur de chargement"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAuthenticated) loadGames(); }, [isAuthenticated]);

  // ── PANIER ──
  const addToCart = useCallback((game, e) => {
    if (e) e.stopPropagation();
    setCart(prev => {
      const exists = prev.find(i => i.id === game.id);
      return exists
        ? prev.map(i => i.id === game.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...game, quantity: 1 }];
    });
    setAddedIds(prev => ({ ...prev, [game.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [game.id]: false })), 1200);
    toast.success(`${game.title} ajouté !`, { icon: "🎮" });
  }, []);

  // ── RECENTS ──
  const trackView = useCallback((game) => {
    setSelectedGame(game);
    setRecentViews(prev => {
      const next = [game, ...prev.filter(g => g.id !== game.id)].slice(0, 6);
      localStorage.setItem("prostore_recents", JSON.stringify(next));
      return next;
    });
  }, []);

  // ── FILTRES ──
  const categories = useMemo(() => {
    const cats = games.map(g => g.category).filter(Boolean);
    return ["Tous", ...new Set(cats)];
  }, [games]);

  const filteredGames = useMemo(() => {
    let r = games.filter(g => {
      const ms = (g.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const mc = activeCategory === "Tous" || g.category === activeCategory;
      return ms && mc;
    });
    if (sortBy === "price-asc") r = [...r].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sortBy === "price-desc") r = [...r].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sortBy === "news") r = [...r].sort((a, b) => b.id - a.id);
    return r;
  }, [searchTerm, activeCategory, games, sortBy]);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const featuredGames = games.slice(0, 5);
  const featuredGame = featuredGames[heroIndex] || games[0];
  const showHero = !searchTerm && activeCategory === "Tous" && featuredGame;

  // ── KEYBOARD SHORTCUT ──
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSearchTerm("");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // ── SCROLL CATEGORIES TO ACTIVE ──
  useEffect(() => {
    const bar = catBarRef.current;
    if (!bar) return;
    const active = bar.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [activeCategory]);

  if (window.location.pathname === '/admin') return <AdminDashboard />;
  if (isProfileOpen) return <UserProfile user={user} onBack={() => setIsProfileOpen(false)} />;
  if (!isAuthenticated) return <><Toaster position="top-right" /><Auth onLoginSuccess={handleLoginSuccess} /></>;

  return (
    <div ref={mainRef} className="h-screen overflow-y-auto bg-[#06060c] text-white font-sans" style={{ scrollbarWidth: "none" }}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes heroFade{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:scale(1)}}
        .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards}
        .hero-img{animation:heroFade 0.6s ease forwards}
        .card{transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s ease,border-color 0.35s ease}
        .card:hover{transform:translateY(-5px) scale(1.01);box-shadow:0 24px 48px rgba(0,0,0,0.7);border-color:rgba(99,102,241,0.15)}
        .btn-add{transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1)}
        .btn-add.added{animation:pop 0.4s ease}
        .cat-scroll::-webkit-scrollbar{display:none}
        .glass{background:rgba(255,255,255,0.03);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .group-scale-107:hover img{transform:scale(1.07)}
      `}</style>

      <Toaster position="top-right" toastOptions={{
        style: { background: '#0d0d18', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', fontSize: '13px' },
        duration: 2000,
      }} />

      {/* ══ NAVBAR ══ */}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.6)]" : ""}`}
        style={{ background: scrolled ? "rgba(6,6,12,0.88)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none" }}>
        <div className="max-w-screen-xl mx-auto px-5 py-3.5 flex items-center gap-3">

          {/* LOGO */}
          <button onClick={() => window.location.reload()} className="flex items-center gap-2.5 mr-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Gamepad2 size={17} className="text-white" />
            </div>
            <span className="text-[15px] font-black uppercase tracking-wider hidden md:block">
              Pro<span className="text-indigo-400">Store</span>
            </span>
          </button>

          {/* SEARCH */}
          <div className={`relative flex-1 max-w-sm transition-all duration-400 ${searchFocused ? "max-w-lg" : ""}`}>
            <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 ${searchFocused ? "text-indigo-400" : "text-white/20"}`} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher… (appuyer /)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-2.5 pl-10 pr-9 text-xs outline-none text-white placeholder:text-white/20 transition-all duration-300 focus:bg-white/[0.07] focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchTerm
              ? <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"><X size={13} /></button>
              : <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-white/15 font-mono border border-white/10 px-1.5 py-0.5 rounded hidden sm:flex items-center">/</kbd>}
          </div>

          <div className="flex-1" />

          {/* ACTIONS */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/[0.07] glass hover:border-white/10 transition-all duration-200 group">
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0">
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-black">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>}
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-white/40 group-hover:text-white/70 transition-colors max-w-[80px] truncate">
                {user?.username}
              </span>
            </button>

            <button onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-white/[0.07] glass hover:border-indigo-500/30 text-white/50 hover:text-white transition-all duration-200">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-[8px] font-black flex items-center justify-center px-1 shadow-lg shadow-indigo-500/50 border border-[#06060c]">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={handleLogout}
              className="p-2.5 rounded-xl border border-white/[0.07] glass text-white/20 hover:text-rose-400 hover:border-rose-500/20 transition-all duration-200">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      {showHero && (
        <div className="px-5 pt-4 pb-6">
          <div className="relative rounded-[1.75rem] overflow-hidden cursor-pointer group max-w-screen-xl mx-auto" style={{ height: "clamp(240px, 36vw, 400px)" }}
            onClick={() => trackView(featuredGame)}>

            <div className={`absolute inset-0 transition-opacity duration-300 ${heroTransition ? "opacity-100" : "opacity-0"}`}>
              {(featuredGame.cover_url || featuredGame.image)
                ? <img key={featuredGame.id} src={featuredGame.cover_url || featuredGame.image} alt={featuredGame.title}
                    className="hero-img w-full h-full object-cover" />
                : <div className={`w-full h-full bg-gradient-to-br ${featuredGame.gradient || 'from-indigo-900 to-violet-950'}`} />}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-[#06060c]/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06060c]/75 via-transparent to-transparent" />

            {/* DOTS */}
            <div className="absolute top-5 right-5 flex gap-1.5 z-10">
              {featuredGames.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setHeroIndex(i); }}
                  className={`rounded-full transition-all duration-400 ${i === heroIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"}`} />
              ))}
            </div>

            {/* ARROWS */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-white/20 z-10"
              onClick={e => { e.stopPropagation(); setHeroIndex(p => (p - 1 + featuredGames.length) % featuredGames.length); }}>
              <ChevronLeft size={16} className="text-white/70" />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-white/20 z-10"
              onClick={e => { e.stopPropagation(); setHeroIndex(p => (p + 1) % featuredGames.length); }}>
              <ChevronRight size={16} className="text-white/70" />
            </button>

            <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 z-10">
              <Zap size={9} className="text-indigo-400 animate-pulse" /> À LA UNE
            </div>

            <div className={`absolute bottom-0 left-0 p-7 z-10 transition-all duration-300 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/35 mb-1.5">{featuredGame.category}</p>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none text-white mb-4 max-w-[65%] drop-shadow-2xl">
                {featuredGame.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-black text-white font-mono">
                  {parsePrice(featuredGame.price).toLocaleString()}
                  <small className="text-[10px] text-indigo-400 ml-1 font-sans font-bold">FCFA</small>
                </span>
                <button onClick={e => addToCart(featuredGame, e)}
                  className={`btn-add flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all duration-300 ${addedIds[featuredGame.id] ? "added bg-emerald-500 text-white" : "bg-white text-black hover:bg-indigo-500 hover:text-white"}`}>
                  {addedIds[featuredGame.id] ? "✓ Ajouté" : <><Plus size={11} /> Ajouter</>}
                </button>
                <span className="flex items-center gap-1 text-[10px] text-white/30 font-bold group-hover:text-white/60 transition-colors">
                  Détails <ChevronRight size={11} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CATALOGUE ══ */}
      <main className="max-w-screen-xl mx-auto px-5 pb-28">

        {!searchTerm && (
          <div className="mb-6 fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {activeCategory !== "Tous" && (
                  <button onClick={() => setActiveCategory("Tous")} className="p-1.5 rounded-lg glass border border-white/[0.06] text-white/30 hover:text-white transition-colors">
                    <X size={13} />
                  </button>
                )}
                <h2 className="text-base font-black uppercase tracking-wide text-white">
                  {activeCategory === "Tous" ? "Catalogue" : activeCategory}
                  <span className="ml-2 text-xs font-bold text-white/20">{filteredGames.length}</span>
                </h2>
              </div>

              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${showFilters || sortBy !== "default" ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-400" : "glass border-white/[0.06] text-white/30 hover:text-white"}`}>
                  <SlidersHorizontal size={11} />
                  <span className="hidden sm:block">Trier</span>
                  {sortBy !== "default" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />}
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 glass border border-white/[0.08] rounded-2xl p-2 min-w-[190px] z-40 shadow-2xl fade-up">
                    {[
                      { id: "default", label: "Par défaut", icon: Sparkles },
                      { id: "news", label: "Plus récent", icon: Zap },
                      { id: "price-asc", label: "Prix croissant", icon: TrendingUp },
                      { id: "price-desc", label: "Prix décroissant", icon: ArrowUpDown },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => { setSortBy(opt.id); setShowFilters(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${sortBy === opt.id ? "bg-indigo-600/20 text-indigo-300" : "text-white/40 hover:text-white hover:bg-white/[0.04]"}`}>
                        <opt.icon size={12} /> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CATEGORIES */}
            <div ref={catBarRef} className="cat-scroll flex gap-1.5 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button key={cat} data-active={activeCategory === cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-250 ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]"
                      : "glass border border-white/[0.05] text-white/35 hover:text-white hover:bg-white/[0.05]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {searchTerm && (
          <div className="mb-5 fade-up flex items-center gap-3">
            <p className="text-sm text-white/40 font-bold">
              <span className="text-white">{filteredGames.length}</span> résultat{filteredGames.length !== 1 ? "s" : ""} pour
              <span className="text-indigo-400 ml-1">"{searchTerm}"</span>
            </p>
            <button onClick={() => setSearchTerm("")} className="text-[10px] text-white/25 hover:text-white/50 transition-colors font-bold underline">
              Effacer
            </button>
          </div>
        )}

        {/* GRILLE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border border-indigo-500/15 animate-ping" />
              <div className="absolute inset-1 rounded-full border-2 border-t-indigo-500 border-r-indigo-500/30 border-b-transparent border-l-transparent animate-spin" />
              <Gamepad2 size={14} className="absolute inset-0 m-auto text-indigo-400" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/15">Chargement...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
            {filteredGames.map((game, idx) => {
              const isAdded = addedIds[game.id];
              return (
                <div key={game.id} onClick={() => trackView(game)}
                  className="card cursor-pointer group bg-[#0b0b14] border border-white/[0.04] rounded-[1.4rem] overflow-hidden flex flex-col fade-up"
                  style={{ animationDelay: `${Math.min(idx * 25, 350)}ms`, opacity: 0 }}>

                  <div className="relative overflow-hidden bg-[#12121e] group-scale-107" style={{ height: "clamp(130px, 13vw, 175px)" }}>
                    {(game.cover_url || game.image) ? (
                      <img src={game.cover_url || game.image} alt={game.title} loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-700/20 to-violet-900/20'} flex items-center justify-center`}>
                        <Gamepad2 size={28} className="text-white/8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <button onClick={e => addToCart(game, e)}
                      className={`btn-add absolute bottom-2.5 right-2.5 w-8 h-8 rounded-[10px] flex items-center justify-center shadow-xl z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 ${isAdded ? "added bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-white hover:text-black"}`}>
                      {isAdded ? <span className="text-[10px] font-black">✓</span> : <Plus size={14} />}
                    </button>

                    <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded-md glass border border-white/8 text-[7px] font-black uppercase tracking-wider text-white/45">
                      {game.category}
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <h3 className="text-[11px] font-black uppercase leading-tight text-white/75 group-hover:text-white transition-colors line-clamp-2">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white font-mono">
                        {parsePrice(game.price).toLocaleString()}
                        <small className="text-[7.5px] text-indigo-400 ml-0.5 font-sans">FCFA</small>
                      </span>
                      <button onClick={e => addToCart(game, e)}
                        className={`btn-add sm:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isAdded ? "added bg-emerald-500 text-white" : "bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-transparent"}`}>
                        {isAdded ? <span className="text-[9px] font-black">✓</span> : <Plus size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 gap-4 fade-up">
            <div className="w-16 h-16 rounded-2xl glass border border-white/[0.05] flex items-center justify-center">
              <Search size={22} className="text-white/15" />
            </div>
            <div className="text-center">
              <p className="text-white/25 font-black text-sm mb-1">Aucun résultat</p>
              <p className="text-white/15 text-xs">Essaie un autre titre ou catégorie</p>
            </div>
            <button onClick={() => { setSearchTerm(""); setActiveCategory("Tous"); }}
              className="px-4 py-2 rounded-xl glass border border-white/[0.06] text-[10px] font-black text-white/40 hover:text-white transition-colors">
              Réinitialiser
            </button>
          </div>
        )}

        {/* RECENTS */}
        {recentViews.length > 0 && !searchTerm && (
          <div className="mt-14 fade-up">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 flex items-center gap-2 mb-3">
              <History size={11} /> Récemment consultés
            </p>
            <div className="flex gap-2 overflow-x-auto cat-scroll pb-1">
              {recentViews.map(g => (
                <button key={g.id} onClick={() => trackView(g)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-2xl glass border border-white/[0.05] hover:border-white/10 transition-all shrink-0 group">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                    {(g.cover_url || g.image)
                      ? <img src={g.cover_url || g.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={14} className="text-white/20" /></div>}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white/40 group-hover:text-white/70 transition-colors truncate max-w-[100px]">{g.title}</p>
                    <p className="text-[8px] text-white/20 font-bold">{parsePrice(g.price).toLocaleString()} FCFA</p>
                  </div>
                </button>
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
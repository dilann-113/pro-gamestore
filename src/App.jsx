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

  // ── INIT SESSION & CORRECTION CLÉ AVATAR ──
  useEffect(() => {
    const savedUser = localStorage.getItem("prostore_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Correction : Clé pstore_avatar_ harmonisée au chargement initial
        const savedAvatar = localStorage.getItem(`pstore_avatar_${parsedUser.email}`);
        if (savedAvatar) setAvatarPreview(savedAvatar);
      } catch { 
        localStorage.removeItem("prostore_user"); 
      }
    }
    const recents = localStorage.getItem("prostore_recents");
    if (recents) {
      try { setRecentViews(JSON.parse(recents)); } catch {}
    }
  }, []);

  // ── SCROLL DETECTION ──
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(el.scrollTop > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated]);

  // ── HERO AUTO-ROTATE ──
  useEffect(() => {
    if (games.length < 2 || searchTerm || activeCategory !== "Tous") return;
    const interval = setInterval(() => {
      setHeroTransition(false);
      setTimeout(() => {
        setHeroIndex(prev => (prev + 1) % Math.min(games.length, 5));
        setHeroTransition(true);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, [games, searchTerm, activeCategory]);

  // ── AUTH HANDLERS CORRIGÉS ──
  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("prostore_user", JSON.stringify(userData));
    
    // Correction : Utilisation stricte de pstore_avatar_ à la connexion
    const savedAvatar = localStorage.getItem(`pstore_avatar_${userData.email}`);
    if (savedAvatar) setAvatarPreview(savedAvatar);
    
    toast.success(`Content de vous revoir, ${userData.username} !`);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("prostore_user");
    setIsAuthenticated(false);
    setUser(null);
    setCart([]);
    setIsProfileOpen(false);
    setAvatarPreview(null);
    toast.error("Déconnexion réussie");
  }, []);

  // ── SUPABASE DATA FETCH ──
  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      if (data) setGames(data);
    } catch { 
      toast.error("Erreur réseau lors du chargement"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    if (isAuthenticated) loadGames(); 
  }, [isAuthenticated, loadGames]);

  // ── PANIER ──
  const addToCart = useCallback((game, e) => {
    if (e) e.stopPropagation();
    setCart(prev => {
      const exists = prev.find(item => item.id === game.id);
      return exists
        ? prev.map(item => item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...game, quantity: 1 }];
    });
    setAddedIds(prev => ({ ...prev, [game.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [game.id]: false })), 1000);
    toast.success(`${game.title} ajouté au panier`, { icon: "🎮" });
  }, []);

  // ── HISTORIQUE DE CONSULTATION ──
  const trackView = useCallback((game) => {
    setSelectedGame(game);
    setRecentViews(prev => {
      const next = [game, ...prev.filter(g => g.id !== game.id)].slice(0, 6);
      localStorage.setItem("prostore_recents", JSON.stringify(next));
      return next;
    });
  }, []);

  // ── FILTRES & COMPUTATIONS ──
  const categories = useMemo(() => {
    const cats = games.map(g => g.category).filter(Boolean);
    return ["Tous", ...new Set(cats)];
  }, [games]);

  const filteredGames = useMemo(() => {
    let result = games.filter(g => {
      const matchSearch = (g.title || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = activeCategory === "Tous" || g.category === activeCategory;
      return matchSearch && matchCategory;
    });
    if (sortBy === "price-asc") result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sortBy === "news") result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [searchTerm, activeCategory, games, sortBy]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const featuredGames = useMemo(() => games.slice(0, 5), [games]);
  const featuredGame = featuredGames[heroIndex] || games[0];
  const showHero = !searchTerm && activeCategory === "Tous" && featuredGame;

  // ── RACCOURCIS CLAVIERS ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchTerm("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── AUTO-SCROLL BARRE CATEGORIES ──
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
    <div ref={mainRef} className="h-screen overflow-y-auto bg-[#030307] text-slate-100 font-sans antialiased scroll-smooth" style={{ scrollbarWidth: "none" }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#090911', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', fontSize: '13px' },
        duration: 2200,
      }} />

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/5 bg-[#030307]/80 shadow-xl shadow-black/40 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* LOGO */}
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-all">
              <Gamepad2 size={18} className="text-white" />
            </div>
            <span className="text-base font-black uppercase tracking-tight hidden md:block">
              Pro<span className="text-indigo-400">Store</span>
            </span>
          </button>

          {/* BARRE DE RECHERCHE */}
          <div className={`relative flex-1 max-w-sm transition-all duration-300 ${searchFocused ? "max-w-md" : ""}`}>
            <Search size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${searchFocused ? "text-indigo-400" : "text-slate-500"}`} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher un jeu… (Appuyer sur /)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl py-2.5 pl-11 pr-10 text-xs outline-none text-slate-100 placeholder:text-slate-500 transition-all focus:bg-white/[0.05] focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchTerm ? (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            ) : (
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono border border-white/10 px-1.5 py-0.5 rounded hidden sm:inline-block">/</kbd>
            )}
          </div>

          {/* MENUS DROITE */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
              <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/10 shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors max-w-[90px] truncate">
                {user?.username}
              </span>
            </button>

            <button onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:border-indigo-500/40 text-slate-400 hover:text-white transition-all">
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-[9px] font-black flex items-center justify-center px-1 shadow-md shadow-indigo-500/40 border-2 border-[#030307]">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={handleLogout}
              className="p-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] text-slate-500 hover:text-rose-400 hover:border-rose-500/20 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO BANNER */}
      {showHero && (
        <div className="px-6 pt-2 pb-8 max-w-screen-xl mx-auto animate-fade-in">
          <div className="relative rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl bg-[#090911] border border-white/[0.04]" 
            style={{ height: "clamp(260px, 35vw, 420px)" }}
            onClick={() => trackView(featuredGame)}>

            <div className={`absolute inset-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-[1.02] ${heroTransition ? "opacity-100 filter blur-0" : "opacity-40 filter blur-md"}`}>
              {(featuredGame.cover_url || featuredGame.image) ? (
                <img key={featuredGame.id} src={featuredGame.cover_url || featuredGame.image} alt={featuredGame.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${featuredGame.gradient || 'from-indigo-900 to-slate-950'}`} />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-[#030307]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030307]/80 via-transparent to-transparent" />

            {/* SLIDER DOTS */}
            <div className="absolute top-6 right-6 flex gap-2 z-10 bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-white/5">
              {featuredGames.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setHeroIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${i === heroIndex ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>

            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:border-transparent text-white z-10"
              onClick={e => { e.stopPropagation(); setHeroIndex(prev => (prev - 1 + featuredGames.length) % featuredGames.length); }}>
              <ChevronLeft size={18} />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:border-transparent text-white z-10"
              onClick={e => { e.stopPropagation(); setHeroIndex(prev => (prev + 1) % featuredGames.length); }}>
              <ChevronRight size={18} />
            </button>

            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 z-10">
              <Zap size={10} className="fill-current animate-pulse" /> À la une
            </div>

            <div className={`absolute bottom-0 left-0 p-8 z-10 transition-all duration-500 ${heroTransition ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">{featuredGame.category}</p>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white mb-5 max-w-xl">
                {featuredGame.title}
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                  {parsePrice(featuredGame.price).toLocaleString()}
                  <small className="text-xs text-indigo-400 ml-1 font-sans font-bold">FCFA</small>
                </span>
                <button onClick={e => addToCart(featuredGame, e)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-xl ${addedIds[featuredGame.id] ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-indigo-500 hover:text-white"}`}>
                  {addedIds[featuredGame.id] ? "✓ Ajouté" : <><Plus size={13} /> Ajouter au panier</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-screen-xl mx-auto px-6 pb-24">
        {!searchTerm && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {activeCategory !== "Tous" && (
                  <button onClick={() => setActiveCategory("Tous")} className="p-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                )}
                <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  {activeCategory === "Tous" ? "Découvrir" : activeCategory}
                  <span className="text-xs font-medium text-slate-500 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md">{filteredGames.length}</span>
                </h2>
              </div>

              {/* ACTION TRIER */}
              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${showFilters || sortBy !== "default" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"}`}>
                  <SlidersHorizontal size={13} />
                  <span>Trier</span>
                  {sortBy !== "default" && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-[#090911] border border-white/10 rounded-2xl p-2 min-w-[200px] z-40 shadow-2xl animate-fade-in">
                    {[
                      { id: "default", label: "Par défaut", icon: Sparkles },
                      { id: "news", label: "Plus récent", icon: Zap },
                      { id: "price-asc", label: "Prix croissant", icon: TrendingUp },
                      { id: "price-desc", label: "Prix décroissant", icon: ArrowUpDown },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => { setSortBy(opt.id); setShowFilters(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${sortBy === opt.id ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:text-white hover:bg-white/[0.03]"}`}>
                        <opt.icon size={13} /> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FILTRES CATEGORIES */}
            <div ref={catBarRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {categories.map(cat => (
                <button key={cat} data-active={activeCategory === cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 snap-center ${
                    activeCategory === cat
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.01]"
                      : "bg-white/[0.02] border border-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {searchTerm && (
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
            <span>Trouvé <strong className="text-white">{filteredGames.length}</strong> jeu{filteredGames.length > 1 ? "s" : ""} lié{filteredGames.length > 1 ? "s" : ""} à </span>
            <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-xl font-bold">"{searchTerm}"</span>
          </div>
        )}

        {/* GRILLE PRODUITS */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredGames.map((game) => {
              const isAdded = addedIds[game.id];
              return (
                <div key={game.id} onClick={() => trackView(game)}
                  className={`group cursor-pointer bg-[#090911] border rounded-[1.75rem] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60 ${isAdded ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5" : "border-white/[0.04] hover:border-white/[0.08]"}`}>

                  <div className="relative overflow-hidden bg-[#131322] aspect-[4/3] w-full">
                    {(game.cover_url || game.image) ? (
                      <img src={game.cover_url || game.image} alt={game.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-600/10 to-purple-600/10'} flex items-center justify-center`}>
                        <Gamepad2 size={24} className="text-slate-700" />
                      </div>
                    )}

                    <button onClick={e => addToCart(game, e)}
                      className={`absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 opacity-100 sm:opacity-0 group-hover:opacity-100 translate-y-0 sm:translate-y-2 group-hover:translate-y-0 ${isAdded ? "bg-emerald-500 text-white scale-100" : "bg-indigo-600 text-white hover:bg-white hover:text-black"}`}>
                      {isAdded ? <span className="text-xs font-black">✓</span> : <Plus size={15} />}
                    </button>

                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[9px] font-bold text-slate-300">
                      {game.category}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <h3 className="text-xs font-bold leading-snug text-slate-200 group-hover:text-white transition-colors line-clamp-2 uppercase tracking-wide">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {parsePrice(game.price).toLocaleString()}
                        <small className="text-[9px] text-indigo-400 ml-0.5 font-sans font-bold">FCFA</small>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-slate-600">
              <Search size={24} />
            </div>
            <div className="text-center">
              <p className="text-slate-400 font-bold text-sm mb-1">Aucun produit trouvé</p>
              <p className="text-slate-600 text-xs">Ajustez vos filtres ou réinitialisez la recherche</p>
            </div>
            <button onClick={() => { setSearchTerm(""); setActiveCategory("Tous"); }}
              className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Réinitialiser
            </button>
          </div>
        )}

        {/* RECENTLY VIEWED */}
        {recentViews.length > 0 && !searchTerm && (
          <div className="mt-16 border-t border-white/[0.03] pt-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <History size={13} /> Continuer l'exploration
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {recentViews.map(g => (
                <button key={g.id} onClick={() => trackView(g)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/10 hover:bg-white/[0.03] transition-all shrink-0 group">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 shrink-0">
                    {(g.cover_url || g.image) ? (
                      <img src={g.cover_url || g.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={14} className="text-slate-600" /></div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors truncate max-w-[120px]">{g.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{parsePrice(g.price).toLocaleString()} FCFA</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} user={user} onClose={() => setIsCartOpen(false)} />}
      
      {/* Correction essentielle : user={user} transmis pour gérer l'identité des commentaires */}
      {selectedGame && <GameDetails game={selectedGame} user={user} onBack={() => setSelectedGame(null)} onAddToCart={addToCart} />}
    </div>
  );
}
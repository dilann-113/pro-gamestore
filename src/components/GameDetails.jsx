import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, ShieldCheck, Gamepad2, Star, ArrowLeft,
  Tag, Send, CheckCircle, Zap, Globe, Users, Monitor,
  Trophy, Heart, Share2, Cpu, HardDrive, MemoryStick,
  Wifi, Clock, Package, AlertCircle, ThumbsUp, Download,
  Edit3, Trash2, X, Check, Loader2
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const parsePrice = (p) => Number(String(p).replace(/[^0-9]/g, '')) || 0;

const getSystemReqs = (category) => {
  const heavy = ["Action", "Racing", "Adventure", "RPG"].includes(category);
  return {
    min: {
      os: "Windows 10 64-bit",
      cpu: heavy ? "Intel Core i5-8600K / AMD Ryzen 5 3600" : "Intel Core i3-8100 / AMD Ryzen 3 3300X",
      ram: heavy ? "12 Go RAM" : "8 Go RAM",
      gpu: heavy ? "NVIDIA GTX 1060 6Go / AMD RX 580" : "NVIDIA GTX 970 / AMD RX 480",
      storage: heavy ? "70 Go (SSD requis)" : "40 Go",
      directx: "DirectX 12",
      network: "Connexion Internet requise",
    },
    recommended: {
      os: "Windows 11 64-bit",
      cpu: heavy ? "Intel Core i7-10700K / AMD Ryzen 7 5800X" : "Intel Core i5-10600K / AMD Ryzen 5 5600X",
      ram: heavy ? "16 Go RAM" : "12 Go RAM",
      gpu: heavy ? "NVIDIA RTX 3070 / AMD RX 6800 XT" : "NVIDIA RTX 2070 / AMD RX 5700 XT",
      storage: heavy ? "70 Go SSD NVMe" : "40 Go SSD",
      directx: "DirectX 12 Ultimate",
      network: "Connexion haut débit",
    }
  };
};

const TAGS = {
  "Action": ["Action", "Combat", "Multijoueur", "FPS", "Solo"],
  "Racing": ["Course", "Voitures", "Simulation", "Arcade", "Solo"],
  "RPG": ["RPG", "Open World", "Histoire", "Fantaisie", "Solo"],
  "Adventure": ["Aventure", "Exploration", "Histoire", "Cinématique"],
  "Stratégie": ["Stratégie", "Tour par tour", "Gestion", "Multijoueur"],
  "Indie": ["Indie", "Pixel Art", "Solo", "Unique"],
};

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-purple-500 to-fuchsia-600",
];

function ReqRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <Icon size={12} className="text-white/25 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-0.5">{label}</span>
        <span className="text-[11px] text-white/65 font-medium leading-tight">{value}</span>
      </div>
    </div>
  );
}

export default function GameDetails({ game, onBack, onAddToCart, user }) {
  if (!game) return null;

  const [activeTab, setActiveTab]       = useState("about");
  const [reviews, setReviews]           = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newText, setNewText]           = useState("");
  const [newRating, setNewRating]       = useState(5);
  const [hoverRating, setHoverRating]   = useState(0);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [editText, setEditText]         = useState("");
  const [editRating, setEditRating]     = useState(5);
  const [added, setAdded]               = useState(false);
  const [liked, setLiked]               = useState(false);
  const [scrollY, setScrollY]           = useState(0);
  const containerRef                     = useRef();

  const reqs = getSystemReqs(game.category);
  const tags = TAGS[game.category] || ["Jeu vidéo", "Action", "Solo"];
  const price = parsePrice(game.price);
  const navOpacity = Math.min(scrollY / 100, 1);
  const myReview = reviews.find(r => r.user_email === user?.email);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  // ── SCROLL ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, []);

  // ── LOAD REVIEWS ──
  useEffect(() => {
    loadReviews();
  }, [game.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('game_id', game.id)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoadingReviews(false);
  };

  // ── SUBMIT REVIEW ──
  const handleSubmit = async () => {
    if (!newText.trim() || !user) return;
    setSubmitting(true);
    try {
      if (myReview) {
        // Mise à jour
        await supabase.from('reviews').update({
          rating: newRating,
          text: newText.trim(),
          updated_at: new Date().toISOString()
        }).eq('id', myReview.id);
      } else {
        // Nouveau
        await supabase.from('reviews').insert([{
          game_id: game.id,
          user_email: user.email,
          username: user.username || user.email.split('@')[0],
          rating: newRating,
          text: newText.trim(),
        }]);
      }
      setNewText("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      await loadReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // ── EDIT REVIEW ──
  const startEdit = (review) => {
    setEditingId(review.id);
    setEditText(review.text);
    setEditRating(review.rating);
  };

  const saveEdit = async (id) => {
    await supabase.from('reviews').update({
      rating: editRating,
      text: editText.trim(),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    setEditingId(null);
    await loadReviews();
  };

  // ── DELETE REVIEW ──
  const deleteReview = async (id) => {
    await supabase.from('reviews').delete().eq('id', id);
    await loadReviews();
  };

  // ── ADD TO CART ──
  const handleAddToCart = () => {
    onAddToCart(game);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const TABS = [
    { id: "about",   label: "À propos" },
    { id: "config",  label: "Config requise" },
    { id: "reviews", label: `Avis${reviews.length > 0 ? ` (${reviews.length})` : ""}` },
  ];

  // Préremplir si déjà un avis
  useEffect(() => {
    if (myReview && !newText) {
      setNewText(myReview.text);
      setNewRating(myReview.rating);
    }
  }, [myReview]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[150] overflow-y-auto bg-[#06060c] text-white font-sans" style={{ scrollbarWidth: "none" }}>
      <style>{`
        ::-webkit-scrollbar{display:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        @keyframes heroIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .fu{animation:fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0}
        .d1{animation-delay:0.06s}.d2{animation-delay:0.12s}.d3{animation-delay:0.18s}
        .d4{animation-delay:0.24s}.d5{animation-delay:0.30s}
        .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px)}
        .glass-d{background:rgba(0,0,0,0.5);backdrop-filter:blur(16px)}
        .shimmer-fx::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 2.5s infinite}
        .tab-btn{transition:all 0.25s ease;border-bottom:2px solid transparent}
        .tab-btn.active{border-bottom-color:rgb(99,102,241);color:white}
        .star-i{cursor:pointer;transition:transform 0.12s ease}
        .star-i:hover{transform:scale(1.35)}
        .card-lift{transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}
        .card-lift:hover{transform:translateY(-3px)}
        .hero-img{animation:heroIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards}
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 80% 35% at 50% -5%, rgba(79,70,229,0.25) 0%, transparent 65%)" }} />

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{ background: `rgba(6,6,12,${navOpacity * 0.97})`, backdropFilter: navOpacity > 0.1 ? "blur(24px)" : "none", borderBottom: navOpacity > 0.5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
        <button onClick={onBack} className="flex items-center gap-2 group text-white/40 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">Retour</span>
        </button>

        <div className={`flex items-center gap-3 transition-all duration-400 ${scrollY > 100 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {(game.cover_url || game.image) && (
            <img src={game.cover_url || game.image} alt="" className="w-7 h-7 rounded-lg object-cover" />
          )}
          <span className="text-[11px] font-black text-white truncate max-w-[120px] sm:max-w-[200px]">{game.title}</span>
          <button onClick={handleAddToCart}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${added ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
            {added ? <><CheckCircle size={11} /> Ajouté</> : <><ShoppingCart size={11} /> Acheter</>}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setLiked(!liked)}
            className={`w-8 h-8 rounded-xl glass border flex items-center justify-center transition-all ${liked ? "border-rose-500/30 text-rose-400 bg-rose-500/10" : "border-white/10 text-white/30 hover:text-rose-400"}`}>
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
          </button>
          <button className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
            <Share2 size={13} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: "clamp(250px, 42vw, 500px)" }}>
        {(game.cover_url || game.image)
          ? <img src={game.cover_url || game.image} alt={game.title} className="hero-img w-full h-full object-cover" style={{ filter: "brightness(0.8)" }} />
          : <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-900 to-violet-950'} flex items-center justify-center`}><Gamepad2 size={80} className="text-white/8" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-[#06060c]/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06060c]/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-10 pb-7">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-d border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300">
              <Tag size={8} /> {game.category}
            </span>
            {reviews.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-d border border-white/10 text-[9px] font-black text-yellow-400">
                ★ {avgRating} · {reviews.length} avis
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-d border border-white/10 text-[9px] font-black text-indigo-400">
              ✓ Clé numérique
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl max-w-3xl">
            {game.title}
          </h1>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md glass-d border border-white/[0.08] text-[8px] font-bold uppercase tracking-wider text-white/40">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* GAUCHE */}
          <div className="lg:col-span-2">
            <div className="flex gap-6 border-b border-white/[0.07] mb-8 fu d1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn pb-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? "active" : "text-white/30 hover:text-white/60"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* À PROPOS */}
            {activeTab === "about" && (
              <div className="space-y-8">
                <div className="fu d2 space-y-3">
                  <p className="text-white/60 leading-relaxed text-sm">
                    Plongez dans l'univers immersif de <span className="text-white font-bold">{game.title}</span> — 
                    une expérience de jeu d'exception sélectionnée par ProStore pour sa qualité exceptionnelle, 
                    ses graphismes de pointe et son gameplay addictif. Profitez d'une activation 
                    immédiate après votre achat. Disponible pour les joueurs au Gabon et en Afrique Centrale.
                  </p>
                </div>
                <div className="fu d3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "🎮", label: "Mode", val: "Solo & Multi" },
                    { icon: "🌍", label: "Langue", val: "Français / EN" },
                    { icon: "⚡", label: "Activation", val: "Immédiate" },
                    { icon: "♾️", label: "Licence", val: "À vie" },
                  ].map((h, i) => (
                    <div key={i} className="card-lift p-4 rounded-2xl glass border border-white/[0.06] text-center">
                      <div className="text-2xl mb-2">{h.icon}</div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-1">{h.label}</p>
                      <p className="text-xs font-black text-white">{h.val}</p>
                    </div>
                  ))}
                </div>
                <div className="fu d4 p-5 rounded-2xl glass border border-white/[0.06] space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Ce qui est inclus</p>
                  {["Jeu de base complet","Mises à jour gratuites à vie","Accès au contenu en ligne","Clé d'activation sécurisée","Support client ProStore 7j/7"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle size={9} className="text-indigo-400" />
                      </div>
                      <span className="text-xs text-white/60 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="fu d5 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-center gap-4">
                  <ShieldCheck size={28} className="text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white mb-0.5">Paiement 100% sécurisé</p>
                    <p className="text-[10px] text-white/40">Airtel Money · Moov Money · Virement bancaire</p>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIG */}
            {activeTab === "config" && (
              <div className="space-y-6 fu d2">
                <p className="text-xs text-white/40 leading-relaxed">Vérifiez que votre PC répond aux configurations minimales avant d'acheter.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Minimale", data: reqs.min, color: "border-white/[0.08]" },
                    { title: "Recommandée", data: reqs.recommended, color: "border-indigo-500/20" },
                  ].map(({ title, data, color }) => (
                    <div key={title} className={`p-5 rounded-2xl glass border ${color} space-y-1`}>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">{title}</p>
                      <ReqRow icon={Monitor} label="OS" value={data.os} />
                      <ReqRow icon={Cpu} label="Processeur" value={data.cpu} />
                      <ReqRow icon={MemoryStick} label="RAM" value={data.ram} />
                      <ReqRow icon={Gamepad2} label="GPU" value={data.gpu} />
                      <ReqRow icon={HardDrive} label="Stockage" value={data.storage} />
                      <ReqRow icon={Zap} label="DirectX" value={data.directx} />
                      <ReqRow icon={Wifi} label="Réseau" value={data.network} />
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/50 leading-relaxed">Un SSD est fortement recommandé. La connexion internet est nécessaire pour l'activation initiale.</p>
                </div>
              </div>
            )}

            {/* AVIS */}
            {activeTab === "reviews" && (
              <div className="space-y-6">

                {/* RECAP */}
                {reviews.length > 0 && (
                  <div className="fu d2 p-5 rounded-2xl glass border border-white/[0.06] flex items-center gap-8">
                    <div className="text-center shrink-0">
                      <p className="text-5xl font-black text-white leading-none">{avgRating}</p>
                      <div className="flex gap-0.5 justify-center my-1.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={parseFloat(avgRating) >= s ? "text-yellow-400" : "text-white/15"} fill={parseFloat(avgRating) >= s ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <p className="text-[8px] text-white/25 font-bold uppercase tracking-widest">{reviews.length} avis</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5,4,3,2,1].map(s => {
                        const n = reviews.filter(r => r.rating === s).length;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className="text-[9px] text-white/25 w-2.5 font-bold shrink-0">{s}</span>
                            <Star size={8} className="text-white/20 shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                                style={{ width: `${reviews.length > 0 ? (n / reviews.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-[9px] text-white/20 w-3 font-bold text-right">{n}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* LISTE AVIS */}
                {loadingReviews ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star size={32} className="text-white/10 mb-3" />
                    <p className="text-white/30 font-black text-xs uppercase tracking-widest">Aucun avis pour l'instant</p>
                    <p className="text-white/20 text-xs mt-1">Sois le premier à donner ton avis !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review, i) => {
                      const colorIdx = review.username?.charCodeAt(0) % AVATAR_COLORS.length || 0;
                      const isMe = review.user_email === user?.email;
                      const isEditing = editingId === review.id;
                      return (
                        <div key={review.id} className={`fu card-lift p-5 rounded-2xl glass border ${isMe ? "border-indigo-500/20" : "border-white/[0.05]"}`}
                          style={{ animationDelay: `${i * 0.06}s` }}>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {/* AVATAR AVEC LOGIQUE IMAGE FIX */}
                              <div className={`w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center font-black text-sm shadow-lg shrink-0`}>
                                {isMe && localStorage.getItem(`pstore_avatar_${user?.email}`) ? (
                                  <img 
                                    src={localStorage.getItem(`pstore_avatar_${user?.email}`)} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  (review.username?.[0] || "?").toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-[11px] font-black text-white uppercase tracking-wide">{review.username || "Anonyme"}</p>
                                  {isMe && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">Moi</span>}
                                </div>
                                <p className="text-[8px] text-white/25 font-bold mt-0.5">
                                  {new Date(review.updated_at || review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {review.updated_at && review.updated_at !== review.created_at && " (modifié)"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* ÉTOILES */}
                              {!isEditing && (
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={10} className={review.rating >= s ? "text-yellow-400" : "text-white/10"} fill={review.rating >= s ? "currentColor" : "none"} />
                                  ))}
                                </div>
                              )}

                              {/* ACTIONS SI C'EST MOI */}
                              {isMe && !isEditing && (
                                <div className="flex gap-1 ml-1">
                                  <button onClick={() => startEdit(review)}
                                    className="w-6 h-6 rounded-lg glass border border-white/10 flex items-center justify-center text-white/30 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                                    <Edit3 size={10} />
                                  </button>
                                  <button onClick={() => deleteReview(review.id)}
                                    className="w-6 h-6 rounded-lg glass border border-white/10 flex items-center justify-center text-white/30 hover:text-rose-400 hover:border-rose-500/30 transition-all">
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* MODE ÉDITION */}
                          {isEditing ? (
                            <div className="space-y-3 pl-12">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-white/30 font-bold">Note :</span>
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={16} className={`star-i ${editRating >= s ? "text-yellow-400" : "text-white/15"}`}
                                      fill={editRating >= s ? "currentColor" : "none"}
                                      onClick={() => setEditRating(s)} />
                                  ))}
                                </div>
                              </div>
                              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white outline-none resize-none focus:border-indigo-500/40 transition-all" />
                              <div className="flex gap-2">
                                <button onClick={() => saveEdit(review.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white transition-all">
                                  <Check size={11} /> Sauvegarder
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/10 text-[10px] font-black text-white/40 hover:text-white transition-all">
                                  <X size={11} /> Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/50 text-xs leading-relaxed pl-12">"{review.text}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* FORMULAIRE */}
                <div className="fu d5 p-6 rounded-2xl glass border border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                      {myReview ? "Modifier mon avis" : "Laisser un avis"}
                    </p>
                    {myReview && <span className="text-[8px] text-indigo-400 font-bold">Tu as déjà un avis sur ce jeu</span>}
                  </div>

                  {!user ? (
                    <p className="text-xs text-white/30 text-center py-4">Connecte-toi pour laisser un avis</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-white/30 font-bold">Note :</span>
                        <div className="flex gap-1.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={20} className={`star-i ${(hoverRating || newRating) >= s ? "text-yellow-400" : "text-white/15"}`}
                              fill={(hoverRating || newRating) >= s ? "currentColor" : "none"}
                              onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewRating(s)} />
                          ))}
                        </div>
                      </div>
                      <textarea value={newText} onChange={e => setNewText(e.target.value)}
                        placeholder="Partagez votre expérience avec la communauté…"
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                      <button onClick={handleSubmit} disabled={submitting || !newText.trim()}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 ${
                          submitted ? "bg-indigo-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}>
                        {submitting ? <Loader2 size={12} className="animate-spin" /> :
                         submitted ? <><CheckCircle size={12} /> Publié !</> :
                         <><Send size={12} /> {myReview ? "Mettre à jour" : "Publier"}</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DROITE STICKY */}
          <div className="lg:sticky lg:top-20 h-fit space-y-3 fu d2">
            <div className="p-5 rounded-2xl glass border border-white/[0.08] space-y-4 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
              {(game.cover_url || game.image) && (
                <div className="w-full h-28 rounded-xl overflow-hidden mb-4">
                  <img src={game.cover_url || game.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-white/25 mb-1">Prix</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{price.toLocaleString()}</span>
                  <span className="text-sm text-indigo-400 font-black">FCFA</span>
                </div>
                <p className="text-[8px] text-indigo-400 font-bold mt-1">✓ En stock — Livraison immédiate</p>
              </div>
              <button onClick={handleAddToCart}
                className={`relative overflow-hidden w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                  added ? "bg-indigo-500 text-white shadow-indigo-500/25" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 shimmer-fx"
                }`}>
                {added ? <><CheckCircle size={14} /> Ajouté au panier</> : <><ShoppingCart size={14} /> Ajouter au panier</>}
              </button>
              <button onClick={() => { onAddToCart(game); onBack(); }}
                className="w-full py-3 rounded-xl border border-white/[0.08] glass text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all">
                Acheter directement
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
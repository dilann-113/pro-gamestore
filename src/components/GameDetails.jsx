import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, ShieldCheck, Gamepad2, Cpu,
  Star, ArrowLeft, Tag, Send, CheckCircle,
  Zap, Globe, Users, Monitor, Trophy,
  Heart, Share2, HardDrive, Sliders, Check
} from 'lucide-react';

const parsePrice = (p) => Number(String(p).replace(/[^0-9]/g, '')) || 0;

export default function GameDetails({ game, onBack, onAddToCart }) {
  if (!game) return null;

  const [comments, setComments] = useState([
    { id: 1, user: "Marius K.", avatar: "M", date: "Il y a 2 jours", text: "Le jeu tourne super bien, graphismes incroyables. ProStore c'est sérieux !", rating: 5 },
    { id: 2, user: "Sarah L.", avatar: "S", date: "Il y a 1 semaine", text: "Livraison de la clé ultra rapide. Je recommande à 100% !", rating: 4 },
    { id: 3, user: "Kevin M.", avatar: "K", date: "Il y a 2 semaines", text: "Prix imbattable au Gabon. Aucun autre site ne fait ça.", rating: 5 },
  ]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [commentPosted, setCommentPosted] = useState(false);
  const [specTab, setSpecTab] = useState("minimum"); // minimum | recommended
  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fn = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', fn, { passive: true });
    return () => el.removeEventListener('scroll', fn);
  }, []);

  const handleAddToCart = () => {
    onAddToCart(game);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([{
      id: Date.now(),
      user: "Moi",
      avatar: "M",
      date: "À l'instant",
      text: newComment,
      rating
    }, ...comments]);
    setNewComment("");
    setCommentPosted(true);
    setTimeout(() => setCommentPosted(false), 2500);
  };

  const avgRating = (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1);
  const navOpacity = Math.min(scrollY / 120, 1);
  const price = parsePrice(game.price);

  // ── CONFIGURATIONS TECHNIQUES SIMULÉES DYNAMIQUEMENT ──
  const systemRequirements = {
    minimum: [
      { label: "Système d'exploitation", value: "Windows 10 (64-bit)" },
      { label: "Processeur (CPU)", value: "Intel Core i5-8400 / AMD Ryzen 5 2600" },
      { label: "Mémoire vive (RAM)", value: "8 GB RAM" },
      { label: "Carte graphique (GPU)", value: "NVIDIA GTX 1060 (6GB) / AMD RX 580" },
      { label: "DirectX", value: "Version 12" },
      { label: "Espace stockage", value: "SSD requis — 65 GB disponibles" }
    ],
    recommended: [
      { label: "Système d'exploitation", value: "Windows 10 / 11 (64-bit)" },
      { label: "Processeur (CPU)", value: "Intel Core i7-10700K / AMD Ryzen 7 3700X" },
      { label: "Mémoire vive (RAM)", value: "16 GB RAM" },
      { label: "Carte graphique (GPU)", value: "NVIDIA RTX 3060 Ti / AMD RX 6700 XT" },
      { label: "DirectX", value: "Version 12" },
      { label: "Espace stockage", value: "SSD NVMe haut débit — 65 GB disponibles" }
    ]
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[150] overflow-y-auto text-slate-100 font-sans bg-[#030307] scrollbar-none antialiased">
      
      {/* Ambient Blur Wallpaper Lueur */}
      <div className="fixed inset-x-0 top-0 pointer-events-none h-[500px] z-0 opacity-40"
        style={{ background: `radial-gradient(circle 800px at 50% -200px, rgba(79, 70, 229, 0.22) 0%, transparent 80%)` }} />

      {/* ── HEADER NAVIGATION GLASSMORPHIC ── */}
      <div className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 border-b border-transparent"
        style={{ 
          backgroundColor: `rgba(3, 3, 7, ${navOpacity * 0.85})`, 
          backdropFilter: navOpacity > 0.1 ? "blur(24px)" : "none", 
          borderColor: navOpacity > 0.5 ? "rgba(255, 255, 255, 0.05)" : "transparent" 
        }}>

        <button onClick={onBack} className="flex items-center gap-3 group text-slate-400 hover:text-white transition-colors">
          <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-white/20 transition-all">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Retour</span>
        </button>

        <div className={`flex items-center gap-4 transition-all duration-300 ${scrollY > 100 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
          <span className="text-xs font-black text-white uppercase tracking-wide truncate max-w-[160px]">{game.title}</span>
          <button onClick={handleAddToCart}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg ${added ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"}`}>
            {added ? <><CheckCircle size={13} /> Option validée</> : <><ShoppingCart size={13} /> Acheter</>}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all ${liked ? "text-rose-400 border-rose-500/30 bg-rose-500/10" : "text-slate-400 hover:text-rose-400 hover:border-white/10"}`}>
            <Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "scale-110 transition-transform" : ""} />
          </button>
          <button className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      {/* ── HERO HEADER BANNER (WIDESCREEN STEAM LAYOUT) ── */}
      <div className="relative w-full overflow-hidden border-b border-white/[0.02]" style={{ height: "clamp(280px, 42vw, 480px)" }}>
        {(game.cover_url || game.image) ? (
          <img src={game.cover_url || game.image} alt={game.title}
            className="w-full h-full object-cover select-none filter brightness-[0.75]" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-950 to-slate-950'} flex items-center justify-center`} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-[#030307]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030307]/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 sm:px-8 pb-8 z-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-wider text-indigo-400 backdrop-blur-md">
              <Tag size={10} /> {game.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-wider text-yellow-400 backdrop-blur-md">
              ⭐ {avgRating} ({comments.length} avis)
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-2xl max-w-4xl">
            {game.title}
          </h1>
        </div>
      </div>

      {/* ── GRID DE CONTENU PRINCIPAL ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">

          {/* ── COLONNE DE GAUCHE : PRÉSENTATION & CONFIGURATIONS DETAILED ── */}
          <div className="lg:col-span-2 space-y-12">

            {/* PRESENTATION TEXT */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Présentation du produit</h2>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">
                Découvrez l'aventure unique de <span className="text-white font-bold">{game.title}</span>. Ce jeu vidéo 
                est distribué sous forme de clé d'activation numérique officielle, livrée de façon instantanée après l'achat. 
                Optimisé pour les joueurs résidant au Gabon et en zone CEMAC.
              </p>
            </div>

            {/* 🛠️ NOUVELLE SECTION : CONFIGURATION SYSTÈME REQUISE (STEAM TYPE) */}
            <div className="space-y-5 p-6 rounded-3xl border border-white/[0.04] bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
                <div className="flex items-center gap-3">
                  <Cpu size={16} className="text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Spécifications PC requises</h3>
                </div>
                {/* SYSTEM TABS CONTROLS */}
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5 w-fit">
                  <button onClick={() => setSpecTab("minimum")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${specTab === "minimum" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
                    Minimale
                  </button>
                  <button onClick={() => setSpecTab("recommended")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${specTab === "recommended" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
                    Recommandée
                  </button>
                </div>
              </div>

              {/* LISTE CONFIG DYNAMIQUE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                {systemRequirements[specTab].map((req, index) => (
                  <div key={index} className="flex flex-col border-b border-white/[0.02] pb-2 last:border-0 sm:last:border-b">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">{req.label}</span>
                    <span className="text-xs font-bold text-slate-200">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RATINGS STATS AREA */}
            <div className="p-6 rounded-3xl border border-white/[0.04] bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-white font-mono tracking-tighter leading-none">{avgRating}</p>
                  <div className="flex gap-0.5 justify-center mt-3 mb-1.5 text-yellow-400">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} className={parseFloat(avgRating) >= s ? "fill-current" : "text-slate-700"} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{comments.length} retours vérifiés</p>
                </div>
                <div className="flex-1 w-full space-y-2.5">
                  {[5,4,3,2,1].map(s => {
                    const count = comments.filter(c => c.rating === s).length;
                    const pct = (count / comments.length) * 100;
                    return (
                      <div key={s} className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                        <span className="w-2">{s}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* REVIEWS HUB */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Évaluations clients</h2>
              </div>
              <div className="space-y-3.5">
                {comments.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-black text-sm text-white">
                          {c.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-200 uppercase tracking-wide">{c.user}</p>
                          <p className="text-[9px] text-slate-500 font-bold mt-0.5">{c.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-yellow-400 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={c.rating >= s ? "fill-current" : "text-slate-800"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed pl-12 italic">"{c.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WRITE REVIEWS FORM */}
            <div className="p-6 rounded-3xl border border-white/[0.04] bg-white/[0.01] space-y-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Évaluer ce jeu</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" className="transform transition-all duration-150 hover:scale-125 focus:outline-none"
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
                    <Star size={24} className={`transition-colors ${(hoverRating || rating) >= s ? "text-yellow-400 fill-current" : "text-slate-800"}`} />
                  </button>
                ))}
              </div>
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Rédigez votre avis ici (votre retour aide la communauté)..." rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 outline-none resize-none focus:border-indigo-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium" />
              <button onClick={handleAddComment}
                className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-98 ${commentPosted ? "bg-emerald-500 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}>
                {commentPosted ? <><CheckCircle size={14} /> Avis mis en ligne !</> : <><Send size={14} /> Envoyer l'avis</>}
              </button>
            </div>
          </div>

          {/* ── COLONNE DE DROITE : FINANCES & FEATURES SYSTÈME STICKY ── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">

            {/* MAIN TRANSACTION PANEL */}
            <div className="p-6 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent space-y-5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Prix Global</p>
                <p className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                  {price.toLocaleString()}
                  <span className="text-sm text-indigo-400 ml-2 font-sans font-bold uppercase">FCFA</span>
                </p>
              </div>

              {/* CTAS */}
              <button onClick={handleAddToCart}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-xl relative overflow-hidden ${added ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"}`}>
                {added ? <><CheckCircle size={14} /> Jeu ajouté au panier</> : <><ShoppingCart size={14} /> Mettre au panier</>}
              </button>

              <button onClick={() => { onAddToCart(game); onBack(); }}
                className="w-full py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.01] text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:border-white/10 hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2">
                <Zap size={14} className="fill-current text-indigo-400" /> Commande immédiate
              </button>

              {/* SECURITY DATA METADATA */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-200 uppercase tracking-wider">Passerelle Gabonaise Sécurisée</p>
                  <p className="text-[8px] text-slate-500 font-bold mt-0.5">Airtel Money • Moov Money</p>
                </div>
              </div>
            </div>

            {/* STEAM SIDEBAR METADATA FEATURES */}
            <div className="p-5 rounded-3xl border border-white/[0.04] bg-white/[0.01] space-y-3.5">
              {[
                { icon: "⚡", label: "Livraison", value: "Code d'activation instantané" },
                { icon: "🌍", label: "Région", value: "Gabon & CEMAC" },
                { icon: HardDrive, label: "Stockage Recommandé", value: "65 GB SSD" },
                { icon: "♾️", label: "Validité de licence", value: "Licence permanente" },
              ].map((info, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    {typeof info.icon === 'string' ? (
                      <span className="text-sm select-none">{info.icon}</span>
                    ) : (
                      <info.icon size={13} className="text-slate-500" />
                    )}
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{info.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 tracking-wide text-right max-w-[120px] truncate">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
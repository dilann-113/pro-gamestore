import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, ShieldCheck, Gamepad2,
  Star, ArrowLeft, Tag, Send, CheckCircle,
  Zap, Globe, Users, Monitor, Trophy,
  Heart, Share2
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
  const [activeSpec, setActiveSpec] = useState(null);
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

  const specs = [
    { icon: Monitor, label: "Résolution", value: "4K / HDR10" },
    { icon: Users, label: "Mode", value: "Multi & Solo" },
    { icon: Globe, label: "Audio", value: "FR / EN" },
    { icon: Trophy, label: "Succès", value: "50 Trophées" },
  ];

  return (
    <div ref={containerRef} className="fixed inset-0 z-[150] overflow-y-auto text-slate-100 font-sans bg-[#030307] scrollbar-none antialiased">
      
      {/* ── AMBIENT ARTWORK BACKGROUND GLOW ── */}
      <div className="fixed inset-x-0 top-0 pointer-events-none h-[500px] z-0 opacity-40 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle 800px at 50% -200px, rgba(79, 70, 229, 0.25) 0%, transparent 80%)` }} />

      {/* ── STICKY GLASSMORPHIC NAVIGATION BAR ── */}
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
            {added ? <><CheckCircle size={13} /> Ajouter</> : <><ShoppingCart size={13} /> Acheter</>}
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

      {/* ── CINEMATIC WIDESCREEN HERO BANNER ── */}
      <div className="relative w-full overflow-hidden border-b border-white/[0.02]" style={{ height: "clamp(280px, 42vw, 480px)" }}>
        {(game.cover_url || game.image) ? (
          <img src={game.cover_url || game.image} alt={game.title}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 select-none filter brightness-[0.75]" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-950 to-slate-950'} flex items-center justify-center`}>
            <Gamepad2 size={64} className="text-white/5 animate-pulse" />
          </div>
        )}

        {/* Cinematic Gradient Overlays */}
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

      {/* ── MAIN RESPONSIVE VIEW GRID ── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">

          {/* ── LEFT COLUMN : INFORMATION ARCHITECTURE ── */}
          <div className="lg:col-span-2 space-y-12">

            {/* PRODUCT SUMMARY */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">À propos de l'aventure</h2>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">
                Plongez dans l'univers immersif de <span className="text-white font-bold">{game.title}</span> — 
                une expérience de jeu d'exception sélectionnée par ProStore pour ses graphismes 
                de pointe et son gameplay addictif. Bénéficiez d'une activation immédiate après validation de l'achat. 
                Disponible en exclusivité pour les joueurs au Gabon et sur toute l'Afrique Centrale.
              </p>
            </div>

            {/* PERFORMANCE SPECS INTERACTIVE GRID */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-violet-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Données techniques</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} onClick={() => setActiveSpec(activeSpec === i ? null : i)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transform transition-all duration-300 hover:-translate-y-0.5 ${activeSpec === i ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5" : "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"}`}>
                    <spec.icon size={16} className={`mb-4 transition-colors ${activeSpec === i ? "text-indigo-400" : "text-slate-500"}`} />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">{spec.label}</p>
                    <p className="text-xs font-black text-white uppercase tracking-wide">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEWS HUB STATS */}
            <div className="p-6 rounded-3xl border border-white/[0.04] bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-white font-mono tracking-tighter leading-none">{avgRating}</p>
                  <div className="flex gap-0.5 justify-center mt-3 mb-1.5 text-yellow-400">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} className={parseFloat(avgRating) >= s ? "fill-current" : "text-slate-700"} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{comments.length} avis certifiés</p>
                </div>
                <div className="flex-1 w-full space-y-2.5">
                  {[5,4,3,2,1].map(s => {
                    const count = comments.filter(c => c.rating === s).length;
                    const pct = (count / comments.length) * 100;
                    return (
                      <div key={s} className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                        <span className="w-2">{s}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PUBLIC AVIS TIMELINE */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Fil des discussions</h2>
              </div>
              <div className="space-y-3.5">
                {comments.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-black text-sm text-white shadow-md">
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

            {/* INTERACTIVE REVIEW FORMULAIRE */}
            <div className="p-6 rounded-3xl border border-white/[0.04] bg-white/[0.01] space-y-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Rédiger votre évaluation</p>

              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    className="transform transition-all duration-150 hover:scale-125 focus:outline-none"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                  >
                    <Star 
                      size={24}
                      className={`transition-colors ${(hoverRating || rating) >= s ? "text-yellow-400 fill-current" : "text-slate-800"}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Racontez votre expérience d'achat et votre avis sur le titre..."
                rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 outline-none resize-none focus:border-indigo-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
              />

              <button onClick={handleAddComment}
                className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-98 ${
                  commentPosted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10"
                }`}>
                {commentPosted ? <><CheckCircle size={14} /> Avis partagé !</> : <><Send size={14} /> Envoyer l'avis</>}
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN : TRANSACTION CARD (STICKY) ── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">

            {/* SECURE CHECKOUT CORE CARD */}
            <div className="p-6 rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent space-y-5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Tarif unique</p>
                <p className="text-4xl font-black text-white font-mono tracking-tight leading-none">
                  {price.toLocaleString()}
                  <span className="text-sm text-indigo-400 ml-2 font-sans font-bold uppercase">FCFA</span>
                </p>
              </div>

              {/* ACTION MAIN CTA BUTTON */}
              <button onClick={handleAddToCart}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 shadow-xl relative overflow-hidden ${
                  added
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000"
                }`}>
                {added ? <><CheckCircle size={14} /> Option validée</> : <><ShoppingCart size={14} /> Mettre au panier</>}
              </button>

              <button onClick={() => { onAddToCart(game); onBack(); }}
                className="w-full py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.01] text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:border-white/10 hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2">
                <Zap size={14} className="fill-current text-indigo-400" /> Commande immédiate
              </button>

              {/* REGIONAL SECURE BADGE */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-200 uppercase tracking-wider">Passerelle Sécurisée</p>
                  <p className="text-[8px] text-slate-500 font-bold mt-0.5">Airtel Money • Moov Money Flooz</p>
                </div>
              </div>
            </div>

            {/* QUICK ACQUISITION METADATA */}
            <div className="p-5 rounded-3xl border border-white/[0.04] bg-white/[0.01] space-y-3.5">
              {[
                { icon: "⚡", label: "Traitement", value: "Livraison Immédiate" },
                { icon: "🌍", label: "Zone géographique", value: "Gabon & CEMAC" },
                { icon: "📦", label: "Support", value: "Code d'activation" },
                { icon: "♾️", label: "Disponibilité", value: "Accès à vie" },
              ].map((info, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm select-none">{info.icon}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{info.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 tracking-wide">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
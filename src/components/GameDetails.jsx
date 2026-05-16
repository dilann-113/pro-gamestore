import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, ShieldCheck, Gamepad2,
  Star, ArrowLeft, Tag, Send, CheckCircle,
  Zap, Globe, Users, Monitor, Trophy,
  ChevronDown, Heart, Share2
} from 'lucide-react';

const parsePrice = (p) => Number(String(p).replace(/[^0-9]/g, '')) || 0;

export default function GameDetails({ game, onBack, onAddToCart }) {
  if (!game) return null;

  const [comments, setComments] = useState([
    { id: 1, user: "Marius K.", avatar: "M", date: "Il y a 2 jours", text: "Le jeu tourne super bien, graphismes incroyables. ProStore c'est sérieux !", rating: 5, likes: 12 },
    { id: 2, user: "Sarah L.", avatar: "S", date: "Il y a 1 semaine", text: "Livraison de la clé ultra rapide. Je recommande à 100% !", rating: 4, likes: 7 },
    { id: 3, user: "Kevin M.", avatar: "K", date: "Il y a 2 semaines", text: "Prix imbattable au Gabon. Aucun autre site ne fait ça.", rating: 5, likes: 19 },
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
      rating,
      likes: 0
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
    <div ref={containerRef} className="fixed inset-0 z-[150] overflow-y-auto text-white font-sans" style={{ background: "#06060c", scrollbarWidth: "none" }}>
      <style>{`
        ::-webkit-scrollbar{display:none}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse2{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
        .slide-up{animation:slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
        .fade-in{animation:fadeIn 0.4s ease forwards}
        .pop{animation:pop 0.35s ease}
        .delay-1{animation-delay:0.05s;opacity:0}
        .delay-2{animation-delay:0.12s;opacity:0}
        .delay-3{animation-delay:0.19s;opacity:0}
        .delay-4{animation-delay:0.26s;opacity:0}
        .delay-5{animation-delay:0.33s;opacity:0}
        .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .glass-dark{background:rgba(0,0,0,0.4);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .shimmer-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);animation:shimmer 2s infinite}
        .star-hover{cursor:pointer;transition:transform 0.15s ease,color 0.15s ease}
        .star-hover:hover{transform:scale(1.3)}
        .spec-card{transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}
        .spec-card:hover{transform:translateY(-3px);border-color:rgba(99,102,241,0.3)}
        .comment-card{transition:all 0.3s ease}
        .comment-card:hover{transform:translateY(-2px)}
      `}</style>

      {/* ── AMBIENT GLOW ── */}
      {(game.cover_url || game.image) && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20"
          style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(99,102,241,0.6) 0%, transparent 70%)` }} />
      )}

      {/* ── STICKY NAV ── */}
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between transition-all duration-300"
        style={{ background: `rgba(6,6,12,${navOpacity * 0.95})`, backdropFilter: navOpacity > 0.1 ? "blur(24px)" : "none", borderBottom: navOpacity > 0.5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>

        <button onClick={onBack} className="flex items-center gap-2 group text-white/50 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Retour</span>
        </button>

        <div className={`flex items-center gap-3 transition-all duration-300 ${scrollY > 80 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <span className="text-xs font-black text-white truncate max-w-[140px]">{game.title}</span>
          <button onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${added ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
            {added ? <><CheckCircle size={12} /> Ajouté</> : <><ShoppingCart size={12} /> Acheter</>}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLiked(!liked)}
            className={`w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center transition-all ${liked ? "text-rose-400 border-rose-500/30 bg-rose-500/10" : "text-white/30 hover:text-rose-400"}`}>
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
          </button>
          <button className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* ── HERO IMAGE ── */}
      <div className="relative w-full overflow-hidden slide-up" style={{ height: "clamp(260px, 45vw, 520px)" }}>
        {(game.cover_url || game.image) ? (
          <img src={game.cover_url || game.image} alt={game.title}
            className="w-full h-full object-cover scale-[1.02]"
            style={{ filter: "brightness(0.85)" }} />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${game.gradient || 'from-indigo-900 to-violet-950'} flex items-center justify-center`}>
            <Gamepad2 size={80} className="text-white/10" />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-[#06060c]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06060c]/60 via-transparent to-transparent" />

        {/* Bottom content sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 sm:px-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-dark border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-300">
              <Tag size={9} /> {game.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-dark border border-white/10 text-[9px] font-black uppercase tracking-widest text-yellow-400">
              ⭐ {avgRating} ({comments.length} avis)
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
            {game.title}
          </h1>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* ── COLONNE GAUCHE ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* DESCRIPTION */}
            <div className="slide-up delay-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/40">À propos</h2>
              </div>
              <p className="text-white/60 leading-relaxed text-sm">
                Plongez dans l'univers immersif de <span className="text-white font-bold">{game.title}</span> — 
                une expérience de jeu d'exception sélectionnée par ProStore pour ses graphismes 
                de pointe et son gameplay addictif. Activation immédiate après achat. 
                Disponible pour les joueurs au Gabon et en Afrique Centrale.
              </p>
            </div>

            {/* SPECS GRID */}
            <div className="slide-up delay-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 rounded-full bg-violet-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/40">Caractéristiques</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} onClick={() => setActiveSpec(activeSpec === i ? null : i)}
                    className={`spec-card p-4 rounded-2xl border cursor-pointer ${activeSpec === i ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/[0.06] glass"}`}>
                    <spec.icon size={16} className={`mb-3 ${activeSpec === i ? "text-indigo-400" : "text-white/25"}`} />
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{spec.label}</p>
                    <p className="text-xs font-black text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RATING OVERVIEW */}
            <div className="slide-up delay-3 p-6 rounded-3xl border border-white/[0.06] glass">
              <div className="flex items-center gap-6">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-white leading-none">{avgRating}</p>
                  <div className="flex gap-0.5 justify-center mt-2 mb-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={12} className={parseFloat(avgRating) >= s ? "text-yellow-400" : "text-white/15"} fill={parseFloat(avgRating) >= s ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">{comments.length} avis</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(s => {
                    const count = comments.filter(c => c.rating === s).length;
                    const pct = (count / comments.length) * 100;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-[9px] text-white/25 w-3 font-bold">{s}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-white/25 w-4 font-bold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COMMENTAIRES */}
            <div className="slide-up delay-4 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-6 rounded-full bg-rose-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white/40">Avis de la communauté</h2>
              </div>
              {comments.map((c, i) => (
                <div key={c.id} className="comment-card p-5 rounded-2xl border border-white/[0.05] glass">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center font-black text-sm shrink-0 shadow-lg">
                        {c.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wide">{c.user}</p>
                        <p className="text-[9px] text-white/25 font-bold mt-0.5">{c.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={10} className={c.rating >= s ? "text-yellow-400" : "text-white/10"} fill={c.rating >= s ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed pl-12">"{c.text}"</p>
                </div>
              ))}
            </div>

            {/* FORMULAIRE AVIS */}
            <div className="slide-up delay-5 p-6 rounded-3xl border border-white/[0.06] glass space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Votre avis</p>

              {/* STAR SELECTOR */}
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={22}
                    className={`star-hover ${(hoverRating || rating) >= s ? "text-yellow-400" : "text-white/15"}`}
                    fill={(hoverRating || rating) >= s ? "currentColor" : "none"}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)} />
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience avec la communauté..."
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-indigo-500/40 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />

              <button onClick={handleAddComment}
                className={`relative overflow-hidden w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  commentPosted ? "bg-emerald-500 text-white" : "bg-rose-500 hover:bg-rose-400 text-white"
                }`}>
                {commentPosted ? <><CheckCircle size={13} /> Publié !</> : <><Send size={13} /> Publier l'avis</>}
              </button>
            </div>
          </div>

          {/* ── COLONNE DROITE — STICKY ── */}
          <div className="lg:sticky lg:top-20 h-fit space-y-4 slide-up delay-2">

            {/* PRIX + CTA */}
            <div className="p-6 rounded-3xl border border-white/[0.08] glass space-y-5 overflow-hidden relative">
              {/* Lueur d'ambiance */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mb-1">Prix</p>
                <p className="text-4xl font-black text-white leading-none">
                  {price.toLocaleString()}
                  <small className="text-sm text-indigo-400 ml-2 font-bold">FCFA</small>
                </p>
              </div>

              {/* CTA PRINCIPAL */}
              <button onClick={handleAddToCart}
                className={`relative overflow-hidden w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-2xl ${
                  added
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 shimmer-btn"
                }`}>
                {added
                  ? <><CheckCircle size={15} /> Ajouté au panier !</>
                  : <><ShoppingCart size={15} /> Ajouter au panier</>}
              </button>

              <button onClick={() => { onAddToCart(game); onBack(); }}
                className="w-full py-3.5 rounded-2xl border border-white/[0.08] glass text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2">
                <Zap size={13} /> Acheter maintenant
              </button>

              {/* ACHAT SÉCURISÉ */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-white uppercase tracking-wider">Achat sécurisé</p>
                  <p className="text-[8px] text-white/30 font-bold mt-0.5">Airtel Money • Moov Money</p>
                </div>
              </div>
            </div>

            {/* INFOS RAPIDES */}
            <div className="p-5 rounded-3xl border border-white/[0.06] glass space-y-3">
              {[
                { icon: "⚡", label: "Activation", value: "Immédiate" },
                { icon: "🌍", label: "Disponibilité", value: "Gabon & Afrique" },
                { icon: "📦", label: "Format", value: "Clé numérique" },
                { icon: "♾️", label: "Validité", value: "À vie" },
              ].map((info, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{info.icon}</span>
                    <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">{info.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-white">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
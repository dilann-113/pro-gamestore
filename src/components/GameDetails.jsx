import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, ShieldCheck, Gamepad2, Star, ArrowLeft,
  Tag, Send, CheckCircle, Zap, Globe, Users, Monitor,
  Trophy, Heart, Share2, Cpu, HardDrive, MemoryStick,
  Wifi, Clock, Package, ChevronDown, ChevronUp,
  AlertCircle, ThumbsUp, ThumbsDown, Download
} from 'lucide-react';

const parsePrice = (p) => Number(String(p).replace(/[^0-9]/g, '')) || 0;

// Config PC par défaut selon la catégorie
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

export default function GameDetails({ game, onBack, onAddToCart }) {
  if (!game) return null;

  const [activeTab, setActiveTab] = useState("about");
  const [comments, setComments] = useState([
    { id: 1, user: "Marius K.", avatar: "M", date: "Il y a 2 jours", text: "Graphismes incroyables, tourne parfaitement. ProStore c'est du sérieux !", rating: 5, likes: 12, color: "from-indigo-500 to-violet-600" },
    { id: 2, user: "Sarah L.", avatar: "S", date: "Il y a 1 semaine", text: "Livraison de la clé ultra rapide. Je recommande à 100% pour le Gabon !", rating: 4, likes: 7, color: "from-rose-500 to-pink-600" },
    { id: 3, user: "Kevin M.", avatar: "K", date: "Il y a 2 semaines", text: "Prix imbattable. Aucun autre site au Gabon ne propose ça. Merci ProStore.", rating: 5, likes: 19, color: "from-emerald-500 to-teal-600" },
  ]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [commentPosted, setCommentPosted] = useState(false);
  const [showFullReqs, setShowFullReqs] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const containerRef = useRef();

  const reqs = getSystemReqs(game.category);
  const tags = TAGS[game.category] || ["Jeu vidéo", "Action", "Solo"];
  const avgRating = (comments.reduce((s, c) => s + c.rating, 0) / comments.length).toFixed(1);
  const price = parsePrice(game.price);
  const navOpacity = Math.min(scrollY / 100, 1);

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
    setTimeout(() => setAdded(false), 2200);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    setComments([{ id: Date.now(), user: "Moi", avatar: "M", date: "À l'instant", text: newComment, rating, likes: 0, color: "from-indigo-500 to-purple-600" }, ...comments]);
    setNewComment("");
    setCommentPosted(true);
    setTimeout(() => setCommentPosted(false), 2500);
  };

  const TABS = [
    { id: "about", label: "À propos" },
    { id: "config", label: "Config requise" },
    { id: "reviews", label: `Avis (${comments.length})` },
  ];

  const ReqRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <Icon size={13} className="text-white/25 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-0.5">{label}</span>
        <span className="text-xs text-white/70 font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="fixed inset-0 z-[150] overflow-y-auto bg-[#06060c] text-white font-sans" style={{ scrollbarWidth: "none" }}>
      <style>{`
        ::-webkit-scrollbar{display:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        @keyframes pop{0%{transform:scale(1)}45%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes heroIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        .fu{animation:fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0}
        .d1{animation-delay:0.06s} .d2{animation-delay:0.12s} .d3{animation-delay:0.18s}
        .d4{animation-delay:0.24s} .d5{animation-delay:0.30s} .d6{animation-delay:0.36s}
        .glass{background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
        .glass-d{background:rgba(0,0,0,0.5);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .shimmer-fx::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);animation:shimmer 2.5s infinite}
        .tab-btn{transition:all 0.25s ease;border-bottom:2px solid transparent}
        .tab-btn.active{border-bottom-color:rgb(99,102,241);color:white}
        .star-i{cursor:pointer;transition:transform 0.12s ease}
        .star-i:hover{transform:scale(1.35)}
        .card-lift{transition:all 0.3s cubic-bezier(0.16,1,0.3,1)}
        .card-lift:hover{transform:translateY(-3px)}
        .req-col{transition:all 0.3s ease}
        .req-col:hover{border-color:rgba(99,102,241,0.2)}
        .hero-img{animation:heroIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards}
      `}</style>

      {/* AMBIENT */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 80% 35% at 50% -5%, rgba(79,70,229,0.25) 0%, transparent 65%)" }} />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{ background: `rgba(6,6,12,${navOpacity * 0.97})`, backdropFilter: navOpacity > 0.1 ? "blur(24px)" : "none", borderBottom: navOpacity > 0.5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>

        <button onClick={onBack} className="flex items-center gap-2 group text-white/40 hover:text-white transition-colors">
          <div className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">Retour</span>
        </button>

        {/* Titre mini au scroll */}
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

      {/* ── HERO ── */}
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-d border border-white/10 text-[9px] font-black text-yellow-400">
              ★ {avgRating} · {comments.length} avis
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-d border border-white/10 text-[9px] font-black text-emerald-400">
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

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── GAUCHE ── */}
          <div className="lg:col-span-2">

            {/* TABS */}
            <div className="flex gap-6 border-b border-white/[0.07] mb-8 fu d1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn pb-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? "active" : "text-white/30 hover:text-white/60"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: À PROPOS ── */}
            {activeTab === "about" && (
              <div className="space-y-8">

                {/* DESCRIPTION */}
                <div className="fu d2 space-y-3">
                  <p className="text-white/60 leading-relaxed text-sm">
                    Plongez dans l'univers immersif de <span className="text-white font-bold">{game.title}</span> — 
                    une expérience de jeu d'exception sélectionnée par ProStore pour sa qualité exceptionnelle, 
                    ses graphismes de pointe et son gameplay addictif. Profitez d'une activation 
                    immédiate après votre achat. Disponible pour les joueurs au Gabon et en Afrique Centrale.
                  </p>
                </div>

                {/* HIGHLIGHTS */}
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

                {/* INCLUS */}
                <div className="fu d4 p-5 rounded-2xl glass border border-white/[0.06] space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">Ce qui est inclus</p>
                  {[
                    "Jeu de base complet",
                    "Mises à jour gratuites à vie",
                    "Accès au contenu en ligne",
                    "Clé d'activation sécurisée",
                    "Support client ProStore 7j/7",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle size={9} className="text-indigo-400" />
                      </div>
                      <span className="text-xs text-white/60 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* ACHAT SÉCURISÉ STRIPE-LIKE */}
                <div className="fu d5 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-4">
                  <ShieldCheck size={28} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-white mb-0.5">Paiement 100% sécurisé</p>
                    <p className="text-[10px] text-white/40">Airtel Money · Moov Money · Virement bancaire</p>
                  </div>
                  <div className="ml-auto flex gap-2 shrink-0">
                    {["📱", "🏦"].map((e, i) => (
                      <div key={i} className="w-8 h-8 rounded-lg glass-d border border-white/10 flex items-center justify-center text-base">{e}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: CONFIG ── */}
            {activeTab === "config" && (
              <div className="space-y-6 fu d2">
                <p className="text-xs text-white/40 leading-relaxed">
                  Vérifiez que votre PC répond aux configurations minimales avant d'acheter. 
                  La configuration recommandée garantit la meilleure expérience de jeu.
                </p>

                {/* TOGGLE MINI / RECO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Minimale", data: reqs.min, color: "border-white/[0.08]", badge: "text-white/40 border-white/10 bg-white/[0.03]" },
                    { title: "Recommandée", data: reqs.recommended, color: "border-indigo-500/20", badge: "text-indigo-300 border-indigo-500/25 bg-indigo-500/8" },
                  ].map(({ title, data, color, badge }) => (
                    <div key={title} className={`req-col p-5 rounded-2xl glass border ${color} space-y-1`}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-white">{title}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badge}`}>{title}</span>
                      </div>
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

                {/* NOTES */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Les configurations peuvent varier selon les mises à jour du jeu. 
                    Un SSD est fortement recommandé pour des temps de chargement optimaux. 
                    La connexion internet est nécessaire pour l'activation initiale.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: AVIS ── */}
            {activeTab === "reviews" && (
              <div className="space-y-6">

                {/* RECAP NOTES */}
                <div className="fu d2 p-5 rounded-2xl glass border border-white/[0.06] flex items-center gap-8">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-white leading-none">{avgRating}</p>
                    <div className="flex gap-0.5 justify-center my-1.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={11} className={parseFloat(avgRating) >= s ? "text-yellow-400" : "text-white/15"} fill={parseFloat(avgRating) >= s ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-[8px] text-white/25 font-bold uppercase tracking-widest">{comments.length} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => {
                      const n = comments.filter(c => c.rating === s).length;
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-[9px] text-white/25 w-2.5 font-bold shrink-0">{s}</span>
                          <Star size={8} className="text-white/20 shrink-0" />
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-1000" style={{ width: `${(n / comments.length) * 100}%` }} />
                          </div>
                          <span className="text-[9px] text-white/20 w-3 font-bold text-right">{n}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LISTE AVIS */}
                <div className="space-y-3">
                  {comments.map((c, i) => (
                    <div key={c.id} className={`fu card-lift p-5 rounded-2xl glass border border-white/[0.05]`} style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center font-black text-sm shadow-lg shrink-0`}>
                            {c.avatar}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-wide">{c.user}</p>
                            <p className="text-[8px] text-white/25 font-bold mt-0.5">{c.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={10} className={c.rating >= s ? "text-yellow-400" : "text-white/10"} fill={c.rating >= s ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed pl-12 mb-3">"{c.text}"</p>
                      <div className="flex items-center gap-4 pl-12">
                        <button onClick={() => setLikedComments(p => ({ ...p, [c.id]: !p[c.id] }))}
                          className={`flex items-center gap-1.5 text-[9px] font-bold transition-colors ${likedComments[c.id] ? "text-indigo-400" : "text-white/20 hover:text-white/50"}`}>
                          <ThumbsUp size={11} /> {c.likes + (likedComments[c.id] ? 1 : 0)} utile{c.likes > 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FORMULAIRE */}
                <div className="fu d5 p-6 rounded-2xl glass border border-white/[0.06] space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Laisser un avis</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-white/30 font-bold">Note :</span>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={20} className={`star-i ${(hoverRating || rating) >= s ? "text-yellow-400" : "text-white/15"}`}
                          fill={(hoverRating || rating) >= s ? "currentColor" : "none"}
                          onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} />
                      ))}
                    </div>
                  </div>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="Partagez votre expérience avec la communauté…"
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-indigo-500/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                  <button onClick={handleComment}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${commentPosted ? "bg-emerald-500 text-white" : "bg-rose-500 hover:bg-rose-400 text-white"}`}>
                    {commentPosted ? <><CheckCircle size={12} /> Publié !</> : <><Send size={12} /> Publier</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── DROITE STICKY ── */}
          <div className="lg:sticky lg:top-20 h-fit space-y-3 fu d2">

            {/* PRIX + CTA */}
            <div className="p-5 rounded-2xl glass border border-white/[0.08] space-y-4 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

              {/* Mini cover */}
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
                <p className="text-[8px] text-emerald-400 font-bold mt-1">✓ En stock — Livraison immédiate</p>
              </div>

              <button onClick={handleAddToCart}
                className={`relative overflow-hidden w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                  added ? "bg-emerald-500 text-white shadow-emerald-500/25" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 shimmer-fx"
                }`}>
                {added ? <><CheckCircle size={14} /> Ajouté au panier</> : <><ShoppingCart size={14} /> Ajouter au panier</>}
              </button>

              <button onClick={() => { onAddToCart(game); onBack(); }}
                className="w-full py-3 rounded-xl border border-white/[0.08] glass text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Zap size={12} /> Acheter maintenant
              </button>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-white">Achat sécurisé</p>
                  <p className="text-[7px] text-white/30 font-bold mt-0.5">Airtel Money · Moov Money</p>
                </div>
              </div>
            </div>

            {/* INFOS PRODUIT */}
            <div className="p-4 rounded-2xl glass border border-white/[0.06] space-y-1">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Informations</p>
              {[
                { icon: Package, label: "Format", val: "Clé numérique" },
                { icon: Clock, label: "Activation", val: "Immédiate" },
                { icon: Globe, label: "Région", val: "Monde entier" },
                { icon: Download, label: "Plateforme", val: "PC / Console" },
                { icon: Users, label: "Joueurs", val: "1–32 joueurs" },
              ].map(({ icon: Icon, label, val }, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={11} className="text-white/25 shrink-0" />
                    <span className="text-[9px] font-bold text-white/35 uppercase tracking-wide">{label}</span>
                  </div>
                  <span className="text-[9px] font-black text-white">{val}</span>
                </div>
              ))}
            </div>

            {/* CONFIG MINI */}
            <div className="p-4 rounded-2xl glass border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">Config min.</p>
                <button onClick={() => setActiveTab("config")} className="text-[8px] text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  Voir tout →
                </button>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: Cpu, val: reqs.min.cpu.split("/")[0].trim() },
                  { icon: MemoryStick, val: reqs.min.ram },
                  { icon: Gamepad2, val: reqs.min.gpu.split("/")[0].trim() },
                  { icon: HardDrive, val: reqs.min.storage },
                ].map(({ icon: Icon, val }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon size={10} className="text-white/20 shrink-0" />
                    <span className="text-[9px] text-white/40 font-medium truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TAGS */}
            <div className="p-4 rounded-2xl glass border border-white/[0.06]">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg glass border border-white/[0.06] text-[8px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 hover:border-white/15 transition-colors cursor-pointer">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant interne ReqRow
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
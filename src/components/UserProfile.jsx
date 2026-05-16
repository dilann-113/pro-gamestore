import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ShoppingBag, Clock, CheckCircle2,
  ShieldCheck, Gamepad2, TrendingUp, Package,
  Camera
} from "lucide-react";
import { supabase } from "../supabaseClient";

// Extraction sécurisée avec gestion propre du CORS et filtrage des pixels sombres
function extractColor(imgEl, callback) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext("2d");
    
    imgEl.crossOrigin = "anonymous";
    
    ctx.drawImage(imgEl, 0, 0, 40, 40);
    const data = ctx.getImageData(0, 0, 40, 40).data;
    
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      if (data[i+3] > 128 && (data[i] + data[i+1] + data[i+2] > 60)) {
        r += data[i]; 
        g += data[i + 1]; 
        b += data[i + 2]; 
        count++;
      }
    }
    
    if (count > 0) {
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      callback(`${r}, ${g}, ${b}`);
    } else {
      callback("99, 102, 241"); // Fallback Indigo ProStore
    }
  } catch (e) {
    callback("99, 102, 241"); // Fallback en cas de blocage CORS strict
  }
}

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [dominantColor, setDominantColor] = useState("99, 102, 241");
  const [prevColor, setPrevColor] = useState("99, 102, 241");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [fadeTrigger, setFadeTrigger] = useState(true);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) return;
      try {
        const { data } = await supabase
          .from("orders").select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });
        if (data) setOrders(data);
      } catch (e) { 
        console.error("Erreur commandes:", e); 
      } finally { 
        setLoadingOrders(false); 
      }
    };
    
    fetchOrders();

    const saved = localStorage.getItem(`avatar_${user?.email}`);
    if (saved) setAvatarPreview(saved);
  }, [user]);

  // Gère la transition en douceur lors du changement de couleur dominante
  const updateDominantColor = (newColor) => {
    if (newColor === dominantColor) return;
    setPrevColor(dominantColor);
    setDominantColor(newColor);
    setFadeTrigger(false);
    setTimeout(() => {
      setFadeTrigger(true);
    }, 50);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      localStorage.setItem(`avatar_${user?.email}`, dataUrl);
      
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => extractColor(img, updateDominantColor);
    };
    reader.readAsDataURL(file);
  };

  const handleImgLoad = (e) => {
    extractColor(e.target, updateDominantColor);
  };

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
  const totalGames = orders.reduce((s, o) =>
    s + (Array.isArray(o.items) ? o.items.reduce((a, i) => a + (Number(i.quantity) || 1), 0) : 0), 0);

  const getRank = () => {
    if (totalSpent >= 500000) return { label: "Légende", icon: "👑", color: "text-amber-400" };
    if (totalSpent >= 200000) return { label: "Élite", icon: "💎", color: "text-cyan-400" };
    if (totalSpent >= 50000) return { label: "Pro", icon: "⚡", color: "text-indigo-400" };
    return { label: "Rookie", icon: "🎮", color: "text-slate-400" };
  };
  const rank = getRank();

  return (
    <div className="min-h-screen font-sans text-slate-200 bg-[#050508] relative overflow-x-hidden selection:bg-white/10">
      
      {/* COUCHE INFÉRIEURE : Ancienne couleur en arrière-plan */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ 
          background: `linear-gradient(180deg, rgb(${prevColor}) 0%, #07070a 45%, #050508 100%)`,
        }}
      />

      {/* COUCHE SUPÉRIEURE : Nouvelle couleur qui apparaît en fondu enchaîné (Fade In) */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out ${
          fadeTrigger ? "opacity-100" : "opacity-0"
        }`}
        style={{ 
          background: `linear-gradient(180deg, rgb(${dominantColor}) 0%, #07070a 45%, #050508 100%)`,
        }}
      />

      {/* BLOC DE CONTENU PRINCIPAL (Au-dessus des fonds d'ambiance) */}
      <div className="relative z-10 w-full">
        
        {/* HERO HEADER — Style Playlist Spotify Épuré */}
        <div className="relative pt-20 pb-10 px-6 md:px-12">
          
          {/* Fond lumineux localisé du Header pour l'effet de profondeur */}
          <div 
            className={`absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
              fadeTrigger ? "opacity-100" : "opacity-0"
            }`}
            style={{ 
              background: `linear-gradient(180deg, rgba(${dominantColor}, 0.5) 0%, rgba(${dominantColor}, 0.05) 100%)`,
            }}
          />

          {/* Bouton Retour sécurisé (pas de conflit d'historique) */}
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/70 border border-white/5 text-slate-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 max-w-5xl mx-auto">
            {/* AVATAR ROND CLIQUEUR */}
            <div className="relative group flex-shrink-0 z-10">
              <div 
                className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] ring-4 ring-black/30 cursor-pointer bg-[#101014] relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    crossOrigin="anonymous"
                    onLoad={handleImgLoad}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-6xl font-black tracking-tighter text-white transition-colors duration-1000"
                    style={{ background: `linear-gradient(135deg, rgba(${dominantColor}, 0.4) 0%, rgba(0,0,0,0.5) 100%)` }}
                  >
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 rounded-full backdrop-blur-sm">
                  <Camera size={24} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white">Modifier</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* METADONNÉES COMPTE */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Profil joueur</p>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none tracking-tighter drop-shadow-md">
                {user?.username}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs text-white/60 font-medium">
                <span className={`font-black px-2.5 py-1 rounded-md bg-white/5 border border-white/5 ${rank.color}`}>
                  {rank.icon} {rank.label.toUpperCase()}
                </span>
                <span>•</span>
                <span className="font-mono"><strong className="text-white font-sans font-bold">{orders.length}</strong> achat{orders.length > 1 ? 's' : ''}</span>
                <span>•</span>
                <span className="font-mono"><strong className="text-white font-sans font-bold">{totalGames}</strong> jeu{totalGames > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CORPS PRINCIPAL DE LA PAGE */}
        <div className="px-6 md:px-12 pb-16 max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-10 -mt-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all backdrop-blur-sm"
            >
              Changer d'image
            </button>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <ShieldCheck size={12} />
              Compte Certifié
            </div>
          </div>

          {/* GRILLE DES COMPTEURS ADAPTATIFS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Transactions", value: orders.length, icon: Package },
              { label: "Jeux acquis", value: totalGames, icon: Gamepad2 },
              { label: "Total investi", value: `${totalSpent.toLocaleString()} FCFA`, icon: TrendingUp, isMono: true },
            ].map((s, i) => (
              <div 
                key={i} 
                className="rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.05] border backdrop-blur-md"
                style={{ 
                  background: `rgba(${dominantColor}, 0.03)`, 
                  borderColor: `rgba(${dominantColor}, 0.15)` 
                }}
              >
                <s.icon size={16} className="mb-4 text-white/30" />
                <p className={`text-2xl md:text-3xl font-black text-white mb-1 ${s.isMono ? 'font-mono' : 'tracking-tight'}`}>{s.value}</p>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* NAVIGATION DES ONGLETS */}
          <div className="flex gap-2 mb-8 border-b border-white/5">
            {[
              { id: "orders", label: "Historique d'achats" },
              { id: "achievements", label: "Succès débloqués" },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "text-white border-white"
                    : "text-white/30 border-transparent hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ONGLET HISTORIQUE DES COMMANDES */}
          {activeTab === "orders" && (
            <div className="space-y-1 bg-black/10 p-2 rounded-2xl border border-white/[0.02]">
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                  <span className="text-[9px] font-mono tracking-widest text-white/30">SYNC...</span>
                </div>
              ) : orders.length > 0 ? orders.map((order, idx) => (
                <div 
                  key={order.id}
                  className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-150 border border-transparent hover:border-white/[0.02]"
                >
                  <div className="w-5 flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold text-white/30 group-hover:hidden">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <ShoppingBag size={13} className="hidden group-hover:block text-white/50" />
                  </div>

                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5 flex items-center justify-center shadow-md">
                    {Array.isArray(order.items) && (order.items[0]?.cover_url || order.items[0]?.image) ? (
                      <img src={order.items[0].cover_url || order.items[0].image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 size={15} className="text-white/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                      {Array.isArray(order.items) ? order.items.map(i => i.title).join(", ") : "Achat numérique"}
                    </p>
                    <p className="text-[10px] text-white/30 font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Validé
                  </div>

                  <p className="text-sm font-mono font-black text-white shrink-0 pl-2">
                    {Number(order.total_price).toLocaleString()} <span className="text-white/30 text-[10px] font-sans font-bold">FCFA</span>
                  </p>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag size={32} className="text-white/10 mb-3" />
                  <p className="text-white/30 font-bold text-xs uppercase tracking-wider">Aucune transaction enregistrée</p>
                </div>
              )}
            </div>
          )}

          {/* ONGLET SUCCÈS (GAMIFICATION) */}
          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { icon: "🎮", title: "Premier Pas", desc: "Première commande validée", unlocked: orders.length >= 1 },
                { icon: "🔥", title: "Collectionneur", desc: "5 commandes ou plus", unlocked: orders.length >= 5 },
                { icon: "💎", title: "Gros Dépensier", desc: "+100k FCFA investis", unlocked: totalSpent >= 100000 },
                { icon: "⚡", title: "Accumulation", desc: "10 jeux ou plus possédés", unlocked: totalGames >= 10 },
                { icon: "👑", title: "Baleine ProStore", desc: "+500k FCFA de budget", unlocked: totalSpent >= 500000 },
                { icon: "🚀", title: "Fidélité Absolue", desc: "10 commandes enregistrées", unlocked: orders.length >= 10 },
              ].map((a, i) => (
                <div 
                  key={i} 
                  className="rounded-2xl p-5 border transition-all duration-500"
                  style={{
                    background: a.unlocked ? `rgba(${dominantColor}, 0.04)` : 'rgba(0,0,0,0.2)',
                    borderColor: a.unlocked ? `rgba(${dominantColor}, 0.2)` : 'rgba(255,255,255,0.02)',
                    opacity: a.unlocked ? 1 : 0.35
                  }}
                >
                  <div className="text-2xl mb-3 filter drop-shadow-sm">{a.unlocked ? a.icon : "🔒"}</div>
                  <p className="font-black text-xs uppercase tracking-wider text-white mb-1">{a.title}</p>
                  <p className="text-xs text-white/40 font-medium">{a.desc}</p>
                  {a.unlocked && (
                    <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded w-max border border-emerald-500/10">
                      <CheckCircle2 size={9} /> Débloqué
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
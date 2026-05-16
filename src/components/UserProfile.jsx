import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ShoppingBag, Clock, CheckCircle2,
  ShieldCheck, Gamepad2, TrendingUp, Package,
  Edit3, Camera, Trophy, Star
} from "lucide-react";
import { supabase } from "../supabaseClient";

// Extraire la couleur dominante d'une image via canvas
function extractColor(imgEl, callback) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    callback(`${r}, ${g}, ${b}`);
  } catch (e) {
    callback("99, 102, 241"); // fallback indigo
  }
}

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [dominantColor, setDominantColor] = useState("99, 102, 241");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
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
      } catch (e) { console.error(e); }
      finally { setLoadingOrders(false); }
    };
    fetchOrders();

    // Charger avatar depuis localStorage
    const saved = localStorage.getItem(`avatar_${user?.email}`);
    if (saved) setAvatarPreview(saved);
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      localStorage.setItem(`avatar_${user?.email}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleImgLoad = (e) => {
    extractColor(e.target, setDominantColor);
  };

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
  const totalGames = orders.reduce((s, o) =>
    s + (Array.isArray(o.items) ? o.items.reduce((a, i) => a + (Number(i.quantity) || 1), 0) : 0), 0);

  const getRank = () => {
    if (totalSpent >= 500000) return { label: "Légende", icon: "👑" };
    if (totalSpent >= 200000) return { label: "Élite", icon: "💎" };
    if (totalSpent >= 50000) return { label: "Pro", icon: "⚡" };
    return { label: "Rookie", icon: "🎮" };
  };
  const rank = getRank();

  return (
    <div className="min-h-screen font-sans text-white"
      style={{ background: `linear-gradient(180deg, rgb(${dominantColor}) 0%, #0a0a0f 35%, #0a0a0f 100%)` }}>

      {/* HERO HEADER — Style Spotify */}
      <div className="relative pt-16 pb-8 px-6 md:px-12"
        style={{ background: `linear-gradient(180deg, rgba(${dominantColor}, 0.85) 0%, rgba(${dominantColor}, 0.4) 70%, transparent 100%)` }}>

        {/* Back button */}
        <button onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>

        <div className="flex flex-col md:flex-row items-end md:items-end gap-6 max-w-5xl mx-auto">

          {/* AVATAR ROND — cliquable pour modifier */}
          <div className="relative group flex-shrink-0">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/30 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" crossOrigin="anonymous"
                  onLoad={handleImgLoad}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-black"
                  style={{ background: `rgba(${dominantColor}, 0.3)` }}>
                  {user?.username?.[0]?.toUpperCase() || "G"}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 rounded-full">
                <Camera size={28} className="text-white" />
                <span className="text-xs font-bold text-white">Modifier</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* USER INFO */}
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-2">Profil joueur</p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tighter">
              {user?.username}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="font-bold">{rank.icon} {rank.label}</span>
              <span>•</span>
              <span><strong className="text-white">{orders.length}</strong> commande{orders.length > 1 ? 's' : ''}</span>
              <span>•</span>
              <span><strong className="text-white">{totalGames}</strong> jeux</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 md:px-12 pb-12 max-w-5xl mx-auto">

        {/* ACTION BUTTONS — Style Spotify */}
        <div className="flex items-center gap-4 mb-10 mt-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 rounded-full border border-white/30 text-sm font-bold text-white hover:border-white transition-colors">
            Modifier le profil
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-xs font-bold text-white/50 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-400" />
            Vérifié
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Commandes", value: orders.length, icon: Package },
            { label: "Jeux achetés", value: totalGames, icon: Gamepad2 },
            { label: "Total investi", value: `${totalSpent.toLocaleString()} FCFA`, icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 md:p-5 transition-colors hover:bg-white/10"
              style={{ background: `rgba(${dominantColor}, 0.12)`, border: `1px solid rgba(${dominantColor}, 0.2)` }}>
              <s.icon size={18} className="mb-3 text-white/60" />
              <p className="text-2xl md:text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-xs text-white/50 font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {[
            { id: "orders", label: "Commandes" },
            { id: "achievements", label: "Succès" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-white border-white"
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ORDERS — Style liste Spotify */}
        {activeTab === "orders" && (
          <div className="space-y-1">
            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : orders.length > 0 ? orders.map((order, idx) => (
              <div key={order.id}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-default">

                {/* NUMBER */}
                <span className="w-6 text-center text-sm font-bold text-white/40 group-hover:hidden flex-shrink-0">
                  {idx + 1}
                </span>
                <ShoppingBag size={14} className="hidden group-hover:block text-white/60 flex-shrink-0" />

                {/* COVER ou icône */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                  {Array.isArray(order.items) && (order.items[0]?.cover_url || order.items[0]?.image) ? (
                    <img src={order.items[0].cover_url || order.items[0].image} alt=""
                      className="w-full h-full object-cover" />
                  ) : (
                    <Gamepad2 size={16} className="text-white/40" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {Array.isArray(order.items)
                      ? order.items.map(i => i.title).join(", ")
                      : "Commande"}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* STATUS */}
                <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Validé
                </div>

                {/* PRICE */}
                <p className="text-sm font-bold text-white/80 flex-shrink-0">
                  {Number(order.total_price).toLocaleString()} <span className="text-white/40 text-xs">FCFA</span>
                </p>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag size={40} className="text-white/10 mb-4" />
                <p className="text-white/40 font-bold text-sm">Aucune commande pour l'instant</p>
              </div>
            )}
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: "🎮", title: "Premier Achat", desc: "Première commande validée", unlocked: orders.length >= 1 },
              { icon: "🔥", title: "Accro du Gaming", desc: "5 commandes ou plus", unlocked: orders.length >= 5 },
              { icon: "💎", title: "Gros Dépensier", desc: "+100 000 FCFA dépensés", unlocked: totalSpent >= 100000 },
              { icon: "⚡", title: "Collectionneur", desc: "10 jeux ou plus", unlocked: totalGames >= 10 },
              { icon: "👑", title: "Légende ProStore", desc: "+500 000 FCFA dépensés", unlocked: totalSpent >= 500000 },
              { icon: "🚀", title: "Client Fidèle", desc: "10 commandes ou plus", unlocked: orders.length >= 10 },
            ].map((a, i) => (
              <div key={i} className="rounded-2xl p-5 transition-all"
                style={{
                  background: a.unlocked ? `rgba(${dominantColor}, 0.15)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${a.unlocked ? `rgba(${dominantColor}, 0.3)` : 'rgba(255,255,255,0.06)'}`,
                  opacity: a.unlocked ? 1 : 0.5
                }}>
                <div className="text-3xl mb-3">{a.unlocked ? a.icon : "🔒"}</div>
                <p className="font-black text-sm text-white mb-1">{a.title}</p>
                <p className="text-xs text-white/40">{a.desc}</p>
                {a.unlocked && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase">
                    <CheckCircle2 size={10} /> Débloqué
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
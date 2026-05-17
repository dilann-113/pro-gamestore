import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ShoppingBag, Clock, CheckCircle2,
  ShieldCheck, Gamepad2, TrendingUp, Package,
  Camera, Star, Zap, Crown, Trophy
} from "lucide-react";
import { supabase } from "../supabaseClient";

function extractColor(imgEl, callback) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 40; canvas.height = 40;
    const ctx = canvas.getContext("2d");
    imgEl.crossOrigin = "anonymous";
    ctx.drawImage(imgEl, 0, 0, 40, 40);
    const data = ctx.getImageData(0, 0, 40, 40).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      if (data[i+3] > 128 && (data[i] + data[i+1] + data[i+2] > 70)) {
        r += data[i]; g += data[i+1]; b += data[i+2]; count++;
      }
    }
    if (count > 0) callback(`${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}`);
    else callback("99, 102, 241");
  } catch { callback("99, 102, 241"); }
}

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [uploading, setUploading] = useState(false); // État de chargement pour l'upload
  const [activeTab, setActiveTab] = useState("orders");
  const [dominantColor, setDominantColor] = useState("99, 102, 241");
  const [prevColor, setPrevColor] = useState("99, 102, 241");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [fadeTrigger, setFadeTrigger] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const fileInputRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      if (!user?.email) return;
      
      try {
        // 1. Récupération des commandes
        const { data: ordersData } = await supabase.from("orders").select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });
        if (ordersData) setOrders(ordersData);

        // 2. Récupération de l'avatar depuis la table profiles de Supabase
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("email", user.email)
          .single();

        if (profileData?.avatar_url) {
          setAvatarPreview(profileData.avatar_url);
        }
      } catch(e) { 
        console.error("Erreur lors de la récupération des données :", e); 
      } finally { 
        setLoadingOrders(false); 
      }
    };

    fetchUserDataAndOrders();
  }, [user]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const updateDominantColor = (newColor) => {
    if (newColor === dominantColor) return;
    setPrevColor(dominantColor);
    setDominantColor(newColor);
    setFadeTrigger(false);
    setTimeout(() => setFadeTrigger(true), 50);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.email) return;

    try {
      setUploading(true);

      // Génération d'un nom de fichier unique pour éviter les conflits de cache
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.email.replace(/[@.]/g, '_')}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `user_avatars/${fileName}`;

      // 1. Envoi du fichier vers le bucket 'avatars' de Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Récupération de l'URL publique de l'image stockée
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 3. Mise à jour de la colonne avatar_url dans la table profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("email", user.email);

      if (updateError) throw updateError;

      // 4. Mise à jour locale de l'état d'affichage de l'avatar
      setAvatarPreview(publicUrl);

      // Extraction de la couleur dominante à partir de la nouvelle URL
      const img = new Image();
      img.src = publicUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => extractColor(img, updateDominantColor);

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'avatar :", error.message);
      alert("Impossible de mettre à jour l'avatar. Vérifiez la configuration de Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleImgLoad = (e) => extractColor(e.target, updateDominantColor);

  const totalSpent = orders.reduce((s, o) => s + (Number(o.total_price) || 0), 0);
  const totalGames = orders.reduce((s, o) =>
    s + (Array.isArray(o.items) ? o.items.reduce((a, i) => a + (Number(i.quantity) || 1), 0) : 0), 0);

  const getRank = () => {
    if (totalSpent >= 500000) return { label: "Légende", icon: Crown, color: "#fbbf24", glow: "255, 191, 36" };
    if (totalSpent >= 200000) return { label: "Élite", icon: Star, color: "#22d3ee", glow: "34, 211, 238" };
    if (totalSpent >= 50000) return { label: "Pro", icon: Zap, color: "#818cf8", glow: "129, 140, 248" };
    return { label: "Rookie", icon: Gamepad2, color: "#94a3b8", glow: "148, 163, 184" };
  };
  const rank = getRank();
  const RankIcon = rank.icon;

  const headerCollapsed = scrollY > 200;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto text-white font-sans"
      style={{ background: "#050508" }}
    >
      {/* ── FONDS DYNAMIQUES ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgb(${prevColor}) 0%, transparent 70%)` }} />
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[1200ms] ease-in-out ${fadeTrigger ? "opacity-100" : "opacity-0"}`}
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgb(${dominantColor}) 0%, transparent 70%)` }} />

      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      {/* ── NAVBAR FLOTTANTE ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerCollapsed ? "py-3 bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl" : "py-5 bg-transparent"}`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <button onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 group">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 ${headerCollapsed ? "opacity-100" : "opacity-0 -translate-x-2"}`}>
              Retour
            </span>
          </button>

          {/* Mini profil quand scrollé */}
          <div className={`flex items-center gap-3 transition-all duration-500 ${headerCollapsed ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: `rgba(${dominantColor}, 0.5)` }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-sm font-black" style={{ background: `rgb(${dominantColor})` }}>{user?.username?.[0]?.toUpperCase()}</div>}
            </div>
            <span className="text-sm font-black text-white">{user?.username}</span>
          </div>

          <div className="w-20" />
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">

            {/* AVATAR */}
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
              {/* Halo animé */}
              <div className="absolute -inset-3 rounded-full animate-pulse opacity-30 blur-xl transition-all duration-1000"
                style={{ background: `rgb(${dominantColor})` }} />
              <div className="absolute -inset-1 rounded-full opacity-60"
                style={{ background: `conic-gradient(from 0deg, rgb(${dominantColor}), transparent, rgb(${dominantColor}))` }} />

              <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)] bg-black">
                {uploading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-white/50">Envoi...</span>
                  </div>
                ) : avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" crossOrigin="anonymous" onLoad={handleImgLoad}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-black"
                      style={{ background: `linear-gradient(135deg, rgba(${dominantColor},0.3), rgba(0,0,0,0.6))` }}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Overlay édition */}
                {!uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <Camera size={22} className="text-white" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Modifier</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* INFOS */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border"
                style={{ color: rank.color, borderColor: `rgba(${rank.glow}, 0.3)`, background: `rgba(${rank.glow}, 0.08)` }}>
                <RankIcon size={11} />
                {rank.label}
              </div>

              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl"
                style={{ textShadow: `0 0 80px rgba(${dominantColor}, 0.4)` }}>
                {user?.username}
              </h1>

              <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">{user?.email}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                {[
                  { val: orders.length, label: "achats" },
                  { val: totalGames, label: "jeux" },
                  { val: `${(totalSpent/1000).toFixed(0)}K`, label: "FCFA" },
                ].map((s, i) => (
                  <div key={i} className="text-center md:text-left">
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="px-6 mb-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Transactions", value: orders.length, icon: Package, suffix: "" },
            { label: "Jeux acquis", value: totalGames, icon: Gamepad2, suffix: "" },
            { label: "Total investi", value: totalSpent.toLocaleString(), icon: TrendingUp, suffix: " FCFA" },
          ].map((s, i) => (
            <div key={i} className="relative group rounded-3xl p-6 border overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, rgba(${dominantColor}, 0.07) 0%, rgba(0,0,0,0.3) 100%)`,
                borderColor: `rgba(${dominantColor}, 0.15)`,
              }}>
              {/* Lueur coin */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                style={{ background: `rgb(${dominantColor})` }} />
              <s.icon size={18} className="mb-4 opacity-40" style={{ color: `rgb(${dominantColor})` }} />
              <p className="text-3xl font-black text-white tracking-tight">{s.value}<span className="text-sm font-bold text-white/30">{s.suffix}</span></p>
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="px-6 mb-8">
        <div className="max-w-5xl mx-auto flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {[{ id: "orders", label: "Historique" }, { id: "achievements", label: "Succès" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
              style={activeTab === tab.id
                ? { background: `rgb(${dominantColor})`, color: "#fff", boxShadow: `0 4px 20px rgba(${dominantColor}, 0.4)` }
                : { color: "rgba(255,255,255,0.3)" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">

          {/* HISTORIQUE */}
          {activeTab === "orders" && (
            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 animate-spin" style={{ borderTopColor: `rgb(${dominantColor})` }} />
                  <span className="text-[9px] font-mono tracking-[0.3em] text-white/20">CHARGEMENT...</span>
                </div>
              ) : orders.length > 0 ? (
                <div>
                  {/* Header */}
                  <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5">
                    <span className="col-span-1 text-[9px] font-black uppercase tracking-widest text-white/20">#</span>
                    <span className="col-span-6 text-[9px] font-black uppercase tracking-widest text-white/20">Commande</span>
                    <span className="col-span-2 text-[9px] font-black uppercase tracking-widest text-white/20 hidden sm:block">Date</span>
                    <span className="col-span-2 text-[9px] font-black uppercase tracking-widest text-white/20 hidden sm:block">Statut</span>
                    <span className="col-span-1 text-[9px] font-black uppercase tracking-widest text-white/20 text-right">Prix</span>
                  </div>

                  {orders.map((order, idx) => (
                    <div key={order.id}
                      className="group grid grid-cols-12 items-center px-6 py-4 border-b border-white/40 hover:bg-white/[0.03] transition-all duration-200 cursor-default"
                      style={{ animationDelay: `${idx * 50}ms` }}>

                      <div className="col-span-1">
                        <span className="text-xs font-mono text-white/20 group-hover:hidden">{String(idx + 1).padStart(2, "0")}</span>
                        <ShoppingBag size={13} className="hidden group-hover:block text-white/40" />
                      </div>

                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/5"
                          style={{ background: `rgba(${dominantColor}, 0.1)` }}>
                          {Array.isArray(order.items) && (order.items[0]?.cover_url || order.items[0]?.image)
                            ? <img src={order.items[0].cover_url || order.items[0].image} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={14} className="text-white/20" /></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white/80 truncate group-hover:text-white transition-colors">
                            {Array.isArray(order.items) ? order.items.map(i => i.title).join(", ") : "Achat numérique"}
                          </p>
                          <p className="text-[10px] text-white/30">{Array.isArray(order.items) ? `${order.items.length} article${order.items.length > 1 ? "s" : ""}` : ""}</p>
                        </div>
                      </div>

                      <div className="col-span-2 hidden sm:flex items-center gap-1.5 text-white/30">
                        <Clock size={11} />
                        <span className="text-xs">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                      </div>

                      <div className="col-span-2 hidden sm:block">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                          style={{ color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                          <CheckCircle2 size={9} /> Validé
                        </span>
                      </div>

                      <div className="col-span-1 text-right">
                        <p className="text-sm font-black text-white">{Number(order.total_price).toLocaleString()}</p>
                        <p className="text-[9px] text-white/20 font-bold">FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `rgba(${dominantColor}, 0.1)` }}>
                    <ShoppingBag size={28} style={{ color: `rgba(${dominantColor}, 0.5)` }} />
                  </div>
                  <p className="text-white/20 font-bold text-xs uppercase tracking-widest">Aucune transaction</p>
                </div>
              )}
            </div>
          )}

          {/* SUCCÈS */}
          {activeTab === "achievements" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "🎮", title: "Premier Pas", desc: "Première commande validée", unlocked: orders.length >= 1, glow: "129, 140, 248" },
                { icon: "🔥", title: "Collectionneur", desc: "5 commandes ou plus", unlocked: orders.length >= 5, glow: "249, 115, 22" },
                { icon: "💎", title: "Gros Dépensier", desc: "+100k FCFA investis", unlocked: totalSpent >= 100000, glow: "34, 211, 238" },
                { icon: "⚡", title: "Accumulation", desc: "10 jeux ou plus", unlocked: totalGames >= 10, glow: "250, 204, 21" },
                { icon: "👑", title: "Légende ProStore", desc: "+500k FCFA de budget", unlocked: totalSpent >= 500000, glow: "251, 191, 36" },
                { icon: "🚀", title: "Fidélité Absolue", desc: "10 commandes enregistrées", unlocked: orders.length >= 10, glow: "167, 139, 250" },
              ].map((a, i) => (
                <div key={i}
                  className={`relative group rounded-3xl p-6 border overflow-hidden transition-all duration-500 ${a.unlocked ? "hover:scale-[1.03] hover:shadow-2xl cursor-default" : "opacity-40"}`}
                  style={{
                    background: a.unlocked ? `linear-gradient(135deg, rgba(${a.glow}, 0.1) 0%, rgba(0,0,0,0.4) 100%)` : "rgba(0,0,0,0.2)",
                    borderColor: a.unlocked ? `rgba(${a.glow}, 0.25)` : "rgba(255,255,255,0.04)",
                  }}>
                  {/* Lueur de fond */}
                  {a.unlocked && (
                    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ background: `rgb(${a.glow})` }} />
                  )}

                  <div className="text-3xl mb-5 filter drop-shadow-lg">{a.unlocked ? a.icon : "🔒"}</div>
                  <p className="font-black text-sm uppercase tracking-wider text-white mb-1.5">{a.title}</p>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">{a.desc}</p>

                  {a.unlocked && (
                    <div className="mt-5 inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg"
                      style={{ color: `rgb(${a.glow})`, background: `rgba(${a.glow}, 0.1)`, border: `1px solid rgba(${a.glow}, 0.2)` }}>
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
import React, { useState, useEffect } from "react";
import { 
  Mail, ArrowLeft, ShoppingBag, Clock, 
  CheckCircle2, ShieldCheck, Wallet, Flame, Terminal
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Configuration du thème dynamique basé sur le profil
  // Tu pourras plus tard lier ces couleurs à un choix de l'utilisateur ou à sa photo !
  const theme = {
    avatarBg: "from-fuchsia-600 to-indigo-600", // Le dégradé de l'avatar principal
    glowColor: "bg-indigo-500",                  // La lueur de fond diffuse
    accentText: "text-indigo-400",                // Les accents sur les titres/badges
    accentBorder: "group-hover:border-indigo-500/30",
    accentBg: "bg-indigo-500/5",
    priceText: "text-indigo-400"
  };

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.email) return;
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setOrders(data);
      } catch (err) {
        console.error("Erreur récupération commandes:", err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
  const totalGames = orders.reduce((sum, order) => {
    const itemsCount = Array.isArray(order.items) 
      ? order.items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
      : 0;
    return sum + itemsCount;
  }, 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans p-6 md:p-10 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 🌌 Lueur de fond diffuse synchronisée avec le thème */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] ${theme.glowColor}/[0.02] rounded-full blur-[180px] pointer-events-none`} />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ⬅️ Retour Catalogue */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 group transition-all text-[10px] font-black uppercase tracking-[0.25em]"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Retour au catalogue
        </button>

        {/* CONTENEUR PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* GAUCHE : BLOC PROFIL ADAPTATIF */}
          <div className="lg:col-span-1 space-y-4">
            
            <div className="bg-[#080d1a]/50 border border-white/[0.03] rounded-3xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Avatar à dégradé fluide */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className={`absolute inset-0 bg-gradient-to-tr ${theme.avatarBg} rounded-3xl blur-xl opacity-30`} />
                <div className={`relative w-full h-full rounded-3xl bg-gradient-to-tr ${theme.avatarBg} flex items-center justify-center text-3xl font-black text-white shadow-lg border border-white/10`}>
                  {user?.username?.[0].toUpperCase() || "U"}
                </div>
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-white text-center mb-1">
                {user?.username}
              </h2>
              
              <p className={`text-[9px] text-center font-black uppercase tracking-[0.2em] ${theme.accentText} ${theme.accentBg} border border-white/5 py-1 px-3 rounded-md w-max mx-auto mb-6`}>
                Membre Privilège
              </p>

              {/* Infos système */}
              <div className="space-y-2 border-t border-white/5 pt-5">
                <div className="bg-black/30 p-3 rounded-xl border border-white/[0.01] flex items-center gap-3">
                  <Mail size={14} className="text-slate-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Adresse Email</p>
                    <p className="text-xs text-slate-400 truncate font-mono">{user?.email}</p>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded-xl border border-white/[0.01] flex items-center gap-3">
                  <ShieldCheck size={14} className="text-slate-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Sécurité</p>
                    <p className="text-xs text-emerald-500 font-bold tracking-wide">Compte Vérifié</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLEAU DES COMPTEURS MAT */}
            <div className="bg-[#080d1a]/50 border border-white/[0.03] rounded-3xl p-5 space-y-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Flame size={14} className={theme.accentText} />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Jeux possédés</span>
                </div>
                <span className="text-lg font-mono font-black text-white">{totalGames}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Wallet size={14} className="text-purple-400" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Total investi</span>
                </div>
                <span className="text-base font-mono font-black text-white">
                  {totalSpent.toLocaleString()} <span className="text-[9px] text-purple-400 font-bold">FCFA</span>
                </span>
              </div>
            </div>

          </div>

          {/* DROITE : HISTORIQUE D'ACHATS SOMBRE ET NET */}
          <div className="lg:col-span-3">
            <div className="bg-[#080d1a]/30 border border-white/[0.03] rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
              
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Terminal size={14} className={theme.accentText} />
                  Historique des commandes
                </h3>
                <span className="text-[9px] font-mono text-slate-600">COMMANDES: {orders.length}</span>
              </div>

              {loadingOrders ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-[9px] font-mono tracking-widest text-slate-600">CHARGEMENT EN COURS...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className={`group bg-[#090f1c]/40 border border-white/[0.02] ${theme.accentBorder} hover:bg-[#090f1c]/80 transition-all duration-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-slate-400">
                            #{String(order.id).padStart(4, '0')}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Jeux achetés (Badges discrets) */}
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(order.items) ? (
                            order.items.map((item, idx) => (
                              <span key={idx} className="text-xs bg-white/[0.02] px-3 py-1 rounded-xl text-slate-300 border border-white/[0.02] font-medium">
                                {item.title} <span className={`${theme.accentText} font-black ml-1 text-[10px]`}>x{item.quantity || 1}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 font-mono">Détails non trouvés</span>
                          )}
                        </div>
                      </div>

                      {/* Prix & Statut */}
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">Montant</p>
                          <p className="text-base font-mono font-black text-white">
                            {Number(order.total_price).toLocaleString()}{" "}
                            <span className={`text-[9px] ${theme.priceText} font-bold font-sans`}>FCFA</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider">
                          <CheckCircle2 size={11} />
                          Validé
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl bg-black/10">
                  <p className="text-slate-600 font-mono text-[10px] uppercase tracking-widest">Aucune commande enregistrée</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
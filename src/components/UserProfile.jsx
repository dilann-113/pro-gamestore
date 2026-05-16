import React, { useState, useEffect } from "react";
import { 
  User, Mail, ArrowLeft, ShoppingBag, Clock, 
  CheckCircle2, ShieldCheck, Wallet, Flame, Sparkles 
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Récupération des commandes de l'utilisateur depuis Supabase
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

  // Calculs dynamiques pour les statistiques du joueur
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
  const totalGames = orders.reduce((sum, order) => {
    const itemsCount = Array.isArray(order.items) 
      ? order.items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
      : 0;
    return sum + itemsCount;
  }, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 🌌 Arrière-plan avec lueurs diffuses (Glows SaaS) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* ⬅️ Bouton Retour Net & Pro : Appelle directement onBack sans toucher à l'historique du navigateur */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition-all text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur-md"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour au catalogue
        </button>

        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE COMPTE & STATISTIQUES */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Carte Profil Glassmorphism */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              
              {/* Avatar stylisé */}
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl blur-md opacity-40" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-inner border border-white/20">
                  {user?.username?.[0].toUpperCase() || "U"}
                </div>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">
                {user?.username}
              </h2>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={10} /> Membre Privilège
              </div>

              {/* Détails du compte */}
              <div className="space-y-2 text-left border-t border-white/5 pt-6">
                <div className="bg-black/20 p-3 rounded-2xl border border-white/[0.02] flex items-center gap-3">
                  <Mail size={16} className="text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Adresse Email</p>
                    <p className="text-xs text-slate-300 font-semibold truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="bg-black/20 p-3 rounded-2xl border border-white/[0.02] flex items-center gap-3">
                  <ShieldCheck size={16} className="text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Sécurité du compte</p>
                    <p className="text-xs text-emerald-400 font-bold">Vérifié & Protégé</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartes de statistiques rapides */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-xl">
                <div className="bg-indigo-600/10 w-8 h-8 rounded-xl flex items-center justify-center text-indigo-400 mb-3">
                  <Flame size={16} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Jeux achetés</p>
                <p className="text-2xl font-black text-white italic">{totalGames}</p>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-xl">
                <div className="bg-purple-600/10 w-8 h-8 rounded-xl flex items-center justify-center text-purple-400 mb-3">
                  <Wallet size={16} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total dépensé</p>
                <p className="text-xl font-black text-white italic truncate">
                  {totalSpent.toLocaleString()} <span className="text-[9px] text-purple-500 not-italic font-bold">FCFA</span>
                </p>
              </div>
            </div>

          </div>

          {/* COLONNE HISTORIQUE DES COMMANDES */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 h-full shadow-2xl flex flex-col">
              
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-indigo-500" />
                Historique des <span className="text-indigo-500">Commandes</span>
              </h3>

              {loadingOrders ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chargement de tes achats...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[500px] scrollbar-thin scrollbar-thumb-white/5">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="group bg-black/30 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 rounded-2xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden"
                    >
                      <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            ID #{String(order.id).padStart(4, '0')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-500" />
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Jeux achetés découpés en badges individuels */}
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(order.items) ? (
                            order.items.map((item, idx) => (
                              <span key={idx} className="text-xs bg-white/5 px-2.5 py-1 rounded-xl text-slate-300 border border-white/[0.02] font-semibold">
                                {item.title} <span className="text-indigo-400 font-bold ml-0.5">x{item.quantity || 1}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">Détails indisponibles</span>
                          )}
                        </div>
                      </div>

                      {/* Prix total et Badge de validation */}
                      <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Prix Total</p>
                          <p className="text-lg font-black text-white italic">
                            {Number(order.total_price).toLocaleString()}{" "}
                            <span className="text-[10px] text-indigo-500 not-italic font-bold">FCFA</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg">
                          <CheckCircle2 size={13} />
                          Validé
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl p-6 bg-black/10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Aucun achat enregistré</p>
                  <p className="text-xs text-slate-600 max-w-xs">Ton historique est vide. Dès que tu achètes un jeu, il apparaîtra ici avec style !</p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
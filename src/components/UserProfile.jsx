import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, ArrowLeft, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function UserProfile({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Bouton Retour */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 group transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour au catalogue
        </button>

        {/* Header Profil */}
        <header className="mb-12 relative rounded-[2.5rem] p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 shadow-2xl">
          <div className="bg-[#0b1329]/90 backdrop-blur-xl rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            
            {/* Avatar Stylisé */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-indigo-500/20 ring-4 ring-white/5">
              {user?.username?.[0].toUpperCase() || "U"}
            </div>

            {/* Infos Utilisateur */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                {user?.username}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <Mail size={14} className="text-indigo-400" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <User size={14} className="text-purple-400" />
                  Client Privilège
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Section Historique d'achats */}
        <section>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-500" />
            Mon historique <span className="text-indigo-500">d'achats</span>
          </h3>

          {loadingOrders ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-1/3 mx-auto"></div>
                <div className="h-12 bg-white/5 rounded-2xl w-full"></div>
                <div className="h-12 bg-white/5 rounded-2xl w-full"></div>
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-[2rem] p-6 flex flex-col md:flex-row justify-between md:items-center gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Commande #{String(order.id).padStart(4, '0')}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Liste simplifiée des items achetés */}
                    <p className="text-sm text-slate-300 font-medium">
                      {Array.isArray(order.items) 
                        ? order.items.map(item => `${item.title} (x${item.quantity || 1})`).join(", ")
                        : "Détails indisponibles"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Montant</p>
                      <p className="text-xl font-black text-white italic">
                        {Number(order.total_price).toLocaleString()} <small className="text-[10px] text-indigo-500 not-italic font-bold">FCFA</small>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider">
                      <CheckCircle2 size={14} />
                      Livré
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center space-y-3">
              <ShoppingBag size={40} className="text-slate-600 mx-auto" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune commande pour le moment</p>
              <p className="text-xs text-slate-600">Tes futurs jeux vidéo apparaîtront ici dès que tu auras validé un panier !</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
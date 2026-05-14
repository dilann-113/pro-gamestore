import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// 1. IMPORTATION DU CLIENT SUPABASE
import { supabase } from '../supabaseClient';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIQUE DE CONNEXION SUPABASE ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success(`Content de vous revoir !`);
        // On passe les infos utilisateur au composant parent
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata.username || formData.email.split('@')[0]
        });

      } else {
        // --- LOGIQUE D'INSCRIPTION SUPABASE ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            }
          }
        });

        if (error) throw error;

        Swal.fire({
          title: 'Inscription réussie !',
          text: `Vérifie ta boîte mail pour confirmer ton compte : ${formData.email}`,
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc',
          confirmButtonColor: '#6366f1'
        }).then(() => setIsLogin(true));
      }
    } catch (err) {
      console.error("Erreur Auth :", err.message);
      
      // Alerte personnalisée pour remplacer l'erreur 500 PHP
      Swal.fire({
        title: 'Erreur Authentification',
        text: err.message === "Failed to fetch" 
          ? "Impossible de contacter Supabase. Vérifie ta connexion internet." 
          : err.message,
        icon: 'error',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-600/20">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">
            Pro<span className="text-indigo-500">Store</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            {isLogin ? 'Authentification Cloud' : 'Création de compte Cloud'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" name="username" placeholder="Pseudo" required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all"
                value={formData.username} onChange={handleChange}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" name="email" placeholder="Email" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="password" name="password" placeholder="Mot de passe" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white transition-all"
              value={formData.password} onChange={handleChange}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Connexion' : "S'enregistrer"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            {isLogin ? "Besoin d'un compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
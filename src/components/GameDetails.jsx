import React, { useState } from 'react';
import { 
  X, ShoppingCart, ShieldCheck, Gamepad2, 
  Star, Monitor, Users, Globe, ArrowLeft, Trophy, 
  Download, Tag, MessageSquare, Send
} from 'lucide-react';

export default function GameDetails({ game, onBack, onAddToCart }) {
  if (!game) return null;

  // --- ÉTATS POUR LES COMMENTAIRES ---
  const [comments, setComments] = useState([
    { id: 1, user: "Marius K.", date: "Il y a 2 jours", text: "Le jeu tourne super bien sur ma config, merci ProStore !", rating: 5 },
    { id: 2, user: "Sarah L.", date: "Il y a 1 semaine", text: "Livraison de la clé ultra rapide au Gabon.", rating: 4 }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "Moi (Client)",
        date: "À l'instant",
        text: newComment,
        rating: 5
      };
      setComments([comment, ...comments]);
      // ✅ FIX : Utilisation du setter pour vider le champ
      setNewComment(""); 
    }
  };

  const specs = [
    { icon: <Monitor size={20} />, label: "Résolution", value: "4K Natif / HDR10" },
    { icon: <Users size={20} />, label: "Mode", value: "Multijoueur & Solo" },
    { icon: <Globe size={20} />, label: "Audio", value: "Français, Anglais" },
    { icon: <Trophy size={20} />, label: "Succès", value: "50 Trophées" },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-[#020617] overflow-y-auto animate-in fade-in duration-500">
      {/* FOND DYNAMIQUE */}
      <div className={`fixed inset-0 bg-gradient-to-br ${game.gradient || 'from-indigo-600 to-blue-700'} opacity-10 blur-[120px] -z-10`} />
      
      {/* NAVBAR DÉTAILS */}
      <div className="sticky top-0 z-[160] bg-[#020617]/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group font-bold text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          RETOUR AU STORE
        </button>
        
        <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
                <span className="text-xl font-black text-white">{Number(game.price).toLocaleString()}</span>
                <span className="text-xs text-indigo-500 font-bold ml-1">FCFA</span>
            </div>
            <button 
                onClick={() => { onAddToCart(game); onBack(); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
                <ShoppingCart size={16} /> ACHETER MAINTENANT
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* SECTION HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <div className={`aspect-video rounded-[3rem] bg-gradient-to-br ${game.gradient || 'from-slate-800 to-slate-900'} relative overflow-hidden shadow-2xl border border-white/10 group mb-8`}>
                
                {/* ✅ FIX : Bloc Image dynamique avec cover_url */}
                {game.cover_url ? (
                  <img 
                    src={game.cover_url} 
                    alt={game.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700"></div>
                    <Gamepad2 size={120} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10" />
                  </>
                )}

                <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-4 border border-white/10">
                    <div className="flex gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <span className="text-sm font-bold border-l border-white/20 pl-4 uppercase tracking-tighter">Édition Numérique</span>
                </div>
            </div>

            <section className="space-y-6">
                <h3 className="text-4xl font-black flex items-center gap-3 uppercase italic tracking-tighter text-white">
                    <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                    Présentation : {game.title}
                </h3>
                <p className="text-xl text-slate-400 leading-relaxed">
                    Plongez dans une aventure époustouflante avec **{game.title}**. 
                    Sélectionné par ProStore pour sa qualité exceptionnelle et ses graphismes de pointe. 
                    Profitez d'une activation immédiate après votre achat au Gabon.
                </p>
            </section>
          </div>

          {/* FICHE TECHNIQUE À DROITE */}
          <div className="space-y-6">
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -top-4 -right-4 opacity-5 rotate-12 text-white">
                    <Download size={120} />
                </div>
                <div className="flex items-center gap-2 text-indigo-500 mb-4 font-bold text-xs uppercase tracking-widest">
                    <Tag size={14} /> <span>{game.category}</span>
                </div>
                <h1 className="text-4xl font-black uppercase italic mb-6 tracking-tighter leading-none">{game.title}</h1>
                
                <div className="space-y-4 mb-8">
                    {specs.map((spec, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="text-indigo-500">{spec.icon}</div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{spec.label}</p>
                                <p className="text-sm font-black text-white">{spec.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-emerald-500/5 rounded-3xl mb-8 border border-emerald-500/20 flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={32} />
                    <div>
                        <p className="text-xs font-black text-white uppercase italic">Achat Sécurisé</p>
                        <p className="text-[10px] text-slate-500 italic">Compatible Airtel Money & Moov Money</p>
                    </div>
                </div>

                <button 
                    onClick={() => onAddToCart(game)}
                    className="w-full bg-white text-black hover:bg-indigo-600 hover:text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                >
                    <ShoppingCart size={20} /> AJOUTER AU PANIER
                </button>
            </div>
          </div>
        </div>

        {/* SECTION COMMENTAIRES */}
        <section className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black flex items-center gap-3 uppercase italic tracking-tighter text-white">
                    <div className="w-2 h-10 bg-rose-500 rounded-full"></div>
                    Avis de la communauté
                </h3>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                    <MessageSquare size={16} /> <span>{comments.length} AVIS</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* FORMULAIRE */}
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 h-fit lg:sticky lg:top-28 backdrop-blur-md">
                    <h4 className="text-lg font-bold mb-6 italic text-white">Votre avis compte</h4>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Racontez votre expérience..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm outline-none focus:ring-2 focus:ring-rose-500/50 min-h-[150px] mb-6 transition-all text-slate-200 placeholder:text-slate-600"
                    />
                    <button 
                        onClick={handleAddComment}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl text-xs uppercase transition-all active:scale-95 shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2"
                    >
                        <Send size={16} /> PUBLIER L'AVIS
                    </button>
                </div>

                {/* LISTE DES COMMENTAIRES */}
                <div className="lg:col-span-2 space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 transition-transform hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-black text-sm text-white shadow-lg">
                                        {comment.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-wider">{comment.user}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{comment.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 text-yellow-500">
                                    {[...Array(comment.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm italic leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                                "{comment.text}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
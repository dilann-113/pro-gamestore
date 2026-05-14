import React, { useState } from 'react';
import { ShoppingCart, Trash2, CreditCard, X, Loader2, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Cart({ cart, setCart, user, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  // Calcul du total sécurisé : nettoie le texte "FCFA" pour ne garder que les chiffres
  const total = cart.reduce((sum, item) => {
    const price = Number(String(item.price || 0).replace(/[^0-9]/g, '')) || 0;
    return sum + price;
  }, 0);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    toast.success("Jeu retiré du panier");
  };

  const handleCheckout = async (e) => {
    if(e) e.preventDefault();
    
    if (!user) {
      toast.error("Connectez-vous pour finaliser l'achat");
      return;
    }

    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setLoading(true);

    try {
      // 1. Importation dynamique du client Supabase
      const { supabase } = await import('../supabaseClient');

      // 2. Enregistrement dans la table 'orders' sur Supabase
      const { error: dbError } = await supabase
        .from('orders')
        .insert([{
          customer_name: user.username || user.email.split('@')[0],
          customer_email: user.email,
          items: cart,
          total_price: total,
          status: 'completed'
        }]);

      if (dbError) throw new Error("Erreur BDD : " + dbError.message);

      // 3. Appel de la Edge Function 'quick-worker' pour l'email via Resend
      const functionUrl = 'https://onfybrqtufwwdambnwhm.supabase.co/functions/v1/quick-worker';
      
      const mailRes = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.username || user.email.split('@')[0],
          total: `${total.toLocaleString()} FCFA`,
          items: cart
        })
      });

      if (mailRes.ok) {
        setCart([]); 
        onClose(); 
        
        Swal.fire({
          title: 'Paiement réussi !',
          text: `Merci Dilann ! Un mail de confirmation a été envoyé à ${user.email}`,
          icon: 'success',
          background: '#0f172a',
          color: '#ffffff',
          confirmButtonColor: '#6366f1'
        });
      } else {
        throw new Error("Erreur lors de l'envoi du mail de confirmation");
      }
    } catch (error) {
      console.error("Erreur de commande:", error);
      Swal.fire({
        title: 'Échec de la commande',
        text: error.message,
        icon: 'error',
        background: '#0f172a',
        color: '#ffffff'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] h-screen shadow-2xl flex flex-col border-l border-white/10 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between font-bold">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-indigo-500" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              Panier <span className="text-indigo-500">ProStore</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Liste des jeux */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
              <Gamepad2 size={48} className="mb-2 opacity-20" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex-1">
                  <h3 className="font-bold text-sm truncate">{item.title}</h3>
                  <p className="text-indigo-400 font-black text-xs">
                    {Number(String(item.price).replace(/[^0-9]/g, '') || 0).toLocaleString()} FCFA
                  </p>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-slate-500 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Action */}
        <div className="p-6 bg-white/[0.02] border-t border-white/10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total</span>
            <span className="text-2xl font-black italic">
               {total.toLocaleString()} <small className="text-xs text-indigo-500 not-italic">FCFA</small>
            </span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <CreditCard size={18} />
                Confirmer le paiement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
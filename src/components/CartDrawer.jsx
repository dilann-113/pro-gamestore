import React, { useState } from 'react';
import { X, Trash2, Minus, Plus, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function CartDrawer({ cart, setCart, user, onClose }) {
  const [loading, setLoading] = useState(false);

  // Calcul du total avec formatage sécurisé pour éviter le NaN
  const total = cart.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.error("Article retiré");
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour payer");
      return;
    }
    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setLoading(true);

    try {
      // 1. Enregistrement de la commande dans Supabase
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase
        .from('orders')
        .insert([{
          customer_name: user.username || user.email.split('@')[0],
          customer_email: user.email,
          items: cart,
          total_price: total,
          status: 'completed'
        }]);

      if (error) throw new Error("Erreur BDD : " + error.message);

      // 2. Appel de la Edge Function (Confirmé par image_791c31.png)
      // On utilise le nom 'quick-worker'
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

      if (!mailRes.ok) {
        console.warn("La commande est enregistrée, mais l'email n'a pas pu être envoyé.");
      }

      // 3. Finalisation réussie
      setCart([]);
      onClose();
      Swal.fire({
        title: 'Paiement validé !',
        text: `Merci Dilann ! Ta commande est enregistrée et un mail arrive sur ${user.email}`,
        icon: 'success',
        background: '#020617',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });

    } catch (error) {
      console.error("Erreur paiement:", error);
      Swal.fire({
        title: 'Erreur',
        text: error.message,
        icon: 'error',
        background: '#020617',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#020617] h-full shadow-2xl flex flex-col border-l border-white/10 text-white">
        
        {/* Header Style Premium Dark */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            Mon <span className="text-indigo-500">Panier</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        {/* Liste des jeux */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-500 font-bold">
                {item.title ? item.title[0] : 'G'}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                <p className="text-indigo-400 text-xs font-black">{Number(item.price || 0).toLocaleString()} FCFA</p>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-indigo-400"><Minus size={14}/></button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-indigo-400"><Plus size={14}/></button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-rose-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>

        {/* Footer avec Total et Paiement */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex justify-between items-end mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total</span>
            <span className="text-3xl font-black text-white italic">
              {total.toLocaleString()} <small className="text-xs text-indigo-500 not-italic">FCFA</small>
            </span>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading || cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <CreditCard size={18} />
                Payer Maintenant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
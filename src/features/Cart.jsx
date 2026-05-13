import React, { useState } from 'react';
import { ShoppingCart, Trash2, CreditCard, X, Loader2, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Cart({ cart, setCart, user, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  // Calcul du total sécurisé
  const total = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(',', '.')) : item.price;
    return sum + (price || 0);
  }, 0);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    toast.success("Jeu retiré du panier");
  };

  const handleCheckout = async (e) => {
    if(e) e.preventDefault();
    
    // Vérifications de sécurité avant l'envoi
    if (!user) {
      toast.error("Connectez-vous pour finaliser l'achat");
      return;
    }

    if (cart.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setLoading(true);

    // Préparation des données pour valider_commande.php
    const orderData = {
      email: user.email,
      total: total.toFixed(2),
      cart: cart.map(item => ({
        title: item.title,
        price: item.price
      }))
    };

    try {
      console.log("Envoi de la commande pour:", user.email);
      
      const response = await fetch('http://localhost/api_chiro/valider_commande.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        setCart([]); // Vide le panier après succès
        onClose();   // Ferme le tiroir du panier
        
        Swal.fire({
          title: 'Paiement réussi !',
          text: `Un mail de confirmation a été envoyé à ${user.email}`,
          icon: 'success',
          background: '#0f172a',
          color: '#ffffff',
          confirmButtonColor: '#6366f1'
        });
      } else {
        throw new Error(data.message || "Erreur lors du paiement");
      }
    } catch (error) {
      console.error("Erreur de commande:", error);
      Swal.fire({
        title: 'Échec du paiement',
        text: "Vérifiez que MySQL est lancé et que db_config.php existe.",
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
      <div className="w-full max-w-md bg-[#0f172a] h-screen shadow-2xl flex flex-col border-l border-white/10">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-indigo-500" />
            <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">
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
            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
              <Gamepad2 size={48} className="mb-2 opacity-20" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                  <p className="text-indigo-400 font-black text-xs">{item.price} €</p>
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
          <div className="flex justify-between items-center mb-6 text-white">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total</span>
            <span className="text-2xl font-black">{total.toFixed(2)} €</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
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
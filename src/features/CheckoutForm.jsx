import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/Button';

const CheckoutForm = ({ cartItems, totalAmount, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    adresse: ''
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Enregistrement de la commande dans Supabase (Table 'orders')
      const { error: dbError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.nom,
            customer_email: formData.email,
            shipping_address: formData.adresse,
            items: cartItems,
            total_price: totalAmount,
            status: 'completed'
          }
        ]);

      if (dbError) throw new Error("Erreur BDD : " + dbError.message);

      // 2. Appel de la Edge Function pour l'envoi du mail de confirmation
      // L'URL utilise l'identifiant de ton projet et le nom de ta fonction (ex: quick-worker)
      const functionUrl = "https://onfybrqtufwwdambnwhm.supabase.co/functions/v1/quick-worker";

      const mailRes = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.nom,
          total: `${Number(totalAmount).toLocaleString()} FCFA`,
          items: cartItems
        })
      });

      if (!mailRes.ok) {
        console.warn("La commande est enregistrée, mais l'envoi du mail a échoué.");
      }

      // 3. Notification de succès et réinitialisation
      alert("Félicitations ! Votre commande a été validée et un e-mail de confirmation vous a été envoyé.");
      onSuccess(); 

    } catch (error) {
      console.error("Erreur transactionnelle:", error.message);
      alert("Une erreur est survenue : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
      {/* Container avec style Glassmorphism Dark */}
      <div className="bg-[#121212]/90 border border-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl text-white">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Finaliser la commande
        </h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-uppercase tracking-wider text-gray-400 mb-2 font-bold">NOM COMPLET</label>
            <input 
              type="text"
              required
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-white"
              placeholder="Ex: Dilann ..."
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-uppercase tracking-wider text-gray-400 mb-2 font-bold">ADRESSE EMAIL</label>
            <input 
              type="email"
              required
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 text-white"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-uppercase tracking-wider text-gray-400 mb-2 font-bold">ADRESSE DE LIVRAISON</label>
            <textarea 
              required
              rows="3"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 resize-none text-white"
              placeholder="Votre adresse précise au Gabon..."
              value={formData.adresse}
              onChange={(e) => setFormData({...formData, adresse: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-semibold"
            >
              ANNULER
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'TRAITEMENT...' : `PAYER ${Number(totalAmount).toLocaleString()} FCFA`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
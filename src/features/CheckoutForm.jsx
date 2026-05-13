// src/features/CheckoutForm.jsx
import { useState } from 'react';
import Button from '../components/Button';

const CheckoutForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    adresse: ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Informations de livraison</h2>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom Complet</label>
            <input 
              type="text"
              required
              className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input 
              type="email"
              required
              className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <div className="flex-1">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
            <div className="flex-1">
              <Button type="submit" variant="primary">
                Payer
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
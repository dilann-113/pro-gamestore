import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Gamepad2, Users, Package, Trash2, Edit3, Plus, 
  X, Check, LogOut, Shield, RefreshCcw, Search,
  UserX, Clock
} from 'lucide-react';
import Swal from 'sweetalert2';

const ADMIN_PASSWORD = "prostore2024admin";

export default function AdminDashboard() {
  // Utilisation du sessionStorage pour éviter de perdre l'authentification au moindre F5
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('is_admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameForm, setGameForm] = useState({
    title: '', price: '', category: '', gradient: 'from-indigo-500 to-purple-600'
  });

  // Charger les données dès que l'utilisateur est authentifié
  useEffect(() => {
    if (authenticated) {
      loadAll();
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('is_admin_authenticated', 'true');
      setAuthenticated(true);
    } else {
      Swal.fire({ title: 'Accès refusé', text: 'Mot de passe incorrect', icon: 'error', background: '#020617', color: '#fff' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_admin_authenticated');
    setAuthenticated(false);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadGames(), loadUsers(), loadOrders()]);
    setLoading(false);
  };

  const loadGames = async () => {
    const { data } = await supabase.from('games').select('*').order('id');
    if (data) setGames(data);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('last_seen', { ascending: false });
    if (data) setUsers(data);
  };

  const loadOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const handleSaveGame = async () => {
    if (!gameForm.title || !gameForm.price || !gameForm.category) {
      Swal.fire({ title: 'Champs manquants', text: 'Remplis tous les champs', icon: 'warning', background: '#020617', color: '#fff' });
      return;
    }
    
    if (editingGame) {
      const { error } = await supabase.from('games').update(gameForm).eq('id', editingGame.id);
      if (!error) {
        Swal.fire({ title: 'Jeu modifié !', icon: 'success', background: '#020617', color: '#fff', timer: 1500, showConfirmButton: false });
        loadGames(); setShowGameForm(false); setEditingGame(null);
      }
    } else {
      const { error } = await supabase.from('games').insert([gameForm]);
      if (!error) {
        Swal.fire({ title: 'Jeu ajouté !', icon: 'success', background: '#020617', color: '#fff', timer: 1500, showConfirmButton: false });
        loadGames(); setShowGameForm(false);
      }
    }
    setGameForm({ title: '', price: '', category: '', gradient: 'from-indigo-500 to-purple-600' });
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setGameForm({ title: game.title, price: game.price, category: game.category, gradient: game.gradient || 'from-indigo-500 to-purple-600' });
    setShowGameForm(true);
  };

  const handleDeleteGame = async (game) => {
    const result = await Swal.fire({
      title: `Supprimer "${game.title}" ?`, text: 'Cette action est irréversible', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#334155',
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', background: '#020617', color: '#fff'
    });
    if (result.isConfirmed) { 
      await supabase.from('games').delete().eq('id', game.id); 
      loadGames(); 
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: `Supprimer ${user.email} ?`,
      text: 'Le compte Auth et son profil associé seront définitivement effacés.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      background: '#020617',
      color: '#fff'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Suppression...',
        allowOutsideClick: false,
        background: '#020617',
        color: '#fff',
        didOpen: () => { Swal.showLoading(); }
      });

      // Appel de l'Edge Function pour la suppression complète
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (error || (data && data.error)) {
        Swal.fire({
          title: 'Erreur',
          text: error?.message || data?.error || 'Impossible de supprimer le compte',
          icon: 'error',
          background: '#020617',
          color: '#fff'
        });
      } else {
        Swal.fire({
          title: 'Utilisateur supprimé !',
          icon: 'success',
          background: '#020617',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
        loadUsers();
      }
    }
  };

  const handleDeleteOrder = async (order) => {
    const result = await Swal.fire({
      title: 'Supprimer cette commande ?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#334155',
      confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler', background: '#020617', color: '#fff'
    });
    if (result.isConfirmed) { 
      await supabase.from('orders').delete().eq('id', order.id); 
      loadOrders(); 
    }
  };

  const filteredGames = games.filter(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter(o => o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  const gradients = [
    'from-cyan-500 to-blue-600', 'from-orange-500 to-rose-700',
    'from-indigo-600 to-pink-500', 'from-green-500 to-teal-600',
    'from-purple-500 to-indigo-700', 'from-yellow-400 to-orange-600',
  ];

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    return (new Date() - new Date(lastSeen)) / 1000 / 60 < 5;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-rose-600 p-4 rounded-2xl mb-4 shadow-lg shadow-rose-600/30">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Pro<span className="text-rose-500">Admin</span></h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Accès restreint</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Mot de passe admin" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-rose-500/50 text-white transition-all" />
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
              Accéder au Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      <nav className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-xl"><Shield size={20} className="text-white" /></div>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Pro<span className="text-rose-500">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-400">
              <span><span className="text-white text-lg font-black">{games.length}</span> jeux</span>
              <span><span className="text-white text-lg font-black">{users.length}</span> utilisateurs</span>
              <span><span className="text-white text-lg font-black">{orders.length}</span> commandes</span>
            </div>
            <button onClick={loadAll} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <RefreshCcw size={16} className={loading ? 'animate-spin text-indigo-400' : ''} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold uppercase">
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
          {[{ id: 'games', label: 'Jeux', icon: Gamepad2 }, { id: 'orders', label: 'Commandes', icon: Package }, { id: 'users', label: 'Utilisateurs', icon: Users }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white text-sm" />
        </div>

        {/* TAB: GAMES */}
        {activeTab === 'games' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic">Catalogue <span className="text-indigo-400">Jeux</span></h2>
              <button onClick={() => { setShowGameForm(true); setEditingGame(null); setGameForm({ title: '', price: '', category: '', gradient: 'from-indigo-500 to-purple-600' }); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <Plus size={16} /> Ajouter un jeu
              </button>
            </div>

            {showGameForm && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black uppercase text-lg italic">{editingGame ? 'Modifier' : 'Nouveau jeu'}</h3>
                    <button onClick={() => setShowGameForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Titre" value={gameForm.title} onChange={e => setGameForm({...gameForm, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white" />
                    <input type="text" placeholder="Prix (ex: 44255 FCFA)" value={gameForm.price} onChange={e => setGameForm({...gameForm, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white" />
                    <input type="text" placeholder="Catégorie" value={gameForm.category} onChange={e => setGameForm({...gameForm, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Couleur</p>
                      <div className="flex gap-2 flex-wrap">
                        {gradients.map(g => (
                          <button key={g} onClick={() => setGameForm({...gameForm, gradient: g})}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${gameForm.gradient === g ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowGameForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5">Annuler</button>
                      <button onClick={handleSaveGame} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-black flex items-center justify-center gap-2">
                        <Check size={16} /> {editingGame ? 'Modifier' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Jeu</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Prix</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Catégorie</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredGames.map(game => (
                    <tr key={game.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4"><div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${game.gradient || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-white font-black text-sm`}>{game.title?.[0]}</div>
                        <span className="font-bold text-sm">{game.title}</span>
                      </div></td>
                      <td className="p-4 text-indigo-400 font-black text-sm">{game.price}</td>
                      <td className="p-4"><span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold text-slate-300">{game.category}</span></td>
                      <td className="p-4"><div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditGame(game)} className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteGame(game)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGames.length === 0 && <div className="py-16 text-center text-slate-500 text-sm font-bold">Aucun jeu</div>}
            </div>
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-black uppercase italic mb-6">Historique <span className="text-indigo-400">Commandes</span></h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Client</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Total</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                </tr></thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4"><div>
                        <p className="font-bold text-sm">{order.customer_name}</p>
                        <p className="text-xs text-slate-500">{order.customer_email}</p>
                      </div></td>
                      <td className="p-4 text-green-400 font-black text-sm">{Number(order.total_price).toLocaleString()} FCFA</td>
                      <td className="p-4"><span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold">{order.status}</span></td>
                      <td className="p-4 text-slate-400 text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteOrder(order)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && <div className="py-16 text-center text-slate-500 text-sm font-bold">Aucune commande</div>}
            </div>
          </div>
        )}

        {/* TAB: USERS */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-black uppercase italic mb-6">Utilisateurs <span className="text-indigo-400">Inscrits</span></h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Utilisateur</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Dernière connexion</th>
                  <th className="text-right p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                </tr></thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4"><div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-sm">
                          {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-sm">{user.username || '-'}</span>
                      </div></td>
                      <td className="p-4 text-slate-300 text-sm">{user.email}</td>
                      <td className="p-4"><div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isOnline(user.last_seen) ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className={`text-xs font-bold ${isOnline(user.last_seen) ? 'text-green-400' : 'text-slate-500'}`}>
                          {isOnline(user.last_seen) ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div></td>
                      <td className="p-4"><div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Clock size={12} />
                        {user.last_seen ? new Date(user.last_seen).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </div></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteUser(user)} className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                          <UserX size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="py-16 text-center text-slate-500 text-sm font-bold">Aucun utilisateur</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
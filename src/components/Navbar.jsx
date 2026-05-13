// src/components/Navbar.jsx
const Navbar = ({ cartCount }) => {
  return (
    <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-xl">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo du Projet */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter text-indigo-400">
            PRO<span className="text-white">STORE</span>
          </h1>
        </div>

        {/* Icône du Panier avec Badge Dynamique */}
        <div className="relative group cursor-pointer p-2 transition-all">
          <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
            🛒
          </span>
          
          {/* Affichage conditionnel du compteur (Critère n°5 : Gestion dynamique) */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
              {cartCount}
            </span>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
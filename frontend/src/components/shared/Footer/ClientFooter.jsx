import { NavLink } from "react-router-dom";

const ClientFooter = () => (
  <footer className="bg-white border-t border-gray-100 mt-auto">
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-700">PetPal</span>
          <span className="text-gray-400 text-sm ml-2">— Prenez soin de vos animaux</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <NavLink to="/" end className="hover:text-gray-800 transition-colors">Accueil</NavLink>
          <NavLink to="/products" className="hover:text-gray-800 transition-colors">Boutique</NavLink>
          <NavLink to="/orders" className="hover:text-gray-800 transition-colors">Mes commandes</NavLink>
          <NavLink to="/hotels" className="hover:text-gray-800 transition-colors">Hôtels</NavLink>
          <NavLink to="/my-reservations" className="hover:text-gray-800 transition-colors">Réservations</NavLink>
          <NavLink to="/training" className="hover:text-gray-800 transition-colors">Dressage</NavLink>
          <NavLink to="/my-training-reservations" className="hover:text-gray-800 transition-colors">Formations</NavLink>
          <NavLink to="/cart" className="hover:text-gray-800 transition-colors">Panier</NavLink>
          <NavLink to="/pets" className="hover:text-gray-800 transition-colors">Mes animaux</NavLink>
          <NavLink to="/appointments" className="hover:text-gray-800 transition-colors">Rendez-vous</NavLink>
          <NavLink to="/profile" className="hover:text-gray-800 transition-colors">Profil</NavLink>
        </nav>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} PetPal. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

export default ClientFooter;

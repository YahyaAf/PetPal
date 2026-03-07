import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../../core/hooks/useAuth";
import useCartStore from "../../../store/cartStore";

const ClientNavbar = () => {
  const { user, logout } = useAuth();
  const { cart, fetchCart } = useCartStore();
  const itemCount = cart?.nombreArticles ?? 0;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-gray-800 text-lg">PetPal</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Accueil", end: true },
            { to: "/products", label: "Boutique" },
            { to: "/hotels", label: "Hôtels" },
            { to: "/orders", label: "Mes commandes" },
            { to: "/my-reservations", label: "Réservations" },
            { to: "/pets", label: "Mes animaux" },
            { to: "/appointments", label: "Rendez-vous" },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Icône panier */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `relative p-2 rounded-lg transition-colors ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13L17 13M10 21a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-gray-100 text-gray-800" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase">
              {user?.nom?.[0] ?? "?"}
            </span>
            <span className="hidden sm:block">{user?.nom}</span>
          </NavLink>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default ClientNavbar;

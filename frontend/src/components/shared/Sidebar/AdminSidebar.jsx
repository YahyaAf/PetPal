import { NavLink } from "react-router-dom";

const ALL_LINKS = [
  { to: "/dashboard", label: "Tableau de bord", icon: "▦", end: true },
  { to: "/dashboard/users", label: "Utilisateurs", icon: "👥" },
  { to: "/dashboard/clients", label: "Clients", icon: "👤" },
  { to: "/dashboard/pets", label: "Animaux", icon: "🐾" },
  { to: "/dashboard/appointments", label: "Rendez-vous", icon: "📅" },
  { to: "/dashboard/cities", label: "Villes", icon: "🏙️" },
  { to: "/dashboard/hotels", label: "Hôtels", icon: "🏨" },
  { to: "/dashboard/categories", label: "Catégories", icon: "🏷️" },
  { to: "/dashboard/products", label: "Produits", icon: "📦" },
  { to: "/dashboard/training-types", label: "Dressage", icon: "🤺" },
  { to: "/dashboard/orders", label: "Commandes", icon: "🛒" },
  { to: "/dashboard/reservations", label: "Réservations", icon: "🔖" },
  { to: "/dashboard/training-reservations", label: "Sessions dressage", icon: "🤺" },
  { to: "/dashboard/my-sessions", label: "Mes sessions", icon: "📆" },
];

const AdminSidebar = () => {
  const links = ALL_LINKS;

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
      <nav className="flex-1 py-4 space-y-1 px-3">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

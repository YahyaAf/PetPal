import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: "▦" },
  { to: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { to: "/admin/clients", label: "Clients", icon: "👤" },
  { to: "/admin/pets", label: "Animaux", icon: "🐾" },
  { to: "/admin/appointments", label: "Rendez-vous", icon: "📅" },
  { to: "/admin/cities", label: "Villes", icon: "🏙️" },
];

const AdminSidebar = () => {
  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col">
      <nav className="flex-1 py-4 space-y-1 px-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
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

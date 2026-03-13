import { useState } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../../core/hooks/useAuth";
import { ROLES } from "../../../core/utils/constants";

// ── SVG icon primitives ───────────────────────────────────────
const Icon = ({ d, d2 }) => (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const ICONS = {
  dashboard:  <Icon d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" d2="M9 21V12h6v9" />,
  users:      <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  client:     <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" d2="M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  pets:       <Icon d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" d2="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5M8 14v.5M16 14v.5M11.25 16.25c.695.386 2.083.386 2.5 0" />,
  calendar:   <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />,
  cities:     <Icon d="M3 21h18M9 21V9l6-5v17M15 21V13" />,
  hotel:      <Icon d="M3 22V7l9-5 9 5v15" d2="M9 22v-5h6v5" />,
  tag:        <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" d2="M7 7h.01" />,
  box:        <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
  training:   <Icon d="M6.5 6.5h11M12 2v20M17.5 6.5L12 12l-5.5-5.5" />,
  cart:       <Icon d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" d2="M3 6h18M16 10a4 4 0 01-8 0" />,
  bookmark:   <Icon d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />,
  sessions:   <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" d2="M12 6v6l4 2" />,
  star:       <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  chevronLeft:<Icon d="M15 18l-6-6 6-6" />,
  chevronRight:<Icon d="M9 18l6-6-6-6" />,
  logout:     <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
};

// ── Nav structure ─────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Général",
    links: [
      { to: "/dashboard",       label: "Tableau de bord", icon: "dashboard", end: true },
    ],
  },
  {
    label: "Utilisateurs",
    links: [
      { to: "/dashboard/users",    label: "Utilisateurs", icon: "users"   },
      { to: "/dashboard/clients",  label: "Clients",      icon: "client"  },
    ],
  },
  {
    label: "Services",
    links: [
      { to: "/dashboard/appointments",  label: "Rendez-vous",  icon: "calendar" },
      { to: "/dashboard/hotels",        label: "Hôtels",       icon: "hotel"    },
      { to: "/dashboard/training-types",label: "Dressage",     icon: "training" },
    ],
  },
  {
    label: "Catalogue",
    links: [
      { to: "/dashboard/cities",     label: "Villes",     icon: "cities" },
      { to: "/dashboard/categories", label: "Catégories", icon: "tag"    },
      { to: "/dashboard/products",   label: "Produits",   icon: "box"    },
    ],
  },
  {
    label: "Activité",
    links: [
      { to: "/dashboard/orders",                label: "Commandes",          icon: "cart"     },
      { to: "/dashboard/reservations",          label: "Réservations",       icon: "bookmark" },
      { to: "/dashboard/training-reservations", label: "Sessions dressage",  icon: "sessions" },
      { to: "/dashboard/my-sessions",           label: "Mes sessions",       icon: "sessions" },
      { to: "/dashboard/reviews",               label: "Avis clients",       icon: "star"     },
    ],
  },
];

// ── Dresseur sees only their own sessions ─────────────────────
const DRESSEUR_ALLOWED = new Set([
  "/dashboard",
  "/dashboard/my-sessions",
]);

// ── Sidebar ───────────────────────────────────────────────────
const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const isDresseur = user?.role === ROLES.DRESSEUR;

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    links: isDresseur
      ? g.links.filter((l) => DRESSEUR_ALLOWED.has(l.to))
      : g.links,
  })).filter((g) => g.links.length > 0);

  const initials = user?.nom
    ? user.nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside
      className={`
        ${ collapsed ? "w-15" : "w-56" }
        relative bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        shrink-0 flex flex-col
        transition-all duration-200 ease-in-out
        overflow-hidden
      `}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">PetPal</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Back office</p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [scrollbar-width:thin] [scrollbar-color:var(--color-gray-200)_transparent] dark:[scrollbar-color:var(--color-gray-700)_transparent]">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.links.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                    }`
                  }
                >
                  <span className="shrink-0 [&_svg]:transition-colors">{ICONS[icon]}</span>
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 shrink-0">
        {collapsed ? (
          <div
            className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto cursor-pointer"
            title={user?.nom}
          >
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{initials}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.nom ?? "—"}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {ICONS.logout}
            </button>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-13.5 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-colors shadow-sm z-10"
      >
        {collapsed ? ICONS.chevronRight : ICONS.chevronLeft}
      </button>
    </aside>
  );
};

export default AdminSidebar;

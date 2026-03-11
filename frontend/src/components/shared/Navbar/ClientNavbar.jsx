import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../../../core/hooks/useAuth";
import useCartStore from "../../../store/cartStore";

/* ── tiny SVG icons ──────────────────────────────────────────── */
const IconChevron = ({ open }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
  </svg>
);
const IconCart = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconOrders = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconHotel = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTraining = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const IconStar = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPaw = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="7" cy="7" r="2" />
    <circle cx="17" cy="7" r="2" />
    <circle cx="5" cy="13" r="1.5" />
    <circle cx="19" cy="13" r="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c-3 0-6-2-6-5 0-2 1-3 3-4l3-1.5 3 1.5c2 1 3 2 3 4 0 3-3 5-6 5z" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
const IconLogout = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);
const PawLogo = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="6.5" cy="6.5" rx="2.3" ry="3" />
    <ellipse cx="17.5" cy="6.5" rx="2.3" ry="3" />
    <ellipse cx="3.2" cy="13" rx="1.8" ry="2.3" />
    <ellipse cx="20.8" cy="13" rx="1.8" ry="2.3" />
    <path d="M12 23c-3.5 0-6.5-2.3-6.5-5.3 0-2.3 1.3-3.5 3.5-4.5L12 12l3 1.2c2.2 1 3.5 2.2 3.5 4.5C18.5 20.7 15.5 23 12 23z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────── */

const personalLinks = [
  { to: "/orders",                    label: "Mes commandes",  Icon: IconOrders   },
  { to: "/my-reservations",           label: "Réservations",   Icon: IconHotel    },
  { to: "/my-training-reservations",  label: "Formations",     Icon: IconTraining },
  { to: "/my-reviews",                label: "Mes avis",       Icon: IconStar     },
  { to: "/pets",                      label: "Mes animaux",    Icon: IconPaw      },
  { to: "/appointments",              label: "Rendez-vous",    Icon: IconCalendar },
];

const mainLinks = [
  { to: "/",         label: "Accueil",  end: true },
  { to: "/products", label: "Boutique"            },
  { to: "/hotels",   label: "Hôtels"              },
  { to: "/training", label: "Dressage"             },
];

/* ─────────────────────────────────────────────────────────────── */

const ClientNavbar = () => {
  const { user, logout } = useAuth();
  const { cart, fetchCart } = useCartStore();
  const itemCount = cart?.nombreArticles ?? 0;

  const [espaceOpen, setEspaceOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);

  const espaceRef = useRef(null);
  const userRef   = useRef(null);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    const close = (e) => {
      if (espaceRef.current && !espaceRef.current.contains(e.target)) setEspaceOpen(false);
      if (userRef.current   && !userRef.current.contains(e.target))   setUserOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const closeAll = () => { setEspaceOpen(false); setUserOpen(false); };

  return (
    <header
      className="bg-white sticky top-0 z-50"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="max-w-7xl mx-auto px-5 h-16.5 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────── */}
        <NavLink to="/" onClick={closeAll} className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)" }}
          >
            <PawLogo />
          </div>
          <span className="font-bold text-gray-900 text-[16px] tracking-tight hidden sm:block">
            PetPal
          </span>
        </NavLink>

        {/* ── Main nav ─────────────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {mainLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeAll}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Mon espace dropdown */}
          <div ref={espaceRef} className="relative">
            <button
              onClick={() => { setEspaceOpen((v) => !v); setUserOpen(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                espaceOpen ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Mon espace
              <IconChevron open={espaceOpen} />
            </button>

            {espaceOpen && (
              <div
                className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl py-2 overflow-hidden"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {/* small arrow */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />
                {personalLinks.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-gray-50 text-gray-900 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`p-1.5 rounded-lg ${isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                          <Icon />
                        </span>
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right actions ────────────────────────────────── */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Cart */}
          <NavLink
            to="/cart"
            onClick={closeAll}
            className={({ isActive }) =>
              `relative p-2.5 rounded-xl transition-colors ${
                isActive ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`
            }
          >
            <IconCart />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </NavLink>

          {/* User dropdown */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => { setUserOpen((v) => !v); setEspaceOpen(false); }}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white uppercase shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {user?.nom?.[0] ?? "?"}
              </span>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-25 truncate">
                {user?.nom}
              </span>
              <IconChevron open={userOpen} />
            </button>

            {userOpen && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)" }}
              >
                {/* small arrow */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100" />

                {/* User header */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white uppercase shrink-0"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      {user?.nom?.[0] ?? "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user?.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile link */}
                <NavLink
                  to="/profile"
                  onClick={closeAll}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                    <IconUser />
                  </span>
                  Mon profil
                </NavLink>

                <div className="h-px bg-gray-50 mx-4" />

                {/* Logout */}
                <button
                  onClick={() => { closeAll(); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="p-1.5 rounded-lg bg-red-50 text-red-400">
                    <IconLogout />
                  </span>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientNavbar;

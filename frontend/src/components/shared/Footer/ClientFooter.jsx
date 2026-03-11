import { NavLink } from "react-router-dom";

/* ── Paw logo — same as Navbar ──────────────────────────────── */
const PawLogo = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="6.5" cy="6.5" rx="2.3" ry="3" />
    <ellipse cx="17.5" cy="6.5" rx="2.3" ry="3" />
    <ellipse cx="3.2" cy="13" rx="1.8" ry="2.3" />
    <ellipse cx="20.8" cy="13" rx="1.8" ry="2.3" />
    <path d="M12 23c-3.5 0-6.5-2.3-6.5-5.3 0-2.3 1.3-3.5 3.5-4.5L12 12l3 1.2c2.2 1 3.5 2.2 3.5 4.5C18.5 20.7 15.5 23 12 23z" />
  </svg>
);

/* ── Social icons ────────────────────────────────────────────── */
const IconFacebook = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const IconInstagram = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);
const IconTwitter = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* ── Column data ─────────────────────────────────────────────── */
const cols = [
  {
    heading: "Explorer",
    links: [
      { to: "/",        label: "Accueil",  end: true },
      { to: "/products",label: "Boutique"            },
      { to: "/hotels",  label: "Hôtels"              },
      { to: "/training",label: "Dressage"             },
    ],
  },
  {
    heading: "Mon espace",
    links: [
      { to: "/orders",                   label: "Mes commandes"  },
      { to: "/my-reservations",          label: "Réservations"   },
      { to: "/my-training-reservations", label: "Formations"     },
      { to: "/my-reviews",               label: "Mes avis"       },
      { to: "/pets",                     label: "Mes animaux"    },
      { to: "/appointments",             label: "Rendez-vous"    },
    ],
  },
  {
    heading: "Compte",
    links: [
      { to: "/profile", label: "Mon profil" },
      { to: "/cart",    label: "Panier"     },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────── */

const ClientFooter = () => (
  <footer className="bg-white mt-auto" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>

    {/* ── Main grid ─────────────────────────────────────── */}
    <div className="max-w-7xl mx-auto px-5 pt-12 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-10 md:gap-16">

        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #E8720C 0%, #f5a623 100%)" }}
            >
              <PawLogo />
            </div>
            <span className="font-bold text-gray-900 text-[16px] tracking-tight">PetPal</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-56">
            La plateforme tout-en-un pour le bien-être de vos animaux de compagnie.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-2 mt-1">
            {[
              { Icon: IconFacebook, label: "Facebook"  },
              { Icon: IconInstagram,label: "Instagram" },
              { Icon: IconTwitter,  label: "Twitter"   },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:text-white flex items-center justify-center transition-colors" style={{ transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background='#E8720C'} onMouseLeave={e => e.currentTarget.style.background=''}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map(({ heading, links }) => (
          <div key={heading} className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{heading}</p>
            <ul className="flex flex-col gap-2">
              {links.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `text-sm transition-colors ${
                        isActive ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* ── Bottom bar ────────────────────────────────────── */}
    <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
      style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
    >
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} PetPal. Tous droits réservés.
      </p>
      <p className="text-xs text-gray-300">
        Fait avec ♥ pour vos animaux
      </p>
    </div>

  </footer>
);

export default ClientFooter;

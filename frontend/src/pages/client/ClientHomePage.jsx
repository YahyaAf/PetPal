import { Link } from "react-router-dom";
import { useAuthContext } from "../../core/context/AuthContext";

/* ── accent color ───────────────────────────────────────────── */
const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

/* ── SVGs ───────────────────────────────────────────────────── */
const IconArrow = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconStar = ({ filled }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? ORANGE : "none"} stroke={ORANGE} strokeWidth={1.5}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinejoin="round" />
  </svg>
);

/* ── Wave divider ───────────────────────────────────────────── */
const WaveBottom = ({ fill = "#fff" }) => (
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block" style={{ marginBottom: -2 }}>
    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
  </svg>
);
const WaveTop = ({ fill = "#fff" }) => (
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block" style={{ marginTop: -2 }}>
    <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z" fill={fill} />
  </svg>
);

/* ── Service icon placeholders ─────────────────────────────── */
const IconDiag = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke={ORANGE} strokeWidth="2" />
    <path d="M16 24h4l3-8 4 16 3-8h2" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTraining = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="10" r="5" stroke="#7B61FF" strokeWidth="2" />
    <path d="M24 15 L20 30 L14 40 M24 15 L28 30 L34 40 M18 25 h12" stroke="#7B61FF" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="36" cy="30" r="4" stroke="#7B61FF" strokeWidth="2" />
    <path d="M34 28 C30 22 22 22 20 26" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconService = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <path d="M10 36 C10 22 24 14 24 14 C24 14 38 22 38 36" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" />
    <path d="M18 36 L18 28 C18 25 30 25 30 28 L30 36" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="10" r="3" fill={ORANGE} />
  </svg>
);
const IconSitting = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="20" rx="8" ry="6" stroke="#7B61FF" strokeWidth="2" />
    <path d="M16 26 C12 28 10 34 14 38 M32 26 C36 28 38 34 34 38" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 26 L20 42 M28 26 L28 42" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 14 C14 8 22 6 24 12 M34 14 C34 8 26 6 24 12" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── Data ───────────────────────────────────────────────────── */
const processItems = [
  { Icon: IconDiag,     title: "Consultations",  desc: "Suivez la santé de vos animaux avec nos vétérinaires qualifiés.", color: ORANGE },
  { Icon: IconTraining, title: "Dressage",        desc: "Sessions personnalisées avec des dresseurs certifiés.", color: "#7B61FF" },
  { Icon: IconService,  title: "Services primés", desc: "Une plateforme reconnue pour l'excellence de ses soins.", color: ORANGE },
  { Icon: IconSitting,  title: "Garde & Hôtels",  desc: "Hébergement sécurisé pendant vos absences.", color: "#7B61FF" },
];

const testimonials = [
  { name: "Sara Benali",   role: "Propriétaire de Labrador", stars: 5, text: "Service exceptionnel ! Mon chien adore les séances de dressage. L'équipe est professionnelle et très attentionnée." },
  { name: "Karim Idrissi", role: "Propriétaire de Husky",    stars: 5, text: "L'hôtel pour animaux est top. Je pars en voyage l'esprit tranquille sachant que Rex est entre de bonnes mains." },
  { name: "Nadia Amrani",  role: "Propriétaire de Persan",   stars: 4, text: "La boutique en ligne est super pratique. Livraison rapide et produits de grande qualité. Je recommande !" },
];

/* ─────────────────────────────────────────────────────────────── */

const ClientHomePage = () => {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#fff", fontFamily: "'Inter','Poppins',sans-serif" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 pt-10 flex flex-col lg:flex-row items-end gap-0">

          {/* Left */}
          <div className="flex-1 pb-14 lg:pb-14 pr-0 lg:pr-10 z-10 self-center">
            <h1 className="text-[1.8rem] lg:text-[2.4rem] font-extrabold text-gray-900 leading-[1.12] mb-3">
              Votre animal mérite{" "}
              <span style={{ color: ORANGE }}>le meilleur</span>{" "}
              soin possible
            </h1>
            <p className="text-gray-400 text-[15px] leading-relaxed mb-7 max-w-sm">
              Boutique, hôtels, dressage, rendez-vous vétérinaires — tout en un seul endroit pour le bien-être de vos compagnons.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
                style={{ background: ORANGE }}
              >
                Nous contacter <IconArrow />
              </Link>
              <a href="tel:+212600000000" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <span className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: ORANGE }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                  </svg>
                </span>
                +212 6 00 000 000
              </a>
            </div>
          </div>

          {/* Right — pug photo */}
          <div className="w-full lg:w-[46%] flex items-end justify-center relative z-20">
            <img
              src="https://img.freepik.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80"
              alt="pug"
              className="w-full object-contain select-none"
              style={{ maxHeight: 400, objectPosition: "center bottom", mixBlendMode: "multiply" }}
            />
          </div>
        </div>

        {/* Wave at bottom of hero */}
        <WaveBottom fill={ORANGE} />
      </section>

      {/* ══════════════════════════════════════════
          JOIN BANNER (orange)
      ══════════════════════════════════════════ */}
      <section style={{ background: ORANGE }} className="relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-4 text-center relative z-10 m-10">
          <h2 className="text-[2rem] lg:text-[2.8rem] font-extrabold text-white mb-2" style={{ fontStyle: "italic" }}>
            Rejoignez Notre Club
          </h2>
          <p className="text-white/75 text-sm max-w-md mx-auto mb-10" style={{ marginBottom: "110px"}}>
            Des milliers de propriétaires d'animaux nous font déjà confiance. Rejoignez la communauté PetPal.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WORKING PROCESS
      ══════════════════════════════════════════ */}
      <section className="bg-white pb-10">
        {/* Dogs bridging from orange section above */}
        <div className="flex justify-center relative z-20" style={{ marginTop: -190 }}>
          <img
            src="/dogs.png"
            alt="dogs"
            className="object-contain select-none"
            style={{ width: "72%", maxWidth: 780, maxHeight: 360 }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-start">

          {/* Left text panel */}
          <div
            className="lg:w-80 shrink-0 p-8 rounded-2xl"
            style={{ background: ORANGE_LIGHT, border: `1px solid ${ORANGE}22` }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: ORANGE }}>
              Processus de travail
            </p>
            <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-4">
              Bienvenue chez{" "}
              <span style={{ color: ORANGE }}>PetPal</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Nous offrons une prise en charge complète pour vos animaux de compagnie avec des professionnels disponibles chaque jour.
            </p>
            <ul className="flex flex-col gap-2 mb-7">
              {["Experts certifiés & expérimentés", "Paiements 100 % sécurisés", "Disponible 7 jours sur 7"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-white" style={{ background: ORANGE }}>
                    <IconCheck />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: ORANGE }}
            >
              Découvrir plus <IconArrow />
            </Link>
          </div>

          {/* Right 2×2 grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {processItems.map(({ Icon, title, desc, color }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl transition-shadow hover:shadow-lg"
                style={{ border: "1px solid #f0f0f0" }}
              >
                <div className="mb-1">
                  <Icon />
                </div>
                <h3 className="font-bold text-[15px] text-gray-900" style={{ color }}>
                  {title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUICK ACCESS  (Mon espace)
      ══════════════════════════════════════════ */}
      <section className="py-10" style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: ORANGE }}>Accès rapide</p>
            <h2 className="text-xl font-extrabold text-gray-900">Mon espace</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { to: "/orders",                   label: "Commandes",    emoji: "📦" },
              { to: "/my-reservations",          label: "Réservations", emoji: "🏨" },
              { to: "/my-training-reservations", label: "Formations",   emoji: "🎓" },
              { to: "/my-reviews",               label: "Mes avis",     emoji: "⭐" },
              { to: "/appointments",             label: "Rendez-vous",  emoji: "📅" },
            ].map(({ to, label, emoji }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-2 px-4 py-6 bg-white rounded-2xl text-center transition-all hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="bg-white pt-10 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: ORANGE }}>Avis clients</p>
            <h2 className="text-xl font-extrabold text-gray-900">Ce que disent nos clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
            {testimonials.map(({ name, role, stars, text }) => (
              <div
                key={name}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f5f5f5" }}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                    style={{ background: `linear-gradient(135deg, ${ORANGE}, #f5a623)` }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900" style={{ color: ORANGE }}>{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative">
                  <span className="text-4xl font-serif leading-none text-gray-200 absolute -top-2 -left-1">"</span>
                  <p className="text-sm text-gray-500 leading-relaxed pl-4">{text}</p>
                  <span className="text-4xl font-serif leading-none text-gray-200 float-right -mt-2">"</span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mt-auto">
                  {[1,2,3,4,5].map((s) => <IconStar key={s} filled={s <= stars} />)}
                  <span className="text-xs text-gray-400 ml-2">{stars} Review</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ClientHomePage;

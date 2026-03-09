import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const features = [
  {
    icon: "🐕",
    title: "Mes animaux",
    description: "Consultez et gérez les profils de vos compagnons à quatre pattes.",
    link: "/pets",
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
  },
  {
    icon: "📅",
    title: "Rendez-vous",
    description: "Prenez et suivez vos rendez-vous vétérinaires facilement.",
    link: "/appointments",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: "📦",
    title: "Boutique",
    description: "Découvrez nos produits de qualité pour le bien-être et le confort de vos animaux.",
    link: "/products",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
  },
  {
    icon: "🤺",
    title: "Dressage",
    description: "Découvrez nos programmes de dressage adaptés à chaque animal.",
    link: "/training",
    icon: "🏨",
    title: "Hôtels",
    description: "Réservez un hébergement de qualité pour votre animal pendant vos absences.",
    link: "/hotels",
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
  },
];

const ClientHomePage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">Bienvenue sur PetPal</p>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              Bonjour,{" "}
              <span className="text-blue-600">{user?.nom ?? ""}</span> 👋
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Votre espace dédié au bien-être de vos animaux. Gérez leurs soins,
              hébergements et rendez-vous en quelques clics.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/appointments"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Prendre un rendez-vous
              </Link>
              <Link
                to="/pets"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm border border-gray-200"
              >
                Voir mes animaux
              </Link>
            </div>
          </div>
          <div className="text-[120px] leading-none select-none hidden md:block">
            🐾
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Nos services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, title, description, link, color, iconBg }) => (
            <Link
              key={title}
              to={link}
              className={`group flex flex-col gap-4 p-6 rounded-2xl border ${color} hover:shadow-md transition-all`}
            >
              <span className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
                {icon}
              </span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="bg-blue-600 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-xl mb-1">Besoin d’aide ?</h3>
            <p className="text-blue-100 text-sm">Notre équipe est disponible pour vous accompagner dans l’utilisation de PetPal.</p>
          </div>
          <Link
            to="/profile"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
          >
            Mon profil
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ClientHomePage;

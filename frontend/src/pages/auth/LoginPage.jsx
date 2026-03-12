import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../core/hooks/useAuth";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = ({ email, motDePasse }) => {
  const errors = {};
  if (!email) errors.email = "Email est obligatoire";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email invalide";
  if (!motDePasse) errors.motDePasse = "Mot de passe est obligatoire";
  return errors;
};

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 401 || status === 403
          ? "Email ou mot de passe incorrect"
          : err.response?.data?.message ||
            err.response?.data?.error ||
            "Une erreur est survenue, veuillez réessayer";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#ffffff", fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* ── Left: login card ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 md:px-16 lg:px-24">
        <div
          className="w-full max-w-sm bg-white rounded-3xl p-10"
          style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-10 select-none">
            {/* Paw icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-lg"
              style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)` }}
            >
              🐾
            </div>
            {/* Wordmark */}
            <div>
              <p className="text-[16px] font-extrabold tracking-tight text-gray-900 leading-none">PetPal</p>
              <p className="text-[11px] tracking-widest text-gray-400 mt-1" style={{ color: ORANGE }}>Connexion</p>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <p className="mb-6 text-xs text-red-500 text-center bg-red-50 rounded-lg p-2">{serverError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full pb-2.5 pt-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : `border-gray-200 focus:border-gray-300`
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pb-2.5 pt-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
                  errors.motDePasse
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-300"
                }`}
              />
              {errors.motDePasse && (
                <p className="mt-1.5 text-[11px] text-red-400">{errors.motDePasse}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-white text-sm font-bold rounded-2xl transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: ORANGE }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <Link
                to="/auth/register"
                className="text-xs font-semibold hover:underline transition-colors"
                style={{ color: ORANGE }}
              >
                Créer un compte
              </Link>

              <Link
                to="/auth/forgot-password"
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Mot de passe oublié?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right: hero section ───────────────────────────────── */}
      <div
        className="hidden md:flex md:w-[45%] lg:w-[42%] relative overflow-hidden items-center justify-center flex-col"
        style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)` }}
      >
        <div
          className="absolute inset-y-0 left-0 z-10 pointer-events-none"
          style={{
            width: "40%",
            background: `linear-gradient(to right, ${ORANGE} 0%, rgba(232, 114, 12, 0.5) 80%, transparent 100%)`
          }}
        />
        <div className="text-white text-center z-20 px-8">
          <h2 className="text-3xl font-extrabold mb-3">Bienvenue chez PetPal</h2>
          <p className="text-sm opacity-90">Votre plateforme complète pour le bien-être de vos animaux.</p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&auto=format&fit=crop&q=85"
          alt="Pet"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          style={{ objectPosition: "40% center" }}
        />
      </div>
    </div>
  );
};

export default LoginPage;

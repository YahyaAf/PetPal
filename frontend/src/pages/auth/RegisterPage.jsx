import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../core/hooks/useAuth";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-]{8,15}$/;

const validate = ({ nom, email, motDePasse, phone, address, dateNaissance }) => {
  const errors = {};
  if (!nom) errors.nom = "Nom est obligatoire";
  if (!email) errors.email = "Email est obligatoire";
  else if (!EMAIL_REGEX.test(email)) errors.email = "Format email invalide";
  if (!motDePasse) errors.motDePasse = "Mot de passe est obligatoire";
  else if (motDePasse.length < 6) errors.motDePasse = "Minimum 6 caractères";
  if (!phone) errors.phone = "Téléphone est obligatoire";
  else if (!PHONE_REGEX.test(phone)) errors.phone = "Format téléphone invalide";
  if (!address) errors.address = "Adresse est obligatoire";
  if (!dateNaissance) errors.dateNaissance = "Date de naissance est obligatoire";
  else if (new Date(dateNaissance) > new Date()) errors.dateNaissance = "Date invalide";
  return errors;
};

/* Bottom-border-only input — same style as LoginPage */
const inputCls = (hasError) =>
  `w-full pb-2 pt-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-gray-300"
  }`;

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nom: "", email: "", motDePasse: "", phone: "", address: "", dateNaissance: "",
  });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      await register({ ...form, dateNaissance: new Date(form.dateNaissance).toISOString() });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.message || data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#ffffff", fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* ── Left: register card ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-16 lg:px-24">
        <div
          className="w-full max-w-sm bg-white rounded-3xl p-10"
          style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}
        >
          {/* Brand — identical to LoginPage */}
          <div className="flex items-center gap-2.5 mb-8 select-none">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-lg"
              style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)` }}
            >
              🐾
            </div>
            <div>
              <p className="text-[16px] font-extrabold tracking-tight text-gray-900 leading-none">PetPal</p>
              <p className="text-[11px] tracking-widest text-gray-400 mt-1" style={{ color: ORANGE }}>Inscription</p>
            </div>
          </div>

          {serverError && (
            <p className="mb-5 text-xs text-red-500 text-center bg-red-50 rounded-lg p-2">{serverError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1 — Nom + Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom</label>
                <input
                  type="text" name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Votre nom"
                  className={inputCls(!!errors.nom)}
                />
                {errors.nom && <p className="mt-1 text-[11px] text-red-400">{errors.nom}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+212 6XX..."
                  className={inputCls(!!errors.phone)}
                />
                {errors.phone && <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="votre@email.com"
                className={inputCls(!!errors.email)}
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <input
                type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange}
                placeholder="••••••• (min. 6 caractères)"
                className={inputCls(!!errors.motDePasse)}
              />
              {errors.motDePasse && <p className="mt-1 text-[11px] text-red-400">{errors.motDePasse}</p>}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse</label>
              <input
                type="text" name="address" value={form.address} onChange={handleChange}
                placeholder="Rue, ville"
                className={inputCls(!!errors.address)}
              />
              {errors.address && <p className="mt-1 text-[11px] text-red-400">{errors.address}</p>}
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date de naissance</label>
              <input
                type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className={inputCls(!!errors.dateNaissance)}
                style={{ colorScheme: "light" }}
              />
              {errors.dateNaissance && <p className="mt-1 text-[11px] text-red-400">{errors.dateNaissance}</p>}
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-white text-sm font-bold rounded-2xl transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: ORANGE }}
              >
                {loading ? "Création..." : "S'inscrire"}
              </button>

              <Link
                to="/auth/login"
                className="text-xs font-semibold hover:underline transition-colors"
                style={{ color: ORANGE }}
              >
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right: hero section ──────────────────────────────── */}
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
          <h2 className="text-3xl font-extrabold mb-3">Rejoignez PetPal</h2>
          <p className="text-sm opacity-90">Commencez à prendre soin de vos compagnons aujourd'hui.</p>
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

export default RegisterPage;


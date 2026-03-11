import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../core/hooks/useAuth";

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
  `w-full pb-2 pt-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-gray-200 focus:border-gray-600"
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
      style={{ background: "#f5f5f5", fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* ── Left: register card ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-16 lg:px-24">
        <div
          className="w-full max-w-sm bg-white rounded-sm p-10"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}
        >
          {/* Brand — identical to LoginPage */}
          <div className="flex items-center gap-2.5 mb-8 select-none">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <circle cx="6.5" cy="6.5" r="2" />
                <circle cx="11" cy="4.5" r="1.7" />
                <circle cx="15.5" cy="6" r="1.8" />
                <circle cx="18.5" cy="10" r="1.6" />
                <path d="M12 9.5c-2.5 0-5.5 2-5.5 5 0 2.2 1.5 3.5 3 3.8.5.1 1 .2 1.5.2h2c.5 0 1-.1 1.5-.2 1.5-.3 3-1.6 3-3.8 0-3-3-5-5.5-5z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[0.18em] text-gray-800 leading-none">PETPAL</p>
              <p className="text-[10px] tracking-widest text-gray-400 mt-0.5">your pet&apos;s best friend</p>
            </div>
          </div>

          {serverError && (
            <p className="mb-5 text-xs text-red-500 text-center">{serverError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1 — Nom + Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text" name="nom" value={form.nom} onChange={handleChange}
                  placeholder="Full name"
                  className={inputCls(!!errors.nom)}
                />
                {errors.nom && <p className="mt-1 text-[11px] text-red-400">{errors.nom}</p>}
              </div>
              <div>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="Phone"
                  className={inputCls(!!errors.phone)}
                />
                {errors.phone && <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="Enter your email"
                className={inputCls(!!errors.email)}
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange}
                placeholder="Password (min. 6 characters)"
                className={inputCls(!!errors.motDePasse)}
              />
              {errors.motDePasse && <p className="mt-1 text-[11px] text-red-400">{errors.motDePasse}</p>}
            </div>

            {/* Adresse */}
            <div>
              <input
                type="text" name="address" value={form.address} onChange={handleChange}
                placeholder="Address"
                className={inputCls(!!errors.address)}
              />
              {errors.address && <p className="mt-1 text-[11px] text-red-400">{errors.address}</p>}
            </div>

            {/* Date de naissance */}
            <div>
              <input
                type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className={inputCls(!!errors.dateNaissance)}
                style={{ colorScheme: "light" }}
              />
              {errors.dateNaissance && <p className="mt-1 text-[11px] text-red-400">{errors.dateNaissance}</p>}
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-full tracking-wider transition-colors duration-200"
              >
                {loading ? "..." : "Sign Up"}
              </button>

              <Link
                to="/auth/login"
                className="text-xs font-semibold text-gray-800 hover:text-gray-500 tracking-wide transition-colors"
              >
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right: same dog image as LoginPage ──────────────── */}
      <div
        className="hidden md:flex md:w-[45%] lg:w-[42%] relative overflow-hidden items-center justify-start"
        style={{ background: "#f5f5f5" }}
      >
        <div
          className="absolute inset-y-0 left-0 z-10 pointer-events-none"
          style={{ width: "35%", background: "linear-gradient(to right, #f5f5f5 0%, transparent 100%)" }}
        />
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&auto=format&fit=crop&q=85"
          alt="Dog"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "40% center", mixBlendMode: "multiply" }}
        />
      </div>
    </div>
  );
};

export default RegisterPage;


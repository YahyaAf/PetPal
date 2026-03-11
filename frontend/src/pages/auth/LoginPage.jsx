import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../core/hooks/useAuth";

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
      style={{ background: "#f5f5f5", fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* ── Left: login card ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 md:px-16 lg:px-24">
        <div
          className="w-full max-w-sm bg-white rounded-sm p-10"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-10 select-none">
            {/* Paw icon */}
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
            {/* Wordmark */}
            <div>
              <p className="text-[15px] font-semibold tracking-[0.18em] text-gray-800 leading-none">PETPAL</p>
              <p className="text-[10px] tracking-widest text-gray-400 mt-0.5">your pet&apos;s best friend</p>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <p className="mb-6 text-xs text-red-500 text-center">{serverError}</p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full pb-2.5 pt-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-600"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full pb-2.5 pt-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none border-b transition-colors duration-200 ${
                  errors.motDePasse
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-600"
                }`}
              />
              {errors.motDePasse && (
                <p className="mt-1.5 text-[11px] text-red-400">{errors.motDePasse}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-full tracking-wider transition-colors duration-200"
              >
                {loading ? "..." : "Log in"}
              </button>

              <Link
                to="/auth/register"
                className="text-xs font-semibold text-gray-800 hover:text-gray-500 tracking-wide transition-colors"
              >
                Sign Up
              </Link>

              <Link
                to="/auth/forgot-password"
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right: dog image ───────────────────────────────── */}
      <div
        className="hidden md:flex md:w-[45%] lg:w-[42%] relative overflow-hidden items-center justify-start"
        style={{ background: "#f5f5f5" }}
      >
        {/* Left-edge fade */}
        <div
          className="absolute inset-y-0 left-0 z-10 pointer-events-none"
          style={{ width: "35%", background: "linear-gradient(to right, #f5f5f5 0%, transparent 100%)" }}
        />
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&auto=format&fit=crop&q=85"
          alt="Dog"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "40% center",
            mixBlendMode: "multiply",
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;

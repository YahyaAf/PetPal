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
  else if (new Date(dateNaissance) > new Date()) errors.dateNaissance = "Date de naissance invalide";
  return errors;
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-400" : "border-gray-300"
  }`;

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    phone: "",
    address: "",
    dateNaissance: "",
  });
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
      const payload = {
        ...form,
        dateNaissance: new Date(form.dateNaissance).toISOString(),
      };
      await register(payload);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        const msg = data?.message || data?.error || "Une erreur est survenue";
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Créer un compte</h1>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Nom complet" error={errors.nom}>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              className={inputClass(!!errors.nom)}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className={inputClass(!!errors.email)}
            />
          </Field>

          <Field label="Mot de passe" error={errors.motDePasse}>
            <input
              type="password"
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              placeholder="Minimum 6 caractères"
              className={inputClass(!!errors.motDePasse)}
            />
          </Field>

          <Field label="Téléphone" error={errors.phone}>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+212600000000"
              className={inputClass(!!errors.phone)}
            />
          </Field>

          <Field label="Adresse" error={errors.address}>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Votre adresse"
              className={inputClass(!!errors.address)}
            />
          </Field>

          <Field label="Date de naissance" error={errors.dateNaissance}>
            <input
              type="date"
              name="dateNaissance"
              value={form.dateNaissance}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className={inputClass(!!errors.dateNaissance)}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link to="/auth/login" className="text-blue-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

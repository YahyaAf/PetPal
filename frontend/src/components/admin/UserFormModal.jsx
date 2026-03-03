import { useState, useEffect } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["CLIENT", "ADMIN", "VET", "DRESSEUR"];

const validate = (form, isEdit) => {
  const errors = {};
  if (!form.nom || form.nom.trim().length < 2) errors.nom = "Nom requis (min 2 caractères)";
  else if (form.nom.trim().length > 100) errors.nom = "Nom trop long (max 100 caractères)";
  if (!form.email) errors.email = "Email obligatoire";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Format email invalide";
  if (!form.motDePasse) errors.motDePasse = "Mot de passe obligatoire";
  else if (form.motDePasse.length < 6) errors.motDePasse = "Minimum 6 caractères";
  if (!form.role) errors.role = "Rôle obligatoire";
  return errors;
};

const EMPTY_FORM = { nom: "", email: "", motDePasse: "", role: "CLIENT" };

const UserFormModal = ({ open, onClose, onSubmit, user, loading, serverErrors }) => {
  const isEdit = !!user;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(user ? { nom: user.nom, email: user.email, motDePasse: "", role: user.role } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, user]);

  useEffect(() => {
    if (serverErrors) setErrors((prev) => ({ ...prev, ...serverErrors }));
  }, [serverErrors]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ ...form });
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Nom complet"
              className={inputClass(!!errors.nom)}
            />
            {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className={inputClass(!!errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              value={form.motDePasse}
              onChange={handleChange}
              placeholder="Minimum 6 caractères"
              className={inputClass(!!errors.motDePasse)}
            />
            {errors.motDePasse && <p className="mt-1 text-xs text-red-500">{errors.motDePasse}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={inputClass(!!errors.role)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium transition-colors"
            >
              {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

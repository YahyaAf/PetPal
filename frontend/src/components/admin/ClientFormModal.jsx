import { useState, useEffect } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TODAY = new Date().toISOString().split("T")[0];

const validate = (form) => {
  const errors = {};
  if (!form.nom || form.nom.trim().length < 2) errors.nom = "Nom requis (min 2 caractères)";
  else if (form.nom.trim().length > 100) errors.nom = "Nom trop long (max 100 caractères)";
  if (!form.email) errors.email = "Email obligatoire";
  else if (!EMAIL_REGEX.test(form.email)) errors.email = "Format email invalide";
  if (!form.motDePasse) errors.motDePasse = "Mot de passe obligatoire";
  else if (form.motDePasse.length < 6) errors.motDePasse = "Minimum 6 caractères";
  if (!form.phone) errors.phone = "Téléphone obligatoire";
  else if (form.phone.replace(/\D/g, "").length < 10) errors.phone = "Minimum 10 chiffres";
  else if (form.phone.length > 15) errors.phone = "Maximum 15 caractères";
  if (!form.address) errors.address = "Adresse obligatoire";
  else if (form.address.trim().length < 5) errors.address = "Adresse trop courte (min 5 caractères)";
  else if (form.address.trim().length > 200) errors.address = "Adresse trop longue (max 200 caractères)";
  if (!form.dateNaissance) errors.dateNaissance = "Date de naissance obligatoire";
  else if (new Date(form.dateNaissance) >= new Date()) errors.dateNaissance = "Doit être dans le passé";
  return errors;
};

const EMPTY_FORM = { nom: "", email: "", motDePasse: "", phone: "", address: "", dateNaissance: "" };

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
    hasError ? "border-red-400 bg-red-50 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-600"
  }`;

const ClientFormModal = ({ open, onClose, onSubmit, client, loading, serverErrors }) => {
  const isEdit = !!client;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              nom: client.nom,
              email: client.email,
              motDePasse: "",
              phone: client.phone || "",
              address: client.address || "",
              dateNaissance: client.dateNaissance
                ? new Date(client.dateNaissance).toISOString().split("T")[0]
                : "",
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, client]);

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
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      ...form,
      dateNaissance: new Date(form.dateNaissance).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Modifier le client" : "Nouveau client"}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field label="Nom complet" error={errors.nom}>
            <input type="text" name="nom" value={form.nom} onChange={handleChange}
              placeholder="Nom complet" className={inputClass(!!errors.nom)} />
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="exemple@email.com" className={inputClass(!!errors.email)} />
          </Field>

          <Field label="Mot de passe" error={errors.motDePasse}>
            <input type="password" name="motDePasse" value={form.motDePasse} onChange={handleChange}
              placeholder="Minimum 6 caractères" className={inputClass(!!errors.motDePasse)} />
          </Field>

          <Field label="Téléphone" error={errors.phone}>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+212600000000" className={inputClass(!!errors.phone)} />
          </Field>

          <Field label="Adresse" error={errors.address}>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              placeholder="Adresse complète" className={inputClass(!!errors.address)} />
          </Field>

          <Field label="Date de naissance" error={errors.dateNaissance}>
            <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange}
              max={TODAY} className={inputClass(!!errors.dateNaissance)} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium transition-colors">
              {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;

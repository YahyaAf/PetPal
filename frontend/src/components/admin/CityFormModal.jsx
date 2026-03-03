import { useState, useEffect } from "react";

const validate = ({ nomVille }) => {
  const errors = {};
  if (!nomVille || !nomVille.trim()) errors.nomVille = "Nom de la ville obligatoire";
  return errors;
};

const EMPTY_FORM = { nomVille: "" };

const CityFormModal = ({ open, onClose, onSubmit, city, loading, serverErrors }) => {
  const isEdit = !!city;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(city ? { nomVille: city.nomVille } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, city]);

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
    onSubmit({ nomVille: form.nomVille.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Modifier la ville" : "Nouvelle ville"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la ville</label>
            <input
              type="text"
              name="nomVille"
              value={form.nomVille}
              onChange={handleChange}
              placeholder="Ex: Casablanca"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nomVille ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.nomVille && (
              <p className="mt-1 text-xs text-red-500">{errors.nomVille}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
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

export default CityFormModal;

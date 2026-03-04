import { useState, useEffect } from "react";

const CategoryFormModal = ({ open, category, onClose, onSubmit, loading, serverErrors }) => {
  const [nom, setNom] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setNom(category ? category.nom : "");
      setErrors({});
    }
  }, [open, category]);

  useEffect(() => {
    if (serverErrors) setErrors((p) => ({ ...p, ...serverErrors }));
  }, [serverErrors]);

  const submit = (e) => {
    e.preventDefault();
    if (!nom.trim()) { setErrors({ nom: "Le nom est obligatoire" }); return; }
    onSubmit({ nom: nom.trim() });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              value={nom}
              onChange={(e) => { setNom(e.target.value); setErrors({}); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.nom ? "border-red-400 bg-red-50" : "border-gray-200"
              }`}
              placeholder="Nom de la catégorie"
              autoFocus
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : category ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;

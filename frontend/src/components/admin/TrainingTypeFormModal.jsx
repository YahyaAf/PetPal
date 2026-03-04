import { useState, useEffect } from "react";

const empty = { nom: "", description: "", prix: "", duree: "" };

const TrainingTypeFormModal = ({ open, trainingType, onClose, onSubmit, loading, serverErrors }) => {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (trainingType) {
        setForm({
          nom: trainingType.nom || "",
          description: trainingType.description || "",
          prix: trainingType.prix != null ? String(trainingType.prix) : "",
          duree: trainingType.duree != null ? String(trainingType.duree) : "",
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, trainingType]);

  useEffect(() => {
    if (serverErrors) setErrors((p) => ({ ...p, ...serverErrors }));
  }, [serverErrors]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    if (form.prix === "" || isNaN(Number(form.prix))) e.prix = "Le prix est obligatoire";
    else if (Number(form.prix) <= 0) e.prix = "Le prix doit être positif";
    if (form.duree === "" || isNaN(Number(form.duree))) e.duree = "La durée est obligatoire";
    else if (Number(form.duree) <= 0) e.duree = "La durée doit être positive";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      nom: form.nom.trim(),
      description: form.description.trim() || null,
      prix: parseFloat(form.prix),
      duree: parseInt(form.duree),
    });
  };

  if (!open) return null;

  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";
  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {trainingType ? "Modifier le type de dressage" : "Nouveau type de dressage"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="px-6 py-4 space-y-4">
          <div>
            <label className={labelClass}>Nom <span className="text-red-500">*</span></label>
            <input
              name="nom"
              value={form.nom}
              onChange={change}
              className={inputClass("nom")}
              placeholder="Nom du type de dressage"
              autoFocus
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              className={`${inputClass("description")} resize-none`}
              placeholder="Description (optionnel)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prix (MAD) <span className="text-red-500">*</span></label>
              <input
                name="prix"
                value={form.prix}
                onChange={change}
                type="number"
                min="0.01"
                step="0.01"
                className={inputClass("prix")}
                placeholder="0.00"
              />
              {errors.prix && <p className="text-red-500 text-xs mt-1">{errors.prix}</p>}
            </div>
            <div>
              <label className={labelClass}>Durée (jours) <span className="text-red-500">*</span></label>
              <input
                name="duree"
                value={form.duree}
                onChange={change}
                type="number"
                min="1"
                className={inputClass("duree")}
                placeholder="1"
              />
              {errors.duree && <p className="text-red-500 text-xs mt-1">{errors.duree}</p>}
            </div>
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
            {loading ? "Enregistrement..." : trainingType ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingTypeFormModal;

import { useState, useEffect } from "react";

const empty = {
  nom: "",
  adresse: "",
  description: "",
  prixParJour: "",
  disponibilite: "true",
  countOfPlace: "",
  cityId: "",
};

const HotelFormModal = ({ open, hotel, cities, onClose, onSubmit, loading, serverErrors }) => {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (hotel) {
        setForm({
          nom: hotel.nom || "",
          adresse: hotel.adresse || "",
          description: hotel.description || "",
          prixParJour: hotel.prixParJour != null ? String(hotel.prixParJour) : "",
          disponibilite: hotel.disponibilite != null ? String(hotel.disponibilite) : "true",
          countOfPlace: hotel.countOfPlace != null ? String(hotel.countOfPlace) : "",
          cityId: hotel.city?.idCity != null ? String(hotel.city.idCity) : "",
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, hotel]);

  useEffect(() => {
    if (serverErrors) setErrors((prev) => ({ ...prev, ...serverErrors }));
  }, [serverErrors]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    if (!form.adresse.trim()) e.adresse = "L'adresse est obligatoire";
    if (form.prixParJour === "" || isNaN(Number(form.prixParJour)))
      e.prixParJour = "Le prix par jour est obligatoire";
    else if (Number(form.prixParJour) < 0)
      e.prixParJour = "Le prix doit être positif";
    if (!form.countOfPlace || isNaN(Number(form.countOfPlace)))
      e.countOfPlace = "Le nombre de places est obligatoire";
    else if (Number(form.countOfPlace) < 1)
      e.countOfPlace = "Minimum 1 place";
    if (!form.cityId) e.cityId = "La ville est obligatoire";
    return e;
  };

  const submit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSubmit({
      nom: form.nom.trim(),
      adresse: form.adresse.trim(),
      description: form.description.trim() || null,
      prixParJour: parseFloat(form.prixParJour),
      disponibilite: form.disponibilite === "true",
      countOfPlace: parseInt(form.countOfPlace),
      cityId: parseInt(form.cityId),
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {hotel ? "Modifier l'hôtel" : "Nouvel hôtel"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom <span className="text-red-500">*</span></label>
              <input name="nom" value={form.nom} onChange={change} className={inputClass("nom")} placeholder="Nom de l'hôtel" />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>
            <div>
              <label className={labelClass}>Ville <span className="text-red-500">*</span></label>
              <select name="cityId" value={form.cityId} onChange={change} className={inputClass("cityId")}>
                <option value="">Sélectionner une ville</option>
                {cities.map((c) => (
                  <option key={c.idCity} value={c.idCity}>{c.nomVille}</option>
                ))}
              </select>
              {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Adresse <span className="text-red-500">*</span></label>
            <input name="adresse" value={form.adresse} onChange={change} className={inputClass("adresse")} placeholder="Adresse complète" />
            {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              className={`${inputClass("description")} resize-none`}
              placeholder="Description de l'hôtel (optionnel)"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Prix/Jour (MAD) <span className="text-red-500">*</span></label>
              <input
                name="prixParJour"
                value={form.prixParJour}
                onChange={change}
                type="number"
                min="0"
                step="0.01"
                className={inputClass("prixParJour")}
                placeholder="0.00"
              />
              {errors.prixParJour && <p className="text-red-500 text-xs mt-1">{errors.prixParJour}</p>}
            </div>
            <div>
              <label className={labelClass}>Places <span className="text-red-500">*</span></label>
              <input
                name="countOfPlace"
                value={form.countOfPlace}
                onChange={change}
                type="number"
                min="1"
                className={inputClass("countOfPlace")}
                placeholder="1"
              />
              {errors.countOfPlace && <p className="text-red-500 text-xs mt-1">{errors.countOfPlace}</p>}
            </div>
            <div>
              <label className={labelClass}>Disponibilité <span className="text-red-500">*</span></label>
              <select name="disponibilite" value={form.disponibilite} onChange={change} className={inputClass("disponibilite")}>
                <option value="true">Disponible</option>
                <option value="false">Non disponible</option>
              </select>
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
            {loading ? "Enregistrement..." : hotel ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelFormModal;

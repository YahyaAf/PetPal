import { useState, useEffect } from "react";

const empty = {
  nom: "",
  description: "",
  prix: "",
  stock: "",
  imageUrl: "",
  categoryId: "",
};

const ProductFormModal = ({ open, product, categories, onClose, onSubmit, loading, serverErrors }) => {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          nom: product.nom || "",
          description: product.description || "",
          prix: product.prix != null ? String(product.prix) : "",
          stock: product.stock != null ? String(product.stock) : "",
          imageUrl: product.imageUrl || "",
          categoryId: product.categoryId != null ? String(product.categoryId) : "",
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, product]);

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
    else if (Number(form.prix) < 0) e.prix = "Le prix doit être positif";
    if (form.stock === "" || isNaN(Number(form.stock))) e.stock = "Le stock est obligatoire";
    else if (Number(form.stock) < 0) e.stock = "Le stock doit être positif";
    if (!form.imageUrl.trim()) e.imageUrl = "L'image est obligatoire";
    if (!form.categoryId) e.categoryId = "La catégorie est obligatoire";
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
      stock: parseInt(form.stock),
      imageUrl: form.imageUrl.trim(),
      categoryId: parseInt(form.categoryId),
    });
  };

  if (!open) return null;

  const label = (text, required) => (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
      errors[field] ? "border-red-400 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-600"
    }`;

  const err = (field) =>
    errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={submit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              {label("Nom", true)}
              <input name="nom" value={form.nom} onChange={change} className={inputClass("nom")} placeholder="Nom du produit" />
              {err("nom")}
            </div>
            <div>
              {label("Catégorie", true)}
              <select name="categoryId" value={form.categoryId} onChange={change} className={inputClass("categoryId")}>
                <option value="">Sélectionner</option>
                {categories.map((c) => (
                  <option key={c.idCategory} value={c.idCategory}>{c.nom}</option>
                ))}
              </select>
              {err("categoryId")}
            </div>
          </div>

          <div>
            {label("Image URL", true)}
            <input name="imageUrl" value={form.imageUrl} onChange={change} className={inputClass("imageUrl")} placeholder="https://..." />
            {err("imageUrl")}
            {form.imageUrl && !errors.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" onError={(e) => e.target.style.display = "none"} />
            )}
          </div>

          <div>
            {label("Description")}
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              className={`${inputClass("description")} resize-none`}
              placeholder="Description du produit (optionnel)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              {label("Prix (MAD)", true)}
              <input
                name="prix"
                value={form.prix}
                onChange={change}
                type="number"
                min="0"
                step="0.01"
                className={inputClass("prix")}
                placeholder="0.00"
              />
              {err("prix")}
            </div>
            <div>
              {label("Stock", true)}
              <input
                name="stock"
                value={form.stock}
                onChange={change}
                type="number"
                min="0"
                className={inputClass("stock")}
                placeholder="0"
              />
              {err("stock")}
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : product ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;

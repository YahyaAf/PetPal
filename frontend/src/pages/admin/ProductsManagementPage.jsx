import { useState, useEffect, useCallback } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductFormModal from "../../components/admin/ProductFormModal";
import ProductDetailModal from "../../components/admin/ProductDetailModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const ProductsManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, product: null });
  const [detailModal, setDetailModal] = useState({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const all = await productService.getAll();
      const filtered = selectedCategoryId
        ? all.filter((p) => String(p.categoryId) === selectedCategoryId)
        : all;
      setProducts(filtered);
    } catch {
      setListError("Impossible de charger les produits.");
    } finally {
      setLoadingList(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, product: null });
  };

  const openEdit = (product) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, product });
  };

  const openDetail = (product) => {
    setDetailModal({ open: true, product });
  };

  const openDelete = (product) => {
    setActionError("");
    setDeleteModal({ open: true, product });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.product) {
        await productService.update(formModal.product.id, payload);
        addToast("Produit modifié avec succès");
      } else {
        await productService.create(payload);
        addToast("Produit créé avec succès");
      }
      setFormModal({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
      } else {
        const msg = data?.message || data?.error || "Une erreur est survenue";
        setActionError(msg);
        if (msg.toLowerCase().includes("nom")) {
          setServerErrors({ nom: msg });
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await productService.delete(deleteModal.product.id);
      setDeleteModal({ open: false, product: null });
      fetchProducts();
      addToast("Produit supprimé avec succès");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCategoryName = selectedCategoryId
    ? categories.find((c) => String(c.idCategory) === selectedCategoryId)?.nom
    : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestion des produits</h1>
          {selectedCategoryName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Filtré par : <span className="font-medium text-blue-600">{selectedCategoryName}</span>
            </p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouveau produit
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrer par catégorie :</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[200px]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.idCategory} value={c.idCategory}>{c.nom}</option>
          ))}
        </select>
        {selectedCategoryId && (
          <button
            onClick={() => setSelectedCategoryId("")}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {actionError && !formModal.open && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {actionError}
        </div>
      )}

      {listError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{listError}</div>
      )}

      {loadingList ? (
        <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Image</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prix</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {selectedCategoryId ? "Aucun produit dans cette catégorie" : "Aucun produit trouvé"}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{p.id}</td>
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.nom}
                          className="h-10 w-10 object-cover rounded-lg border border-gray-100"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nom}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {p.categoryNom || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{p.prix} MAD</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}>
                        {p.stock > 0 ? `${p.stock} en stock` : "Rupture"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openDetail(p)}
                          className="px-3 py-1 text-xs rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(p)}
                          className="px-3 py-1 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={formModal.open}
        product={formModal.product}
        categories={categories}
        onClose={() => setFormModal({ open: false, product: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ProductDetailModal
        open={detailModal.open}
        product={detailModal.product}
        onClose={() => setDetailModal({ open: false, product: null })}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.product?.nom}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductsManagementPage;

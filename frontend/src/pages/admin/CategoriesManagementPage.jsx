import { useState, useEffect, useCallback } from "react";
import categoryService from "../../services/categoryService";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchCategories = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      setListError("Impossible de charger les catégories.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, category: null });
  };

  const openEdit = (category) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, category });
  };

  const openDelete = (category) => {
    setActionError("");
    setDeleteModal({ open: true, category });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.category) {
        await categoryService.update(formModal.category.idCategory, payload);
        addToast("Catégorie modifiée avec succès");
      } else {
        await categoryService.create(payload);
        addToast("Catégorie créée avec succès");
      }
      setFormModal({ open: false, category: null });
      fetchCategories();
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
      await categoryService.delete(deleteModal.category.idCategory);
      setDeleteModal({ open: false, category: null });
      fetchCategories();
      addToast("Catégorie supprimée avec succès");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Gestion des catégories</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvelle catégorie
        </button>
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date de création</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">Aucune catégorie trouvée</td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.idCategory} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{c.idCategory}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nom}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.dateCreation)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(c)}
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

      <CategoryFormModal
        open={formModal.open}
        category={formModal.category}
        onClose={() => setFormModal({ open: false, category: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.category?.nom}
        onClose={() => setDeleteModal({ open: false, category: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default CategoriesManagementPage;

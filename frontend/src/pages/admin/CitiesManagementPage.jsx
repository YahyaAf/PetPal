import { useState, useEffect, useCallback } from "react";
import cityService from "../../services/cityService";
import CityFormModal from "../../components/admin/CityFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const CitiesManagementPage = () => {
  const [cities, setCities] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, city: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, city: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchCities = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await cityService.getAll();
      setCities(data);
    } catch {
      setListError("Impossible de charger les villes.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, city: null });
  };

  const openEdit = (city) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, city });
  };

  const openDelete = (city) => {
    setActionError("");
    setDeleteModal({ open: true, city });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.city) {
        await cityService.update(formModal.city.idCity, payload);
        addToast("Ville modifiée avec succès");
      } else {
        await cityService.create(payload);
        addToast("Ville créée avec succès");
      }
      setFormModal({ open: false, city: null });
      fetchCities();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
      } else {
        const msg = data?.message || data?.error || "Une erreur est survenue";
        setActionError(msg);
        if (msg.toLowerCase().includes("nomville") || msg.toLowerCase().includes("ville")) {
          setServerErrors({ nomVille: msg });
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
      await cityService.delete(deleteModal.city.idCity);
      setDeleteModal({ open: false, city: null });
      fetchCities();
      addToast("Ville supprimée avec succès");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des villes</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvelle ville
        </button>
      </div>

      {actionError && !formModal.open && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {actionError}
        </div>
      )}

      {listError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{listError}</div>
      )}

      {loadingList ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">Chargement...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Nom de la ville</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {cities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-400 dark:text-gray-600">Aucune ville trouvée</td>
                </tr>
              ) : (
                cities.map((c) => (
                  <tr key={c.idCity} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-600">{c.idCity}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{c.nomVille}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(c)}
                          className="px-3 py-1 text-xs rounded-lg border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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

      <CityFormModal
        open={formModal.open}
        city={formModal.city}
        onClose={() => setFormModal({ open: false, city: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.city?.nomVille}
        onClose={() => setDeleteModal({ open: false, city: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default CitiesManagementPage;

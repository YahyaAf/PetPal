import { useState, useEffect, useCallback } from "react";
import trainingTypeService from "../../services/trainingTypeService";
import TrainingTypeFormModal from "../../components/admin/TrainingTypeFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const TrainingTypesManagementPage = () => {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, trainingType: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, trainingType: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchTrainingTypes = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await trainingTypeService.getAll();
      setTrainingTypes(data);
    } catch {
      setListError("Impossible de charger les types de dressage.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchTrainingTypes(); }, [fetchTrainingTypes]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, trainingType: null });
  };

  const openEdit = (trainingType) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, trainingType });
  };

  const openDelete = (trainingType) => {
    setActionError("");
    setDeleteModal({ open: true, trainingType });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.trainingType) {
        await trainingTypeService.update(formModal.trainingType.idType, payload);
        addToast("Type de dressage modifié avec succès");
      } else {
        await trainingTypeService.create(payload);
        addToast("Type de dressage créé avec succès");
      }
      setFormModal({ open: false, trainingType: null });
      fetchTrainingTypes();
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
      await trainingTypeService.delete(deleteModal.trainingType.idType);
      setDeleteModal({ open: false, trainingType: null });
      fetchTrainingTypes();
      addToast("Type de dressage supprimé avec succès");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Types de dressage</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouveau type
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prix</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Durée</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trainingTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Aucun type de dressage trouvé</td>
                </tr>
              ) : (
                trainingTypes.map((t) => (
                  <tr key={t.idType} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{t.idType}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.nom}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate" title={t.description}>
                      {t.description || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{t.prix} MAD</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {t.duree} {t.duree === 1 ? "jour" : "jours"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(t)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(t)}
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

      <TrainingTypeFormModal
        open={formModal.open}
        trainingType={formModal.trainingType}
        onClose={() => setFormModal({ open: false, trainingType: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.trainingType?.nom}
        onClose={() => setDeleteModal({ open: false, trainingType: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default TrainingTypesManagementPage;

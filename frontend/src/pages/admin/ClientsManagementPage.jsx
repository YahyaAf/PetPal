import { useState, useEffect, useCallback } from "react";
import clientService from "../../services/clientService";
import ClientFormModal from "../../components/admin/ClientFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const ClientsManagementPage = () => {
  const [clients, setClients] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, client: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, client: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchClients = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch {
      setListError("Impossible de charger les clients.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, client: null });
  };

  const openEdit = (client) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, client });
  };

  const openDelete = (client) => {
    setActionError("");
    setDeleteModal({ open: true, client });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.client) {
        await clientService.update(formModal.client.idUser, payload);
        addToast("Client modifié avec succès");
      } else {
        await clientService.create(payload);
        addToast("Client créé avec succès");
      }
      setFormModal({ open: false, client: null });
      fetchClients();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
      } else {
        const msg = data?.message || data?.error || "Une erreur est survenue";
        setActionError(msg);
        if (msg.toLowerCase().includes("email")) {
          setServerErrors({ email: msg });
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
      await clientService.delete(deleteModal.client.idUser);
      setDeleteModal({ open: false, client: null });
      fetchClients();
      addToast("Client supprimé avec succès");
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des clients</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouveau client
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Téléphone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Adresse</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Naissance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-600">Aucun client trouvé</td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.idUser} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-600">{c.idUser}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{c.nom}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-40 truncate">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-500">
                      {c.dateNaissance ? new Date(c.dateNaissance).toLocaleDateString("fr-FR") : "—"}
                    </td>
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

      <ClientFormModal
        open={formModal.open}
        client={formModal.client}
        onClose={() => setFormModal({ open: false, client: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.client?.nom}
        onClose={() => setDeleteModal({ open: false, client: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default ClientsManagementPage;

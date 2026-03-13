import { useState, useEffect, useCallback } from "react";
import userService from "../../services/userService";
import UserFormModal from "../../components/admin/UserFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const ROLE_BADGE = {
  ADMIN: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  CLIENT: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  VET: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchUsers = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      setListError("Impossible de charger les utilisateurs.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, user: null });
  };

  const openEdit = (user) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, user });
  };

  const openDelete = (user) => {
    setActionError("");
    setDeleteModal({ open: true, user });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.user) {
        await userService.update(formModal.user.idUser, payload);
        addToast("Utilisateur modifié avec succès");
      } else {
        await userService.create(payload);
        addToast("Utilisateur créé avec succès");
      }
      setFormModal({ open: false, user: null });
      fetchUsers();
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
      await userService.delete(deleteModal.user.idUser);
      setDeleteModal({ open: false, user: null });
      fetchUsers();
      addToast("Utilisateur supprimé avec succès");
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvel utilisateur
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Rôle</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Date création</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 dark:text-gray-600">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.idUser} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-600">{u.idUser}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{u.nom}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[u.role] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-500">
                      {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(u)}
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

      <UserFormModal
        open={formModal.open}
        user={formModal.user}
        onClose={() => setFormModal({ open: false, user: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        user={deleteModal.user}
        userName={deleteModal.user?.nom}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default UsersManagementPage;

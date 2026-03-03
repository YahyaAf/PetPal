import { useState, useEffect, useCallback } from "react";
import userService from "../../services/userService";
import UserFormModal from "../../components/admin/UserFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

const ROLE_BADGE = {
  ADMIN: "bg-purple-100 text-purple-700",
  CLIENT: "bg-blue-100 text-blue-700",
  VET: "bg-green-100 text-green-700",
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
      } else {
        await userService.create(payload);
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
        <h1 className="text-xl font-bold text-gray-800">Gestion des utilisateurs</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvel utilisateur
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rôle</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date création</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.idUser} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{u.idUser}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[u.role] || "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.dateCreation ? new Date(u.dateCreation).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(u)}
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

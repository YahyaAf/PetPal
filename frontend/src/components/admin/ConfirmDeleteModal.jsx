const ConfirmDeleteModal = ({ open, onClose, onConfirm, loading, userName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-red-600 dark:text-red-400 text-lg">⚠</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Supprimer l&apos;utilisateur</h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{userName}</span> ?
          Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium transition-colors"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

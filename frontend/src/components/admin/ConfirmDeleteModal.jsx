const ConfirmDeleteModal = ({ open, onClose, onConfirm, loading, userName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-lg">⚠</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Supprimer l&apos;utilisateur</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="font-semibold text-gray-800">{userName}</span> ?
          Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
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

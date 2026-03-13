const ProductDetailModal = ({ open, product, onClose }) => {
  if (!open || !product) return null;

  const row = (label, value) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-200">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white">Détails du produit</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {product.imageUrl && (
            <div className="flex justify-center">
              <img
                src={product.imageUrl}
                alt={product.nom}
                className="h-36 w-36 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                onError={(e) => e.target.style.display = "none"}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {row("Nom", product.nom)}
            {row("Catégorie", product.categoryNom)}
            {row("Prix", product.prix != null ? `${product.prix} MAD` : null)}
            {row("Stock", product.stock != null ? `${product.stock} unités` : null)}
          </div>

          {product.description && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Image URL</span>
            <a
              href={product.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate"
            >
              {product.imageUrl}
            </a>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import useCartStore from "../../store/cartStore";
import useToastStore from "../../store/toastStore";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [qty, setQty] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch {
        setError("Produit introuvable.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    setCartLoading(true);
    const result = await addItem(product.id, qty);
    setCartLoading(false);
    if (result.success) {
      addToast(`"${product.nom}" ajouté au panier ! 🛒`, "success");
    } else {
      addToast(result.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4 py-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-gray-600 font-medium">{error || "Produit introuvable"}</p>
        <Link to="/products" className="text-blue-600 text-sm hover:underline">← Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
        >
          ← Retour
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative bg-gray-50">
            {product.imageUrl && !imgError ? (
              <img
                src={product.imageUrl}
                alt={product.nom}
                className="w-full h-full object-cover aspect-square"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-200 text-8xl">
                📦
              </div>
            )}
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 shadow-sm border border-gray-100">
              {product.categoryNom}
            </span>
            {product.stock === 0 && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                Rupture de stock
              </span>
            )}
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.nom}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {product.categoryNom}
              </span>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            )}

            <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Prix</p>
                <p className="text-3xl font-bold text-blue-600">{product.prix} <span className="text-lg font-semibold text-blue-400">MAD</span></p>
              </div>
              <div className="ml-auto">
                <p className="text-xs text-gray-400 font-medium mb-1">Disponibilité</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.stock > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {product.stock > 0 ? `${product.stock} en stock` : "Indisponible"}
                </span>
              </div>
            </div>

            {product.stock > 0 ? (
              <div className="flex flex-col gap-3">
                {/* Sélecteur de quantité */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">Quantité</span>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-800">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.stock} dispo.</span>
                </div>

                {/* Bouton ajouter au panier */}
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {cartLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Ajout en cours…
                    </span>
                  ) : (
                    "🛒 Ajouter au panier"
                  )}
                </button>

                <Link
                  to="/cart"
                  className="w-full py-3 border border-blue-200 hover:bg-blue-50 text-blue-700 font-medium rounded-xl transition-colors text-sm text-center"
                >
                  Voir mon panier
                </Link>
                <Link
                  to="/appointments"
                  className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm text-center"
                >
                  Prendre un rendez-vous
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button disabled className="w-full py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl text-sm cursor-not-allowed">
                  Indisponible
                </button>
                <Link
                  to="/products"
                  className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm text-center"
                >
                  Voir d'autres produits
                </Link>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              Référence : <span className="font-mono">PROD-{String(product.id).padStart(5, "0")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import useCartStore from "../../store/cartStore";
import useToastStore from "../../store/toastStore";

const ORANGE = "#E8720C";

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
      <div className="min-h-screen" style={{ background: "#f5f5f5", fontFamily: "'Inter','Poppins',sans-serif" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden">
            <div className="aspect-square bg-gray-100" />
            <div className="p-10 space-y-5">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded w-1/3" />
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#f5f5f5" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-gray-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 font-medium">{error || "Produit introuvable"}</p>
        <Link to="/products" className="text-sm font-semibold hover:underline" style={{ color: ORANGE }}>
          &#8592; Retour &#224; la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5", fontFamily: "'Inter','Poppins',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-600 transition-colors">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-600 transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{product.nom}</span>
        </div>

        {/* Main card */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 2px 24px 0 rgba(0,0,0,0.06)" }}
        >
          {/* Left - Image */}
          <div className="relative flex items-center justify-center bg-gray-50 p-8" style={{ minHeight: 420 }}>
            {product.imageUrl && !imgError ? (
              <img
                src={product.imageUrl}
                alt={product.nom}
                className="w-full object-contain"
                style={{ maxHeight: 380 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full text-gray-200" style={{ minHeight: 300 }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20">
                  <path d="M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 10c-2.5 0-6 1.5-6 4.5V17h12v-2.5c0-3-3.5-4.5-6-4.5z" />
                </svg>
              </div>
            )}
            <span
              className="absolute top-5 left-5 px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: ORANGE }}
            >
              {product.categoryNom}
            </span>
            {product.stock === 0 && (
              <div
                className="absolute top-0 right-0 w-0 h-0"
                style={{ borderTop: "60px solid #ef4444", borderLeft: "60px solid transparent" }}
              >
                <span className="absolute text-white text-[9px] font-bold" style={{ top: -54, right: 3 }}>RUPTURE</span>
              </div>
            )}
          </div>

          {/* Right - Info */}
          <div className="p-10 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug mb-2">{product.nom}</h1>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">{product.categoryNom}</p>
            </div>

            {product.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center justify-between py-5 border-t border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Prix</p>
                <p className="text-4xl font-extrabold" style={{ color: ORANGE }}>
                  {product.prix} <span className="text-xl font-semibold" style={{ color: ORANGE }}>MAD</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Disponibilit&#233;</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {product.stock > 0 ? `${product.stock} en stock` : "Indisponible"}
                </span>
              </div>
            </div>

            {product.stock > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantit&#233;</span>
                  <div className="flex items-center rounded-xl overflow-hidden border border-gray-200">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                    >
                      &#8722;
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-800 border-x border-gray-200 h-10 flex items-center justify-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                    >
                      &#43;
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.stock} disponibles</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: ORANGE }}
                >
                  {cartLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Ajout en cours&#8230;
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Ajouter au panier
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-center transition-colors hover:bg-gray-50 border border-gray-200 text-gray-700"
                >
                  Voir mon panier &#8594;
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl text-sm cursor-not-allowed">
                  Indisponible
                </button>
                <Link
                  to="/products"
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-center transition-colors hover:bg-gray-50 border border-gray-200 text-gray-700"
                >
                  &#8592; Voir d&#8217;autres produits
                </Link>
              </div>
            )}

            <p className="text-xs text-gray-300 text-center tracking-wider">
              R&#233;f&#233;rence&#160;: <span className="font-mono">PROD-{String(product.id).padStart(5, "0")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

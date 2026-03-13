import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useToastStore from "../../store/toastStore";
import orderService from "../../services/orderService";

const ORANGE = "#E8720C";

const CartItemSkeleton = () => (
  <div className="flex items-center gap-5 p-5 animate-pulse">
    <div className="w-20 h-20 rounded-2xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="w-28 h-9 bg-gray-100 rounded-xl" />
    <div className="w-20 h-4 bg-gray-100 rounded" />
  </div>
);

const QuantityControl = ({ item, onUpdate, onRemove, disabled }) => (
  <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 bg-white">
    <button
      onClick={() =>
        item.quantite === 1 ? onRemove(item.idCartItem) : onUpdate(item.idCartItem, item.quantite - 1)
      }
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center transition-colors disabled:opacity-40"
      style={{ color: item.quantite === 1 ? "#ef4444" : "#6b7280" }}
      title={item.quantite === 1 ? "Retirer" : "Diminuer"}
    >
      {item.quantite === 1 ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ) : (
        <span className="text-lg font-medium leading-none">&#8722;</span>
      )}
    </button>
    <span className="w-9 text-center text-sm font-bold text-gray-800 border-x border-gray-200 h-9 flex items-center justify-center">{item.quantite}</span>
    <button
      onClick={() => onUpdate(item.idCartItem, item.quantite + 1)}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
    >
      <span className="text-lg font-medium leading-none">&#43;</span>
    </button>
  </div>
);

// ─────────────────────────────────────────────
//  CartPage
// ─────────────────────────────────────────────
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, error, fetchCart, updateItem, removeItem, clearCart } =
    useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Mise à jour de quantité ──────────────────
  const handleUpdate = async (cartItemId, newQty) => {
    await updateItem(cartItemId, newQty);
  };

  // ── Suppression d'un article ─────────────────
  const handleRemove = async (cartItemId) => {
    await removeItem(cartItemId);
    addToast("Article retiré du panier.", "info");
  };

  // ── Vider le panier ──────────────────────────
  const handleClear = async () => {
    if (!window.confirm("Vider tout le panier ?")) return;
    await clearCart();
    addToast("Panier vidé.", "info");
  };

  // ── Passer la commande → Stripe ─────────────
  const handleOrder = async () => {
    if (!items.length) return;
    setOrderLoading(true);
    try {
      const orderRequest = {
        items: items.map((i) => ({ productId: i.productId, quantite: i.quantite })),
      };
      const response = await orderService.createOrder(orderRequest);
      navigate("/checkout", {
        state: {
          clientSecret: response.stripeClientSecret,
          paymentId: response.paymentId,
          orderId: response.idOrder,
          total: response.total,
          items,
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Impossible de créer la commande. Réessayez.";
      addToast(message, "error");
    } finally {
      setOrderLoading(false);
    }
  };

  const items = cart?.items ?? [];
  const isEmpty = !loading && items.length === 0;

  // ── Erreur globale ───────────────────────────
  if (error && !cart) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" style={{ background: "#f5f5f5" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-gray-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-gray-600 font-medium">{error}</p>
        <button
          onClick={fetchCart}
          className="px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}
        >
          R&#233;essayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5", fontFamily: "'Inter','Poppins',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Mon panier</h1>
            {!loading && cart && (
              <p className="text-sm text-gray-400 mt-1">
                {cart.nombreArticles ?? 0} article{(cart.nombreArticles ?? 0) > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            &#8592; Continuer mes achats
          </Link>
        </div>

        {/* Panier validé */}
        {cart?.status === "VALIDE" && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-600 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-semibold text-sm">Panier d&#233;j&#224; command&#233;</p>
              <p className="text-green-600 text-xs mt-0.5">Ce panier a d&#233;j&#224; &#233;t&#233; pass&#233; en commande.</p>
            </div>
          </div>
        )}
        {/* Erreur inline */}
        {error && cart && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: "0 2px 24px 0 rgba(0,0,0,0.06)" }}>
              {/* Skeleton */}
              {loading && !cart && (
                <div className="divide-y divide-gray-50">
                  {[...Array(3)].map((_, i) => (
                    <CartItemSkeleton key={i} />
                  ))}
                </div>
              )}
              {/* Empty state */}
              {isEmpty && (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "#FFF4EB" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9" style={{ color: ORANGE }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-bold text-lg mb-1">Votre panier est vide</p>
                  <p className="text-gray-400 text-sm mb-7">Parcourez notre boutique et ajoutez des produits.</p>
                  <Link
                    to="/products"
                    className="px-7 py-3 text-white text-sm font-bold rounded-2xl transition-opacity hover:opacity-90"
                    style={{ background: ORANGE }}
                  >
                    D&#233;couvrir la boutique
                  </Link>
                </div>
              )}

              {/* Items */}
              {items.length > 0 && (
                <ul className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <li
                      key={item.idCartItem}
                      className="flex items-center gap-5 px-6 py-5 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Image produit */}
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "#f5f5f5" }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productNom} className="w-full h-full object-contain p-2" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-300">
                            <path d="M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 10c-2.5 0-6 1.5-6 4.5V17h12v-2.5c0-3-3.5-4.5-6-4.5z" />
                          </svg>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{item.productNom}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.prixUnitaire?.toFixed(2)} MAD / unit&#233;</p>
                      </div>
                      {/* Quantité */}
                      <QuantityControl item={item} onUpdate={handleUpdate} onRemove={handleRemove} disabled={loading} />
                      {/* Sous-total */}
                      <p className="text-sm font-extrabold w-24 text-right shrink-0" style={{ color: ORANGE }}>
                        {item.sousTotal?.toFixed(2)} MAD
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {/* Footer liste */}
              {items.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Vider le panier
                  </button>
                  <span className="text-xs text-gray-300">{items.length} article{items.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-7 sticky top-24" style={{ boxShadow: "0 2px 24px 0 rgba(0,0,0,0.06)" }}>
              {/* Header carte */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF4EB" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" style={{ color: ORANGE }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-7-7 7V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
                <h2 className="text-base font-extrabold text-gray-900">R&#233;capitulatif</h2>
              </div>

              {/* Lignes */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-800">{cart?.total?.toFixed(2) ?? "&#8212;"} MAD</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Livraison</span>
                  <span>&#192; d&#233;finir</span>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-2xl px-4 py-4 mb-5" style={{ background: "#FFF4EB" }}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-sm">Total</span>
                  <span className="font-extrabold text-2xl" style={{ color: ORANGE }}>
                    {cart?.total?.toFixed(2) ?? "&#8212;"} MAD
                  </span>
                </div>
              </div>

              {/* Commander */}
              <button
                onClick={handleOrder}
                disabled={loading || orderLoading || isEmpty}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: ORANGE }}
              >
                {orderLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Cr&#233;ation&#8230;
                  </>
                ) : (
                  <>
                    Commander
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <Link
                to="/products"
                className="block mt-3 w-full py-3 text-center text-sm font-semibold text-gray-500 hover:text-gray-700 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                &#8592; Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

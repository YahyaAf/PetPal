import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useToastStore from "../../store/toastStore";
import orderService from "../../services/orderService";

// ─────────────────────────────────────────────
//  Skeleton d'un article
// ─────────────────────────────────────────────
const CartItemSkeleton = () => (
  <div className="flex items-center gap-4 p-5 animate-pulse">
    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="w-24 h-8 bg-gray-100 rounded-lg" />
    <div className="w-16 h-4 bg-gray-100 rounded" />
  </div>
);

// ─────────────────────────────────────────────
//  Contrôle de quantité
// ─────────────────────────────────────────────
const QuantityControl = ({ item, onUpdate, onRemove, disabled }) => (
  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-1">
    <button
      onClick={() =>
        item.quantite === 1 ? onRemove(item.idCartItem) : onUpdate(item.idCartItem, item.quantite - 1)
      }
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 disabled:opacity-40 transition-colors text-base font-medium"
    >
      {item.quantite === 1 ? "🗑" : "−"}
    </button>
    <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantite}</span>
    <button
      onClick={() => onUpdate(item.idCartItem, item.quantite + 1)}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-40 transition-colors text-base font-medium"
    >
      +
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">⚠️</p>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchCart}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* ── En-tête ─────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
            {!loading && cart && (
              <p className="text-sm text-gray-400 mt-1">
                {cart.nombreArticles ?? 0} article{(cart.nombreArticles ?? 0) > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← Continuer mes achats
          </Link>
        </div>

        {/* ── Bannière panier validé ───────────── */}
        {cart?.status === "VALIDE" && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-800 font-semibold text-sm">Panier déjà commandé</p>
              <p className="text-green-600 text-xs mt-0.5">
                Ce panier a déjà été passé en commande.
              </p>
            </div>
          </div>
        )}

        {/* ── Erreur inline ───────────────────── */}
        {error && cart && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Liste des articles ─────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <span className="text-6xl mb-4">🛒</span>
                  <p className="text-gray-700 font-semibold text-lg mb-2">Votre panier est vide</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Parcourez notre boutique et ajoutez des produits.
                  </p>
                  <Link
                    to="/products"
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Découvrir la boutique
                  </Link>
                </div>
              )}

              {/* Items */}
              {items.length > 0 && (
                <ul className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <li
                      key={item.idCartItem}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Icône produit */}
                      <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-2xl">
                        📦
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {item.productNom}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.prixUnitaire?.toFixed(2)} MAD / unité
                        </p>
                      </div>

                      {/* Quantité */}
                      <QuantityControl
                        item={item}
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                        disabled={loading}
                      />

                      {/* Sous-total */}
                      <p className="text-sm font-bold text-gray-900 w-20 text-right shrink-0">
                        {item.sousTotal?.toFixed(2)} MAD
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions bas de liste */}
              {items.length > 0 && (
                <div className="px-5 py-4 border-t border-gray-100">
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors disabled:opacity-40"
                  >
                    Vider le panier
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Récapitulatif ──────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-5">Récapitulatif</h2>

              {/* Lignes */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{cart?.total?.toFixed(2) ?? "—"} MAD</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Livraison</span>
                  <span>À définir</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-lg">
                  {cart?.total?.toFixed(2) ?? "—"} MAD
                </span>
              </div>

              {/* Bouton commander */}
              <button
                onClick={handleOrder}
                disabled={loading || orderLoading || isEmpty}
                className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
              >
                {orderLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Création de la commande…
                  </span>
                ) : (
                  "Commander →"
                )}
              </button>

              <Link
                to="/products"
                className="block mt-3 w-full py-2.5 text-center text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/orderService";
import useAuthStore from "../../store/authStore";

// ─────────────────────────────────────────────
//  Statut badge
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  PAYEE: {
    label: "Payée",
    className: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
    icon: "✓",
  },
  PENDING: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    icon: "⏳",
  },
  ANNULEE: {
    label: "Annulée",
    className: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
    icon: "✕",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    icon: "•",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────
//  Skeleton
// ─────────────────────────────────────────────
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-100 rounded-full" />
    </div>
    <div className="space-y-2 pt-2 border-t border-gray-50">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-40 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
    <div className="flex justify-between pt-2 border-t border-gray-50">
      <div className="h-4 w-16 bg-gray-100 rounded" />
      <div className="h-4 w-24 bg-gray-100 rounded" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
//  Carte commande
// ─────────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const date = order.dateOrder
    ? new Date(order.dateOrder).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* ── En-tête ── */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Icône statut */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${
              order.status === "PAYEE"
                ? "bg-green-50 text-green-600"
                : order.status === "ANNULEE"
                ? "bg-red-50 text-red-500"
                : "bg-amber-50 text-amber-500"
            }`}
          >
            {STATUS_CONFIG[order.status]?.icon ?? "•"}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">
              Commande{" "}
              <span className="font-mono">
                CMD-{String(order.idOrder).padStart(5, "0")}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <StatusBadge status={order.status} />
          <span className="font-bold text-blue-600 text-sm">
            {order.total?.toFixed(2)} MAD
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
          >
            {expanded ? "Masquer" : "Détails"}
          </button>
        </div>
      </div>

      {/* ── Articles (accordéon) ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Articles commandés
          </p>
          <ul className="space-y-2">
            {order.items?.map((item) => (
              <li
                key={item.idOrderItem}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs shrink-0">
                    📦
                  </span>
                  <span className="text-gray-700 truncate">{item.productNom}</span>
                  <span className="text-gray-400 shrink-0">× {item.quantite}</span>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-medium text-gray-800">
                    {item.sousTotal?.toFixed(2)} MAD
                  </span>
                  <p className="text-xs text-gray-400">
                    {item.prixUnitaire?.toFixed(2)} / u
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Total résumé */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-bold text-blue-600">
              {order.total?.toFixed(2)} MAD
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  MyOrdersPage
// ─────────────────────────────────────────────
const MyOrdersPage = () => {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getMyOrders(user.id);
        // Trier : plus récent en premier
        const sorted = [...data].sort(
          (a, b) => new Date(b.dateOrder) - new Date(a.dateOrder)
        );
        setOrders(sorted);
      } catch (err) {
        setError(
          err.response?.data?.message ?? "Impossible de charger vos commandes."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // ── Compteurs par statut ──
  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    { PAYEE: 0, PENDING: 0, ANNULEE: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* ── En-tête ──────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Historique de vos achats
          </p>
        </div>

        {/* ── Statistiques rapides ─────────────── */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Payées", count: counts.PAYEE, color: "text-green-600", bg: "bg-green-50 border-green-100" },
              { label: "En attente", count: counts.PENDING, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              { label: "Annulées", count: counts.ANNULEE, color: "text-red-500", bg: "bg-red-50 border-red-100" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Erreur ───────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Skeleton ─────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────── */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🛍️</span>
            </div>
            <p className="text-gray-800 font-semibold text-lg mb-2">
              Aucune commande pour l'instant
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Parcourez notre boutique et passez votre première commande.
            </p>
            <Link
              to="/products"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Découvrir la boutique
            </Link>
          </div>
        )}

        {/* ── Liste des commandes ───────────────── */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.idOrder} order={order} />
            ))}
          </div>
        )}

        {/* ── CTA boutique ─────────────────────── */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Continuer mes achats
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;

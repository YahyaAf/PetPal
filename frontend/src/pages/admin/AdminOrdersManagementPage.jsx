import { useState, useEffect, useCallback } from "react";
import orderService from "../../services/orderService";

const STATUS_CONFIG = {
  PAYEE:   { label: "Payée",    cls: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  PENDING: { label: "En attente", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  ANNULEE: { label: "Annulée",  cls: "bg-red-100 text-red-700",      dot: "bg-red-500"   },
};

const ALL_STATUSES = ["ALL", "PAYEE", "PENDING", "ANNULEE"];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status || "—", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const nom     = order.userNom     || "—";
  const email   = order.userEmail   || "—";
  const phone   = order.userPhone   || "—";
  const adresse = order.userAddress || "—";
  const ville   = order.userVille   || "";

  const dateStr = order.dateOrder || order.createdAt
    ? new Date(order.dateOrder || order.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  const items    = order.items || order.orderItems || [];
  const total    = Number(order.total ?? order.montantTotal ?? 0).toFixed(2);
  const orderId  = order.idOrder ?? order.id;
  const orderNum = orderId != null ? `CMD-${String(orderId).padStart(5, "0")}` : "CMD-?????";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* Order + status */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base flex-shrink-0">
            📦
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{orderNum}</p>
            <p className="text-xs text-gray-400">{dateStr}</p>
          </div>
          <StatusBadge status={order.status || order.statusOrder} />
        </div>

        {/* Client info */}
        <div className="flex-1 min-w-0 border-l border-gray-100 pl-4 hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 truncate">{nom}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>

        {/* Contact */}
        <div className="flex-1 min-w-0 border-l border-gray-100 pl-4 hidden md:block">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">📞</span> {phone}
          </p>
          <p className="text-xs text-gray-500 truncate">
            <span className="font-medium text-gray-700">📍</span>{" "}
            {adresse}{ville ? `, ${ville}` : ""}
          </p>
        </div>

        {/* Total + toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <p className="text-base font-bold text-gray-800">{total} MAD</p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium"
          >
            {expanded ? "Masquer ▲" : "Détails ▼"}
          </button>
        </div>
      </div>

      {/* Mobile client block */}
      <div className="px-5 pb-3 sm:hidden border-t border-gray-50 pt-3 space-y-1">
        <p className="text-sm font-semibold text-gray-800">{nom}</p>
        <p className="text-xs text-gray-500">{email}</p>
        <p className="text-xs text-gray-500">📞 {phone}</p>
        <p className="text-xs text-gray-500">📍 {adresse}{ville ? `, ${ville}` : ""}</p>
      </div>

      {/* Expanded: articles */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun article</p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Articles ({items.length})
              </p>
              {items.map((item, idx) => {
                const product    = item.product || item.produit || {};
                const productNom = item.productNom || product.nom || product.name || `Article #${idx + 1}`;
                const qty        = item.quantite ?? item.quantity ?? 1;
                const unitPrice  = Number(item.prixUnitaire ?? item.unitPrice ?? product.prix ?? 0).toFixed(2);
                const subTotal   = Number(item.sousTotal ?? item.subTotal ?? 0).toFixed(2);
                return (
                  <div key={item.idOrderItem ?? item.id ?? idx} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-base">📦</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{productNom}</p>
                        <p className="text-xs text-gray-400">{unitPrice} MAD/u</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{subTotal} MAD</p>
                      <p className="text-xs text-gray-400">× {qty}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-28" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-20" />
      <div className="h-5 bg-gray-100 rounded w-24" />
      <div className="h-6 bg-gray-100 rounded w-16" />
    </div>
  </div>
);

const AdminOrdersManagementPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("ALL");
  const [search,  setSearch]  = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      // Sort by date desc
      list.sort((a, b) => {
        const da = new Date(a.dateOrder || a.createdAt || 0);
        const db = new Date(b.dateOrder || b.createdAt || 0);
        return db - da;
      });
      setOrders(list);
    } catch {
      setError("Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const status  = o.status || o.statusOrder || "";
    const nom     = (o.userNom   || "").toLowerCase();
    const email   = (o.userEmail || "").toLowerCase();
    const phone   = (o.userPhone || "");
    const q       = search.toLowerCase();

    const matchStatus = filter === "ALL" || status === filter;
    const matchSearch = !q || nom.includes(q) || email.includes(q) || phone.includes(q);
    return matchStatus && matchSearch;
  });

  const counts = orders.reduce((acc, o) => {
    const s = o.status || o.statusOrder || "—";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Gestion des commandes</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Chargement…" : "↻ Actualiser"}
        </button>
      </div>

      {/* Stats recap */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: orders.length,       cls: "bg-blue-50 text-blue-700"  },
            { label: "Payées",   value: counts.PAYEE   || 0, cls: "bg-green-50 text-green-700" },
            { label: "En attente", value: counts.PENDING || 0, cls: "bg-amber-50 text-amber-700" },
            { label: "Annulées", value: counts.ANNULEE  || 0, cls: "bg-red-50 text-red-700"   },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`rounded-2xl p-4 ${cls}`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher par client, email, téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "Tous" : STATUS_CONFIG[s]?.label ?? s}
              {s !== "ALL" && counts[s] != null && (
                <span className="ml-1 opacity-70">({counts[s] || 0})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={fetchOrders} className="mt-3 text-sm text-blue-600 hover:underline">
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 text-sm">
            {orders.length === 0 ? "Aucune commande pour l'instant" : "Aucun résultat pour ce filtre"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersManagementPage;

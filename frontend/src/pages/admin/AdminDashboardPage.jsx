import { useState, useEffect, useCallback } from "react";
import userService from "../../services/userService";
import clientService from "../../services/clientService";
import cityService from "../../services/cityService";
import hotelService from "../../services/hotelService";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import trainingTypeService from "../../services/trainingTypeService";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";

const RESERVATION_TYPES = [
  { key: "ALL", label: "Tous", icon: "💳" },
  { key: "ORDER", label: "Commandes", icon: "📦" },
  { key: "HOTEL", label: "Hôtel", icon: "🏨" },
  { key: "TRAINING", label: "Dressage", icon: "🤺" },
];

const STATUS_COLORS = {
  SUCCES:  "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  ECHEC:   "bg-red-100 text-red-700",
  ANNULEE: "bg-red-100 text-red-700",
};

const TYPE_COLORS = {
  ORDER:    "bg-blue-100 text-blue-700",
  HOTEL:    "bg-purple-100 text-purple-700",
  TRAINING: "bg-orange-100 text-orange-700",
};

const StatCard = ({ label, value, loading, icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
    <div className="flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
    {loading ? (
      <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
    ) : (
      <p className="text-3xl font-bold text-gray-800">{value ?? "—"}</p>
    )}
  </div>
);

const PaymentRow = ({ payment }) => {
  const typeColor   = TYPE_COLORS[payment.reservationType]  || "bg-gray-100 text-gray-600";
  const statusColor = STATUS_COLORS[payment.status]          || "bg-gray-100 text-gray-600";
  const typeIcon    = RESERVATION_TYPES.find((t) => t.key === payment.reservationType)?.icon ?? "💳";
  const amount      = Number(payment.amount ?? payment.montant ?? 0).toFixed(2);
  const rawDate     = payment.createdAt || payment.datePayment;
  const dateStr     = rawDate
    ? new Date(rawDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-600">
        #{String(payment.id).padStart(5, "0")}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {payment.clientNom || payment.userNom || payment.client?.nom || "—"}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
          {typeIcon} {payment.reservationType || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{amount} MAD</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {payment.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{dateStr}</td>
    </tr>
  );
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    users: null, clients: null, cities: null, hotels: null,
    categories: null, products: null, trainingTypes: null, orders: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeType, setActiveType] = useState("ALL");
  const [payments, setPayments]     = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError,   setPaymentsError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [users, clients, cities, hotels, categories, products, trainingTypes, orders] =
          await Promise.all([
            userService.count(),
            clientService.count(),
            cityService.count(),
            hotelService.count(),
            categoryService.count(),
            productService.count(),
            trainingTypeService.count(),
            orderService.count().catch(() => null),
          ]);
        setStats({ users, clients, cities, hotels, categories, products, trainingTypes, orders });
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const fetchPayments = useCallback(async (type) => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const data = type === "ALL"
        ? await paymentService.getAll()
        : await paymentService.getByType(type);
      setPayments(Array.isArray(data) ? data : (data?.content ?? []));
    } catch {
      setPaymentsError("Impossible de charger les paiements.");
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(activeType); }, [activeType, fetchPayments]);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCES")
    .reduce((sum, p) => sum + Number(p.amount ?? p.montant ?? 0), 0);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Utilisateurs"  value={stats.users}         loading={statsLoading} />
        <StatCard icon="👤" label="Clients"        value={stats.clients}       loading={statsLoading} />
        <StatCard icon="🏙️" label="Villes"         value={stats.cities}        loading={statsLoading} />
        <StatCard icon="🏨" label="Hôtels"         value={stats.hotels}        loading={statsLoading} />
        <StatCard icon="🏷️" label="Catégories"    value={stats.categories}    loading={statsLoading} />
        <StatCard icon="📦" label="Produits"       value={stats.products}      loading={statsLoading} />
        <StatCard icon="🤺" label="Dressage"       value={stats.trainingTypes} loading={statsLoading} />
        <StatCard icon="🛒" label="Commandes"      value={stats.orders}        loading={statsLoading} />
      </div>

      {/* ── Payments ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">Paiements</h2>
            {!paymentsLoading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {payments.length} résultat{payments.length !== 1 ? "s" : ""}
                {activeType !== "ALL" && ` · ${activeType}`}
                {totalRevenue > 0 && (
                  <span className="text-green-600 font-semibold ml-1">
                    · Revenu confirmé : {totalRevenue.toFixed(2)} MAD
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {RESERVATION_TYPES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeType === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {paymentsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : paymentsError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm">{paymentsError}</p>
            <button onClick={() => fetchPayments(activeType)} className="mt-3 text-sm text-blue-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-gray-400 text-sm">Aucun paiement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

import { useState, useEffect, useCallback } from "react";
import useAuth from "../../core/hooks/useAuth";
import userService from "../../services/userService";
import clientService from "../../services/clientService";
import cityService from "../../services/cityService";
import hotelService from "../../services/hotelService";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import trainingTypeService from "../../services/trainingTypeService";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import appointmentService from "../../services/appointmentService";

// ── Static chart data (visual only) ──────────────────────────
const MONTHLY_DATA = [
  { month: "Sep", value: 820  },
  { month: "Oct", value: 1450 },
  { month: "Nov", value: 1180 },
  { month: "Dec", value: 2300 },
  { month: "Jan", value: 1760 },
  { month: "Fév", value: 3194 },
];

const DONUT_SEGMENTS = [
  { label: "Hôtel",      pct: 52, color: "#3B82F6" },
  { label: "Formations", pct: 31, color: "#93C5FD" },
  { label: "Commandes",  pct: 17, color: "#DBEAFE" },
];

const RESERVATION_TYPES = [
  { key: "ALL",      label: "Tous",      icon: "💳" },
  { key: "ORDER",    label: "Commandes", icon: "📦" },
  { key: "HOTEL",    label: "Hôtel",     icon: "🏨" },
  { key: "TRAINING", label: "Dressage",  icon: "🤺" },
];

const STATUS_COLORS = {
  SUCCES:  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  ECHEC:   "bg-red-100   dark:bg-red-900/30   text-red-700   dark:text-red-400",
  ANNULEE: "bg-red-100   dark:bg-red-900/30   text-red-700   dark:text-red-400",
};

const TYPE_COLORS = {
  ORDER:    "bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400",
  HOTEL:    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  TRAINING: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};

// ── StatCard ──────────────────────────────────────────────────
const ACCENT = {
  blue:   { bg: "bg-blue-50   dark:bg-blue-900/20",   text: "text-blue-600   dark:text-blue-400"   },
  green:  { bg: "bg-green-50  dark:bg-green-900/20",  text: "text-green-600  dark:text-green-400"  },
  amber:  { bg: "bg-amber-50  dark:bg-amber-900/20",  text: "text-amber-600  dark:text-amber-400"  },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
};

const StatCard = ({ icon, label, value, delta, deltaUp, loading, accent = "blue" }) => {
  const a = ACCENT[accent];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${a.bg}`}>
        <span className={a.text}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
        {loading ? (
          <div className="h-5 w-14 mt-1 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        ) : (
          <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight mt-0.5">
            {value ?? "—"}
          </p>
        )}
      </div>
      {delta && !loading && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
          deltaUp
            ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
            : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
        }`}>
          {deltaUp ? "↑" : "↓"} {delta}
        </span>
      )}
    </div>
  );
};

// ── BarChart (CSS) ────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  const last = data.length - 1;
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full">
          <div className="flex-1 w-full flex items-end">
            <div
              className={`w-full rounded-t-md transition-all ${
                i === last
                  ? "bg-blue-600"
                  : "bg-blue-200 dark:bg-blue-900/40"
              }`}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ── DonutChart (conic-gradient) ───────────────────────────────
const DonutChart = ({ segments, center }) => {
  let cum = 0;
  const gradient = segments
    .map(({ pct, color }) => {
      const from = cum;
      cum += pct;
      return `${color} ${from}% ${cum}%`;
    })
    .join(", ");

  return (
    <div className="relative w-28 h-28 mx-auto">
      <div
        className="w-full h-full rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-18 h-18 rounded-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
          <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{center}</p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">total</p>
        </div>
      </div>
    </div>
  );
};

// ── PaymentRow ────────────────────────────────────────────────
const PaymentRow = ({ payment }) => {
  const typeColor   = TYPE_COLORS[payment.reservationType]  ?? "bg-gray-100 text-gray-600";
  const statusColor = STATUS_COLORS[payment.status]          ?? "bg-gray-100 text-gray-600";
  const typeIcon    = RESERVATION_TYPES.find((t) => t.key === payment.reservationType)?.icon ?? "💳";
  const amount      = Number(payment.amount ?? payment.montant ?? 0).toFixed(2);
  const rawDate     = payment.createdAt || payment.datePayment;
  const dateStr     = rawDate
    ? new Date(rawDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3 text-xs font-mono text-gray-400 dark:text-gray-500">
        #{String(payment.idPayment).padStart(5, "0")}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}>
          {typeIcon} {payment.reservationType || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{amount} MAD</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
          {payment.status || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">{dateStr}</td>
    </tr>
  );
};

// ── Page ──────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();

  const [stats, setStats] = useState({
    users: null, clients: null, cities: null, hotels: null,
    categories: null, products: null, trainingTypes: null,
    orders: null, appointments: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeType,      setActiveType]      = useState("ALL");
  const [payments,        setPayments]        = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError,   setPaymentsError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [users, clients, cities, hotels, categories, products, trainingTypes, orders, appointments] =
          await Promise.all([
            userService.count(),
            clientService.count(),
            cityService.count(),
            hotelService.count(),
            categoryService.count(),
            productService.count(),
            trainingTypeService.count(),
            orderService.count().catch(() => null),
            appointmentService.count().catch(() => null),
          ]);
        setStats({ users, clients, cities, hotels, categories, products, trainingTypes, orders, appointments });
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

  const todayStr = (() => {
    const s = new Date().toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  const donutCenter = statsLoading
    ? "…"
    : ((stats.orders ?? 0) + (stats.clients ?? 0)).toString();

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{todayStr}</p>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon="👤" label="Utilisateurs"  value={stats.users}        loading={statsLoading} delta="1.02%" deltaUp accent="blue"   />
        <StatCard icon="💰" label="Revenus"        value={totalRevenue > 0 ? `${totalRevenue.toFixed(0)} MAD` : "—"} loading={paymentsLoading} delta="2.75%" deltaUp accent="green"  />
        <StatCard icon="📅" label="Rendez-vous"    value={stats.appointments} loading={statsLoading} delta="3.44%" deltaUp accent="amber"  />
        <StatCard icon="🛒" label="Commandes"      value={stats.orders}       loading={statsLoading} delta="1.89%" deltaUp accent="purple" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Revenus mensuels</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">6 derniers mois · estimatif</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
              {MONTHLY_DATA[MONTHLY_DATA.length - 1].value.toLocaleString("fr-FR")} MAD
            </span>
          </div>
          <BarChart data={MONTHLY_DATA} />
        </div>

        {/* Donut */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Répartition</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Par type de service</p>
          <DonutChart segments={DONUT_SEGMENTS} center={donutCenter} />
          <div className="mt-4 space-y-2">
            {DONUT_SEGMENTS.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Secondary stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="🏙️" label="Villes"      value={stats.cities}        loading={statsLoading} accent="blue"   />
        <StatCard icon="🏨" label="Hôtels"       value={stats.hotels}        loading={statsLoading} accent="green"  />
        <StatCard icon="📦" label="Produits"     value={stats.products}      loading={statsLoading} accent="amber"  />
        <StatCard icon="🤺" label="Dressage"     value={stats.trainingTypes} loading={statsLoading} accent="purple" />
      </div>

      {/* ── Payments table (ADMIN only) ── */}
      {isAdmin && (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Derniers paiements</h2>
            {!paymentsLoading && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {payments.length} transaction{payments.length !== 1 ? "s" : ""}
                {totalRevenue > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium ml-1.5">
                    · {totalRevenue.toFixed(2)} MAD confirmés
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {RESERVATION_TYPES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveType(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeType === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        {paymentsLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : paymentsError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm">{paymentsError}</p>
            <button
              onClick={() => fetchPayments(activeType)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun paiement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">ID</th>
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
      )}
    </div>
  );
};

export default AdminDashboardPage;

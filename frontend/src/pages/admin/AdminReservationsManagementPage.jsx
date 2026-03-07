import { useState, useEffect, useCallback } from "react";
import reservationService from "../../services/reservationService";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  CONFIRMEE:  { label: "Confirmée",   cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  PAYEE:      { label: "Payée",       cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  EN_ATTENTE: { label: "En attente",  cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  PENDING:    { label: "En attente",  cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  ANNULEE:    { label: "Annulée",     cls: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
  REFUSEE:    { label: "Refusée",     cls: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
};

const ALL_STATUSES = ["ALL", "CONFIRMEE", "PAYEE", "EN_ATTENTE", "ANNULEE"];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status || "—", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-24" />
      <div className="h-4 bg-gray-100 rounded w-20" />
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────
const ReservationCard = ({ reservation }) => {
  const [expanded, setExpanded] = useState(false);

  const hotel    = reservation.hotel || {};
  const hotelNom = hotel.nom  || hotel.name || "Hôtel";
  const ville    = hotel.city?.nomVille || hotel.villeNom || "";

  const userObj  = reservation.client || {};
  const nom      = userObj.nom    || userObj.name    || "—";
  const email    = userObj.email  || "—";
  const phone    = userObj.phone  || "—";
  const adresse  = userObj.address || "";

  const status   = reservation.status || "—";
  const resId    = reservation.idReservation ?? reservation.id;
  const resNum   = resId != null ? `RES-${String(resId).padStart(5, "0")}` : "RES-?????";
  const montant  = Number(reservation.montantTotal ?? 0).toFixed(2);
  const days     = reservation.days ?? "—";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* Res ID + hotel */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base shrink-0">
            🏨
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{resNum}</p>
            <p className="text-xs text-gray-400 truncate">{hotelNom}{ville ? ` — ${ville}` : ""}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Client name + email */}
        <div className="flex-1 min-w-0 border-l border-gray-100 pl-4 hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 truncate">{nom}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>

        {/* Contact */}
        <div className="flex-1 min-w-0 border-l border-gray-100 pl-4 hidden md:block">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">📞</span> {phone || "—"}
          </p>
          {adresse && (
            <p className="text-xs text-gray-500 truncate">
              <span className="font-medium text-gray-700">📍</span> {adresse}
            </p>
          )}
        </div>

        {/* Montant + toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <p className="text-base font-bold text-gray-800">{montant} MAD</p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium"
          >
            {expanded ? "Masquer ▲" : "Détails ▼"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Réservation</p>
              <p className="font-mono font-semibold text-gray-800">{resNum}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Arrivée</p>
              <p className="font-medium text-gray-800">{formatDate(reservation.dateDebut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Départ</p>
              <p className="font-medium text-gray-800">{formatDate(reservation.dateFin)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Durée</p>
              <p className="font-medium text-gray-800">{days} nuit{Number(days) > 1 ? "s" : ""}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-0.5">Client</p>
              <p className="font-medium text-gray-800">{nom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="font-medium text-gray-800 truncate">{email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
              <p className="font-medium text-gray-800">{phone || "—"}</p>
            </div>
            {adresse && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                <p className="font-medium text-gray-800 truncate">{adresse}</p>
              </div>
            )}
          </div>

          {/* Hotel info */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
            <span className="text-2xl">🏨</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{hotelNom}</p>
              {ville && <p className="text-xs text-gray-500">📍 {ville}</p>}
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-bold text-blue-600">{montant} MAD</p>
              <p className="text-xs text-gray-400">{days} nuit{Number(days) > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const AdminReservationsManagementPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getAll();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      list.sort((a, b) => new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0));
      setReservations(list);
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const filtered = reservations.filter((r) => {
    const q    = search.toLowerCase();
    const user = r.client || {};
    const nom   = (user.nom   || user.name  || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    const hotel = (r.hotel?.nom || r.hotel?.name || "").toLowerCase();

    const matchSearch = !q || nom.includes(q) || email.includes(q)
      || phone.includes(q) || hotel.includes(q);
    const matchStatus = activeStatus === "ALL" || r.status === activeStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const total       = reservations.length;
  const confirmees  = reservations.filter((r) => ["CONFIRMEE","PAYEE"].includes(r.status)).length;
  const enAttente   = reservations.filter((r) => ["EN_ATTENTE","PENDING"].includes(r.status)).length;
  const annulees    = reservations.filter((r) => ["ANNULEE","REFUSEE"].includes(r.status)).length;
  const revenue     = reservations
    .filter((r) => ["CONFIRMEE","PAYEE"].includes(r.status))
    .reduce((s, r) => s + Number(r.montantTotal ?? 0), 0);

  const STATUS_LABELS = {
    ALL: "Toutes", CONFIRMEE: "Confirmée", PAYEE: "Payée",
    EN_ATTENTE: "En attente", ANNULEE: "Annulée",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Réservations Hôtels</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion de toutes les réservations d'hôtels</p>
        </div>
        <button
          onClick={fetchReservations}
          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total",       value: total,       cls: "bg-blue-50  text-blue-700"  },
            { label: "Confirmées",  value: confirmees,  cls: "bg-green-50 text-green-700" },
            { label: "En attente",  value: enAttente,   cls: "bg-amber-50 text-amber-700" },
            { label: "Annulées",    value: annulees,    cls: "bg-red-50   text-red-700"   },
            { label: "Revenus",     value: `${revenue.toFixed(0)} MAD`, cls: "bg-indigo-50 text-indigo-700" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`rounded-2xl p-4 ${cls}`}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Chercher par client, email, hôtel…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {STATUS_LABELS[s]}
              {s !== "ALL" && (
                <span className="ml-1 opacity-70">
                  ({reservations.filter((r) => r.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button onClick={fetchReservations} className="mt-3 text-sm text-blue-600 hover:underline">
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🏨</p>
          <p className="text-gray-400 text-sm">
            {reservations.length === 0
              ? "Aucune réservation pour l'instant"
              : "Aucune réservation ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard key={r.idReservation ?? r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReservationsManagementPage;

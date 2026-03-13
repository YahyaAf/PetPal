import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import trainingReservationService from "../../services/trainingReservationService";
import { useAuthContext } from "../../core/context/AuthContext";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "En attente", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  CONFIRMEE: { label: "Confirmée",  cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dot: "bg-green-500" },
  ANNULEE:   { label: "Annulée",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",         dot: "bg-red-500"   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status || "—", cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-40" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" />
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────
const SessionCard = ({ reservation }) => {
  const [expanded, setExpanded] = useState(false);

  const client   = reservation.client       || {};
  const type     = reservation.trainingType || {};
  const status   = reservation.status || "—";
  const resNum   = `TRAIN-${String(reservation.idReservation ?? 0).padStart(5, "0")}`;
  const montant  = Number(reservation.totalPrice ?? 0).toFixed(2);
  const typeNom  = type.nom || type.name || "Formation";
  const duree    = type.duree ?? "—";
  const clientNom     = client.nom     || client.name  || "—";
  const clientEmail   = client.email   || "—";
  const clientPhone   = client.phone   || "—";
  const clientAddress = client.address || "—";
  const clientDob     = client.dateNaissance
    ? new Date(client.dateNaissance).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  // Compute if today is within session range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const debut = reservation.dateDebut ? new Date(reservation.dateDebut) : null;
  const fin   = reservation.dateFin   ? new Date(reservation.dateFin)   : null;
  const isActive = debut && fin && today >= debut && today <= fin;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
      isActive ? "border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900/50" : "border-gray-100 dark:border-gray-800"
    }`}>
      {isActive && (
        <div className="bg-blue-600 text-white text-xs font-semibold px-5 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Session en cours aujourd'hui
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* Res + type */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-xl shrink-0">
            🤺
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{resNum}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{typeNom}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Client name + email */}
        <div className="flex-1 min-w-0 border-l border-gray-100 dark:border-gray-800 pl-4 hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">👤 {clientNom}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{clientEmail}</p>
        </div>

        {/* Dates */}
        <div className="flex-1 min-w-0 border-l border-gray-100 dark:border-gray-800 pl-4 hidden md:block">
          <p className="text-xs text-gray-400 dark:text-gray-500">📅 {formatDate(reservation.dateDebut)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">→ {formatDate(reservation.dateFin)}</p>
        </div>

        {/* Montant + toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <p className="text-base font-bold text-gray-800 dark:text-gray-100">{montant} MAD</p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors font-medium"
          >
            {expanded ? "Masquer ▲" : "Détails ▼"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Réservation</p>
              <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">{resNum}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Début</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(reservation.dateDebut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Fin</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(reservation.dateFin)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Durée</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{duree} jour{Number(duree) > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Client detail card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Informations client</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Nom</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{clientNom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{clientEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Téléphone</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{clientPhone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Adresse</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{clientAddress}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Date de naissance</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{clientDob}</p>
              </div>
            </div>
          </div>

          {/* Training type card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
            <span className="text-2xl">🤺</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{typeNom}</p>
              {type.description && <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">{type.description}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-green-600 dark:text-green-400">{montant} MAD</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{duree} jour{Number(duree) > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const DresseurReservationsPage = () => {
  const { user } = useAuthContext();

  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMEE", "ANNULEE"];
  const STATUS_LABELS = {
    ALL: "Toutes", PENDING: "En attente", CONFIRMEE: "Confirmée", ANNULEE: "Annulée",
  };

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingReservationService.getMyDresseurReservations();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      list.sort((a, b) => new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0));
      setReservations(list);
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger vos sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    const client = r.client || {};
    const type   = r.trainingType || {};
    const matchSearch = !q
      || (client.nom   || "").toLowerCase().includes(q)
      || (client.email || "").toLowerCase().includes(q)
      || (type.nom     || "").toLowerCase().includes(q);
    const matchStatus = activeStatus === "ALL" || r.status === activeStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const counts  = reservations.reduce((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});
  const revenue = reservations
    .filter((r) => r.status === "CONFIRMEE")
    .reduce((s, r) => s + Number(r.totalPrice ?? 0), 0);

  // Today's sessions
  const today = new Date(); today.setHours(0,0,0,0);
  const todaySessions = reservations.filter((r) => {
    const d = r.dateDebut ? new Date(r.dateDebut) : null;
    const f = r.dateFin   ? new Date(r.dateFin)   : null;
    return d && f && today >= d && today <= f;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes sessions de dressage</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Bonjour <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.nom ?? ""}</span> — vos réservations assignées
            </p>
          </div>
          <button onClick={fetchReservations} className="text-sm px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors">
            ↻ Actualiser
          </button>
        </div>

        {/* Today banner */}
        {!loading && todaySessions.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-bold text-sm">Aujourd'hui : {todaySessions.length} session{todaySessions.length > 1 ? "s" : ""} en cours</p>
              <p className="text-blue-200 text-xs">
                {todaySessions.map((r) => r.client?.nom || "Client").join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && reservations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total",      value: reservations.length,         cls: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"     },
              { label: "En attente", value: counts.PENDING    || 0,      cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"     },
            { label: "Confirmées", value: counts.CONFIRMEE  || 0,      cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" },
            { label: "Annulées",   value: counts.ANNULEE    || 0,      cls: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"             },
              { label: "Revenus",    value: `${revenue.toFixed(0)} MAD`, cls: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"  },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-2xl p-4 ${cls}`}>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par client ou formation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeStatus === s
                    ? "bg-green-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {STATUS_LABELS[s]}
                {s !== "ALL" && (
                  <span className="ml-1 opacity-70">({reservations.filter((r) => r.status === s).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} />)}</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchReservations} className="mt-3 text-sm text-green-600 hover:underline">Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-5xl mb-4">🤺</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">
              {reservations.length === 0 ? "Aucune session assignée" : "Aucun résultat"}
            </p>
            <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune réservation de formation ne vous est assignée pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <SessionCard key={r.idReservation} reservation={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DresseurReservationsPage;

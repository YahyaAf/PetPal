import { useState, useEffect, useCallback } from "react";
import trainingReservationService from "../../services/trainingReservationService";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "En attente", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  CONFIRMEE: { label: "Confirmée",  cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dot: "bg-green-500" },
  ANNULEE:   { label: "Annulée",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",     dot: "bg-red-500"   },
};
const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMEE", "ANNULEE"];
const STATUS_LABELS = {
  ALL: "Tous", PENDING: "En attente", CONFIRMEE: "Confirmée", ANNULEE: "Annulée",
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

const Skeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl" />
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
const TrainingResCard = ({ reservation }) => {
  const [expanded, setExpanded] = useState(false);

  const client       = reservation.client || {};
  const dresseur     = reservation.dresseur || {};
  const type         = reservation.trainingType || {};

  const clientNom     = client.nom     || client.name  || "—";
  const clientEmail   = client.email   || "—";
  const clientPhone   = client.phone   || "—";
  const clientAddress = client.address || "—";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const clientDob = formatDate(client.dateNaissance);
  const dresseurNom  = dresseur.nom  || dresseur.name  || "—";
  const typeNom      = type.nom      || type.name      || "Formation";
  const typeduree    = type.duree    ?? reservation.duree ?? "—";
  const status       = reservation.status || "—";
  const montant      = Number(reservation.totalPrice ?? 0).toFixed(2);
  const resNum       = `TRAIN-${String(reservation.idReservation ?? 0).padStart(5, "0")}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* ID + training type */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-base shrink-0">
            🤺
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{resNum}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{typeNom} · {typeduree} jour{Number(typeduree) > 1 ? "s" : ""}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Client */}
        <div className="flex-1 min-w-0 border-l border-gray-100 dark:border-gray-800 pl-4 hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{clientNom}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{clientEmail}</p>
        </div>

        {/* Dresseur */}
        <div className="flex-1 min-w-0 border-l border-gray-100 dark:border-gray-800 pl-4 hidden md:block">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Dresseur</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">🧑‍🏫 {dresseurNom}</p>
        </div>

        {/* Montant + toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{montant} MAD</p>
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
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
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
              <p className="font-medium text-gray-800 dark:text-gray-200">{typeduree} jour{Number(typeduree) > 1 ? "s" : ""}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Client</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{clientNom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{clientEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Téléphone</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{clientPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Adresse</p>
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{clientAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Date de naissance</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{clientDob}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Créée le</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(reservation.createdAt)}</p>
            </div>
          </div>

          {/* Training type + dresseur info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
              <span className="text-xl">🤺</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Formation</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{typeNom}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold text-green-600">{montant} MAD</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{typeduree} jour{Number(typeduree) > 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
              <span className="text-xl">🧑‍🏫</span>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Dresseur assigné</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{dresseurNom}</p>
                {dresseur.email && <p className="text-xs text-gray-500 dark:text-gray-400">{dresseur.email}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const AdminTrainingReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingReservationService.getAll();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      list.sort((a, b) => new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0));
      setReservations(list);
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    const client  = r.client   || {};
    const dresseur = r.dresseur || {};
    const type    = r.trainingType || {};
    const matchSearch = !q
      || (client.nom   || "").toLowerCase().includes(q)
      || (client.email || "").toLowerCase().includes(q)
      || (dresseur.nom || "").toLowerCase().includes(q)
      || (type.nom     || "").toLowerCase().includes(q);
    const matchStatus = activeStatus === "ALL" || r.status === activeStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const total     = reservations.length;
  const confirmed = reservations.filter((r) => r.status === "CONFIRMEE").length;
  const pending   = reservations.filter((r) => r.status === "PENDING").length;
  const annulees  = reservations.filter((r) => r.status === "ANNULEE").length;
  const revenue   = reservations
    .filter((r) => r.status === "CONFIRMEE")
    .reduce((s, r) => s + Number(r.totalPrice ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Réservations Dressage</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestion de toutes les sessions de formation</p>
        </div>
        <button
          onClick={fetchAll}
          className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: total,                          cls: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"   },
            { label: "En attente", value: pending,                        cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"   },
            { label: "Confirmées", value: confirmed,                      cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" },
            { label: "Annulées",   value: annulees,                       cls: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"     },
            { label: "Revenus",    value: `${revenue.toFixed(0)} MAD`,    cls: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" },
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
            placeholder="Client, dresseur, formation…"
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
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} />)}</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button onClick={fetchAll} className="mt-3 text-sm text-green-600 hover:underline">Réessayer</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <p className="text-5xl mb-4">🤺</p>
          <p className="text-gray-400 dark:text-gray-600 text-sm">
            {reservations.length === 0 ? "Aucune réservation de formation" : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <TrainingResCard key={r.idReservation} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTrainingReservationsPage;

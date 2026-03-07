import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import trainingReservationService from "../../services/trainingReservationService";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "En attente", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  CONFIRMEE: { label: "Confirmée",  cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  ANNULEE:   { label: "Annulée",    cls: "bg-red-100 text-red-700",     dot: "bg-red-500"   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
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
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-24" />
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────
const ReservationCard = ({ reservation }) => {
  const [expanded, setExpanded] = useState(false);

  const type        = reservation.trainingType || {};
  const nom         = type.nom  || type.name  || "Formation";
  const duree       = type.duree ?? reservation.duree ?? "—";
  const status      = reservation.status || "—";
  const montant     = Number(reservation.totalPrice ?? 0).toFixed(2);
  const resNum      = `TRAIN-${String(reservation.idReservation ?? 0).padStart(5, "0")}`;
  const dresseurNom = reservation.dresseur?.nom || reservation.dresseur?.name || "";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl shrink-0">
            🤺
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{nom}</p>
            <p className="text-xs text-gray-500">{duree} jour{Number(duree) > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={status} />
          <span className="text-sm font-bold text-green-600">{montant} MAD</span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium"
          >
            {expanded ? "Masquer ▲" : "Détails ▼"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Réservation</p>
              <p className="font-mono font-semibold text-gray-800">{resNum}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Début</p>
              <p className="font-medium text-gray-800">{formatDate(reservation.dateDebut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Fin</p>
              <p className="font-medium text-gray-800">{formatDate(reservation.dateFin)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Durée</p>
              <p className="font-medium text-gray-800">{duree} jour{Number(duree) > 1 ? "s" : ""}</p>
            </div>
          </div>
          {dresseurNom && (
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <span className="text-xl">🧑‍🏫</span>
              <div>
                <p className="text-xs text-gray-400">Dresseur assigné</p>
                <p className="font-semibold text-gray-800 text-sm">{dresseurNom}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const MyTrainingReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingReservationService.getMyReservations();
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      list.sort((a, b) => new Date(b.dateDebut || 0) - new Date(a.dateDebut || 0));
      setReservations(list);
    } catch {
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // Stats
  const counts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const confirmees = counts.CONFIRMEE || 0;
  const annulees   = counts.ANNULEE    || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes formations</h1>
            <p className="text-gray-500 text-sm mt-1">Historique de vos réservations de dressage</p>
          </div>
          <Link
            to="/training"
            className="text-sm px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
          >
            + Nouvelle réservation
          </Link>
        </div>

        {/* Stats */}
        {!loading && reservations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total",       value: reservations.length, cls: "bg-green-50   text-green-700"   },
              { label: "Confirmées",  value: confirmees,          cls: "bg-emerald-50 text-emerald-700" },
              { label: "En attente",  value: counts.PENDING || 0, cls: "bg-amber-50   text-amber-700"   },
              { label: "Annulées",    value: annulees,            cls: "bg-red-50     text-red-700"     },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-2xl p-4 ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchReservations} className="mt-3 text-sm text-green-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🤺</p>
            <p className="text-gray-500 font-medium text-lg mb-2">Aucune réservation</p>
            <p className="text-gray-400 text-sm mb-6">Vous n'avez pas encore réservé de formation.</p>
            <Link
              to="/training"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Voir les formations
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <ReservationCard key={r.idReservation} reservation={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrainingReservationsPage;

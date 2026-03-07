import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import reservationService from "../../services/reservationService";
import useToastStore from "../../store/toastStore";
import useAuthStore from "../../store/authStore";
import { printHotelTicket } from "../../utils/printHotelTicket";

// Status config — covers possible enum values from backend
const STATUS_CONFIG = {
  CONFIRMEE:   { label: "Confirmée",    cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  PAYEE:       { label: "Payée",        cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  EN_ATTENTE:  { label: "En attente",   cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  PENDING:     { label: "En attente",   cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  ANNULEE:     { label: "Annulée",      cls: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
  REFUSEE:     { label: "Refusée",      cls: "bg-red-100 text-red-700",      dot: "bg-red-500"    },
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

const canCancel = (status) =>
  ["EN_ATTENTE", "PENDING"].includes(status);

// ─── Skeleton ─────────────────────────────────────────────────
const ReservationSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-40" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-24" />
      <div className="h-5 bg-gray-100 rounded w-28" />
    </div>
  </div>
);

const canDownloadTicket = (status) =>
  ["CONFIRMEE", "PAYEE"].includes(status);

// ─── Card ─────────────────────────────────────────────────────
const ReservationCard = ({ reservation, onCancel, user }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [cancelling,  setCancelling]  = useState(false);

  const hotel    = reservation.hotel || {};
  const hotelNom = hotel.nom  || hotel.name || "Hôtel";
  const ville    = hotel.city?.nomVille || "";
  const status   = reservation.status || "—";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const handleCancel = async () => {
    if (!window.confirm("Annuler cette réservation ?")) return;
    setCancelling(true);
    try {
      await onCancel(reservation.idReservation);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🏨
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{hotelNom}</p>
            {ville && <p className="text-xs text-gray-500">📍 {ville}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={status} />
          <span className="text-sm font-bold text-blue-600">
            {Number(reservation.montantTotal ?? 0).toFixed(2)} MAD
          </span>
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
              <p className="font-mono font-semibold text-gray-800">
                RES-{String(reservation.idReservation).padStart(5, "0")}
              </p>
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
              <p className="font-medium text-gray-800">
                {reservation.days ?? "—"} nuit{reservation.days > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {canDownloadTicket(status) && (
              <button
                onClick={() => printHotelTicket(reservation, user)}
                className="px-4 py-2 text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                🎫 Télécharger le ticket
              </button>
            )}
            {canCancel(status) && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {cancelling ? "Annulation…" : "Annuler cette réservation"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const MyReservationsPage = () => {
  const showToast = useToastStore((s) => s.show);
  const user      = useAuthStore((s) => s.user);

  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getMyReservations();
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

  const handleCancel = async (reservationId) => {
    try {
      await reservationService.cancel(reservationId);
      showToast("Réservation annulée avec succès", "success");
      setReservations((prev) =>
        prev.map((r) =>
          r.idReservation === reservationId ? { ...r, status: "ANNULEE" } : r
        )
      );
    } catch (err) {
      const msg = err.response?.data?.message ?? "Impossible d'annuler la réservation.";
      showToast(msg, "error");
    }
  };

  // Stats
  const counts = reservations.reduce((acc, r) => {
    const s = r.status || "—";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
            <p className="text-gray-500 text-sm mt-1">Historique de vos séjours hôteliers</p>
          </div>
          <Link
            to="/hotels"
            className="text-sm px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Nouvelle réservation
          </Link>
        </div>

        {/* Stats */}
        {!loading && reservations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total",       value: reservations.length,              cls: "bg-blue-50 text-blue-700"   },
              { label: "Confirmées",  value: (counts.CONFIRMEE || 0) + (counts.PAYEE || 0), cls: "bg-green-50 text-green-700" },
              { label: "En attente",  value: (counts.EN_ATTENTE || 0) + (counts.PENDING || 0), cls: "bg-amber-50 text-amber-700" },
              { label: "Annulées",    value: counts.ANNULEE || 0,              cls: "bg-red-50 text-red-700"     },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-2xl p-4 ${cls}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ReservationSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchReservations} className="mt-3 text-sm text-blue-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏨</p>
            <p className="text-gray-500 font-medium text-lg mb-2">Aucune réservation</p>
            <p className="text-gray-400 text-sm mb-6">Vous n'avez pas encore réservé d'hôtel.</p>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Parcourir les hôtels
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <ReservationCard key={r.idReservation} reservation={r} onCancel={handleCancel} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;

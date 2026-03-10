import { useState, useEffect } from "react";
import appointmentService from "../../services/appointmentService";
import useToastStore from "../../store/toastStore";

// ─── Config ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "En attente", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",  dot: "bg-amber-500"  },
  CONFIRMED: { label: "Confirmé",   cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",  dot: "bg-green-500"  },
  CANCELLED: { label: "Annulé",     cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",          dot: "bg-red-500"    },
  DONE:      { label: "Terminé",    cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",      dot: "bg-blue-500"   },
};

const ALL_STATUSES    = ["ALL", "PENDING", "CONFIRMED", "DONE", "CANCELLED"];
const STATUS_OPTIONS  = ["PENDING", "CONFIRMED", "DONE", "CANCELLED"];

// ─── Helpers ──────────────────────────────────────────────────
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

// ─── StatusBadge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
  label: status || "—", cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400", dot: "bg-gray-400",
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
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-pulse">
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-48" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
    </div>
  </div>
);

// ─── AppointmentCard ──────────────────────────────────────────
const AppointmentCard = ({ appointment, onStatusChange, onDelete }) => {
  const [expanded,  setExpanded]  = useState(false);
  const [newStatus, setNewStatus] = useState(appointment.status);
  const [updating,  setUpdating]  = useState(false);

  const { id, userNom, userEmail, service, dateHeure, dateHeureFin, status, createdAt } = appointment;

  const handleStatusUpdate = async () => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      await onStatusChange(id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-xl shrink-0">
          🩺
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{userNom || "—"}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 truncate">{userEmail}</p>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block mr-2">{service}</span>
        <StatusBadge status={status} />
        <span className="text-gray-300 dark:text-gray-600 text-sm ml-2">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 pb-5 pt-4 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Client</p>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{userNom || "—"}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{userEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Service</p>
              <p className="text-gray-800 dark:text-gray-200">{service}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Réservé le</p>
              <p className="text-gray-800 dark:text-gray-200">{formatDate(createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Début</p>
              <p className="text-gray-800 dark:text-gray-200 font-medium">{formatDateTime(dateHeure)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Fin</p>
              <p className="text-gray-800 dark:text-gray-200">{formatDateTime(dateHeureFin)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Statut</p>
              <StatusBadge status={status} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === status}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {updating ? "Mise à jour…" : "Mettre à jour"}
            </button>
            <button
              onClick={() => onDelete(id)}
              className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const AppointmentsManagementPage = () => {
  const showToast = useToastStore((s) => s.addToast);

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [activeTab,    setActiveTab]    = useState("ALL");
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getAll();
        setAppointments(
          [...data].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure))
        );
      } catch (err) {
        setError(err.response?.data?.message ?? "Impossible de charger les rendez-vous.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await appointmentService.updateStatus(id, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast("Statut mis à jour.", "success");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Erreur lors de la mise à jour.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await appointmentService.delete(confirmDel);
      setAppointments((prev) => prev.filter((a) => a.id !== confirmDel));
      showToast("Rendez-vous supprimé.", "success");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Erreur lors de la suppression.", "error");
    } finally {
      setDeleting(false);
      setConfirmDel(null);
    }
  };

  const counts = appointments.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; },
    { PENDING: 0, CONFIRMED: 0, DONE: 0, CANCELLED: 0 }
  );

  const q = search.toLowerCase();
  const filtered = appointments.filter((a) => {
    const matchTab    = activeTab === "ALL" || a.status === activeTab;
    const matchSearch = !q || [a.userNom, a.userEmail, a.service].some(
      (f) => f?.toLowerCase().includes(q)
    );
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 m-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des rendez-vous</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Consultations vétérinaires enregistrées</p>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total",      count: appointments.length, color: "text-gray-800 dark:text-gray-100",   bg: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"          },
            { label: "En attente", count: counts.PENDING,      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"   },
            { label: "Confirmés",  count: counts.CONFIRMED,    color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"   },
            { label: "Terminés",   count: counts.DONE,         color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"     },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center shadow-sm ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <input
        type="search"
        placeholder="Rechercher par client, email ou service…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
      />

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === s
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {s === "ALL"
              ? `Tous (${appointments.length})`
              : `${STATUS_CONFIG[s]?.label ?? s} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <p className="text-4xl mb-4">📅</p>
          <p className="font-medium">Aucun rendez-vous enregistré.</p>
        </div>
      )}

      {!loading && appointments.length > 0 && filtered.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-10">
          Aucun résultat pour cette recherche.
        </p>
      )}

      {/* ── List ── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onStatusChange={handleStatusChange}
              onDelete={(id) => setConfirmDel(id)}
            />
          ))}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cette action est irréversible. Le rendez-vous sera définitivement supprimé.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDel(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagementPage;

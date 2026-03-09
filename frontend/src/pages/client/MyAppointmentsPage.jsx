import { useState, useEffect } from "react";
import appointmentService from "../../services/appointmentService";
import useToastStore from "../../store/toastStore";

// ─── Config ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: "En attente", cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  CONFIRMED: { label: "Confirmé",   cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  CANCELLED: { label: "Annulé",     cls: "bg-red-100   text-red-700",    dot: "bg-red-500"    },
  DONE:      { label: "Terminé",    cls: "bg-blue-100  text-blue-700",   dot: "bg-blue-500"   },
};

const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMED", "DONE", "CANCELLED"];

const SERVICES = [
  "Consultation générale",
  "Vaccination",
  "Contrôle de santé",
  "Détartrage dentaire",
  "Stérilisation",
  "Urgence",
];

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8h → 17h

// ─── Helpers ──────────────────────────────────────────────────
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("fr-FR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const isWeekend = (dateStr) => {
  if (!dateStr) return false;
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  return day === 0 || day === 6;
};

const minBookingDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ─── StatusBadge ──────────────────────────────────────────────
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
const AppointmentSkeleton = () => (
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

// ─── BookingForm ──────────────────────────────────────────────
const BookingForm = ({ onSubmit, onClose, loading, serverError, onClearServerError }) => {
  const [service, setService] = useState("");
  const [date,    setDate]    = useState("");
  const [hour,    setHour]    = useState("");
  const [errors,  setErrors]  = useState({});

  const minDate = minBookingDate();

  const validate = () => {
    const e = {};
    if (!service) e.service = "Le service est obligatoire.";
    if (!date)    e.date    = "La date est obligatoire.";
    else if (date < minDate)  e.date = "La date ne peut pas être dans le passé.";
    else if (isWeekend(date)) e.date = "Les rendez-vous ne sont pas disponibles le week-end.";
    if (!hour)    e.hour    = "L'heure est obligatoire.";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ service, dateHeure: `${date}T${String(hour).padStart(2, "0")}:00:00` });
  };

  const clear = (field) => {
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    onClearServerError?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6 space-y-5"
    >
      <h3 className="font-semibold text-gray-900 text-base">Nouveau rendez-vous</h3>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span>🚫</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
        <select
          value={service}
          onChange={(e) => { setService(e.target.value); clear("service"); }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— Choisir un service —</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
      </div>

      {/* Date + Hour */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date (lun – ven)</label>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => { setDate(e.target.value); clear("date"); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heure (pleine)</label>
          <select
            value={hour}
            onChange={(e) => { setHour(e.target.value); clear("hour"); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Heure —</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
            ))}
          </select>
          {errors.hour && <p className="text-xs text-red-500 mt-1">{errors.hour}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Confirmation…" : "Confirmer"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

// ─── AppointmentCard ──────────────────────────────────────────
const AppointmentCard = ({ appointment, onCancel }) => {
  const [expanded,   setExpanded]   = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { id, service, dateHeure, dateHeureFin, status, createdAt } = appointment;

  const handleCancel = async () => {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    setCancelling(true);
    try {
      await onCancel(id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
          🩺
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{service}</p>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(dateHeure)}</p>
        </div>
        <StatusBadge status={status} />
        <span className="text-gray-300 text-sm ml-2">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Début</p>
              <p className="text-gray-800 font-medium">{formatDateTime(dateHeure)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Fin</p>
              <p className="text-gray-800 font-medium">{formatDateTime(dateHeureFin)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service</p>
              <p className="text-gray-800">{service}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Réservé le</p>
              <p className="text-gray-800">{formatDate(createdAt)}</p>
            </div>
          </div>

          {status === "PENDING" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cancelling ? "Annulation…" : "Annuler ce rendez-vous"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const MyAppointmentsPage = () => {
  const showToast = useToastStore((s) => s.addToast);

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("ALL");
  const [formOpen,     setFormOpen]     = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(
        [...data].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure))
      );
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger vos rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      const created = await appointmentService.create(payload);
      setAppointments((prev) =>
        [created, ...prev].sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure))
      );
      setFormOpen(false);
      setFormError(null);
      showToast("Rendez-vous créé avec succès.", "success");
    } catch (err) {
      const msg = err.response?.data?.message ?? "Erreur lors de la création.";
      if (err.response?.status === 409) {
        setFormError(msg);
      } else {
        showToast(msg, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const updated = await appointmentService.updateStatus(id, { status: "CANCELLED" });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast("Rendez-vous annulé.", "success");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Impossible d'annuler ce rendez-vous.", "error");
    }
  };

  const counts = appointments.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; },
    { PENDING: 0, CONFIRMED: 0, DONE: 0, CANCELLED: 0 }
  );

  const filtered =
    activeTab === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
            <p className="text-sm text-gray-400 mt-1">Consultations vétérinaires</p>
          </div>
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              + Prendre rendez-vous
            </button>
          )}
        </div>

        {/* ── Booking form ── */}
        {formOpen && (
          <BookingForm
            onSubmit={handleCreate}
            onClose={() => { setFormOpen(false); setFormError(null); }}
            loading={submitting}
            serverError={formError}
            onClearServerError={() => setFormError(null)}
          />
        )}

        {/* ── Stats ── */}
        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "En attente", count: counts.PENDING,   color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              { label: "Confirmés",  count: counts.CONFIRMED,  color: "text-green-600", bg: "bg-green-50 border-green-100" },
              { label: "Terminés",   count: counts.DONE,       color: "text-blue-600",  bg: "bg-blue-50 border-blue-100"   },
              { label: "Annulés",    count: counts.CANCELLED,  color: "text-red-500",   bg: "bg-red-50 border-red-100"     },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
                <p className={`text-2xl font-bold ${color}`}>{count}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <AppointmentSkeleton key={i} />)}
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && appointments.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "ALL" ? "Tous" : STATUS_CONFIG[s]?.label ?? s}
                {s !== "ALL" && counts[s] > 0 && (
                  <span className="ml-1 opacity-70">({counts[s]})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🐾</span>
            </div>
            <p className="text-gray-800 font-semibold text-lg mb-2">Aucun rendez-vous</p>
            <p className="text-gray-400 text-sm mb-6">
              Prenez rendez-vous avec notre vétérinaire dès maintenant.
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Prendre rendez-vous
            </button>
          </div>
        )}

        {/* ── List ── */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}

        {!loading && appointments.length > 0 && filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            Aucun rendez-vous dans cette catégorie.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;

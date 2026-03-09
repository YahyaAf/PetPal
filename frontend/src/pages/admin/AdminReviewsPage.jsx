import { useState, useEffect, useCallback } from "react";
import reviewService from "../../services/reviewService";
import useToastStore from "../../store/toastStore";
import { StarDisplay } from "../../components/shared/ReviewModal";

// ─── Helpers ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  HOTEL:    { label: "Hôtel",     icon: "🏨", cls: "bg-blue-50 text-blue-700 border-blue-200"     },
  TRAINING: { label: "Formation", icon: "🤺", cls: "bg-green-50 text-green-700 border-green-200"   },
  ORDER:    { label: "Commande",  icon: "🛒", cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? { label: type, icon: "📋", cls: "bg-gray-50 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

// ─── Review Card ──────────────────────────────────────────────
const ReviewCard = ({ review, onDeleted }) => {
  const showToast          = useToastStore((s) => s.show);
  const [expanded,         setExpanded]   = useState(false);
  const [deleting,         setDeleting]   = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    setDeleting(true);
    try {
      await reviewService.delete(review.idReview);
      onDeleted(review.idReview);
      showToast("Avis supprimé", "success");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Impossible de supprimer l'avis.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* Type + user */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-base shrink-0">
            {TYPE_CONFIG[review.reservationType]?.icon ?? "📋"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{review.userNom || "—"}</p>
            <p className="text-xs text-gray-400 truncate">{review.userEmail || "—"}</p>
          </div>
        </div>

        {/* Type badge + stars */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <TypeBadge type={review.reservationType} />
          <div className="flex items-center gap-1.5">
            <StarDisplay value={review.rating} size="text-base" />
            <span className="text-xs font-semibold text-gray-600">{review.rating}/5</span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(review.dateReview)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium"
          >
            {expanded ? "Masquer ▲" : "Voir ▼"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {deleting ? "…" : "🗑️"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">ID avis</p>
              <p className="font-mono font-semibold text-gray-800">#{review.idReview}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Réf. réservation</p>
              <p className="font-mono font-semibold text-gray-800">#{review.reviewId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Note</p>
              <StarDisplay value={review.rating} size="text-base" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date</p>
              <p className="font-medium text-gray-800">{formatDate(review.dateReview)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1.5">Commentaire</p>
            <p className="text-sm text-gray-700 leading-relaxed">{review.commentaire}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 bg-gray-100 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-36" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-100 rounded-full w-20" />
      <div className="h-5 bg-gray-100 rounded w-24" />
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────
const AdminReviewsPage = () => {
  const showToast                   = useToastStore((s) => s.show);
  const [reviews,     setReviews]   = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [error,       setError]     = useState(null);
  const [search,      setSearch]    = useState("");
  const [activeType,  setActiveType] = useState("ALL");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.getAll();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b.dateReview || 0) - new Date(a.dateReview || 0));
      setReviews(list);
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleted = (id) => setReviews((prev) => prev.filter((r) => r.idReview !== id));

  const TYPES = ["ALL", "HOTEL", "TRAINING", "ORDER"];
  const TYPE_LABELS = { ALL: "Tous", HOTEL: "Hôtels", TRAINING: "Formations", ORDER: "Commandes" };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || (r.userNom   || "").toLowerCase().includes(q)
      || (r.userEmail || "").toLowerCase().includes(q)
      || (r.commentaire || "").toLowerCase().includes(q);
    const matchType = activeType === "ALL" || r.reservationType === activeType;
    return matchSearch && matchType;
  });

  // Stats
  const total   = reviews.length;
  const avgRating = total
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / total).toFixed(1)
    : "—";
  const countByType = (t) => reviews.filter((r) => r.reservationType === t).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Avis clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion de tous les avis</p>
        </div>
        <button
          onClick={fetchAll}
          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: total,                   cls: "bg-blue-50    text-blue-700"   },
            { label: "Note moy.",  value: `${avgRating} ★`,        cls: "bg-amber-50   text-amber-700"  },
            { label: "Hôtels",     value: countByType("HOTEL"),    cls: "bg-sky-50     text-sky-700"    },
            { label: "Formations", value: countByType("TRAINING"), cls: "bg-green-50   text-green-700"  },
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
            placeholder="Client, email, commentaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeType === t
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {TYPE_LABELS[t]}
              {t !== "ALL" && (
                <span className="ml-1 opacity-70">({countByType(t)})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button onClick={fetchAll} className="mt-3 text-sm text-blue-600 hover:underline">Réessayer</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">⭐</p>
          <p className="text-gray-400 text-sm">
            {reviews.length === 0 ? "Aucun avis enregistré" : "Aucun résultat pour ces filtres"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReviewCard key={r.idReview} review={r} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;

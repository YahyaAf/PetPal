import { useState, useEffect, useCallback } from "react";
import reviewService from "../../services/reviewService";
import useToastStore from "../../store/toastStore";
import ReviewModal, { StarDisplay } from "../../components/shared/ReviewModal";

// ─── Helpers ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  HOTEL:    { label: "Hôtel",     icon: "🏨", cls: "bg-blue-50 text-blue-700 border-blue-200"    },
  TRAINING: { label: "Formation", icon: "🤺", cls: "bg-green-50 text-green-700 border-green-200"  },
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
const ReviewCard = ({ review, onUpdated, onDeleted }) => {
  const showToast     = useToastStore((s) => s.show);
  const [editOpen,    setEditOpen]    = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const handleUpdate = async (rating, commentaire) => {
    setEditLoading(true);
    try {
      const updated = await reviewService.update(review.idReview, { rating, commentaire });
      onUpdated(updated);
      setEditOpen(false);
      showToast("Avis modifié avec succès", "success");
    } catch (err) {
      showToast(err.response?.data?.message ?? "Impossible de modifier l'avis.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cet avis définitivement ?")) return;
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
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={review.reservationType} />
            <span className="text-xs text-gray-400">
              #{review.reviewId}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{formatDate(review.dateReview)}</span>
        </div>

        {/* Stars + note */}
        <div className="flex items-center gap-2 mb-3">
          <StarDisplay value={review.rating} size="text-lg" />
          <span className="text-sm font-semibold text-gray-700">{review.rating}/5</span>
        </div>

        {/* Commentaire */}
        <p className="text-sm text-gray-700 leading-relaxed">{review.commentaire}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            ✏️ Modifier
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? "…" : "🗑️ Supprimer"}
          </button>
        </div>
      </div>

      <ReviewModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        loading={editLoading}
        initialData={{ rating: review.rating, commentaire: review.commentaire }}
        title="Modifier mon avis"
      />
    </>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-5 w-24 bg-gray-100 rounded-full" />
      <div className="h-4 w-20 bg-gray-100 rounded" />
    </div>
    <div className="h-5 w-28 bg-gray-100 rounded" />
    <div className="h-4 w-full bg-gray-100 rounded" />
    <div className="h-4 w-3/4 bg-gray-100 rounded" />
  </div>
);

// ─── Page ─────────────────────────────────────────────────────
const MyReviewsPage = () => {
  const showToast               = useToastStore((s) => s.show);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [filter,  setFilter]    = useState("ALL");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewService.getMyReviews();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => new Date(b.dateReview || 0) - new Date(a.dateReview || 0));
      setReviews(list);
    } catch (err) {
      setError(err.response?.data?.message ?? "Impossible de charger vos avis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleUpdated = (updated) =>
    setReviews((prev) => prev.map((r) => (r.idReview === updated.idReview ? updated : r)));

  const handleDeleted = (id) =>
    setReviews((prev) => prev.filter((r) => r.idReview !== id));

  const FILTERS = [
    { key: "ALL",      label: "Tous"      },
    { key: "HOTEL",    label: "Hôtels"    },
    { key: "TRAINING", label: "Formations" },
    { key: "ORDER",    label: "Commandes" },
  ];

  const filtered = filter === "ALL" ? reviews : reviews.filter((r) => r.reservationType === filter);

  // Stats
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes avis</h1>
          <p className="text-sm text-gray-500 mt-1">Vos évaluations sur les hôtels, formations et commandes</p>
        </div>

        {/* Stats */}
        {!loading && reviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total",      value: reviews.length,                                              cls: "bg-blue-50   text-blue-700"   },
              { label: "Note moy.",  value: avgRating ? `${avgRating} ★` : "—",                        cls: "bg-amber-50  text-amber-700"  },
              { label: "Hôtels",     value: reviews.filter((r) => r.reservationType === "HOTEL").length,    cls: "bg-sky-50    text-sky-700"    },
              { label: "Formations", value: reviews.filter((r) => r.reservationType === "TRAINING").length, cls: "bg-green-50  text-green-700"  },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`rounded-2xl p-4 ${cls}`}>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              {key !== "ALL" && (
                <span className="ml-1 opacity-70">
                  ({reviews.filter((r) => r.reservationType === key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchReviews} className="mt-3 text-sm text-blue-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-gray-400 text-sm">
              {reviews.length === 0 ? "Vous n'avez pas encore laissé d'avis" : "Aucun avis pour ce filtre"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <ReviewCard
                key={r.idReview}
                review={r}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;

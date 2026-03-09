import { useState, useEffect } from "react";

// ─── Static star display ──────────────────────────────────────
export const StarDisplay = ({ value, size = "text-sm" }) => (
  <span className={`${size} tracking-tight leading-none`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= value ? "text-amber-400" : "text-gray-200"}>
        ★
      </span>
    ))}
  </span>
);

// ─── Interactive star input ───────────────────────────────────
const StarRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none leading-none"
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <span className={(hover || value) >= star ? "text-amber-400" : "text-gray-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

const RATING_LABELS = ["", "Très mauvais", "Mauvais", "Moyen", "Bien", "Excellent"];

// ─── Modal ────────────────────────────────────────────────────
/**
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   onSubmit     {(rating: number, commentaire: string) => void}
 *   loading      {boolean}
 *   initialData  {null | { rating: number, commentaire: string }}
 *   title        {string}
 */
const ReviewModal = ({ isOpen, onClose, onSubmit, loading = false, initialData = null, title }) => {
  const [rating,      setRating]      = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [errors,      setErrors]      = useState({});

  // Reset form each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating ?? 0);
      setCommentaire(initialData?.commentaire ?? "");
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const e = {};
    if (!rating || rating < 1 || rating > 5)
      e.rating = "Veuillez sélectionner une note de 1 à 5";
    if (!commentaire.trim())
      e.commentaire = "Le commentaire est obligatoire";
    else if (commentaire.trim().length < 5)
      e.commentaire = "Le commentaire doit contenir au moins 5 caractères";
    else if (commentaire.trim().length > 1000)
      e.commentaire = "Le commentaire ne peut pas dépasser 1000 caractères";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(rating, commentaire.trim());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {title ?? "Laisser un avis"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                value={rating}
                onChange={(v) => {
                  setRating(v);
                  setErrors((prev) => ({ ...prev, rating: undefined }));
                }}
              />
              {rating > 0 && (
                <span className="text-sm font-medium text-amber-600">
                  {RATING_LABELS[rating]}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-xs text-red-500 mt-1.5">{errors.rating}</p>
            )}
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Commentaire <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal ml-1">(5 – 1000 caractères)</span>
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => {
                setCommentaire(e.target.value);
                setErrors((prev) => ({ ...prev, commentaire: undefined }));
              }}
              rows={4}
              maxLength={1000}
              placeholder="Partagez votre expérience…"
              className={`w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
                errors.commentaire
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.commentaire ? (
                <p className="text-xs text-red-500">{errors.commentaire}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ml-auto ${
                  commentaire.length > 950 ? "text-red-500" : "text-gray-400"
                }`}
              >
                {commentaire.length}/1000
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Envoi…" : initialData ? "Modifier" : "Publier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import trainingTypeService from "../../services/trainingTypeService";
import trainingReservationService from "../../services/trainingReservationService";
import useToastStore from "../../store/toastStore";

// ─── Helpers ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days) - 1);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

// ─── Page ─────────────────────────────────────────────────────
const TrainingBookingPage = () => {
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const showToast = useToastStore((s) => s.show);

  const [trainingType, setTrainingType]     = useState(location.state?.trainingType ?? null);
  const [typeLoading,  setTypeLoading]      = useState(!location.state?.trainingType);
  const [typeError,    setTypeError]        = useState(null);

  const [dateDebut, setDateDebut] = useState(today());
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // Fetch training type if not passed via state
  useEffect(() => {
    if (trainingType) return;
    trainingTypeService.getById(id)
      .then(setTrainingType)
      .catch(() => setTypeError("Formation introuvable."))
      .finally(() => setTypeLoading(false));
  }, [id, trainingType]);

  const prix  = trainingType?.prix  ?? 0;
  const duree = trainingType?.duree ?? 1;

  const dateFin = useMemo(
    () => (dateDebut ? addDays(dateDebut, duree) : "—"),
    [dateDebut, duree]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await trainingReservationService.create({
        trainingTypeId: Number(id),
        dateDebut,
      });

      const { reservation, paymentId, stripeClientSecret, stripePaymentIntentId } = response;

      if (!stripeClientSecret) throw new Error("Client secret manquant dans la réponse.");

      navigate("/training-checkout", {
        state: {
          clientSecret:          stripeClientSecret,
          paymentId,
          stripePaymentIntentId,
          reservationId:         reservation.idReservation,
          trainingType,
          dateDebut:             reservation.dateDebut ?? dateDebut,
          dateFin:               reservation.dateFin   ?? dateFin,
          duree:                 duree,
          montantTotal:          reservation.totalPrice ?? prix,
          dresseur:              reservation.dresseur,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? "Une erreur est survenue.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──
  if (typeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (typeError || !trainingType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-500 text-sm">{typeError ?? "Formation introuvable"}</p>
        <Link to="/training" className="text-sm text-green-600 hover:underline">← Retour aux formations</Link>
      </div>
    );
  }

  const nom = trainingType.nom || trainingType.name || "Formation";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        {/* Back */}
        <Link to="/training" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          ← Retour aux formations
        </Link>

        {/* Training type banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
            🤺
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-lg truncate">{nom}</h2>
            {trainingType.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{trainingType.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-green-600">{Number(prix).toFixed(2)}</p>
            <p className="text-xs text-gray-400">MAD · {duree} jour{duree > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Booking form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Détails de la réservation</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateDebut}
                min={today()}
                onChange={(e) => setDateDebut(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Recap */}
            {dateDebut && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">📋 Récapitulatif</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">📅 Début</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(dateDebut)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">📅 Fin estimée</p>
                    <p className="text-sm font-semibold text-gray-800">{dateFin}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Durée de la formation</span>
                  <span className="font-semibold text-gray-800">{duree} jour{duree > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Formation</span>
                  <span className="font-semibold text-gray-800">{nom}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="font-bold text-gray-800 text-sm">Total</span>
                  <span className="font-bold text-green-700 text-lg">{Number(prix).toFixed(2)} MAD</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours…
                </>
              ) : (
                "Continuer vers le paiement →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainingBookingPage;

import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import trainingTypeService from "../../services/trainingTypeService";
import trainingReservationService from "../../services/trainingReservationService";
import useToastStore from "../../store/toastStore";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (typeError || !trainingType) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-500 text-sm">{typeError ?? "Formation introuvable"}</p>
        <Link to="/training" className="text-sm hover:underline" style={{ color: ORANGE }}>&#8592; Retour aux formations</Link>
      </div>
    );
  }

  const nom = trainingType.nom || trainingType.name || "Formation";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Poppins',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/training" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-7 transition-colors">
          &#8592; Retour aux formations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Training Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Formation sélectionnée</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ORANGE_LIGHT }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-6 h-6" style={{ color: ORANGE }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.462 5.214m9.9 0a8.25 8.25 0 1013.456 0m-9.9 0a.75.75 0 11-1.5 0m7.5-6.387a.75.75 0 11-1.5 0m0 0a.75.75 0 11-1.5 0" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-base truncate">{nom}</h2>
                  <p className="text-xs text-gray-500 truncate">{duree} jour{duree > 1 ? "s" : ""}</p>
                </div>
              </div>

              {prix > 0 && (
                <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: ORANGE_LIGHT }}>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Prix de la formation</p>
                  <p className="font-extrabold text-xl" style={{ color: ORANGE }}>
                    {Number(prix).toFixed(2)} MAD
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">Choisissez votre date de début à droite pour continuer vers le paiement sécurisé.</p>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)" }}>
            <h1 className="text-lg font-extrabold text-gray-900 mb-6">Détails de la réservation</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ boxShadow: "0 0 0 0 transparent" }}
                />
              </div>

              {dateDebut && (
                <div className="rounded-2xl p-4 space-y-3" style={{ background: ORANGE_LIGHT, border: "1px solid #fde5d2" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ORANGE }}>Récapitulatif</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-[#fde5d2]">
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Début</p>
                      <p className="text-sm font-semibold text-gray-800">{formatDate(dateDebut)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#fde5d2]">
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Fin estimée</p>
                      <p className="text-sm font-semibold text-gray-800">{dateFin}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Durée de la formation</span>
                    <span className="font-semibold text-gray-800">{duree} jour{duree > 1 ? "s" : ""}</span>
                  </div>

                  {prix > 0 && (
                    <>
                      <div className="flex justify-between items-center pt-2 border-t border-[#f6cda9]">
                        <span className="font-bold text-gray-800 text-sm">Total</span>
                        <span className="font-extrabold text-lg" style={{ color: ORANGE }}>{Number(prix).toFixed(2)} MAD</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: ORANGE }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création en cours…
                  </>
                ) : (
                  "Continuer vers le paiement \u2192"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingBookingPage;

import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import hotelService from "../../services/hotelService";
import reservationService from "../../services/reservationService";
import useToastStore from "../../store/toastStore";

// ─── Helpers ─────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + Number(days));
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

// ─── Page ─────────────────────────────────────────────────────
const HotelBookingPage = () => {
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const showToast = useToastStore((s) => s.show);

  const [hotel,    setHotel]    = useState(location.state?.hotel ?? null);
  const [hotelLoading, setHotelLoading] = useState(!location.state?.hotel);
  const [hotelError,   setHotelError]   = useState(null);

  const [dateDebut, setDateDebut] = useState(today());
  const [days,      setDays]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // Fetch hotel if not passed via navigation state
  useEffect(() => {
    if (hotel) return;
    (async () => {
      try {
        const data = await hotelService.getById(id);
        setHotel(data);
      } catch {
        setHotelError("Hôtel introuvable.");
      } finally {
        setHotelLoading(false);
      }
    })();
  }, [id, hotel]);

  const prix          = hotel ? (hotel.prixParJour ?? 0) : 0;
  const estimatedTotal = useMemo(() => Number(prix) * Number(days), [prix, days]);
  const dateFin        = useMemo(() => (dateDebut && days ? addDays(dateDebut, days) : "—"), [dateDebut, days]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await reservationService.create({
        dateDebut,
        days: Number(days),
        hotelId: Number(id),
      });

      const { reservation, paymentId, stripeClientSecret, stripePaymentIntentId } = response;

      if (!stripeClientSecret) {
        throw new Error("Client secret manquant dans la réponse.");
      }

      navigate("/hotel-checkout", {
        state: {
          clientSecret:          stripeClientSecret,
          paymentId,
          stripePaymentIntentId,
          reservationId:         reservation.idReservation,
          hotel,
          dateDebut:             reservation.dateDebut ?? dateDebut,
          dateFin:               reservation.dateFin   ?? dateFin,
          days:                  reservation.days      ?? days,
          montantTotal:          reservation.montantTotal ?? estimatedTotal,
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

  // ── Loading hotel ──
  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (hotelError || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-500 text-sm">{hotelError ?? "Hôtel introuvable"}</p>
        <Link to="/hotels" className="text-sm text-blue-600 hover:underline">← Retour aux hôtels</Link>
      </div>
    );
  }

  const nom   = hotel.nom   || hotel.name || "Hôtel";
  const ville = hotel.city?.nomVille || "—";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        {/* Back */}
        <Link to="/hotels" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
          ← Retour aux hôtels
        </Link>

        {/* Hotel summary banner */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            🏨
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-lg truncate">{nom}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span> {ville}
            </p>
          </div>
          {prix > 0 && (
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-blue-600">{Number(prix).toFixed(2)}</p>
              <p className="text-xs text-gray-400">MAD / jour</p>
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Détails de la réservation</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date d'arrivée <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateDebut}
                min={today()}
                onChange={(e) => setDateDebut(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Nombre de jours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre de nuits <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={days}
                min={1}
                max={365}
                onChange={(e) => setDays(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1.5">Entre 1 et 365 nuits</p>
            </div>

            {/* Summary card */}
            {dateDebut && Number(days) > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">📋 Récapitulatif</p>

                {/* Dates row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">📅 Arrivée</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(dateDebut)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5">📅 Départ</p>
                    <p className="text-sm font-semibold text-gray-800">{dateFin}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Durée du séjour</span>
                  <span className="font-semibold text-gray-800">{Number(days)} nuit{Number(days) > 1 ? "s" : ""}</span>
                </div>

                {/* Price breakdown */}
                {prix > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {Number(prix).toFixed(2)} MAD × {Number(days)} nuit{Number(days) > 1 ? "s" : ""}
                      </span>
                      <span className="text-gray-700">{estimatedTotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="font-bold text-gray-800 text-sm">Total estimé</span>
                      <span className="font-bold text-blue-700 text-lg">{estimatedTotal.toFixed(2)} MAD</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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

export default HotelBookingPage;

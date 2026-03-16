import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import hotelService from "../../services/hotelService";
import reservationService from "../../services/reservationService";
import useToastStore from "../../store/toastStore";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

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
  const addToast = useToastStore((s) => s.addToast);

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
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading hotel ──
  if (hotelLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (hotelError || !hotel) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">⚠️</p>
        <p className="text-red-500 text-sm">{hotelError ?? "Hôtel introuvable"}</p>
        <Link to="/hotels" className="text-sm hover:underline" style={{ color: ORANGE }}>&#8592; Retour aux hôtels</Link>
      </div>
    );
  }

  const nom   = hotel.nom   || hotel.name || "Hôtel";
  const ville = hotel.city?.nomVille || "—";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Poppins',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/hotels" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-7 transition-colors">
          &#8592; Retour aux hôtels
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Hôtel sélectionné</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: ORANGE_LIGHT }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-6 h-6" style={{ color: ORANGE }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-base truncate">{nom}</h2>
                  <p className="text-xs text-gray-500 truncate">{ville}</p>
                </div>
              </div>

              {prix > 0 && (
                <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: ORANGE_LIGHT }}>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Prix par nuit</p>
                  <p className="font-extrabold text-xl" style={{ color: ORANGE }}>
                    {Number(prix).toFixed(2)} MAD
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">Choisissez vos dates à droite pour continuer vers le paiement sécurisé.</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)" }}>
            <h1 className="text-lg font-extrabold text-gray-900 mb-6">Détails de la réservation</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ boxShadow: "0 0 0 0 transparent" }}
                />
              </div>

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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ boxShadow: "0 0 0 0 transparent" }}
                />
                <p className="text-xs text-gray-400 mt-1.5">Entre 1 et 365 nuits</p>
              </div>

              {dateDebut && Number(days) > 0 && (
                <div className="rounded-2xl p-4 space-y-3" style={{ background: ORANGE_LIGHT, border: "1px solid #fde5d2" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ORANGE }}>Récapitulatif</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-[#fde5d2]">
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Arrivée</p>
                      <p className="text-sm font-semibold text-gray-800">{formatDate(dateDebut)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#fde5d2]">
                      <p className="text-[11px] text-gray-400 font-medium mb-0.5">Départ</p>
                      <p className="text-sm font-semibold text-gray-800">{dateFin}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Durée du séjour</span>
                    <span className="font-semibold text-gray-800">{Number(days)} nuit{Number(days) > 1 ? "s" : ""}</span>
                  </div>

                  {prix > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {Number(prix).toFixed(2)} MAD × {Number(days)} nuit{Number(days) > 1 ? "s" : ""}
                        </span>
                        <span className="text-gray-700">{estimatedTotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#f6cda9]">
                        <span className="font-bold text-gray-800 text-sm">Total estimé</span>
                        <span className="font-extrabold text-lg" style={{ color: ORANGE }}>{estimatedTotal.toFixed(2)} MAD</span>
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

export default HotelBookingPage;

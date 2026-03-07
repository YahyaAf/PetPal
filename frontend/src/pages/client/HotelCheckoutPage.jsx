import { useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentApi } from "../../services/orderService";

// ─── Stripe singleton ─────────────────────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─── Stripe theme (shared design system) ─────────────────────
const STRIPE_APPEARANCE = {
  theme: "stripe",
  variables: {
    colorPrimary:     "#2563eb",
    colorBackground:  "#ffffff",
    colorText:        "#1e293b",
    colorDanger:      "#ef4444",
    fontFamily:       "Inter, system-ui, sans-serif",
    borderRadius:     "12px",
    spacingUnit:      "4px",
  },
  rules: {
    ".Input":       { border: "1px solid #e2e8f0", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" },
    ".Label":       { fontWeight: "500", color: "#475569", fontSize: "13px" },
  },
};

// ─────────────────────────────────────────────────────────────
//  Payment form (must be mounted inside <Elements>)
// ─────────────────────────────────────────────────────────────
const PaymentForm = ({ paymentId, reservationId, hotel, dateDebut, dateFin, days, montantTotal }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setProcessing(true);
      setError(null);

      // Step 1 — submit to Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/hotel-booking/success` },
        redirect: "if_required",
      });

      if (stripeError) {
        const msg =
          stripeError.type === "card_error" || stripeError.type === "validation_error"
            ? stripeError.message
            : "Une erreur inattendue s'est produite. Veuillez réessayer.";
        setError(msg);
        setProcessing(false);

        // Silent: mark payment ECHEC on backend
        try { await paymentApi.cancel(paymentId); } catch { /* noop */ }
        return;
      }

      // Step 2 — Stripe succeeded → confirm on backend
      if (paymentIntent?.status === "succeeded") {
        try {
          await paymentApi.confirm(paymentId, paymentIntent.id);
          navigate("/hotel-booking/success", {
            state: { reservationId, hotel, dateDebut, dateFin, days, montantTotal, paymentId },
            replace: true,
          });
        } catch (backendErr) {
          setError(
            backendErr.response?.data?.message ??
            "Paiement accepté mais la confirmation a échoué. Contactez le support."
          );
          setProcessing(false);
        }
      } else {
        setError("Le paiement n'a pas pu être confirmé. Statut : " + paymentIntent?.status);
        setProcessing(false);
      }
    },
    [stripe, elements, navigate, paymentId, reservationId, hotel, dateDebut, dateFin, days, montantTotal]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 p-4 bg-white">
        <PaymentElement
          options={{
            layout: "tabs",
            wallets: { applePay: "never", googlePay: "never" },
            fields: { billingDetails: "auto" },
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Traitement…
          </span>
        ) : (
          `Confirmer et payer ${Number(montantTotal ?? 0).toFixed(2)} MAD`
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <span>🔒</span>
        Paiement sécurisé par Stripe
      </p>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
//  HotelCheckoutPage
// ─────────────────────────────────────────────────────────────
const HotelCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const {
    clientSecret,
    paymentId,
    reservationId,
    hotel,
    dateDebut,
    dateFin,
    days,
    montantTotal,
  } = location.state ?? {};

  // Guard: direct navigation without context
  if (!clientSecret || !paymentId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">🏨</span>
        <p className="text-gray-700 font-semibold">Aucune réservation en cours.</p>
        <Link
          to="/hotels"
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Voir les hôtels
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await paymentApi.cancel(paymentId);
    } catch {
      // Always navigate back even if cancel fails on backend
    } finally {
      setCancelling(false);
      navigate("/hotels", { replace: true });
    }
  };

  const hotelNom = hotel?.nom || hotel?.name || "Hôtel";
  const hotelVille = hotel?.city?.nomVille || "";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            ← Retour aux hôtels
          </button>
          <p className="text-xs text-gray-400">Réservation #{String(reservationId).padStart(5, "0")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: booking summary ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Hotel card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Votre réservation</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🏨
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{hotelNom}</p>
                  {hotelVille && <p className="text-xs text-gray-500">📍 {hotelVille}</p>}
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-gray-50 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Arrivée</span>
                  <span className="font-medium text-gray-800">{formatDate(dateDebut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Départ</span>
                  <span className="font-medium text-gray-800">{formatDate(dateFin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée</span>
                  <span className="font-medium text-gray-800">{days} nuit{days > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Total à payer</p>
              <p className="text-3xl font-bold">{Number(montantTotal ?? 0).toFixed(2)} MAD</p>
            </div>

            {/* Cancel button */}
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelling ? "Annulation…" : "Annuler la réservation"}
            </button>
          </div>

          {/* ── Right: Stripe form ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-6">Paiement sécurisé</h1>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
              <PaymentForm
                paymentId={paymentId}
                reservationId={reservationId}
                hotel={hotel}
                dateDebut={dateDebut}
                dateFin={dateFin}
                days={days}
                montantTotal={montantTotal}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCheckoutPage;

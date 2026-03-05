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

// ─────────────────────────────────────────────
//  Stripe instance (singleton — initialisée une seule fois)
// ─────────────────────────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ─────────────────────────────────────────────
//  Apparence Stripe (thème cohérent avec le design)
// ─────────────────────────────────────────────
const STRIPE_APPEARANCE = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2563eb",
    colorBackground: "#ffffff",
    colorText: "#1e293b",
    colorDanger: "#ef4444",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #e2e8f0", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,0.1)" },
    ".Label": { fontWeight: "500", color: "#475569", fontSize: "13px" },
  },
};

// ─────────────────────────────────────────────
//  Formulaire de paiement (doit être dans <Elements>)
// ─────────────────────────────────────────────
const PaymentForm = ({ paymentId, orderId, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setProcessing(true);
      setError(null);

      // ── Étape 1 : soumettre le formulaire Stripe ──
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
        },
        // Ne redirige que si requis (3D Secure…), sinon reste dans l'app
        redirect: "if_required",
      });

      if (stripeError) {
        // Erreur carte / validation → marquer le paiement ECHEC + order ANNULEE côté backend
        const msg =
          stripeError.type === "card_error" || stripeError.type === "validation_error"
            ? stripeError.message
            : "Une erreur inattendue s'est produite. Veuillez réessayer.";
        setError(msg);
        setProcessing(false);

        // Appel backend silent : payment → ECHEC, order → ANNULEE
        try {
          await paymentApi.cancel(paymentId);
        } catch {
          // Ne pas bloquer l'UX sur cet appel secondaire
        }
        return;
      }

      // ── Étape 2 : Stripe accepté → confirmer le backend ──
      if (paymentIntent?.status === "succeeded") {
        try {
          // Backend : payment → SUCCES, order → PAYEE, stock décrémenté
          await paymentApi.confirm(paymentId, paymentIntent.id);
          navigate("/order/success", {
            state: { orderId, total, paymentId },
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
    [stripe, elements, navigate, orderId, total, paymentId]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="rounded-xl border border-gray-200 p-4 bg-white">
        <PaymentElement
          options={{
            layout: "tabs",
            // Désactiver Link + wallets pour éviter l'erreur sign_up 400 en test mode
            wallets: { applePay: "never", googlePay: "never" },
            fields: { billingDetails: "auto" },
          }}
        />
      </div>

      {/* Erreur Stripe */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Bouton payer */}
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Traitement du paiement…
          </span>
        ) : (
          `Payer ${total?.toFixed(2)} MAD`
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <span>🔒</span>
        Paiement sécurisé par Stripe — vos données ne nous parviennent jamais
      </p>
    </form>
  );
};

// ─────────────────────────────────────────────
//  CheckoutPage
// ─────────────────────────────────────────────
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { clientSecret, paymentId, orderId, total, items } =
    location.state ?? {};

  // Redirect si on arrive sans contexte (navigation directe)
  if (!clientSecret || !paymentId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <span className="text-5xl">🛒</span>
        <p className="text-gray-700 font-semibold">Aucune commande en cours.</p>
        <Link
          to="/cart"
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Retour au panier
        </Link>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: STRIPE_APPEARANCE,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* ── En-tête ──────────────────────────── */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            ← Retour au panier
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Paiement</h1>
          <p className="text-sm text-gray-400 mt-1">
            Commande #{String(orderId).padStart(5, "0")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Formulaire Stripe ────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">
                Informations de paiement
              </h2>

              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm
                  paymentId={paymentId}
                  orderId={orderId}
                  total={total}
                />
              </Elements>
            </div>
          </div>

          {/* ── Récapitulatif commande ──────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                Récapitulatif
              </h2>

              {/* Articles */}
              {items?.length > 0 && (
                <ul className="space-y-3 mb-4">
                  {items.map((item) => (
                    <li key={item.idCartItem ?? item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600 flex-1 min-w-0 truncate pr-2">
                        {item.productNom}
                        <span className="text-gray-400 ml-1">× {item.quantite}</span>
                      </span>
                      <span className="font-medium text-gray-800 shrink-0">
                        {item.sousTotal?.toFixed(2)} MAD
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{total?.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Livraison</span>
                  <span>À définir</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-blue-600 text-lg">
                  {total?.toFixed(2)} MAD
                </span>
              </div>

              {/* Badges sécurité */}
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
                {["🔒 Sécurisé", "🏦 Stripe", "🛡️ Chiffré"].map((label) => (
                  <div key={label} className="bg-gray-50 rounded-lg py-2 px-1">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

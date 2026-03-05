import { useLocation, Link } from "react-router-dom";

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const { orderId, total } = state ?? {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
        {/* Icône succès */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 text-sm mb-6">
          Votre paiement a été accepté. Merci pour votre achat.
        </p>

        {/* Détails commande */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          {orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Référence</span>
              <span className="font-mono font-semibold text-gray-800">
                CMD-{String(orderId).padStart(5, "0")}
              </span>
            </div>
          )}
          {total !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant payé</span>
              <span className="font-bold text-blue-600">{total?.toFixed(2)} MAD</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Statut</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              ✓ Payée
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/products"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm text-center"
          >
            Continuer mes achats
          </Link>
          <Link
            to="/"
            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-xl transition-colors text-sm text-center"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

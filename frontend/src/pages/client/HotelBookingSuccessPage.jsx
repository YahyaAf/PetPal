import { useLocation, Link } from "react-router-dom";

const HotelBookingSuccessPage = () => {
  const location = useLocation();
  const {
    reservationId,
    hotel,
    dateDebut,
    dateFin,
    days,
    montantTotal,
  } = location.state ?? {};

  const hotelNom   = hotel?.nom || hotel?.name || "Hôtel";
  const hotelVille = hotel?.city?.nomVille || "";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
      : "—";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Réservation confirmée !</h1>
          <p className="text-gray-500 text-sm mt-2">
            Votre paiement a été accepté. Nous vous attendons !
          </p>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 mb-6">
          {/* Hotel */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
              🏨
            </div>
            <div>
              <p className="font-bold text-gray-900">{hotelNom}</p>
              {hotelVille && <p className="text-xs text-gray-500">📍 {hotelVille}</p>}
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2 text-sm">
            {reservationId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Réservation</span>
                <span className="font-mono font-bold text-gray-800">
                  RES-{String(reservationId).padStart(5, "0")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Arrivée</span>
              <span className="font-medium text-gray-800">{formatDate(dateDebut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Départ</span>
              <span className="font-medium text-gray-800">{formatDate(dateFin)}</span>
            </div>
            {days && (
              <div className="flex justify-between">
                <span className="text-gray-500">Durée</span>
                <span className="font-medium text-gray-800">{days} nuit{days > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-50">
            <span className="text-sm font-semibold text-gray-700">Montant payé</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {Number(montantTotal ?? 0).toFixed(2)} MAD
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                ✓ Payée
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/my-reservations"
            className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Voir mes réservations
          </Link>
          <Link
            to="/hotels"
            className="block w-full text-center py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            Explorer d'autres hôtels
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelBookingSuccessPage;

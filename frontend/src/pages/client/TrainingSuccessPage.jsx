import { useLocation, Link } from "react-router-dom";

const TrainingSuccessPage = () => {
  const location = useLocation();
  const {
    reservationId,
    trainingType,
    dateDebut,
    dateFin,
    duree,
    montantTotal,
    dresseur,
  } = location.state ?? {};

  const resNum   = reservationId != null ? `TRAIN-${String(reservationId).padStart(5, "0")}` : "TRAIN-?????";
  const nom      = trainingType?.nom || trainingType?.name || "Formation";
  const prix     = Number(montantTotal ?? 0).toFixed(2);
  const dresseurNom = dresseur?.nom || dresseur?.name || "";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Green header */}
          <div className="bg-linear-to-br from-green-500 to-emerald-600 px-8 py-10 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              ✅
            </div>
            <h1 className="text-2xl font-bold mb-1">Réservation confirmée !</h1>
            <p className="text-green-100 text-sm">Votre programme de dressage a été réservé avec succès.</p>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            {/* Res number */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Numéro de réservation</p>
              <p className="font-mono text-xl font-bold text-gray-800">{resNum}</p>
            </div>

            <hr className="border-gray-100" />

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Formation</p>
                <p className="font-semibold text-gray-800">{nom}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Durée</p>
                <p className="font-semibold text-gray-800">{duree} jour{Number(duree) > 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Début</p>
                <p className="font-semibold text-gray-800">{formatDate(dateDebut)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Fin</p>
                <p className="font-semibold text-gray-800">{formatDate(dateFin)}</p>
              </div>
              {dresseurNom && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Dresseur assigné</p>
                  <p className="font-semibold text-gray-800">🤺 {dresseurNom}</p>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Montant payé</span>
              <span className="text-lg font-bold text-green-600">{prix} MAD</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/my-training-reservations"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl text-center transition-colors"
              >
                Voir mes réservations
              </Link>
              <Link
                to="/training"
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl text-center transition-colors border border-gray-200"
              >
                Explorer d'autres formations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSuccessPage;

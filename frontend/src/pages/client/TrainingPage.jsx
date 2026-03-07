import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import trainingTypeService from "../../services/trainingTypeService";

// ─── Skeleton ─────────────────────────────────────────────────
const TrainingSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-36 bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-10 bg-gray-100 rounded-xl mt-4" />
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────
const TrainingCard = ({ type, onBook }) => {
  const id          = type.id ?? type.idType;
  const nom         = type.nom  || type.name || "Formation";
  const description = type.description || "";
  const prix        = type.prix  ?? 0;
  const duree       = type.duree ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Banner */}
      <div className="h-36 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <span className="text-5xl">🤺</span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-gray-800 text-base leading-snug">{nom}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span className="font-semibold text-green-600 text-sm">{Number(prix).toFixed(2)} MAD</span>
          <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
            {duree} jour{duree > 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => onBook(type)}
          className="mt-auto w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Réserver
        </button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const TrainingPage = () => {
  const navigate = useNavigate();
  const [types,   setTypes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    trainingTypeService.getAll()
      .then((data) => setTypes(Array.isArray(data) ? data : (data?.content ?? [])))
      .catch(() => setError("Impossible de charger les formations."))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (type) => {
    navigate(`/training/${type.id ?? type.idType}/book`, { state: { trainingType: type } });
  };

  const visible = types.filter((t) =>
    !search || (t.nom || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Programmes de dressage</h1>
          <p className="text-gray-500 text-sm mt-1">Choisissez une formation adaptée à votre animal</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => <TrainingSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-green-600 hover:underline">
              Réessayer
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🤺</p>
            <p className="text-gray-400 text-sm">
              {types.length === 0 ? "Aucun programme disponible pour l'instant" : "Aucun résultat pour cette recherche"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((t) => (
              <TrainingCard key={t.id ?? t.idType} type={t} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;

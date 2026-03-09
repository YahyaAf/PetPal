import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hotelService from "../../services/hotelService";
import cityService from "../../services/cityService";

// ─── Skeleton ────────────────────────────────────────────────
const HotelSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-10 bg-gray-100 rounded-xl mt-4" />
    </div>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────
const HotelCard = ({ hotel, onBook }) => {
  const nom      = hotel.nom        || hotel.name          || "Hôtel";
  const ville    = hotel.city?.nomVille || "—";
  const prix     = hotel.prixParJour ?? null;
  const places   = hotel.countOfPlace ?? hotel.capacite    ?? null;
  const imageUrl = hotel.imageUrl   || hotel.image         || null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={nom} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏨</span>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-gray-800 text-base leading-snug">{nom}</h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <span>📍</span> {ville}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          {prix != null && (
            <span className="font-semibold text-blue-600 text-sm">{Number(prix).toFixed(2)} MAD / jour</span>
          )}
          {places != null && (
            <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
              {places} place{places > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          onClick={() => onBook(hotel)}
          className="mt-auto w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Réserver
        </button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const HotelsPage = () => {
  const navigate          = useNavigate();
  const [hotels,  setHotels]  = useState([]);
  const [cities,  setCities]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,       setSearch]       = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [hotelsData, citiesData] = await Promise.all([
          hotelService.getAll(),
          cityService.getAll(),
        ]);
        setHotels(Array.isArray(hotelsData) ? hotelsData : (hotelsData?.content ?? []));
        setCities(Array.isArray(citiesData) ? citiesData : (citiesData?.content ?? []));
      } catch {
        setError("Impossible de charger les hôtels. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBook = (hotel) => {
    navigate(`/hotels/${hotel.id ?? hotel.idHotel}/book`, { state: { hotel } });
  };

  const visible = hotels.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (h.nom || "").toLowerCase().includes(q);
    const matchCity   = !selectedCity || (h.city?.idCity ?? h.city?.id) === Number(selectedCity);
    return matchSearch && matchCity;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hôtels disponibles</h1>
          <p className="text-gray-500 text-sm mt-1">Réservez un hébergement confortable pour votre animal</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search by name */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* City filter */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">📍</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">Toutes les villes</option>
              {cities.map((c) => (
                <option key={c.idCity ?? c.id} value={c.idCity ?? c.id}>
                  {c.nomVille ?? c.nom}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
          </div>

          {/* Active filters count */}
          {(search || selectedCity) && (
            <button
              onClick={() => { setSearch(""); setSelectedCity(""); }}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl bg-white"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => <HotelSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏨</p>
            <p className="text-gray-400 text-sm">
              {hotels.length === 0 ? "Aucun hôtel disponible pour l'instant" : "Aucun hôtel ne correspond à vos filtres"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((hotel) => (
              <HotelCard key={hotel.id ?? hotel.idHotel} hotel={hotel} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;

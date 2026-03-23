import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hotelService from "../../services/hotelService";
import cityService from "../../services/cityService";

const ORANGE = "#E8720C";

const HotelSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden animate-pulse" style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)" }}>
    <div className="h-48 bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-10 bg-gray-100 rounded-xl mt-4" />
    </div>
  </div>
);

const HotelCard = ({ hotel, onBook }) => {
  const nom      = hotel.nom        || hotel.name      || "H\u00f4tel";
  const ville    = hotel.city?.nomVille                || "\u2014";
  const prix     = hotel.prixParJour ?? null;
  const places   = hotel.countOfPlace ?? hotel.capacite ?? null;
  const imageUrl = hotel.imageUrl   || hotel.image     || null;

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
      style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 150 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#FFF4EB" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: ORANGE }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
        )}
        {prix != null && (
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: ORANGE }}>
            {Number(prix).toFixed(0)} MAD / j
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{nom}</h3>
          <div className="flex items-center gap-1 mt-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-[11px] text-gray-400">{ville}</span>
          </div>
        </div>

        {places != null && (
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span className="text-[11px] text-gray-400">{places} place{places > 1 ? "s" : ""}</span>
          </div>
        )}

        <button
          onClick={() => onBook(hotel)}
          className="mt-auto w-full py-2 rounded-xl text-white text-xs font-bold transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}
        >
          R&#233;server
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

  // Pagination logic
  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedHotels = visible.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setSelectedCity("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", fontFamily: "'Inter','Poppins',sans-serif" }}>

      {/* HERO */}
      <section style={{ background: "#ffffff" }} className="overflow-hidden p-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end" style={{ minHeight: 300 }}>
          <div className="flex-1 px-10 lg:px-16 flex flex-col justify-center pb-10 pt-10 lg:pt-0">
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-gray-400">PetPal H&#244;tels</p>
            <h1 className="text-[1.7rem] lg:text-[2.2rem] font-extrabold leading-tight mb-2" style={{ color: ORANGE }}>
              H&#233;bergement pour<br />vos compagnons
            </h1>
            <p className="text-gray-400 text-sm">Des s&#233;jours confortables et s&#233;curis&#233;s pour votre animal.</p>
          </div>
          <div className="w-full lg:w-[38%] flex items-end justify-center self-end px-6 lg:px-0" style={{ maxHeight: 300 }}>
            <div className="relative w-full" style={{ maxHeight: 300 }}>
              <div
                className="absolute -inset-2 rounded-3xl pointer-events-none"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  filter: "blur(10px)",
                }}
              />
              <div
                className="relative w-full p-2 rounded-3xl border border-gray-100 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.86)",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              >
                <img
                  src="/hotel.jpg"
                  alt="hotel animaux"
                  className="w-full object-cover rounded-2xl"
                  style={{ maxHeight: 284, filter: "contrast(0.95) brightness(1.02) saturate(0.95)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* Filters */}
        <div className="bg-white rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row gap-3 items-center" style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.05)" }}>
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un h&#244;tel&#8230;"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 focus:outline-none"
            />
          </div>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="rounded-xl pl-10 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-100 focus:outline-none appearance-none cursor-pointer"
              style={{ minWidth: 180 }}
            >
              <option value="">Toutes les villes</option>
              {cities.map((c) => (
                <option key={c.idCity ?? c.id} value={c.idCity ?? c.id}>{c.nomVille ?? c.nom}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          {(search || selectedCity) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              R&#233;initialiser
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <HotelSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 text-gray-300 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm font-bold hover:underline" style={{ color: ORANGE }}>R&#233;essayer</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF4EB" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: ORANGE }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              {hotels.length === 0 ? "Aucun h\u00f4tel disponible pour l'instant" : "Aucun h\u00f4tel ne correspond \u00e0 vos filtres"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {paginatedHotels.map((hotel) => (
                <HotelCard key={hotel.id ?? hotel.idHotel} hotel={hotel} onBook={handleBook} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                &#8592; Précédent
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 text-sm font-medium rounded-full transition-colors"
                  style={page === currentPage
                    ? { background: ORANGE, color: "#fff", border: `2px solid ${ORANGE}` }
                    : { border: "1px solid #e5e7eb", color: "#555" }
                  }
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant &#8594;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;

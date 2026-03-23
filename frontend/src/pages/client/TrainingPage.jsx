import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import trainingTypeService from "../../services/trainingTypeService";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

// ─── Skeleton ─────────────────────────────────────────────────
const TrainingSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden animate-pulse" style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)" }}>
    <div className="h-32 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-9 bg-gray-100 rounded-xl mt-3" />
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
    <div className="bg-white rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col" style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)" }}>
      {/* Banner */}
      <div className="h-32 flex items-center justify-center" style={{ background: ORANGE_LIGHT }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-11 h-11" style={{ color: ORANGE }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.5 4.5 0 0112 17.25a4.5 4.5 0 01-3.182-.932m6.364 0A4.5 4.5 0 0016.5 13.5v-.75A4.5 4.5 0 0012 8.25a4.5 4.5 0 00-4.5 4.5v.75a4.5 4.5 0 001.318 2.818m6.364 0l1.06 1.06a.75.75 0 010 1.061l-.53.53a.75.75 0 01-1.06 0l-1.06-1.06m-4.774-1.06l-1.06 1.06a.75.75 0 000 1.061l.53.53a.75.75 0 001.06 0l1.06-1.06M9.75 4.5a2.25 2.25 0 114.5 0" />
        </svg>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{nom}</h3>
          {description && (
            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span className="font-extrabold text-sm" style={{ color: ORANGE }}>{Number(prix).toFixed(2)} MAD</span>
          <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-[11px]">
            {duree} jour{duree > 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => onBook(type)}
          className="mt-auto w-full py-2.5 text-white text-xs font-bold rounded-xl transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    trainingTypeService.getAll()
      .then((data) => setTypes(Array.isArray(data) ? data : (data?.content ?? [])))
      .catch(() => setError("Impossible de charger les formations."))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (type) => {
    navigate(`/training/${type.id ?? type.idType}/book`, { state: { trainingType: type } });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const visible = types.filter((t) =>
    !search || (t.nom || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedTrainings = visible.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Poppins',sans-serif" }}>
      {/* HERO */}
      <section className="overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end" style={{ minHeight: 300 }}>
          <div className="flex-1 px-10 lg:px-16 flex flex-col justify-center pb-10 pt-10 lg:pt-0">
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-gray-400">PetPal Dressage</p>
            <h1 className="text-[1.7rem] lg:text-[2.2rem] font-extrabold leading-tight mb-2" style={{ color: ORANGE }}>
              Programmes de<br />dressage
            </h1>
            <p className="text-gray-400 text-sm">Des formations claires et adaptées au rythme de votre animal.</p>
          </div>
          <div className="w-full lg:w-[34%] flex items-end justify-center self-end px-6 lg:px-0" style={{ maxHeight: 280 }}>
            <div className="w-full rounded-3xl border border-gray-100 p-4" style={{ background: ORANGE_LIGHT, boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}>
              <div className="h-52 rounded-2xl overflow-hidden bg-white/80 p-1">
                <img
                  src="/dressage.jpg"
                  alt="dressage"
                  className="w-full h-full object-contain"
                  style={{ filter: "contrast(0.97) brightness(1.02)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Search */}
        <div className="bg-white rounded-2xl px-5 py-4 mb-6" style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.05)" }}>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <TrainingSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">⚠️</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm hover:underline" style={{ color: ORANGE }}>
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {paginatedTrainings.map((t) => (
                <TrainingCard key={t.id ?? t.idType} type={t} onBook={handleBook} />
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

export default TrainingPage;

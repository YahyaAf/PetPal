import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

const ORANGE = "#E8720C";
const PRODUCTS_PER_PAGE = 8;

const ProductCard = ({ product }) => (
  <Link
    to={`/products/${product.id}`}
    className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
    style={{ border: "1px solid #f0f0f0" }}
  >
    {/* Image */}
    <div className="relative bg-gray-50 flex items-center justify-center overflow-hidden" style={{ height: 200 }}>
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.nom}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
      ) : null}
      <div className="w-full h-full items-center justify-center text-gray-200"
        style={{ display: product.imageUrl ? "none" : "flex" }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path d="M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 10c-2.5 0-6 1.5-6 4.5V17h12v-2.5c0-3-3.5-4.5-6-4.5z"/></svg>
      </div>
      {product.stock === 0 && (
        <div className="absolute top-0 right-0 w-0 h-0" style={{
          borderTop: "52px solid #ef4444",
          borderLeft: "52px solid transparent",
        }}>
          <span className="absolute text-white text-[9px] font-bold" style={{ top: -46, right: 2 }}>RUPTURE</span>
        </div>
      )}
    </div>

    {/* Info */}
    <div className="p-4 flex flex-col gap-1 flex-1">
      <span className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">{product.categoryNom}</span>
      <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{product.nom}</h3>
      <div className="mt-auto pt-3 flex items-center justify-between">
        <span className="font-bold text-base" style={{ color: ORANGE }}>{product.prix} MAD</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
          product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}>
          {product.stock > 0 ? "En stock" : "Indisponible"}
        </span>
      </div>
    </div>
  </Link>
);

const TABS = ["Tous", "Nouveautés", "Populaires"];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [prods, cats] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch {
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory) result = result.filter((p) => String(p.categoryId) === selectedCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.nom.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return result;
  }, [products, selectedCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safeCurrentPage - 1) * PRODUCTS_PER_PAGE, safeCurrentPage * PRODUCTS_PER_PAGE);

  const handleSearch = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const handleCategory = (catId) => { setSelectedCategory(catId); setCurrentPage(1); };
  const hasActiveFilters = !!(search || selectedCategory);

  return (
    <div className="min-h-screen" style={{ background: "#fff", fontFamily: "'Inter','Poppins',sans-serif" }}>

      {/* â”€â”€ HERO BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section style={{ background: "#f5f5f5" }} className="overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-end gap-0" style={{ minHeight: 440 }}>
          {/* Left */}
          <div className="flex-1 px-10 lg:px-16 flex flex-col justify-center pb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3 text-gray-400">Bienvenue sur PetPal</p>
            <h1 className="text-[2.6rem] lg:text-[3.8rem] font-extrabold leading-tight mb-4" style={{ color: ORANGE }}>
              Produits pour<br />vos animaux
            </h1>
            <p className="text-gray-400 text-base">Tout ce dont votre compagnon a besoin, en un seul endroit.</p>
          </div>
          {/* Right - hero image */}
          <div className="w-full lg:w-[44%] flex items-end justify-center self-end" style={{ maxHeight: 460 }}>
            <img
              src="/boutique.png"
              alt="pet products"
              className="w-full object-contain"
              style={{ maxHeight: 460, mixBlendMode: "multiply" }}
            />
          </div>
        </div>
      </section>

      {/* â”€â”€ PROMO BANNERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="relative rounded-2xl overflow-hidden flex items-center gap-6 px-8 py-7" style={{ background: "#fdf3e8", minHeight: 140 }}>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase mb-1">Accessoires</p>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Jouets & Accessoires</h3>
            <p className="text-xs font-bold mb-3" style={{ color: ORANGE }}>JUSQU'A 20% DE REDUCTION</p>
            <Link to="#products" className="text-xs font-bold underline text-gray-700 hover:text-orange-600 transition-colors">Voir tout â†’</Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&auto=format&fit=crop&q=80"
            alt="dog toy"
            className="w-28 h-28 object-cover rounded-xl shrink-0"
          />
        </div>
        <div className="relative rounded-2xl overflow-hidden flex items-center gap-6 px-8 py-7" style={{ background: "#f0f7f0", minHeight: 140 }}>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase mb-1">Alimentation</p>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Nourriture Premium</h3>
            <p className="text-xs font-bold mb-3 text-green-600">QUALITE GARANTIE</p>
            <Link to="#products" className="text-xs font-bold underline text-gray-700 hover:text-green-600 transition-colors">Voir tout â†’</Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&auto=format&fit=crop&q=80"
            alt="dog food"
            className="w-28 h-28 object-cover rounded-xl shrink-0"
          />
        </div>
      </section>

      {/* â”€â”€ PRODUCTS SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">

        {/* Section title */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest uppercase mb-1 text-gray-400">Boutique</p>
          <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide">Nos Meilleurs Produits</h2>
        </div>

        {/* Tabs + search row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                style={activeTab === tab
                  ? { background: ORANGE, color: "#fff", border: `1.5px solid ${ORANGE}` }
                  : { background: "#fff", color: "#555", border: "1.5px solid #e5e7eb" }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search + category */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                value={search}
                onChange={handleSearch}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 bg-white"
                style={{ "--tw-ring-color": ORANGE }}
                placeholder="Rechercher..."
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategory(e.target.value)}
              className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none bg-white text-gray-600"
            >
              <option value="">Toutes catégories</option>
              {categories.map((c) => (
                <option key={c.idCategory} value={c.idCategory}>{c.nom}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => { setSearch(""); setSelectedCategory(""); setCurrentPage(1); }}
                className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-full hover:bg-gray-50"
              >âœ•</button>
            )}
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <button
              onClick={() => handleCategory("")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={!selectedCategory
                ? { background: "#1a1a1a", color: "#fff" }
                : { background: "#f5f5f5", color: "#555" }
              }
            >Tout</button>
            {categories.map((c) => (
              <button
                key={c.idCategory}
                onClick={() => handleCategory(String(c.idCategory))}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={selectedCategory === String(c.idCategory)
                  ? { background: ORANGE, color: "#fff" }
                  : { background: "#f5f5f5", color: "#555" }
                }
              >{c.nom}</button>
            ))}
          </div>
        )}

        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">{error}</div>}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid #f0f0f0" }}>
                <div className="bg-gray-100" style={{ height: 200 }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 mb-4 mx-auto text-gray-200"><path d="M4.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 10c-2.5 0-6 1.5-6 4.5V17h12v-2.5c0-3-3.5-4.5-6-4.5z"/></svg>
            <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
            {hasActiveFilters && (
              <button onClick={() => { setSearch(""); setSelectedCategory(""); }} className="mt-3 text-sm hover:underline" style={{ color: ORANGE }}>
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-700">{filtered.length}</span> produit{filtered.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-400">Page {safeCurrentPage} / {totalPages}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
              {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >&#8592; Pr&#233;c&#233;dent</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9 text-sm rounded-full font-medium transition-colors"
                    style={page === safeCurrentPage
                      ? { background: ORANGE, color: "#fff" }
                      : { border: "1px solid #e5e7eb", color: "#555" }
                    }
                  >{page}</button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >Suivant â†’</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;

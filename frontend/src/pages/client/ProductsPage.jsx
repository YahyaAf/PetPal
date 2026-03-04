import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

const PRODUCTS_PER_PAGE = 9;

const ProductCard = ({ product }) => (
  <Link to={`/products/${product.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col">
    <div className="relative h-52 bg-white overflow-hidden flex items-center justify-center p-3">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.nom}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
      ) : null}
      <div
        className="w-full h-full items-center justify-center text-gray-300 text-4xl"
        style={{ display: product.imageUrl ? "none" : "flex" }}
      >
        📦
      </div>
      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-600 shadow-sm">
        {product.categoryNom}
      </span>
      {product.stock === 0 && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
          Rupture
        </span>
      )}
    </div>

    <div className="p-4 flex flex-col flex-1 gap-2">
      <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.nom}</h3>
      {product.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{product.description}</p>
      )}
      <div className="mt-auto pt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-blue-600">{product.prix} MAD</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
        }`}>
          {product.stock > 0 ? `${product.stock} en stock` : "Indisponible"}
        </span>
      </div>
    </div>
  </Link>
);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
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
    if (selectedCategory) {
      result = result.filter((p) => String(p.categoryId) === selectedCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * PRODUCTS_PER_PAGE,
    safeCurrentPage * PRODUCTS_PER_PAGE
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategory = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(search || selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Notre boutique</p>
          <h1 className="text-3xl font-bold text-gray-900">Produits pour vos animaux</h1>
          <p className="text-gray-500 mt-2">Découvrez notre sélection de produits de qualité pour le bien-être de vos compagnons.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Rechercher un produit..."
            />
          </div>

          <select
            value={selectedCategory}
            onChange={handleCategory}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[200px]"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.idCategory} value={c.idCategory}>{c.nom}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 font-medium">Aucun produit trouvé</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{filtered.length}</span> produit{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-gray-400">
                Page {safeCurrentPage} / {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm rounded-xl font-medium transition-colors ${
                      page === safeCurrentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, Search, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const Store = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const initCat = params.get('category') || 'Todos';

  const { addToCart, toggleFavorite, isFavorite, products, brands, categories: dbCategories, isLoadingProducts } = useShop();

  // Filters state
  const [category, setCategory] = useState(initCat);
  const [brand, setBrand] = useState('Todas');
  const [family, setFamily] = useState(params.get('family') || 'Todas');
  const [priceRange, setPriceRange] = useState('Todos');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('destacados'); // destacados, recientes, precio_asc, precio_desc, nombre
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageInUrl = params.get('page');
    if (pageInUrl && !isNaN(parseInt(pageInUrl, 10))) {
      return parseInt(pageInUrl, 10);
    }
    try {
      const savedPage = sessionStorage.getItem('perfume_store_page');
      if (savedPage && !isNaN(parseInt(savedPage, 10))) {
        return parseInt(savedPage, 10);
      }
    } catch {}
    return 1;
  });
  const PRODUCTS_PER_PAGE = 16; // Entre 15 y 20 productos por página según requerimiento
  const gridTopRef = useRef(null);
  const isFilterMounted = useRef(false);
  const prevSearchRef = useRef(search);

  // Cambia de página y deja la vista al inicio del catálogo (nunca en el footer)
  const goToPage = (page) => {
    setCurrentPage(page);
    try {
      sessionStorage.setItem('perfume_store_page', String(page));
    } catch {}
    requestAnimationFrame(() => {
      const el = gridTopRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
  };

  // Sync state when URL params change (e.g. user clicked /tienda?category=Mujer)
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search;
      const currentCat = params.get('category') || 'Todos';
      const pageInUrl = params.get('page');
      setCategory(currentCat);
      if (pageInUrl && !isNaN(parseInt(pageInUrl, 10))) {
        setCurrentPage(parseInt(pageInUrl, 10));
      } else {
        setCurrentPage(1);
        try { sessionStorage.setItem('perfume_store_page', '1'); } catch {}
      }
    }
  }, [search]);

  // Reset page ONLY when user interactively changes filters (NOT on initial mount)
  useEffect(() => {
    if (!isFilterMounted.current) {
      isFilterMounted.current = true;
      return;
    }
    setCurrentPage(1);
    try {
      sessionStorage.setItem('perfume_store_page', '1');
    } catch {}
  }, [category, brand, family, priceRange, query, sortBy]);

  const PRICE_RANGES = [
    { label: 'Todos', min: 0, max: Infinity },
    { label: 'Hasta $100.000', min: 0, max: 100000 },
    { label: '$100.000 - $200.000', min: 100000, max: 200000 },
    { label: '$200.000 - $300.000', min: 200000, max: 300000 },
    { label: 'Más de $300.000', min: 300000, max: Infinity },
  ];

  const families = useMemo(() => {
    const set = new Map();
    products.forEach(p => {
      const f = (p.family || '').trim();
      if (f && !set.has(f.toLowerCase())) set.set(f.toLowerCase(), f);
    });
    return [...set.values()].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const categories = ['Todos', ...dbCategories.map(c => c.name), 'Ofertas'];

  // Apply filters and sorting
  const filteredAndSorted = useMemo(() => {
    let result = products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const selCat = (category || '').toLowerCase();
      const matchCat = selCat === 'todos' || 
                       (pCat && pCat === selCat) || 
                       (selCat === 'hombre' && (pCat.includes('masc') || pCat.includes('homb'))) ||
                       (selCat === 'mujer' && (pCat.includes('fem') || pCat.includes('muj'))) ||
                       (category === 'Ofertas' && p.discount);
      const matchBrand = brand === 'Todas' || 
                         (p.brand && p.brand.toLowerCase() === brand.toLowerCase());
      const matchFamily = family === 'Todas' ||
                          ((p.family || '').trim().toLowerCase() === family.toLowerCase());
      const range = PRICE_RANGES.find(r => r.label === priceRange) || PRICE_RANGES[0];
      const price = Number(p.price) || 0;
      const matchPrice = price >= range.min && price <= range.max;
      const matchQ = !query || 
                     (p.name && p.name.toLowerCase().includes(query.toLowerCase())) || 
                     (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchBrand && matchFamily && matchPrice && matchQ;
    });

    switch (sortBy) {
      case 'precio_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'precio_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nombre':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      // destacados y recientes mantienen el orden original por ahora (mock)
      default:
        break;
    }

    return result;
  }, [products, category, brand, family, priceRange, query, sortBy]);

  const clearFilters = () => {
    setCategory('Todos');
    setBrand('Todas');
    setFamily('Todas');
    setPriceRange('Todos');
    setQuery('');
    setSortBy('destacados');
    setCurrentPage(1);
    try {
      sessionStorage.setItem('perfume_store_page', '1');
    } catch {}
    setFilterOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '106px', paddingBottom: '4rem', backgroundColor: 'var(--color-white)' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.65rem', letterSpacing: '3px' }}>DFV PERFUMES</p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: '400', marginBottom: '0.5rem', color: 'var(--color-black)' }}>Catálogo</h1>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>Explora nuestra selección premium de fragancias.</p>
        </div>

        {/* Search + Filter Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre o casa…"
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="desktop-only" style={{ position: 'relative' }}>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '0.85rem 2.5rem 0.85rem 1rem', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.75rem', 
                  letterSpacing: '1px', textTransform: 'uppercase', appearance: 'none', backgroundColor: 'transparent',
                  fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="destacados">Destacados</option>
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre (A-Z)</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                border: '1px solid var(--color-black)',
                fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase',
                backgroundColor: 'var(--color-black)', color: '#fff', cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={14} /> FILTRAR
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div ref={gridTopRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)', letterSpacing: '0.5px' }}>
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </span>
          {(category !== 'Todos' || brand !== 'Todas' || family !== 'Todas' || priceRange !== 'Todos' || query !== '') && (
            <button onClick={clearFilters} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-black)', borderBottom: '1px solid', paddingBottom: '2px', cursor: 'pointer', background: 'transparent' }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoadingProducts ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', minHeight: '70vh', alignContent: 'start' }} className="store-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '4/5', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '0.75rem', animation: 'pulseSkeleton 1.5s ease-in-out infinite' }} />
                <div style={{ height: '12px', width: '40%', backgroundColor: '#f3f4f6', marginBottom: '8px', borderRadius: '4px' }} />
                <div style={{ height: '16px', width: '80%', backgroundColor: '#f3f4f6', marginBottom: '10px', borderRadius: '4px' }} />
                <div style={{ height: '14px', width: '50%', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
              </div>
            ))}
            <style>{`@keyframes pulseSkeleton { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Search size={40} style={{ color: 'var(--color-gray-light)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--color-black)' }}>No encontramos productos</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '2rem' }}>Intenta ajustando los filtros o la búsqueda.</p>
            <button onClick={clearFilters} className="btn-primary">Ver todo el catálogo</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', minHeight: '70vh', alignContent: 'start' }} className="store-grid">
              {filteredAndSorted
                .slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
                .map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onFav={() => toggleFavorite(p)}
                    fav={isFavorite(p.id)}
                    onAdd={() => addToCart(p, 1, p.sizes?.[0])}
                  />
                ))}
            </div>

            {/* Paginación con números y flechitas cuando hay más de una página */}
            {Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE) > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}>
                {/* Flecha Anterior */}
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #EAE8E4',
                    backgroundColor: '#FFFFFF',
                    color: currentPage === 1 ? '#D1CCC4' : '#050505',
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <ChevronLeft size={18} strokeWidth={1.8} />
                </button>

                {/* Números de página */}
                {Array.from({ length: Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        border: isActive ? '1px solid #050505' : '1px solid #EAE8E4',
                        backgroundColor: isActive ? '#050505' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#333333',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Flecha Siguiente */}
                <button
                  onClick={() => goToPage(Math.min(Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE)}
                  aria-label="Página siguiente"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid #EAE8E4',
                    backgroundColor: '#FFFFFF',
                    color: currentPage >= Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE) ? '#D1CCC4' : '#050505',
                    cursor: currentPage >= Math.ceil(filteredAndSorted.length / PRODUCTS_PER_PAGE) ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <ChevronRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Filter Panel (Mobile & Desktop Overlay) ── */}
      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1998, backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '380px',
            background: 'var(--color-white)', zIndex: 1999, padding: '2rem',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', letterSpacing: '1px' }}>Filtros</h3>
              <button onClick={() => setFilterOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} color="var(--color-black)" /></button>
            </div>

            {/* Ordenar en móvil */}
            <div className="mobile-only" style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem', fontWeight: '600' }}>Ordenar por</p>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.85rem', appearance: 'none', backgroundColor: 'transparent', outline: 'none' }}
              >
                <option value="destacados">Destacados</option>
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre (A-Z)</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem', fontWeight: '600' }}>Categoría / Género</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {categories.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={category === c} 
                      onChange={() => setCategory(c)} 
                      style={{ accentColor: 'var(--color-black)', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: category === c ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: category === c ? '500' : '400' }}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem', fontWeight: '600' }}>Precio</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {PRICE_RANGES.map(r => (
                  <label key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="radio" name="price" checked={priceRange === r.label} onChange={() => setPriceRange(r.label)} style={{ accentColor: 'var(--color-black)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '0.9rem', color: priceRange === r.label ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: priceRange === r.label ? '500' : '400' }}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem', fontWeight: '600' }}>Casa</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                  <input type="radio" name="brand" checked={brand === 'Todas'} onChange={() => setBrand('Todas')} style={{ accentColor: 'var(--color-black)', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.9rem', color: brand === 'Todas' ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: brand === 'Todas' ? '500' : '400' }}>Todas las casas</span>
                </label>
                {brands.map(b => (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="radio" name="brand" checked={brand === b} onChange={() => setBrand(b)} style={{ accentColor: 'var(--color-black)', width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '0.9rem', color: brand === b ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: brand === b ? '500' : '400' }}>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
              <button onClick={clearFilters} style={{ flex: 1, padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>Limpiar</button>
              <button onClick={() => setFilterOpen(false)} style={{ flex: 1, padding: '1rem', border: '1px solid var(--color-black)', background: 'var(--color-black)', color: '#fff', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>Aplicar</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .store-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 768px)  { .store-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; } }
      `}</style>
    </div>
  );
};

export default Store;

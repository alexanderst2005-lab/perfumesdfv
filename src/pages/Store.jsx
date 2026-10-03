import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, Search, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const Store = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const initCat = params.get('category') || 'Todos';

  const { addToCart, toggleFavorite, isFavorite, products, brands, isLoadingProducts } = useShop();

  // Filters state
  const [category, setCategory] = useState(initCat);
  const [brand, setBrand] = useState('Todas');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('destacados'); // destacados, recientes, precio_asc, precio_desc, nombre
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Ofertas'];

  // Apply filters and sorting
  const filteredAndSorted = useMemo(() => {
    let result = products.filter(p => {
      const matchCat = category === 'Todos' || p.category === category || (category === 'Ofertas' && p.discount);
      const matchBrand = brand === 'Todas' || p.brand === brand;
      const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchBrand && matchQ;
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
  }, [category, brand, query, sortBy]);

  const clearFilters = () => {
    setCategory('Todos');
    setBrand('Todas');
    setQuery('');
    setSortBy('destacados');
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
              placeholder="Buscar por nombre o marca…"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray)', letterSpacing: '0.5px' }}>
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </span>
          {(category !== 'Todos' || brand !== 'Todas' || query !== '') && (
            <button onClick={clearFilters} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-black)', borderBottom: '1px solid', paddingBottom: '2px', cursor: 'pointer', background: 'transparent' }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {filteredAndSorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Search size={40} style={{ color: 'var(--color-gray-light)', marginBottom: '1.5rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--color-black)' }}>No encontramos productos</h3>
            <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '2rem' }}>Intenta ajustando los filtros o la búsqueda.</p>
            <button onClick={clearFilters} className="btn-primary">Ver todo el catálogo</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }} className="store-grid">
            {filteredAndSorted.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onFav={() => toggleFavorite(p)}
                fav={isFavorite(p.id)}
                onAdd={() => addToCart(p, 1, p.sizes?.[0])}
              />
            ))}
          </div>
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

            <div style={{ marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem', fontWeight: '600' }}>Marcas</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                  <input type="radio" name="brand" checked={brand === 'Todas'} onChange={() => setBrand('Todas')} style={{ accentColor: 'var(--color-black)', width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.9rem', color: brand === 'Todas' ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: brand === 'Todas' ? '500' : '400' }}>Todas las marcas</span>
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
        @media (max-width: 1024px) { .store-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 768px)  { .store-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; } }
      `}</style>
    </div>
  );
};

export default Store;

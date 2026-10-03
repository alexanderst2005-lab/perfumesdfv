import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, Search, Heart } from 'lucide-react';
import { products, brands } from '../data/mockProducts';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const TOTAL_HEADER = 106;

const Store = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const initCat = params.get('category') || 'Todos';

  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const [category, setCategory] = useState(initCat);
  const [brand, setBrand] = useState('Todas');
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Ofertas'];

  const filtered = products.filter(p => {
    const matchCat = category === 'Todos' || p.category === category || (category === 'Ofertas' && p.discount);
    const matchBrand = brand === 'Todas' || p.brand === brand;
    const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchBrand && matchQ;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: `${TOTAL_HEADER + 40}px`, paddingBottom: '4rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>DFV PERFUMES</p>
          <h1 className="title-lg" style={{ marginBottom: '0.75rem' }}>Perfumes</h1>
          <p style={{ color: 'var(--color-gray)', fontSize: '0.95rem' }}>Explora nuestra colección de fragancias.</p>
        </div>

        {/* Search + Filter Row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar perfumes…"
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.8rem',
                border: '1px solid var(--color-gray-light)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              border: '1px solid var(--color-gray-light)',
              fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase',
              backgroundColor: 'transparent', cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={16} /> FILTRAR
          </button>
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '0.5rem 1.2rem',
                border: '1px solid',
                borderColor: category === c ? 'var(--color-black)' : 'var(--color-gray-light)',
                backgroundColor: category === c ? 'var(--color-black)' : 'transparent',
                color: category === c ? '#fff' : 'var(--color-black)',
                fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase',
                whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-gray)' }}>
            No se encontraron fragancias con esos filtros.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="store-grid">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onFav={() => toggleFavorite(p)}
                fav={isFavorite(p.id)}
                onAdd={() => addToCart(p, 1, p.sizes[0])}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Filter Panel ── */}
      {filterOpen && (
        <>
          <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1998 }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px',
            background: '#fff', zIndex: 1999, padding: '2rem',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Filtros</h3>
              <button onClick={() => setFilterOpen(false)}><X size={22} /></button>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem' }}>Género</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {categories.map(c => (
                  <button key={c} onClick={() => { setCategory(c); setFilterOpen(false); }} style={{ textAlign: 'left', fontSize: '0.9rem', fontWeight: category === c ? '600' : '400', color: category === c ? 'var(--color-black)' : 'var(--color-gray)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '1rem' }}>Marcas</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <button onClick={() => { setBrand('Todas'); setFilterOpen(false); }} style={{ textAlign: 'left', fontSize: '0.9rem', fontWeight: brand === 'Todas' ? '600' : '400', color: brand === 'Todas' ? 'var(--color-black)' : 'var(--color-gray)' }}>
                  Todas
                </button>
                {brands.map(b => (
                  <button key={b} onClick={() => { setBrand(b); setFilterOpen(false); }} style={{ textAlign: 'left', fontSize: '0.9rem', fontWeight: brand === b ? '600' : '400', color: brand === b ? 'var(--color-black)' : 'var(--color-gray)' }}>
                    {b}
                  </button>
                ))}
              </div>
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

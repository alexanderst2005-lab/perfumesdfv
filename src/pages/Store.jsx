import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, X, Heart, Search } from 'lucide-react';
import { products, brands } from '../data/mockProducts';

const Store = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Sets', 'Lujo', 'Ofertas'];

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory || (selectedCategory === 'Ofertas' && p.discount);
    const matchBrand = selectedBrand === 'Todas' || p.brand === selectedBrand;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchBrand && matchSearch;
  });

  return (
    <div className="container section-padding" style={{ paddingBottom: '100px' }}>
      
      {/* Header del Catálogo */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Perfumes</h1>
        <p style={{ color: 'var(--color-gray)', fontSize: '1.1rem' }}>Encuentra una fragancia para cada momento.</p>
      </div>
      
      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
          <input 
            type="text" 
            placeholder="Buscar perfumes, marcas o estilos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid var(--color-gray-light)', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="mobile-filter-btn" 
            onClick={() => setIsFilterOpen(true)}
            style={{ display: 'none', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', border: '1px solid var(--color-black)', backgroundColor: 'transparent', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}
          >
            <SlidersHorizontal size={16} /> FILTRAR
          </button>
          
          <button style={{ alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', border: '1px solid var(--color-gray-light)', backgroundColor: 'transparent', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
            ORDENAR
          </button>
        </div>
      </div>
      
      <div className="store-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem' }}>
        
        {/* Filters Sidebar */}
        <div className={`filter-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-serif)' }}>Filtros</h3>
            <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)} style={{ display: 'none' }}><X size={24} /></button>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)' }}>Género</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }}
                    style={{ color: selectedCategory === cat ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: selectedCategory === cat ? '500' : '400', textAlign: 'left', width: '100%', fontSize: '0.9rem' }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-gray)' }}>Marcas</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li key="Todas">
                <button 
                  onClick={() => { setSelectedBrand('Todas'); setIsFilterOpen(false); }}
                  style={{ color: selectedBrand === 'Todas' ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: selectedBrand === 'Todas' ? '500' : '400', textAlign: 'left', width: '100%', fontSize: '0.9rem' }}
                >
                  Todas
                </button>
              </li>
              {brands.map(brand => (
                <li key={brand}>
                  <button 
                    onClick={() => { setSelectedBrand(brand); setIsFilterOpen(false); }}
                    style={{ color: selectedBrand === brand ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: selectedBrand === brand ? '500' : '400', textAlign: 'left', width: '100%', fontSize: '0.9rem' }}
                  >
                    {brand}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Product Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-gray)' }}>
              No se encontraron fragancias con los filtros seleccionados.
            </div>
          ) : (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/producto/${product.id}`} style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden', backgroundColor: 'var(--color-cream)', marginBottom: '1rem' }}>
                    <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                  <button style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-black)', backgroundColor: 'rgba(255,255,255,0.8)', padding: '8px', borderRadius: '50%' }}>
                    <Heart size={18} />
                  </button>
                  <Link to={`/producto/${product.id}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>{product.brand}</p>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '0.5rem' }}>100 ml</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <p style={{ fontWeight: '500' }}>${product.price}</p>
                      <button style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--color-black)', backgroundColor: 'transparent', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Agregar</button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .store-layout {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: flex !important;
          }
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          .filter-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0; width: 300px;
            background: white;
            z-index: 2000;
            padding: 2rem;
            border-right: none !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
          }
          .filter-sidebar.open {
            transform: translateX(0);
          }
          .close-filter-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Store;

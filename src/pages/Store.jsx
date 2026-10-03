import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { products, brands } from '../data/mockProducts';

const Store = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const categories = ['Todos', 'Hombre', 'Mujer', 'Unisex', 'Sets'];

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    if (selectedBrand !== 'Todas' && p.brand !== selectedBrand) return false;
    return true;
  });

  return (
    <div className="container section-padding">
      <h1 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Colección Exclusiva</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button 
          className="mobile-filter-btn" 
          onClick={() => setIsFilterOpen(true)}
          style={{ display: 'none', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', backgroundColor: 'var(--color-black)', color: 'white' }}
        >
          <SlidersHorizontal size={18} /> FILTRAR
        </button>
      </div>
      
      <div className="store-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        {/* Filters (Desktop / Modal Mobile) */}
        <div className={`filter-sidebar ${isFilterOpen ? 'open' : ''}`} style={{ paddingRight: '2rem', borderRight: '1px solid var(--color-gray-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Filtros</h3>
            <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)} style={{ display: 'none' }}><X size={24} /></button>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-gray)' }}>CATEGORÍA</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setSelectedCategory(cat)}
                    style={{ color: selectedCategory === cat ? 'var(--color-black)' : 'var(--color-gray)', fontWeight: selectedCategory === cat ? '600' : '400', textAlign: 'left', width: '100%' }}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-gray)' }}>MARCA</h4>
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--color-gray-light)', backgroundColor: 'transparent', outline: 'none' }}
            >
              <option value="Todas">Todas las marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--color-gray)' }}>Mostrando {filteredProducts.length} productos</p>
            <select style={{ padding: '0.8rem', border: '1px solid var(--color-gray-light)', backgroundColor: 'transparent', outline: 'none' }}>
              <option>Ordenar por: Relevancia</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <p>No se encontraron productos con estos filtros.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{ textAlign: 'center' }}>
                  <Link to={`/producto/${product.id}`}>
                    <div style={{ position: 'relative', paddingBottom: '120%', overflow: 'hidden', backgroundColor: 'var(--color-cream)', marginBottom: '1rem' }}>
                      <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</h3>
                    <h4 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{product.name}</h4>
                    <p style={{ fontWeight: '500' }}>${product.price}</p>
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
          .filter-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0; width: 300px;
            background: white;
            z-index: 2000;
            padding: 2rem !important;
            border-right: none !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
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

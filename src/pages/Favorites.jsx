import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Trash2, ShoppingBag } from 'lucide-react';

const Favorites = () => {
  const { favorites, toggleFavorite, addToCart } = useShop();

  return (
    <div className="container section-padding" style={{ minHeight: '60vh' }}>
      <h1 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Mis Favoritos</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center">
          <p style={{ color: 'var(--color-gray)', marginBottom: '2rem' }}>Aún no tienes perfumes en tus favoritos.</p>
          <Link to="/tienda" className="btn-primary">Explorar Colección</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {favorites.map(product => (
            <div key={product.id} style={{ border: '1px solid var(--color-gray-light)', padding: '1rem', position: 'relative' }}>
              <button 
                onClick={() => toggleFavorite(product)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 2, backgroundColor: 'var(--color-white)', padding: '0.5rem', borderRadius: '50%' }}
              >
                <Trash2 size={18} color="var(--color-gray)" />
              </button>
              
              <Link to={`/producto/${product.id}`} style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '300px', objectFit: 'cover', marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>{product.brand}</p>
                <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{product.name}</h3>
                <p style={{ fontWeight: '500' }}>${product.price}</p>
              </Link>
              
              <button 
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.8rem' }}
                onClick={() => addToCart(product, 1, product.sizes[0])}
              >
                <ShoppingBag size={18} /> Agregar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { ProductCard } from './Home';

const Favorites = () => {
  const { favorites, toggleFavorite, addToCart, isFavorite } = useShop();

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Tu selección</p>
        <h1 className="title-md">Favoritos</h1>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Heart size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--color-gray-light)', display: 'block' }} />
          <p style={{ color: 'var(--color-gray)', marginBottom: '2rem', fontSize: '1rem' }}>
            Guarda aquí tus fragancias favoritas.
          </p>
          <Link to="/tienda" className="btn-primary">EXPLORAR PERFUMES</Link>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--color-gray)', marginBottom: '2rem', fontSize: '0.85rem' }}>
            {favorites.length} {favorites.length === 1 ? 'fragancia guardada' : 'fragancias guardadas'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="fav-grid">
            {favorites.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onFav={() => toggleFavorite(p)}
                fav={isFavorite(p.id)}
                onAdd={() => addToCart(p, 1, p.sizes[0])}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) { .fav-grid { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 768px)  { .fav-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; } }
      `}</style>
    </div>
  );
};

export default Favorites;

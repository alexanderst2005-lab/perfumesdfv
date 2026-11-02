import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { optimizeImg, prefetchImg } from '../utils/img';

export const ProductCard = ({ product, onFav, fav, onAdd, priority = false }) => {
  const [loaded, setLoaded] = useState(false);

  if (!product) return null;

  return (
    <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left', backgroundColor: 'transparent' }}>
      <div 
        className="product-card__image-wrap" 
        style={{ 
          position: 'relative', 
          aspectRatio: '4/5', 
          overflow: 'hidden', 
          backgroundColor: '#F8F7F5', 
          borderRadius: '8px',
          marginBottom: '0.75rem'
        }}
      >
        {/* Shimmer de lujo mientras descarga la imagen */}
        {!loaded && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, #F5F4F0 25%, #EBE8E1 50%, #F5F4F0 75%)',
              backgroundSize: '200% 100%',
              animation: 'luxuryShimmer 1.4s infinite ease-in-out',
              zIndex: 1
            }}
          />
        )}

        <Link
          to={`/producto/${product.id}`}
          onMouseEnter={() => prefetchImg(product.image, 750)}
          onTouchStart={() => prefetchImg(product.image, 750)}
          style={{ display: 'block', width: '100%', height: '100%', position: 'relative', zIndex: 2 }}
        >
          <img 
            src={optimizeImg(product.image, 380)} 
            alt={product.name || 'Perfume'} 
            className="product-img"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.28s ease, transform 0.5s ease'
            }} 
          />
        </Link>
      
        {/* Etiqueta de Descuento Discreta */}
        {product.discount && (
          <span style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            background: 'rgba(10, 10, 10, 0.9)', 
            backdropFilter: 'blur(4px)',
            color: '#fff', 
            padding: '3px 7px', 
            fontSize: '0.58rem', 
            letterSpacing: '0.5px', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            borderRadius: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            -{product.discount}%
          </span>
        )}

        {/* Overlay AGOTADO */}
        {!product.inStock && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            <span style={{
              background: '#111',
              color: '#fff',
              padding: '6px 14px',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              fontWeight: '600',
              textTransform: 'uppercase',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              fontFamily: 'var(--font-sans)'
            }}>
              AGOTADO
            </span>
          </div>
        )}

        {/* Botón Favorito Minimalista con fondo suave */}
        <button
          onClick={(e) => { e.preventDefault(); onFav && onFav(); }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            border: 'none', cursor: 'pointer',
            width: '30px', height: '30px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}
          className={fav ? 'fav-active' : ''}
          aria-label="Guardar en favoritos"
        >
          <Heart size={15} strokeWidth={1.8} color={fav ? '#E11D48' : '#222'} fill={fav ? '#E11D48' : 'none'} />
        </button>

        {/* Botón Flotante Desktop en Hover */}
        {(onAdd && product.inStock) && (
          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="add-to-cart-btn-desktop"
            style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.55rem 1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(4px)',
              border: '1px solid #111',
              borderRadius: '3px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              color: '#111',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.62rem',
              fontWeight: '600',
              letterSpacing: '1px',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 6
            }}
          >
            + AGREGAR AL CARRITO
          </button>
        )}
      </div>
      
      <div className="product-card__info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 0.1rem' }}>
        <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', 
            fontWeight: '500', 
            color: '#1A1A1A', 
            lineHeight: '1.3', 
            marginBottom: '0.3rem',
            minHeight: '2.6em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>
        </Link>

        <p style={{ 
          fontFamily: 'var(--font-sans)', 
          fontSize: '0.62rem', 
          fontWeight: '600', 
          letterSpacing: '1.5px',
          textTransform: 'uppercase', 
          color: '#8A857D', 
          margin: '0 0 0.2rem 0' 
        }}>
          {product.brand}
        </p>

        <p style={{ 
          fontFamily: 'var(--font-sans)', 
          fontSize: '0.58rem', 
          fontWeight: '400', 
          letterSpacing: '1px',
          textTransform: 'uppercase', 
          color: '#B0AAA0', 
          margin: '0 0 0.5rem 0' 
        }}>
          {product.category}
        </p>
        
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#0A0A0A', fontWeight: '600', letterSpacing: '-0.2px' }}>
            ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
          </span>
          {product.oldPrice && (
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.72rem', fontWeight: '400' }}>
              ${typeof product.oldPrice === 'number' ? product.oldPrice.toLocaleString() : product.oldPrice}
            </span>
          )}
        </div>

        {/* Botón Agregar al Carrito para Móvil y Tablet (debajo del precio, sin tapar la botella) */}
        {(onAdd && product.inStock) && (
          <button
            onClick={(e) => { e.preventDefault(); onAdd(); }}
            className="add-to-cart-btn-mobile"
            style={{
              width: '100%',
              padding: '0.48rem 0.6rem',
              backgroundColor: '#FAF9F6',
              border: '1px solid #D5D0C6',
              borderRadius: '4px',
              color: '#1A1A1A',
              fontSize: '0.64rem',
              fontWeight: '600',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginTop: '0.2rem'
            }}
          >
            <span>+ AGREGAR</span>
          </button>
        )}
      </div>

      <style>{`
        .product-card:hover .product-img {
          transform: scale(1.03);
        }
        
        .add-to-cart-btn-desktop {
          opacity: 0;
          transform: translate(-50%, 8px) !important;
        }
        .product-card:hover .add-to-cart-btn-desktop {
          opacity: 1;
          transform: translate(-50%, 0) !important;
        }
        .add-to-cart-btn-desktop:hover {
          background-color: #0A0A0A !important;
          color: #fff !important;
        }

        .add-to-cart-btn-mobile {
          display: none !important;
        }
        .add-to-cart-btn-mobile:hover {
          background-color: #0A0A0A !important;
          color: #fff !important;
          border-color: #0A0A0A !important;
        }
        
        @media (max-width: 1024px) {
          .add-to-cart-btn-desktop {
            display: none !important;
          }
          .add-to-cart-btn-mobile {
            display: flex !important;
          }
        }

        .fav-active {
          animation: heartBeat 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes luxuryShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;

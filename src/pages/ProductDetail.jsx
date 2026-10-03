import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { products } from '../data/mockProducts';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const TOTAL_HEADER = 106;

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  const product = products.find(p => p.id === id);

  const [size, setSize] = useState(product?.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return (
    <div style={{ paddingTop: `${TOTAL_HEADER + 40}px`, textAlign: 'center', padding: '5rem 1rem', color: 'var(--color-gray)' }}>
      Producto no encontrado. <Link to="/tienda" style={{ borderBottom: '1px solid' }}>Volver a la tienda</Link>
    </div>
  );

  const images = [product.image, product.image, product.image];
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const arrivalStart = new Date(today); arrivalStart.setDate(arrivalStart.getDate() + 2);
  const arrivalEnd = new Date(today); arrivalEnd.setDate(arrivalEnd.getDate() + 5);
  
  const formatD = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');

  return (
    <div className="product-page-wrapper" style={{ paddingTop: '0.8rem' }}>

      {/* Main Grid */}
      <div className="container product-detail-container" style={{ paddingBottom: '4rem' }}>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '55% 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Gallery */}
          <div className="gallery-section">
            <div 
              className="gallery-scroll-container no-scrollbar"
              style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: '1rem', padding: '0 1rem' }}
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.offsetWidth;
                const newIdx = Math.round(scrollLeft / width);
                if (newIdx !== imgIdx) setImgIdx(newIdx);
              }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="gallery-slide" style={{ flex: '0 0 88%', scrollSnapAlign: 'center', position: 'relative', overflow: 'hidden', borderRadius: '4px', backgroundColor: 'var(--color-cream)' }}>
                  <img src={img} alt={`${product.name} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            
            {/* Gallery Indicator */}
            {images.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem', color: 'var(--color-gray)' }}>
                <button onClick={() => {
                  const container = document.querySelector('.gallery-scroll-container');
                  if(container) container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
                }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--color-gray)' }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.85rem', letterSpacing: '2px' }}>{imgIdx + 1} / {images.length}</span>
                <button onClick={() => {
                  const container = document.querySelector('.gallery-scroll-container');
                  if(container) container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
                }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--color-gray)' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="info-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingTop: '0.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.8rem', color: 'var(--color-black)', textTransform: 'uppercase', lineHeight: '1.4' }}>
                {product.brand} {product.name} {product.category} {product.concentration} {product.sizes?.[0]}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '400', fontFamily: 'var(--font-sans)' }}>${product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--color-gray)', fontSize: '1.1rem' }}>
                  ${product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-gray)' }}>Presentación</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        padding: '0.4rem 0.8rem', fontSize: '0.75rem',
                        border: `1px solid ${size === s ? 'var(--color-black)' : 'var(--color-gray-light)'}`,
                        backgroundColor: size === s ? 'var(--color-black)' : 'transparent',
                        color: size === s ? '#fff' : 'var(--color-black)', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-gray)' }}>Cantidad</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-gray-light)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.4rem 0.8rem' }}><Minus size={14} /></button>
                <span style={{ padding: '0.4rem 1rem', minWidth: '2.5rem', textAlign: 'center', fontWeight: '500', fontSize: '0.85rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.4rem 0.8rem' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.8rem', flexDirection: 'column', marginTop: '1rem' }}>
              <button
                style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', border: '1px solid var(--color-black)', color: 'var(--color-black)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => addToCart(product, qty, size)}
              >
                AÑADIR AL CARRITO
              </button>
              <button
                style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => {
                  addToCart(product, qty, size);
                  window.location.href = '/checkout';
                }}
              >
                COMPRAR AHORA
              </button>
              
              <button
                onClick={() => toggleFavorite(product)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.7rem',
                  border: 'none', background: 'transparent',
                  color: isFavorite(product.id) ? 'var(--color-black)' : 'var(--color-gray)',
                  fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase',
                  cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                <Heart size={14} fill={isFavorite(product.id) ? 'var(--color-black)' : 'none'} />
                {isFavorite(product.id) ? 'EN FAVORITOS' : 'GUARDAR EN FAVORITOS'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-gray-light)', padding: '3.5rem 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: '600', color: 'var(--color-black)', letterSpacing: '0.5px' }}>
                También te recomendamos
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }} className="related-grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onFav={() => toggleFavorite(p)} fav={isFavorite(p.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .whatsapp-floating-btn { display: none !important; }
        .gallery-slide {
          aspect-ratio: 1/1;
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .product-detail-container { padding: 0 !important; }
          .gallery-section { width: 100vw; margin-left: 0; margin-right: 0; margin-bottom: 0.5rem; }
          .gallery-slide {
            aspect-ratio: 4/5;
          }
          .gallery-scroll-container {
            padding: 0 1rem !important;
          }
          .info-section { padding: 1rem 1rem !important; gap: 1rem !important; }
          .related-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

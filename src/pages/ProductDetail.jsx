import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const TOTAL_HEADER = 106;

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleFavorite, isFavorite, products, isLoadingProducts } = useShop();
  const product = products.find(p => p.id === id);

  const [size, setSize] = useState(product?.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  if (!product) return (
    <div style={{ paddingTop: `${TOTAL_HEADER + 40}px`, textAlign: 'center', padding: '5rem 1rem', color: 'var(--color-gray)' }}>
      Producto no encontrado. <Link to="/tienda" style={{ borderBottom: '1px solid' }}>Volver a la tienda</Link>
    </div>
  );

  const images = [product.image, ...(product.images || [])];
  let related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  if (related.length === 0) {
    related = products.filter(p => p.id !== product.id).slice(0, 4);
  }

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
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', border: '1px solid var(--color-black)', color: 'var(--color-black)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => addToCart(product, qty, size)}
                >
                  AÑADIR AL CARRITO
                </button>
                <button
                  onClick={() => toggleFavorite(product)}
                  style={{
                    width: '52px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'transparent', border: '1px solid var(--color-black)', color: 'var(--color-black)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <Heart size={20} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button
                style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => {
                  addToCart(product, qty, size);
                  window.location.href = '/checkout';
                }}
              >
                COMPRAR AHORA
              </button>
            </div>

            {/* Delivery Timeline */}
            <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '1.2rem', color: '#000' }}>Entrega Estimada</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', textAlign: 'center' }}>
                {/* Línea conectora */}
                <div style={{ position: 'absolute', top: '19px', left: '15%', right: '15%', height: '1px', backgroundColor: '#e0e0e0', zIndex: 0 }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 1, backgroundColor: '#fff', padding: '0 0.2rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><path d="M12 16v1"></path></svg>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '400', color: '#666', marginTop: '0.2rem' }}>{formatD(today)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: '500', lineHeight: '1.2' }}>Compra hoy</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 1, backgroundColor: '#fff', padding: '0 0.2rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '400', color: '#666', marginTop: '0.2rem' }}>{formatD(tomorrow)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: '500', lineHeight: '1.2' }}>Enviamos<br/>mañana</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 1, backgroundColor: '#fff', padding: '0 0.2rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '400', color: '#666', marginTop: '0.2rem' }}>{formatD(arrivalStart)} - {formatD(arrivalEnd)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: '500', lineHeight: '1.2' }}>Recíbelo<br/>pronto</span>
                </div>
              </div>
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
                Te podría interesar
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

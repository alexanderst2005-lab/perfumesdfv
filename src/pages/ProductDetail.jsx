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
    <div style={{ paddingTop: '80px' }}>

      {/* Back */}
      <div className="container" style={{ paddingTop: '0', paddingBottom: '0' }}>
        <Link to="/tienda" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>
          <ArrowLeft size={14} /> Volver a Perfumes
        </Link>
      </div>

      {/* Main Grid */}
      <div className="container product-detail-container" style={{ paddingTop: '0.8rem', paddingBottom: '4rem' }}>
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '55% 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Gallery */}
          <div className="gallery-section">
            <div style={{ position: 'relative', backgroundColor: 'var(--color-cream)', overflow: 'hidden', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={images[imgIdx]}
                alt={product.name}
                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
              />
              <button onClick={() => setImgIdx(i => (i === 0 ? images.length - 1 : i - 1))}
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setImgIdx(i => (i === images.length - 1 ? 0 : i + 1))}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} />
              </button>
              <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.75rem', color: 'var(--color-gray)', letterSpacing: '1px' }}>
                {imgIdx + 1} / {images.length}
              </span>
            </div>
            {/* Thumbnails */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: '80px', height: '80px',
                    border: `2px solid ${imgIdx === i ? 'var(--color-black)' : 'var(--color-gray-light)'}`,
                    overflow: 'hidden', backgroundColor: 'var(--color-cream)',
                    padding: '0.25rem', cursor: 'pointer',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="info-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingTop: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-black)', textTransform: 'uppercase', lineHeight: '1.3' }}>
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

            {/* Delivery Timeline */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-black)' }}>Entrega Estimada</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '18px', left: '15%', right: '15%', height: '2px', backgroundColor: 'var(--color-black)', zIndex: 0 }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', zIndex: 1, backgroundColor: 'var(--color-white)', padding: '0 0.5rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-black)' }}>{formatD(today)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Compra hoy</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', zIndex: 1, backgroundColor: 'var(--color-white)', padding: '0 0.5rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-black)' }}>{formatD(tomorrow)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Enviamos mañana</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', zIndex: 1, backgroundColor: 'var(--color-white)', padding: '0 0.5rem', flex: 1 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#4C4C4C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-black)' }}>{formatD(arrivalStart)} - {formatD(arrivalEnd)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>Recíbelo pronto</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray)', lineHeight: '1.9', marginBottom: '1.5rem' }}>{product.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.82rem' }}>
                <div><p style={{ color: 'var(--color-gray)', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Familia</p><p>{product.family}</p></div>
                <div><p style={{ color: 'var(--color-gray)', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Concentración</p><p>{product.concentration}</p></div>
                <div><p style={{ color: 'var(--color-gray)', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Notas de salida</p><p>{product.notes?.top}</p></div>
                <div><p style={{ color: 'var(--color-gray)', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Notas de corazón</p><p>{product.notes?.heart}</p></div>
                <div style={{ gridColumn: '1/-1' }}><p style={{ color: 'var(--color-gray)', marginBottom: '0.2rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Notas de fondo</p><p>{product.notes?.base}</p></div>
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
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', opacity: 0.6 }}>Selección curada</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '400', color: 'var(--color-black)', letterSpacing: '0.5px' }}>
                También te puede gustar
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
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .product-detail-container { padding: 0 !important; }
          .gallery-section { width: 100vw; margin-left: -1rem; margin-right: -1rem; }
          .info-section { padding: 1.5rem 1rem !important; }
          .related-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

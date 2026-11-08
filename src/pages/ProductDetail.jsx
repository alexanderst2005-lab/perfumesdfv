import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';
import { optimizeImg } from '../utils/img';
import ProductTagBadge from '../components/ProductTagBadge';

const TOTAL_HEADER = 106;

// Renders the main product image with a clean neutral skeleton while loading.
// Completely unmounts on product change so an old product image NEVER lingers.
const ProductMainImg = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const layer = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '1.25rem'
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#FFFFFF' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FAFAFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            border: '2px solid #EAEAEA',
            borderTopColor: '#111111',
            borderRadius: '50%',
            animation: 'spinMainImg 0.6s linear infinite'
          }} />
        </div>
      )}
      <img
        src={optimizeImg(src, 900)}
        alt={alt}
        fetchPriority="high"
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          ...layer,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 2
        }}
      />
    </div>
  );
};

// Renders an individual thumbnail with isolated loaded state and unique key per product/img.
// Uses fast 180px thumbnails (~4KB) so all boxes load instantly without keeping the previous product's image.
const GalleryThumb = ({ src, alt, isActive, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className="gallery-thumb-btn"
      style={{
        position: 'relative',
        width: '64px',
        height: '64px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        border: isActive ? '2px solid #111111' : '1px solid #E5E7EB',
        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
        transform: isActive ? 'scale(1.04)' : 'scale(1)',
        opacity: isActive ? 1 : 0.65,
        cursor: 'pointer',
        padding: '4px',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {!loaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#F3F4F6'
        }} />
      )}
      <img
        src={optimizeImg(src, 180)}
        loading="eager"
        decoding="async"
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.15s ease'
        }}
      />
    </button>
  );
};

// Downloads every gallery image and thumbnail in the background as soon as a product opens
const GalleryPreloader = ({ images }) => {
  React.useEffect(() => {
    const loaders = images.map(src => {
      const big = new Image();
      big.src = optimizeImg(src, 900);
      const thumb = new Image();
      thumb.src = optimizeImg(src, 180);
      return [big, thumb];
    });
    return () => { loaders.length = 0; };
  }, [images]);
  return null;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite, products, isLoadingProducts, isFresh } = useShop();
  const product = products.find(p => p.id === id);

  const [size, setSize] = useState(() => (Array.isArray(product?.sizes) ? product.sizes.find(s => s && String(s).trim()) : '') || '');
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  React.useEffect(() => {
    if (product) {
      const firstValidSize = Array.isArray(product.sizes) ? product.sizes.find(s => s && String(s).trim()) || '' : '';
      setSize(firstValidSize);
      setImgIdx(0);
    }
  }, [product?.id]);

  // Deduplicate and sanitize images preserving strict insertion order
  // (hooks must run BEFORE any early return, otherwise the page crashes to blank when loading finishes)
  const images = React.useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image && typeof product.image === 'string' && product.image.trim()) {
      list.push(product.image.trim());
    }
    if (product.images) {
      let extra = [];
      if (Array.isArray(product.images)) {
        extra = product.images;
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) extra = parsed;
          else if (typeof parsed === 'string' && parsed.trim()) extra = [parsed.trim()];
        } catch {
          if (product.images.trim()) extra = [product.images.trim()];
        }
      }
      extra.forEach(img => {
        if (img && typeof img === 'string' && img.trim()) {
          list.push(img.trim());
        }
      });
    }
    return Array.from(new Set(list));
  }, [product?.id, product?.image, product?.images]);

  // Keep imgIdx within bounds if images change
  React.useEffect(() => {
    if (imgIdx >= images.length && images.length > 0) {
      setImgIdx(0);
    }
  }, [images.length, imgIdx]);

  // If products are still loading or empty, show smooth luxury loading spinner instead of flashing "not found"
  if (isLoadingProducts || (!product && !isFresh) || (products.length === 0 && !product)) {
    return (
      <div style={{ paddingTop: `${TOTAL_HEADER + 40}px`, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#888' }}>
        <div style={{
          width: '32px', height: '32px', border: '2px solid #eaeaea', borderTopColor: '#000',
          borderRadius: '50%', animation: 'spinProduct 0.7s linear infinite'
        }} />
        <span style={{ fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999' }}>Cargando fragancia...</span>
        <style>{`@keyframes spinProduct { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) return (
    <div style={{ paddingTop: `${TOTAL_HEADER + 40}px`, textAlign: 'center', padding: '5rem 1rem', color: 'var(--color-gray)' }}>
      Producto no encontrado. <Link to="/tienda" style={{ borderBottom: '1px solid' }}>Volver a la tienda</Link>
    </div>
  );

  const handlePrevImg = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setImgIdx(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNextImg = (e) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setImgIdx(prev => (prev + 1) % images.length);
  };

  const handleTouchStart = (e) => {
    if (images.length > 1 && e.touches?.[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || images.length <= 1) return;
    const touchEndX = e.changedTouches?.[0]?.clientX;
    if (touchEndX !== undefined) {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          handleNextImg();
        } else {
          handlePrevImg();
        }
      }
    }
    setTouchStartX(null);
  };
  const tokens = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z]+/).filter(w => w.length > 2);
  const myWords = new Set(tokens(product.family));
  const scored = products
    .filter(p => p.id !== product.id)
    .map(p => {
      const shared = tokens(p.family).filter(w => myWords.has(w)).length;
      return { p, score: shared * 10 + (p.category === product.category ? 1 : 0) };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  let related = scored.slice(0, 4).map(x => x.p);
  if (related.length === 0) {
    related = products.filter(p => p.id !== product.id).slice(0, 4);
  }

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const arrivalStart = new Date(today); arrivalStart.setDate(arrivalStart.getDate() + 2);
  const arrivalEnd = new Date(today); arrivalEnd.setDate(arrivalEnd.getDate() + 5);

  const formatD = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');

  return (
    <div className="product-page-wrapper" key={product.id} style={{ paddingTop: '0.8rem' }}>
      <GalleryPreloader images={images} />

      {/* Main Grid */}
      <div className="container product-detail-container" style={{ paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <button
            type="button"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/tienda')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: 'none',
              color: '#666',
              fontSize: '0.82rem',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              padding: '0.35rem 0',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '55% 1fr', gap: '3rem', alignItems: 'start' }}>

          {/* Gallery */}
          <div className="gallery-section" key={product.id}>
            {/* Main Stage Image Frame */}
            <div
              className="gallery-main-frame"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECE7DE',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
            >
              {images.length > 0 ? (
                <ProductMainImg
                  key={`${product.id}-main-${imgIdx}-${images[imgIdx] || images[0]}`}
                  src={images[imgIdx] || images[0]}
                  alt={`${product.name} ${imgIdx + 1}`}
                />
              ) : (
                <div style={{ color: '#999', fontSize: '0.85rem' }}>Sin imagen</div>
              )}

              {/* Prev / Next Circular Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImg}
                    aria-label="Imagen anterior"
                    className="gallery-nav-btn gallery-nav-prev"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 3,
                      transition: 'all 0.2s ease',
                      color: '#111'
                    }}
                  >
                    <ChevronLeft size={20} strokeWidth={2.2} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImg}
                    aria-label="Imagen siguiente"
                    className="gallery-nav-btn gallery-nav-next"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 3,
                      transition: 'all 0.2s ease',
                      color: '#111'
                    }}
                  >
                    <ChevronRight size={20} strokeWidth={2.2} />
                  </button>
                </>
              )}

              {/* Contenedor Superior Izquierdo: Etiqueta y Descuento independientes */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '6px',
                  zIndex: 4,
                  pointerEvents: 'none'
                }}
              >
                {Boolean(product.tag) && (
                  <ProductTagBadge tag={product.tag} style={{ fontSize: '0.68rem', padding: '4px 10px' }} />
                )}
                {Boolean(product.discount && String(product.discount).trim()) && (
                  <span
                    style={{
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      borderRadius: '999px',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      lineHeight: 1
                    }}
                  >
                    -{String(product.discount).replace(/[^0-9]/g, '')}% OFF
                  </span>
                )}
              </div>

              {/* Counter Badge */}
              {images.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(17, 17, 17, 0.75)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    letterSpacing: '1.5px',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(6px)',
                    zIndex: 2
                  }}
                >
                  {imgIdx + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="info-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.2rem' }}>
            <div>
              <h1 className="product-title" style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--color-black)', textTransform: 'uppercase', lineHeight: '1.25' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '0.78rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.25rem', fontWeight: '600' }}>
                {product.brand}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#A8A29A', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.category}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              <span className="product-price" style={{ fontWeight: '500', fontFamily: 'var(--font-sans)' }}>
                ${product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="product-old-price" style={{ textDecoration: 'line-through', color: 'var(--color-gray)' }}>
                  ${product.oldPrice.toLocaleString()}
                </span>
              )}
              {Boolean(product.discount && String(product.discount).trim()) && (
                <span style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '4px 9px',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  borderRadius: '4px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  -{String(product.discount).replace(/[^0-9]/g, '')}% OFF
                </span>
              )}
            </div>

            {/* Sizes / Presentación (Opcional - solo se muestra si tiene valores) */}
            {Boolean(product.sizes && Array.isArray(product.sizes) && product.sizes.some(s => s && String(s).trim())) && (
              <div>
                <p style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--color-gray)', fontWeight: '500' }}>Presentación</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {product.sizes.filter(s => s && String(s).trim()).map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        padding: '0.35rem 0.75rem', fontSize: '0.72rem',
                        border: `1px solid ${size === s ? 'var(--color-black)' : 'var(--color-gray-light)'}`,
                        backgroundColor: size === s ? 'var(--color-black)' : 'transparent',
                        color: size === s ? '#fff' : 'var(--color-black)', cursor: 'pointer',
                        transition: 'all 0.2s', borderRadius: '2px'
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
              <p style={{ fontSize: '0.68rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--color-gray)', fontWeight: '500' }}>Cantidad</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--color-gray-light)', borderRadius: '2px' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.35rem 0.75rem', cursor: 'pointer' }}><Minus size={13} /></button>
                <span style={{ padding: '0.35rem 0.9rem', minWidth: '2.2rem', textAlign: 'center', fontWeight: '500', fontSize: '0.82rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.35rem 0.75rem', cursor: 'pointer' }}><Plus size={13} /></button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column', marginTop: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  disabled={!product.inStock}
                  style={{ flex: 1, padding: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', border: '1px solid var(--color-black)', color: 'var(--color-black)', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase', cursor: product.inStock ? 'pointer' : 'not-allowed', opacity: product.inStock ? 1 : 0.5, transition: 'all 0.2s', borderRadius: '2px' }}
                  onClick={() => product.inStock && addToCart(product, qty, size)}
                >
                  {product.inStock ? 'AÑADIR AL CARRITO' : 'AGOTADO'}
                </button>
              </div>

              {product.inStock && (
                <button
                  style={{ width: '100%', padding: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', border: 'none', color: '#fff', fontSize: '0.75rem', fontWeight: '500', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', borderRadius: '2px' }}
                  onClick={() => {
                    addToCart(product, qty, size);
                    window.location.href = '/checkout';
                  }}
                >
                  COMPRAR AHORA
                </button>
              )}

              {/* Botón Comprar por WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://perfumesdfv.com/producto/${product.id}`;
                  const formattedPrice = `$${Number(product.price || 0).toLocaleString()}`;
                  const message = `Hola, me interesa el perfume ${product.name} (${formattedPrice}). Quiero asesoría para comprarlo. ${currentUrl}`;
                  const waUrl = `https://wa.me/573027642208?text=${encodeURIComponent(message)}`;
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '0.55rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#25D366',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, transform 0.1s',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#20BD5A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#25D366'; }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-sans)'
                  }}>
                    COMPRAR POR WHATSAPP
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    fontFamily: 'var(--font-sans)',
                    marginTop: '2px'
                  }}>
                    Asesoría personalizada
                  </span>
                </div>
              </button>
            </div>

            {/* Ocasión de Uso (Si está definida) */}
            {product.occasion && (
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECE7DE',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}>
                <span style={{
                  fontSize: '0.62rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#B99A5B',
                  fontWeight: '600',
                  fontFamily: 'var(--font-sans)'
                }}>
                  ✨ OCASIÓN RECOMENDADA
                </span>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#1A1A1A',
                  fontWeight: '500',
                  fontFamily: 'var(--font-sans)',
                  margin: 0
                }}>
                  {product.occasion}
                </p>
              </div>
            )}

            {/* Descripción del Perfume */}
            {product.description && (
              <div style={{ marginTop: '1.2rem', borderTop: '1px solid #eee', paddingTop: '1.2rem' }}>
                <h4 style={{
                  fontSize: '0.7rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#888',
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '600'
                }}>
                  Descripción
                </h4>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#444',
                  lineHeight: '1.65',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '300'
                }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Timeline - Diseño estirado a todo el ancho */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem', width: '100%' }}>
              <h4 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '1.4rem', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Entrega Estimada
              </h4>

              <div style={{ width: '100%' }}>
                {/* Fila de Iconos y Línea estirada de extremo a extremo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  width: '100%',
                  marginBottom: '0.75rem'
                }}>
                  {/* Línea conectora de fondo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '20px',
                    right: '20px',
                    height: '2px',
                    backgroundColor: '#e5e7eb',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }} />

                  {/* Icono 1 - Extremo Izquierdo */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#222',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><polyline points="9 16 11 18 15 14"></polyline></svg>
                  </div>

                  {/* Icono 2 - Centro */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#222',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle><path d="M7 8h4"></path><path d="M7 11h2"></path></svg>
                  </div>

                  {/* Icono 3 - Extremo Derecho */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#222',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 2,
                    flexShrink: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                </div>

                {/* Textos alineados correspondientes a cada icono */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  width: '100%'
                }}>
                  {/* Texto 1 */}
                  <div style={{ textAlign: 'left', width: '32%' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#111', display: 'block', lineHeight: '1.2' }}>{formatD(today)}</span>
                    <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginTop: '0.15rem' }}>Compra hoy</span>
                  </div>

                  {/* Texto 2 */}
                  <div style={{ textAlign: 'center', width: '36%' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#111', display: 'block', lineHeight: '1.2' }}>{formatD(tomorrow)}</span>
                    <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginTop: '0.15rem' }}>Enviamos mañana</span>
                  </div>

                  {/* Texto 3 */}
                  <div style={{ textAlign: 'right', width: '32%' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#111', display: 'block', lineHeight: '1.2' }}>{formatD(arrivalStart)} - {formatD(arrivalEnd)}</span>
                    <span style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginTop: '0.15rem' }}>Recíbelo pronto</span>
                  </div>
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
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-black)', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
        
        .product-title { font-size: 1.15rem !important; }
        .product-price { font-size: 1.35rem !important; }
        .product-old-price { font-size: 0.95rem !important; }
        
        .gallery-nav-btn:hover {
          background-color: #111 !important;
          color: #fff !important;
          transform: translateY(-50%) scale(1.08) !important;
        }

        .gallery-thumb-btn:hover {
          opacity: 1 !important;
          border-color: #555 !important;
        }

        .gallery-main-img {
          animation: fadeGalleryImg 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeGalleryImg {
          from { opacity: 0.4; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes spinMainImg {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .product-detail-container { 
            padding-left: 1.25rem !important; 
            padding-right: 1.25rem !important; 
            box-sizing: border-box !important;
          }
          
          .product-title { 
            font-size: 1rem !important; 
            line-height: 1.35 !important; 
            letter-spacing: 0.3px !important;
          }
          .product-price { font-size: 1.2rem !important; }
          .product-old-price { font-size: 0.88rem !important; }
          
          .detail-grid { 
            grid-template-columns: 100% !important; 
            gap: 1.5rem !important; 
            width: 100% !important;
          }
          
          .gallery-section { 
            width: 100% !important; 
            margin: 0 auto 0.5rem auto !important; 
          }

          .gallery-thumbnails {
            justify-content: flex-start !important;
          }
          
          .gallery-thumb-btn {
            width: 58px !important;
            height: 58px !important;
          }

          .gallery-nav-btn {
            width: 34px !important;
            height: 34px !important;
          }
          
          .info-section { 
            padding: 0 !important; 
            gap: 0.9rem !important; 
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .related-grid { grid-template-columns: repeat(2,1fr) !important; gap: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

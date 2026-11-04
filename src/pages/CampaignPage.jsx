import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './Home';

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const CampaignPage = () => {
  const { id } = useParams();
  const { addToCart, isFavorite, toggleFavorite } = useShop();

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch('/api/promo-campaigns')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(c => String(c.id) === String(id));
          if (found) {
            setCampaign(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', color: '#9ca3af' }}>Cargando campaña...</p>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#374151' }}>
          Esta campaña ya no está disponible
        </p>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: '#111827',
          textDecoration: 'none', borderBottom: '1px solid currentColor', paddingBottom: '2px'
        }}>
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
      </div>
    );
  }

  const { title, description, badge, products } = campaign;
  const activeProducts = (products || []).filter(p => p.name);

  // Construir objetos de producto compatibles con ProductCard
  const productCards = activeProducts.map(p => ({
    id: p.product_id,
    name: p.name,
    brand: p.brand,
    image: p.image,
    images: p.images || [],
    price: p.promo_price,
    oldPrice: p.ref_price,
    discount: p.discount_pct,
    inStock: true,
    active: true
  }));

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header de la campaña */}
      <div className="container">
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#6b7280',
          textDecoration: 'none', marginBottom: '2rem',
          letterSpacing: '0.3px'
        }}>
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        {/* Badge */}
        {badge && (
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: '#111827', color: '#fff',
              padding: '0.3rem 0.9rem', borderRadius: '99px',
              fontFamily: 'var(--font-sans)', fontSize: '0.68rem',
              fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase'
            }}>
              <Tag size={11} />
              {badge}
            </span>
          </div>
        )}

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
          fontWeight: '500', color: '#111827',
          marginBottom: description ? '0.75rem' : '2rem',
          lineHeight: 1.2
        }}>
          {title}
        </h1>

        {description && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
            color: '#6b7280', lineHeight: 1.7, maxWidth: '600px',
            marginBottom: '2.5rem'
          }}>
            {description}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#e5e7eb' }} />
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.72rem',
            color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            {activeProducts.length} perfume{activeProducts.length !== 1 ? 's' : ''} en oferta
          </span>
          <div style={{ height: '1px', flex: 1, backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Grid de productos */}
        {productCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
              No hay productos disponibles en esta campaña.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            {productCards.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                onFav={() => toggleFavorite(p)}
                fav={isFavorite(p.id)}
                onAdd={() => addToCart(p, 1, p.sizes?.[0])}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;


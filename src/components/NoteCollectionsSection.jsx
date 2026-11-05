import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const DEFAULT_COLLECTIONS = [
  { id: 'ambar-maderoso', name: 'Ámbar & Maderas', product_count: 8, image: '/hero_campaign_1.webp' },
  { id: 'vainilla-dulce', name: 'Vainilla Gourmand', product_count: 6, image: '/hero_campaign_2.webp' },
  { id: 'cuero-oriental', name: 'Cuero & Oriente', product_count: 5, image: '/hero_campaign_3.webp' },
  { id: 'citrico-marino', name: 'Cítricos & Frescos', product_count: 7, image: '/hero_campaign_1_m.webp' }
];

const NoteCollectionsSection = () => {
  const [collections, setCollections] = useState(DEFAULT_COLLECTIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/note-collections')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.collections)) {
          // Filtrar solo las activas que tengan al menos 1 producto
          const activeWithProducts = data.collections.filter(
            c => c.active !== false && c.product_count > 0
          );
          if (activeWithProducts.length > 0) {
            setCollections(activeWithProducts);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="dfv-note-collections-section" style={{ backgroundColor: '#FAF8F5', padding: '3.5rem 0 3.25rem' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* ENCABEZADO CENTRADO */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
            FAMILIAS OLFATIVAS
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: '400', color: '#111111', margin: '0 0 0.5rem', letterSpacing: '0.5px' }}>
            COLECCIONES POR NOTAS
          </h2>
          <p style={{ fontFamily: 'var(--font-sans, "Montserrat", sans-serif)', fontSize: '0.85rem', color: '#666666', margin: '0 auto', maxWidth: '520px', fontWeight: '300' }}>
            Descubre fragancias seleccionadas por su personalidad olfativa
          </p>
        </div>

        {/* GRID: 2 COLUMNAS EN MÓVIL, 4 EN ESCRITORIO */}
        <div className="dfv-notes-grid">
          {collections.map((col) => {
            const imgSrc = col.image ? optimizeImg(col.image, 600) : '/hero_campaign_3.webp';

            return (
              <Link
                key={col.id}
                to={`/tienda?coleccion=${col.id}`}
                className="dfv-note-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.25s ease'
                }}
              >
                {/* FOTOGRAFÍA CUADRADA */}
                <div 
                  className="dfv-note-img-wrap"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    border: '1px solid #EAE6DF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={col.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease'
                    }}
                  />
                  {/* Badge contador discreto */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(10, 10, 10, 0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      padding: '3px 8px',
                      borderRadius: '999px'
                    }}
                  >
                    {col.product_count} {col.product_count === 1 ? 'perfume' : 'perfumes'}
                  </div>
                </div>

                {/* NOMBRE DEBAJO EN MAYÚSCULAS */}
                <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                  <h3 
                    style={{
                      fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#111111',
                      margin: '0 0 0.2rem 0',
                      transition: 'color 0.2s ease'
                    }}
                    className="dfv-note-title"
                  >
                    {col.name}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#B99A5B', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '500' }}>
                    Explorar colección →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      <style>{`
        .dfv-notes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
        }

        .dfv-note-card:hover .dfv-note-img-wrap {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          border-color: #B99A5B;
        }

        .dfv-note-card:hover .dfv-note-img-wrap img {
          transform: scale(1.04);
        }

        .dfv-note-card:hover .dfv-note-title {
          color: #B99A5B;
        }

        @media (max-width: 1024px) {
          .dfv-notes-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }
        }

        @media (max-width: 640px) {
          .dfv-notes-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default NoteCollectionsSection;


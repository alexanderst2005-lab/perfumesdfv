import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const NoteCollectionsSection = () => {
  const [collections, setCollections] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/note-collections?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.collections)) {
          const activeCols = data.collections.filter(
            c => c.active !== false
          );
          setCollections(activeCols);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || collections.length === 0) {
    return null;
  }

  return (
    <section className="dfv-note-collections-section" style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 0 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.15rem' }}>

        {/* ENCABEZADO CENTRADO LIMPIO: SOLO TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.05rem, 4.2vw, 1.5rem)',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            COLECCIONES POR NOTAS
          </h2>
        </div>

        {/* GRID: 2 COLUMNAS EN MÓVIL, 4 EN ESCRITORIO */}
        <div className="dfv-notes-grid">
          {collections.map((col) => {
            const rawImg = col.image || col.image_url;
            const imgSrc = rawImg ? optimizeImg(rawImg, 700) : '/hero_campaign_3.webp';

            return (
              <Link
                key={col.id}
                to={`/tienda?coleccion=${col.id}`}
                className="dfv-note-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {/* FOTOGRAFÍA CUADRADA LIMPIA */}
                <div
                  className="dfv-note-img-wrap"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f4f4f4'
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
                      objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 0.35s ease'
                    }}
                  />
                </div>

                {/* SOLO EL NOMBRE DEBAJO EN MAYÚSCULAS Y CENTRADO */}
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                      fontWeight: '600',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#1a1a1a',
                      margin: 0
                    }}
                    className="dfv-note-title"
                  >
                    {col.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* RAYITA DIVISORIA DEBAJO DE COLECCIONES POR NOTAS */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '1.8rem' }} />

      </div>

      <style>{`
        .dfv-notes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .dfv-note-card:hover .dfv-note-img-wrap img {
          transform: scale(1.03);
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
            gap: 14px;
            row-gap: 22px;
          }
        }
      `}</style>
    </section>
  );
};

export default NoteCollectionsSection;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

let cachedNoteCollections = (() => {
  try {
    const raw = localStorage.getItem('dfv_note_collections_cache');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
})();

const NoteCollectionsSection = () => {
  const [collections, setCollections] = useState(cachedNoteCollections || []);
  const [loaded, setLoaded] = useState(Boolean(cachedNoteCollections));

  useEffect(() => {
    const loadCols = async () => {
      try {
        const earlyPromise = window.__early?.noteCollections;
        if (window.__early) window.__early.noteCollections = null;
        const res = earlyPromise ? await earlyPromise : await fetch(`/api/note-collections?t=${Date.now()}`, { cache: 'no-store' });
        if (!res || !res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.collections)) {
          try { localStorage.setItem('dfv_note_collections_all', JSON.stringify(data.collections)); } catch {}
          const activeCols = data.collections.filter(c => c.active !== false);
          cachedNoteCollections = activeCols;
          setCollections(activeCols);
          try { localStorage.setItem('dfv_note_collections_cache', JSON.stringify(activeCols)); } catch {}
        }
      } catch {}
      finally { setLoaded(true); }
    };
    loadCols();
    window.addEventListener('dfv-sync', loadCols);
    window.addEventListener('storage', loadCols);
    return () => {
      window.removeEventListener('dfv-sync', loadCols);
      window.removeEventListener('storage', loadCols);
    };
  }, []);

  if (!loaded || collections.length === 0) {
    return null;
  }

  return (
    <section className="dfv-note-collections-section" style={{ backgroundColor: '#FFFFFF', padding: '1.8rem 0 0' }}>
      <div className="dfv-notes-container">

        {/* ENCABEZADO CENTRADO LIMPIO: SOLO TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 'clamp(1.1rem, 4.3vw, 1.65rem)',
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

        {/* GRID: 2 COLUMNAS GRANDES EN MÓVIL, 4 EN ESCRITORIO */}
        <div className="dfv-notes-grid">
          {collections.map((col) => {
            const rawImg = col.image || col.image_url;
            const imgSrc = rawImg ? optimizeImg(rawImg, 800) : '/hero_campaign_3.webp';

            return (
              <Link
                key={col.id}
                to={`/tienda?coleccion=${col.id}`}
                className="dfv-note-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {/* FOTOGRAFÍA GRANDE Y 100% COMPLETA SIN RECORTES */}
                <div
                  className="dfv-note-img-wrap"
                  style={{
                    position: 'relative',
                    width: '100%',
                    flex: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={col.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                      borderRadius: '8px',
                      transition: 'transform 0.35s ease'
                    }}
                  />
                </div>

                {/* NOMBRE SIEMPRE ALINEADO EN LA MISMA LÍNEA HORIZONTAL */}
                <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 'clamp(1rem, 3.2vw, 1.18rem)',
                      fontWeight: '600',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#1a1a1a',
                      margin: 0,
                      lineHeight: 1.25
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
        .dfv-notes-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .dfv-notes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          align-items: stretch;
        }

        @media (min-width: 769px) {
          .dfv-note-img-wrap img {
            max-height: 380px !important;
            width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
          }
          .dfv-note-title {
            font-size: 1.12rem !important;
          }
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
          .dfv-notes-container {
            padding: 0 0.65rem;
          }
          .dfv-notes-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            row-gap: 22px;
          }
        }
      `}</style>
    </section>
  );
};

export default NoteCollectionsSection;

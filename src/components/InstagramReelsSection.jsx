import React, { useState } from 'react';
import { Play, ArrowUpRight, X } from 'lucide-react';
import { INSTAGRAM_ACCOUNT, INSTAGRAM_REELS_DATA } from '../data/instagramReelsData';

const InstagramIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Helper para extraer el ID del Reel desde la URL
const getInstagramEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/`;
  }
  return null;
};

const InstagramReelsSection = () => {
  const reels = INSTAGRAM_REELS_DATA.filter(r => r.active).sort((a, b) => a.order - b.order);
  const [activeModalReel, setActiveModalReel] = useState(null);

  const openReel = (reel) => {
    setActiveModalReel(reel);
  };

  const closeModal = () => {
    setActiveModalReel(null);
  };

  return (
    <section 
      id="instagram-reels"
      className="section-padding"
      style={{
        backgroundColor: '#FCFBF9', // El mismo color marfil/cálido de la página web
        borderTop: '1px solid #EAE8E4',
        borderBottom: '1px solid #EAE8E4',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container">
        {/* Encabezado */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto 3.5rem auto'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
            <InstagramIcon size={14} color="#B99A5B" />
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#B99A5B',
              fontWeight: '600',
              fontFamily: 'var(--font-sans)',
              margin: 0
            }}>
              SÍGUENOS EN INSTAGRAM
            </p>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
            fontWeight: '400',
            color: '#050505',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
            marginBottom: '0.9rem'
          }}>
            DFV también se vive en Instagram
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginBottom: '2rem'
          }}>
            Descubre nuestras fragancias, conoce las novedades y encuentra inspiración para tu próxima elección.
          </p>

          <a 
            href={INSTAGRAM_ACCOUNT.profileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.85rem 2rem',
              border: '1px solid #111',
              color: '#111',
              backgroundColor: 'transparent',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '500',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#111';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#111';
            }}
          >
            <span>VER MÁS EN INSTAGRAM</span>
            <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Cuadrícula de Reels en Proporción 9:16 */}
        <div className="reels-grid">
          {reels.map((reel) => (
            <div 
              key={reel.id}
              className="reel-card"
              onClick={() => openReel(reel)}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                aspectRatio: '9/16',
                backgroundColor: '#F5F2EC',
                cursor: 'pointer',
                border: '1px solid #EAE6DF',
                boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            >
              {/* Imagen de Portada */}
              <img 
                src={reel.thumbnailUrl} 
                alt={reel.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.6s ease'
                }}
                className="reel-img"
              />

              {/* Degradado para legibilidad del texto */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.3) 100%)',
                  zIndex: 2,
                  transition: 'opacity 0.3s ease'
                }}
              />

              {/* Badge de Categoría Superior */}
              <div 
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  zIndex: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #D1B878',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.65rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#111',
                  fontWeight: '600'
                }}
              >
                {reel.category}
              </div>

              {/* Icono de Instagram Superior Derecho */}
              <div 
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  zIndex: 3,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111'
                }}
              >
                <InstagramIcon size={14} color="#111" />
              </div>

              {/* Icono Central de Reproducción */}
              <div 
                className="reel-play-btn"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 4,
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '3px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s ease, background-color 0.3s ease'
                }}
              >
                <Play size={20} fill="#111" strokeWidth={0} />
              </div>

              {/* Pie de la tarjeta con título e info */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  zIndex: 3
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.95rem',
                  color: '#FFFFFF',
                  lineHeight: '1.35',
                  marginBottom: '6px',
                  fontWeight: '400',
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)'
                }}>
                  {reel.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#D1B878',
                    letterSpacing: '1px',
                    fontWeight: '600'
                  }}>
                    {INSTAGRAM_ACCOUNT.handle}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#E8E8E8'
                  }}>
                    {reel.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup para Reproducir el Video AQUI MISMO sin tener que salir */}
      {activeModalReel && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.2rem',
              borderBottom: '1px solid #F0ECE4',
              backgroundColor: '#FCFBF9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InstagramIcon size={16} color="#B99A5B" />
                <span style={{ color: '#111', fontSize: '0.85rem', fontWeight: '600' }}>
                  {activeModalReel.title}
                </span>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  color: '#666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Reproductor Real Integrado de Instagram */}
            <div style={{ position: 'relative', width: '100%', height: '560px', backgroundColor: '#000', overflow: 'hidden' }}>
              {getInstagramEmbedUrl(activeModalReel.reelUrl) ? (
                <iframe
                  src={getInstagramEmbedUrl(activeModalReel.reelUrl)}
                  title={activeModalReel.title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency="true"
                  allow="encrypted-media"
                  style={{ border: 'none', width: '100%', height: '100%' }}
                />
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img 
                    src={activeModalReel.thumbnailUrl} 
                    alt={activeModalReel.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center'
                  }}>
                    <p style={{ color: '#fff', fontSize: '0.9rem' }}>Este video está disponible en Instagram.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div style={{ padding: '0.8rem 1.2rem', backgroundColor: '#FAF9F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>
                DFV Perfumes Oficial
              </span>
              <a 
                href={activeModalReel.reelUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#B99A5B',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <span>Abrir en app</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reels-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .reel-card:hover {
          transform: translateY(-6px);
          border-color: #B99A5B !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
        }

        .reel-card:hover .reel-img {
          transform: scale(1.05);
        }

        .reel-card:hover .reel-play-btn {
          transform: translate(-50%, -50%) scale(1.15);
          background-color: #B99A5B !important;
          color: #fff !important;
        }

        .reel-card:hover .reel-play-btn svg {
          fill: #fff !important;
        }

        @media (max-width: 1024px) {
          .reels-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.2rem;
          }
        }

        @media (max-width: 600px) {
          .reels-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramReelsSection;

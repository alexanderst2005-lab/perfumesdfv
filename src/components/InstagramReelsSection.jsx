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

const getEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.instagram.com/reel/${match[1]}/embed/captioned/`;
  }
  return null;
};

const InstagramReelsSection = () => {
  const reels = INSTAGRAM_REELS_DATA.filter(r => r.active).sort((a, b) => a.order - b.order);
  const [activeModalReel, setActiveModalReel] = useState(null);

  const openReelModal = (reel) => {
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
        backgroundColor: '#FCFBF9',
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
          maxWidth: '680px',
          margin: '0 auto 3rem auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.8rem'
          }}>
            <InstagramIcon size={14} color="#B99A5B" />
            <span style={{
              fontSize: '0.72rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#B99A5B',
              fontWeight: '600',
              fontFamily: 'var(--font-sans)'
            }}>
              EXPERIENCIAS REALES
            </span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: '400',
            color: '#050505',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
            marginBottom: '0.8rem'
          }}>
            DFV en primera persona
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginBottom: '1.8rem'
          }}>
            Descubre reseñas, recomendaciones y la experiencia directa de nuestra comunidad.
          </p>

          <a 
            href={INSTAGRAM_ACCOUNT.profileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 2rem',
              border: '1px solid #050505',
              color: '#050505',
              backgroundColor: 'transparent',
              fontSize: '0.72rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '600',
              borderRadius: '2px',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#050505';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#050505';
            }}
          >
            <span>VER MÁS EN @PERFUMESDFV</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Tarjetas Limpias y Elegantes */}
        <div className="reels-feed-container">
          {reels.map((reel) => (
            <div 
              key={reel.id}
              className="reel-feed-card"
              onClick={() => openReelModal(reel)}
              style={{
                position: 'relative',
                borderRadius: '18px',
                overflow: 'hidden',
                aspectRatio: '9/16',
                backgroundColor: '#0D0D0D',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            >
              {/* Imagen limpia sin textos tapando el perfume */}
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
                className="reel-img-zoom"
              />

              {/* Degradado fino solo en los extremos */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 40%, rgba(0,0,0,0.25) 100%)'
              }} />

              {/* Insignia de Instagram en esquina superior derecha */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <InstagramIcon size={16} />
              </div>

              {/* Categoría superior izquierda limpia */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px'
              }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  color: '#050505',
                  fontSize: '0.62rem',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {reel.category}
                </span>
              </div>

              {/* Botón Circular de Play Glassmorphic */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '18px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '3px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease'
                }}
                className="reel-circle-play"
              >
                <Play size={20} fill="#ffffff" color="#ffffff" />
              </div>

              {/* Marca @perfumesdfv en esquina inferior derecha */}
              <div style={{
                position: 'absolute',
                bottom: '22px',
                right: '18px',
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sans)',
                fontWeight: '500',
                letterSpacing: '0.5px'
              }}>
                @perfumesdfv
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup para Reproducir el Video EN TAMAÑO GRANDE */}
      {activeModalReel && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              height: '92vh',
              maxHeight: '820px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.9rem 1.4rem',
              borderBottom: '1px solid #F0ECE4',
              backgroundColor: '#FCFBF9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InstagramIcon size={18} color="#B99A5B" />
                <span style={{ color: '#111', fontSize: '0.88rem', fontWeight: '600' }}>
                  {activeModalReel.title}
                </span>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  color: '#111',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Reproductor Real en Pantalla GRANDE */}
            <div style={{ flex: 1, width: '100%', backgroundColor: '#000', overflow: 'hidden', position: 'relative' }}>
              <iframe
                src={getEmbedUrl(activeModalReel.reelUrl)}
                title={activeModalReel.title}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                style={{ border: 'none', width: '100%', height: '100%' }}
              />
            </div>

            {/* Pie del modal */}
            <div style={{
              padding: '0.9rem 1.4rem',
              backgroundColor: '#FAF9F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #F0ECE4'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#666' }}>
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
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <span>Ver en Instagram</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reels-feed-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2.2rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .reel-feed-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12) !important;
        }

        .reel-feed-card:hover .reel-img-zoom {
          transform: scale(1.05);
        }

        .reel-feed-card:hover .reel-circle-play {
          transform: scale(1.15);
          background-color: rgba(255, 255, 255, 0.75);
        }

        @media (max-width: 640px) {
          .reels-feed-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.9rem;
          }
          .reel-feed-card {
            border-radius: 14px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramReelsSection;

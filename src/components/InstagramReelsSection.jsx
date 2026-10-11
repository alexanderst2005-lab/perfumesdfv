import React, { useState } from 'react';
import { Play, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
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
  
  // Guardamos los IDs de los reels que el usuario ha presionado para reproducir directamente en la tarjeta
  const [playingReels, setPlayingReels] = useState({});

  const handlePlayCard = (id) => {
    setPlayingReels(prev => ({
      ...prev,
      [id]: true
    }));
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
          margin: '0 auto 3rem auto'
        }}>
          <p style={{
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#050505',
            fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            marginBottom: '0.8rem'
          }}>
            EXPERIENCIAS REALES
          </p>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginBottom: '1.8rem'
          }}>
            Mira los videos, reseñas y recomendaciones de nuestros clientes en Instagram.
          </p>

          <a 
            href={INSTAGRAM_ACCOUNT.profileUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.8rem',
              border: '1px solid #111',
              color: '#111',
              backgroundColor: 'transparent',
              fontSize: '0.72rem',
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
            <span>VER MÁS EN @PERFUMESDFV</span>
            <ArrowUpRight size={15} />
          </a>
        </div>

        {/* Tarjetas de Videos Directas en Formato Reel Vertical (9:16) */}
        <div className="reels-feed-container">
          {reels.map((reel) => {
            const isPlaying = !!playingReels[reel.id];
            const embedUrl = getEmbedUrl(reel.reelUrl);

            return (
              <div 
                key={reel.id}
                className="reel-feed-card"
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '9/16',
                  backgroundColor: '#000',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}
              >
                {isPlaying && embedUrl ? (
                  /* Video embebido activo reproduciéndose DIRECTAMENTE en la tarjeta */
                  <iframe
                    src={embedUrl}
                    title={reel.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    style={{
                      border: 'none',
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                  />
                ) : (
                  /* Portada de video con botón de reproducción táctil idéntico a la referencia */
                  <div 
                    onClick={() => handlePlayCard(reel.id)}
                    style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
                  >
                    <img 
                      src={reel.thumbnailUrl} 
                      alt={reel.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />

                    {/* Overlay sutil */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
                    }} />

                    {/* Botón Circular de Play en la esquina inferior izquierda (igual a la foto del usuario) */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '18px',
                        left: '18px',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.35)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: '3px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                        transition: 'transform 0.3s ease, background-color 0.3s ease'
                      }}
                      className="reel-circle-play"
                    >
                      <Play size={20} fill="#ffffff" color="#ffffff" />
                    </div>

                    {/* Logo/Nombre en marca de agua inferior derecha si aplica */}
                    <div style={{
                      position: 'absolute',
                      bottom: '22px',
                      right: '18px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.5px'
                    }}>
                      @perfumesdfv
                    </div>

                    {/* Título del Reel en la parte superior */}
                    <div style={{
                      position: 'absolute',
                      top: '18px',
                      left: '18px',
                      right: '18px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '6px'
                      }}>
                        {reel.category}
                      </span>
                      <p style={{
                        color: '#fff',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.95rem',
                        lineHeight: '1.3',
                        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                      }}>
                        {reel.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .reels-feed-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .reel-feed-card:hover .reel-circle-play {
          transform: scale(1.12);
          background-color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 1024px) {
          .reels-feed-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.2rem;
          }
        }

        @media (max-width: 600px) {
          .reels-feed-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
          .reel-feed-card {
            border-radius: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramReelsSection;

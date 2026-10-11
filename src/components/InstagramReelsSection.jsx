import React, { useState } from 'react';
import { Play, ArrowUpRight, Sparkles } from 'lucide-react';
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
        backgroundColor: '#FCFBF9',
        borderTop: '1px solid #EAE8E4',
        borderBottom: '1px solid #EAE8E4',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container">
        {/* Encabezado de Lujo Minimalista */}
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

        {/* Tarjetas Centradas (2 Columnas con marco ultra elegante) */}
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
                  borderRadius: '20px',
                  overflow: 'hidden',
                  aspectRatio: '9/16',
                  backgroundColor: '#0D0D0D',
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(185, 154, 91, 0.25)',
                  transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                }}
              >
                {isPlaying && embedUrl ? (
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
                        display: 'block',
                        transition: 'transform 0.7s ease'
                      }}
                      className="reel-img-zoom"
                    />

                    {/* Gradiente Cinematográfico */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.1) 40%, rgba(5,5,5,0.4) 100%)',
                      transition: 'opacity 0.3s ease'
                    }} />

                    {/* Botón Circular de Play de Lujo con Glassmorphism */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '22px',
                        left: '20px',
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.35)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: '3px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      className="reel-circle-play"
                    >
                      <Play size={22} fill="#ffffff" color="#ffffff" />
                    </div>

                    {/* Insignia de Instagram en esquina superior derecha */}
                    <div style={{
                      position: 'absolute',
                      top: '18px',
                      right: '18px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <InstagramIcon size={16} />
                    </div>

                    {/* Badge de Categoría y Título */}
                    <div style={{
                      position: 'absolute',
                      top: '18px',
                      left: '18px',
                      right: '58px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(5, 5, 5, 0.65)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(185, 154, 91, 0.5)',
                        color: '#D1B878',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        {reel.category}
                      </span>
                      <p style={{
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1rem',
                        lineHeight: '1.3',
                        textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                        fontWeight: '400'
                      }}>
                        {reel.title}
                      </p>
                    </div>

                    {/* Nombre en esquina inferior derecha */}
                    <div style={{
                      position: 'absolute',
                      bottom: '26px',
                      right: '20px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '0.5px',
                      fontWeight: '500'
                    }}>
                      @perfumesdfv
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
          grid-template-columns: repeat(2, 1fr);
          gap: 2.2rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .reel-feed-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12) !important;
          border-color: #B99A5B !important;
        }

        .reel-feed-card:hover .reel-img-zoom {
          transform: scale(1.06);
        }

        .reel-feed-card:hover .reel-circle-play {
          transform: scale(1.15);
          background-color: rgba(255, 255, 255, 0.7);
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

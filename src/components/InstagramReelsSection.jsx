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

const InstagramReelsSection = () => {
  const reels = INSTAGRAM_REELS_DATA.filter(r => r.active).sort((a, b) => a.order - b.order);
  const [activeModalReel, setActiveModalReel] = useState(null);

  const openReel = (reel) => {
    // Si el usuario da click, abrimos el modal o redirigimos directamente a Instagram
    // Para dar la mejor experiencia sin romper políticas ni bloquear el sitio:
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
        backgroundColor: '#050505', // Negro profundo para alto contraste visual elegante
        color: '#F7F5F0',
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
            color: '#F7F5F0',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
            marginBottom: '0.9rem'
          }}>
            DFV también se vive en Instagram
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#A8A39A',
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
              padding: '0.9rem 2.2rem',
              border: '1px solid #B99A5B',
              color: '#F7F5F0',
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
              e.currentTarget.style.backgroundColor = '#B99A5B';
              e.currentTarget.style.color = '#050505';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#F7F5F0';
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
                backgroundColor: '#0D0D0D',
                cursor: 'pointer',
                border: '1px solid rgba(185, 154, 91, 0.2)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
            >
              {/* Imagen de Portada con lazy loading */}
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

              {/* Degradado oscuro para legibilidad */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.2) 50%, rgba(5,5,5,0.4) 100%)',
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
                  backgroundColor: 'rgba(5, 5, 5, 0.65)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(185, 154, 91, 0.35)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.65rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#D1B878',
                  fontWeight: '500'
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
                  backgroundColor: 'rgba(5, 5, 5, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F7F5F0'
                }}
              >
                <InstagramIcon size={14} />
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
                  backgroundColor: 'rgba(185, 154, 91, 0.9)',
                  color: '#050505',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '3px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  transition: 'transform 0.3s ease, background-color 0.3s ease'
                }}
              >
                <Play size={22} fill="#050505" strokeWidth={0} />
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
                  color: '#F7F5F0',
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
                    color: '#B99A5B',
                    letterSpacing: '1px',
                    fontWeight: '500'
                  }}>
                    {INSTAGRAM_ACCOUNT.handle}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: '#A8A39A'
                  }}>
                    {reel.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup para Reproducir o Visitar el Reel */}
      {activeModalReel && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: '#0D0D0D',
              border: '1px solid #B99A5B',
              borderRadius: '12px',
              maxWidth: '420px',
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InstagramIcon size={18} color="#B99A5B" />
                <span style={{ color: '#F7F5F0', fontSize: '0.85rem', fontWeight: '500' }}>
                  {INSTAGRAM_ACCOUNT.handle}
                </span>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  color: '#A8A39A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Vista previa / Video */}
            <div style={{ position: 'relative', aspectRatio: '9/14', maxHeight: '55vh', overflow: 'hidden' }}>
              <img 
                src={activeModalReel.thumbnailUrl} 
                alt={activeModalReel.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.5rem'
              }}>
                <span style={{ color: '#B99A5B', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {activeModalReel.category}
                </span>
                <h3 style={{ color: '#F7F5F0', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0 }}>
                  {activeModalReel.title}
                </h3>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#A8A39A', fontSize: '0.82rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                Mira este Reel completo y conoce más fragancias directamente en el Instagram oficial de DFV Perfumes.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <a 
                  href={activeModalReel.reelUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#B99A5B',
                    color: '#050505',
                    fontSize: '0.75rem',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <span>VER EN INSTAGRAM</span>
                  <ArrowUpRight size={16} />
                </a>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '0.85rem 1.2rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#F7F5F0',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  CERRAR
                </button>
              </div>
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
          transform: translateY(-8px);
          border-color: #B99A5B !important;
          box-shadow: 0 15px 35px rgba(185, 154, 91, 0.15) !important;
        }

        .reel-card:hover .reel-img {
          transform: scale(1.06);
        }

        .reel-card:hover .reel-play-btn {
          transform: translate(-50%, -50%) scale(1.15);
          background-color: #D1B878;
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

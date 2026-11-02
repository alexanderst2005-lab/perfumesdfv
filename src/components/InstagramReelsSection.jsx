import React, { useState, useEffect, useRef } from 'react';
import { Play, ArrowUpRight, X, Volume2, VolumeX } from 'lucide-react';
import { INSTAGRAM_ACCOUNT } from '../data/instagramReelsData';

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

// Tarjeta individual con reproducción directa en vivo ("afuerita")
const ReelFeedCard = ({ reel, onOpenModal }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Versión liviana de video para móvil y web (comprimido y tamaño justo)
  const fastVideoUrl = reel.videoUrl && reel.videoUrl.includes('/video/upload/') && !reel.videoUrl.includes('w_')
    ? reel.videoUrl.replace('/video/upload/', '/video/upload/q_auto:eco,vc_auto,w_540/')
    : reel.videoUrl;

  // Auto-generación de póster/thumbnail si es video de Cloudinary
  let thumb = reel.thumbnailUrl;
  if (thumb && thumb.includes('/image/upload/') && !thumb.includes('w_')) {
    thumb = thumb.replace('/image/upload/', '/image/upload/w_500,f_auto,q_auto/');
  } else if (!thumb && reel.videoUrl && reel.videoUrl.includes('/video/upload/')) {
    thumb = reel.videoUrl
      .replace('/video/upload/', '/video/upload/so_0,w_500,q_auto,f_auto/')
      .replace(/\.[^/.]+$/, '.jpg');
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  const toggleSound = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div 
      className="reel-feed-card"
      onClick={() => onOpenModal(reel)}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        aspectRatio: '9/16',
        backgroundColor: '#1c1917',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.35s ease'
      }}
    >
      {/* 1. Póster / Imagen SIEMPRE visible debajo para que nunca se vea cuadro negro */}
      {thumb ? (
        <img 
          src={thumb} 
          alt={reel.title}
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            zIndex: 1,
            opacity: videoLoaded ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none'
          }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#262626', zIndex: 1 }} />
      )}

      {/* 2. Video reproduciéndose en bucle optimizado */}
      {fastVideoUrl && (
        <video 
          ref={videoRef}
          src={fastVideoUrl} 
          poster={thumb || undefined}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          onCanPlay={() => setVideoLoaded(true)}
          onPlaying={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            zIndex: 2,
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease transform 0.5s ease'
          }}
          className="reel-video-preview"
        />
      )}

      {/* Sutil viñeta en la base y arriba para contraste */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Botón flotante de audio en la esquina superior derecha */}
      {reel.videoUrl && (
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? "Activar audio" : "Silenciar"}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 3
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* Botón Circular de Play en la esquina inferior izquierda */}
      <div 
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '3px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          zIndex: 2
        }}
        className="reel-circle-play"
      >
        <Play size={18} fill="#ffffff" color="#ffffff" />
      </div>
    </div>
  );
};

const InstagramReelsSection = () => {
  const [dbReels, setDbReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalReel, setActiveModalReel] = useState(null);

  useEffect(() => {
    const early = window.__early?.reels;
    if (window.__early) window.__early.reels = null;
    const fetchPromise = early ? Promise.resolve(early) : fetch('/api/reels');

    fetchPromise
      .then(res => (res && res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setDbReels(data.map(r => ({
            id: r.id,
            title: r.title || 'Experiencia DFV Perfumes',
            thumbnailUrl: r.thumbnail_url || '',
            videoUrl: r.video_url,
            isUploadedVideo: true,
            active: r.active
          })));
        }
      })
      .catch(e => console.error('Error fetching reels:', e))
      .finally(() => setIsLoading(false));
  }, []);

  // Mostramos los reels activos subidos desde el panel
  const reels = dbReels.filter(r => r.active);

  const openReelModal = (reel) => {
    setActiveModalReel(reel);
  };

  const closeModal = () => {
    setActiveModalReel(null);
  };

  // Si no hay reels subidos y ya terminó de cargar, no renderizamos la sección
  if (!isLoading && reels.length === 0) {
    return null;
  }

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
        {/* Encabezado elegante */}
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
            Momentos que se quedan en la piel
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginBottom: '1.8rem'
          }}>
            Mira cómo nuestra comunidad vive, usa y recomienda sus fragancias favoritas.
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

        {/* Carrusel Deslizable Horizontal */}
        <div className="reels-scroll-wrapper">
          <div className="reels-feed-container">
            {reels.map((reel) => (
              <ReelFeedCard 
                key={reel.id}
                reel={reel}
                onOpenModal={openReelModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Popup para Reproducir el Video EN PANTALLA COMPLETA con Audio */}
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
            <div style={{ flex: 1, width: '100%', backgroundColor: '#000', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeModalReel.isUploadedVideo || activeModalReel.videoUrl?.endsWith('.mp4') || activeModalReel.videoUrl?.includes('/video/upload/') ? (
                <video
                  src={activeModalReel.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                />
              ) : (
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
              )}
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
              {activeModalReel.reelUrl && (
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
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .reels-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0.5rem 0 1.5rem 0;
          scrollbar-width: none;
        }
        .reels-scroll-wrapper::-webkit-scrollbar {
          display: none;
        }

        .reels-feed-container {
          display: flex;
          justifyContent: ${reels.length <= 2 ? 'center' : 'flex-start'};
          gap: 1.4rem;
          width: max-content;
          min-width: 100%;
          padding: 0 1rem;
          margin: 0 auto;
        }

        .reel-feed-card {
          flex: 0 0 260px;
          max-width: 280px;
          width: 260px;
        }

        .reel-feed-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12) !important;
        }

        .reel-feed-card:hover .reel-video-preview {
          transform: scale(1.03);
        }

        .reel-feed-card:hover .reel-circle-play {
          transform: scale(1.1);
          background-color: rgba(255, 255, 255, 0.5) !important;
        }

        @media (max-width: 640px) {
          .reels-feed-container {
            justify-content: ${reels.length === 1 ? 'center' : 'flex-start'};
            gap: 1rem;
            padding: 0 1.25rem;
          }
          .reel-feed-card {
            flex: 0 0 215px;
            width: 215px;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InstagramReelsSection;

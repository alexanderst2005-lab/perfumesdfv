import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, MapPin } from 'lucide-react';
import { optimizeImg, getVideoThumbnailUrl, normalizeSedeGallery } from '../utils/img';

const SedeGalleryModal = ({ sede, onClose }) => {
  const items = normalizeSedeGallery(sede);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  // Cuando cambia de sede o de elemento, detener reproducción de video
  useEffect(() => {
    setActiveIndex(0);
    setIsPlayingVideo(false);
  }, [sede]);

  useEffect(() => {
    setIsPlayingVideo(false);
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setActiveIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setActiveIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  // Bloquear scroll del body y soportar teclado (Escape, flechas)
  useEffect(() => {
    if (!sede) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sede, onClose, goPrev, goNext]);

  if (!sede || items.length === 0) return null;

  const currentItem = items[activeIndex] || items[0];
  const isVideo = currentItem.type === 'video';
  const videoThumb = isVideo
    ? (currentItem.thumbnailUrl || getVideoThumbnailUrl(currentItem.url, 1000))
    : '';

  const handleTouchStart = (e) => {
    if (isPlayingVideo) return;
    setTouchStartX(e.targetTouches?.[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e) => {
    if (isPlayingVideo || touchStartX === null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX;
    const diff = touchStartX - endX;
    if (diff > 45) goNext();
    else if (diff < -45) goPrev();
    setTouchStartX(null);
  };

  return (
    <div
      className="dfv-sede-gallery-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(8, 8, 8, 0.94)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
        boxSizing: 'border-box',
        animation: 'dfvSedeFadeIn 0.22s ease-out'
      }}
    >
      {/* ── Barra superior: Nombre de la sede, contador y botón visible para cerrar ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          padding: '0.25rem 0.25rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
            fontSize: '0.65rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#B99A5B',
            fontWeight: 600,
            marginBottom: '2px'
          }}>
            GALERÍA DE NUESTRA SEDE · {activeIndex + 1} / {items.length}
          </span>
          <h3 style={{
            fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
            fontWeight: 600,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {sede.name}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 0.95rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={17} />
          <span>Cerrar</span>
        </button>
      </div>

      {/* ── Visor central grande (Foto o Video con miniatura + botón Play) ── */}
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          maxWidth: '1100px',
          width: '100%',
          margin: '0.75rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
      >
        {/* Botón Anterior */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Elemento anterior"
            className="dfv-sede-nav-btn dfv-sede-nav-btn--left"
            style={{
              position: 'absolute',
              left: '8px',
              zIndex: 20,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 15, 15, 0.78)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.45)'
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Contenedor del medio actual */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '10px'
          }}
        >
          {!isVideo ? (
            <img
              key={currentItem.url}
              src={optimizeImg(currentItem.url, 1600)}
              alt={`${sede.name} - ${activeIndex + 1}`}
              decoding="async"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block',
                boxShadow: '0 16px 50px rgba(0,0,0,0.6)'
              }}
            />
          ) : isPlayingVideo ? (
            <video
              key={currentItem.url}
              src={currentItem.url}
              poster={videoThumb || undefined}
              controls
              autoPlay
              playsInline
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#000',
                boxShadow: '0 16px 50px rgba(0,0,0,0.6)'
              }}
            />
          ) : (
            /* Vista previa del video con miniatura y botón de reproducción (no descarga el video hasta tocar Play) */
            <div
              onClick={() => setIsPlayingVideo(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsPlayingVideo(true); }}
              aria-label="Reproducir video"
              style={{
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '100%',
                display: ' flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#111'
              }}
            >
              {videoThumb ? (
                <img
                  src={videoThumb}
                  alt={`${sede.name} - Video ${activeIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70dvh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'brightness(0.85)'
                  }}
                />
              ) : (
                <video
                  src={`${currentItem.url}#t=0.5`}
                  preload="metadata"
                  muted
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70dvh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Botón central de Play */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)'
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(185, 154, 91, 0.95)',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Play size={30} color="#0a0a0a" fill="#0a0a0a" style={{ marginLeft: '4px' }} />
                </div>
                <span
                  style={{
                    marginTop: '0.65rem',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase'
                  }}
                >
                  Tocar para reproducir video
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botón Siguiente */}
        {items.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Elemento siguiente"
            className="dfv-sede-nav-btn dfv-sede-nav-btn--right"
            style={{
              position: 'absolute',
              right: '8px',
              zIndex: 20,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 15, 15, 0.78)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.45)'
            }}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* ── Barra inferior: Tira de miniaturas + enlace ¿Cómo llegar? ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.65rem',
          paddingTop: '0.4rem'
        }}
      >
        {items.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '0.55rem',
              overflowX: 'auto',
              maxWidth: '100%',
              padding: '0.25rem 0.4rem',
              scrollbarWidth: 'thin'
            }}
          >
            {items.map((item, idx) => {
              const isSelected = idx === activeIndex;
              const thumbSrc = item.type === 'video'
                ? (item.thumbnailUrl || getVideoThumbnailUrl(item.url, 240))
                : optimizeImg(item.url, 200);

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver elemento ${idx + 1}`}
                  style={{
                    position: 'relative',
                    width: '62px',
                    height: '62px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    padding: 0,
                    border: isSelected ? '2px solid #B99A5B' : '2px solid rgba(255,255,255,0.2)',
                    opacity: isSelected ? 1 : 0.6,
                    cursor: 'pointer',
                    flexShrink: 0,
                    backgroundColor: '#1a1a1a',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem' }}>
                      VIDEO
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(185,154,91,0.95)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Play size={12} color="#0a0a0a" fill="#0a0a0a" style={{ marginLeft: '1px' }} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {sede.maps && (
          <a
            href={sede.maps}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '0.2rem 0.5rem'
            }}
          >
            <MapPin size={14} color="#B99A5B" />
            <span>¿Cómo llegar a {sede.name}?</span>
          </a>
        )}
      </div>

      <style>{`
        @keyframes dfvSedeFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (max-width: 640px) {
          .dfv-sede-gallery-backdrop {
            padding: 0.65rem !important;
          }
          .dfv-sede-nav-btn {
            width: 38px !important;
            height: 38px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SedeGalleryModal;


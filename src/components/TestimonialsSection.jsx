import React, { useState, useRef, useEffect } from 'react';
import { Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

const ReviewCard = ({ item }) => {
  const [helpfulCount, setHelpfulCount] = useState(item.initialHelpful || 15);
  const [lovedCount, setLovedCount] = useState(item.initialLoved || 10);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [hasVotedLoved, setHasVotedLoved] = useState(false);

  // Cargar votos previos de localStorage si existen
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`review_react_${item.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.helpful) {
          setHasVotedHelpful(true);
          setHelpfulCount(prev => prev + 1);
        }
        if (parsed.loved) {
          setHasVotedLoved(true);
          setLovedCount(prev => prev + 1);
        }
      }
    } catch (_) {}
  }, [item.id]);

  const toggleHelpful = (e) => {
    e.stopPropagation();
    const nextState = !hasVotedHelpful;
    setHasVotedHelpful(nextState);
    setHelpfulCount(prev => prev + (nextState ? 1 : -1));
    try {
      const stored = JSON.parse(localStorage.getItem(`review_react_${item.id}`) || '{}');
      stored.helpful = nextState;
      localStorage.setItem(`review_react_${item.id}`, JSON.stringify(stored));
    } catch (_) {}
  };

  const toggleLoved = (e) => {
    e.stopPropagation();
    const nextState = !hasVotedLoved;
    setHasVotedLoved(nextState);
    setLovedCount(prev => prev + (nextState ? 1 : -1));
    try {
      const stored = JSON.parse(localStorage.getItem(`review_react_${item.id}`) || '{}');
      stored.loved = nextState;
      localStorage.setItem(`review_react_${item.id}`, JSON.stringify(stored));
    } catch (_) {}
  };

  return (
    <div 
      className="review-customer-card"
      style={{
        width: '350px',
        minWidth: '350px',
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid #ECE7DE',
        padding: '1.8rem 1.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 6px 22px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <div>
        {/* Cabecera de la tarjeta: Estrellas + Badge TOP RESEÑA opcional */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.3rem'
        }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[...Array(item.rating || 5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill="#C49A45" 
                color="#C49A45" 
              />
            ))}
          </div>

          {item.isTopReview && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#B99A5B',
              color: '#FFFFFF',
              fontSize: '0.66rem',
              fontWeight: '700',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '999px',
              boxShadow: '0 2px 6px rgba(185, 154, 91, 0.25)',
              fontFamily: 'var(--font-sans)'
            }}>
              ★ TOP RESEÑA
            </span>
          )}
        </div>

        {/* Texto del comentario entre comillas */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.92rem',
          lineHeight: '1.65',
          color: '#2B2B2B',
          fontWeight: '400',
          marginBottom: '1.6rem',
          fontStyle: 'normal'
        }}>
          "{item.comment}"
        </p>
      </div>

      <div>
        {/* Separador sutil */}
        <div style={{
          height: '1px',
          backgroundColor: '#F3EFEA',
          width: '100%',
          marginBottom: '1.2rem'
        }} />

        {/* Sección de Autor y Ciudad */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Avatar circular con color de contraste y primera letra */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: item.avatarBg || '#1E3A8A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}>
              {item.avatarLetter || item.name.charAt(0)}
            </div>

            <div>
              <h4 style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#111111',
                margin: 0,
                lineHeight: 1.2
              }}>
                {item.name}
              </h4>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                color: '#8A857D',
                margin: '2px 0 0 0',
                fontWeight: '400'
              }}>
                {item.city} · {item.time}
              </p>
            </div>
          </div>

          {/* Badge Verificada verde como en la imagen */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#EDF9F1',
            border: '1px solid #B8E8C7',
            color: '#15803D',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: '600',
            fontFamily: 'var(--font-sans)',
            flexShrink: 0
          }}>
            <Check size={12} strokeWidth={3} />
            <span>Verificada</span>
          </div>
        </div>

        {/* Botones de Reacción Interactivos (Útil / Me encanta) */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={toggleHelpful}
            style={{
              background: hasVotedHelpful ? '#FFF7ED' : '#F9F8F6',
              border: hasVotedHelpful ? '1px solid #FDBA74' : '1px solid #ECE7DE',
              color: hasVotedHelpful ? '#EA580C' : '#555555',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.73rem',
              fontWeight: hasVotedHelpful ? '600' : '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <span>🔥</span>
            <span>Útil ({helpfulCount})</span>
          </button>

          <button
            type="button"
            onClick={toggleLoved}
            style={{
              background: hasVotedLoved ? '#FDF2F8' : '#F9F8F6',
              border: hasVotedLoved ? '1px solid #F9A8D4' : '1px solid #ECE7DE',
              color: hasVotedLoved ? '#DB2777' : '#555555',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.73rem',
              fontWeight: hasVotedLoved ? '600' : '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <span>❤️</span>
            <span>Me encanta ({lovedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 370;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      id="testimonios"
      className="section-padding"
      style={{ 
        backgroundColor: '#FCFBF9',
        borderTop: '1px solid #EAE8E4',
        borderBottom: '1px solid #EAE8E4',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ position: 'relative' }}>
        {/* Encabezado idéntico al estilo solicitado */}
        <div style={{
          textAlign: 'center',
          maxWidth: '750px',
          margin: '0 auto 2.5rem auto'
        }}>
          <p style={{
            fontSize: '0.74rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#B99A5B',
            fontWeight: '700',
            marginBottom: '0.6rem',
            fontFamily: 'var(--font-sans)'
          }}>
            LO QUE DICEN NUESTROS CLIENTES
          </p>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 3.8vw, 2.7rem)',
            fontWeight: '600',
            color: '#0A0A0A',
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            marginBottom: '0.4rem',
            position: 'relative',
            display: 'inline-block'
          }}>
            Experiencias que enamoran
            {/* Detalle de subrayado curvo de acento dorado como en la imagen */}
            <svg 
              style={{
                position: 'absolute',
                bottom: '-10px',
                right: '0',
                width: '180px',
                height: '10px'
              }} 
              viewBox="0 0 180 10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 7C45 2 135 1 178 7" 
                stroke="#B99A5B" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            </svg>
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.94rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginTop: '1.2rem'
          }}>
            Opiniones verificadas de clientes que ya disfrutan de sus fragancias favoritas en toda Colombia.
          </p>
        </div>

        {/* Controles de Navegación Flechas Izq / Der */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '1rem',
          paddingRight: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Ver reseñas anteriores"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #ECE7DE',
              backgroundColor: canScrollLeft ? '#FFFFFF' : '#F5F3EF',
              color: canScrollLeft ? '#111111' : '#B5B1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollLeft ? 'pointer' : 'default',
              boxShadow: canScrollLeft ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Ver siguientes reseñas"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #ECE7DE',
              backgroundColor: canScrollRight ? '#FFFFFF' : '#F5F3EF',
              color: canScrollRight ? '#111111' : '#B5B1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollRight ? 'pointer' : 'default',
              boxShadow: canScrollRight ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Contenedor Carrusel Horizontal Deslizable con Scroll Snap */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="reviews-scroll-container"
          style={{
            display: 'flex',
            gap: '1.4rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '1.5rem',
            paddingTop: '0.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {TESTIMONIALS_DATA.map((item) => (
            <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
              <ReviewCard item={item} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .reviews-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .review-customer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
          border-color: #D6C29A !important;
        }

        @media (max-width: 640px) {
          .review-customer-card {
            width: 300px !important;
            min-width: 300px !important;
            padding: 1.4rem 1.2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

import React, { useState, useEffect, useRef } from 'react';
import { Star, Check, Pause, Play } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

const ReviewCard = ({ item }) => {
  const [helpfulCount, setHelpfulCount] = useState(item.initialHelpful || 15);
  const [lovedCount, setLovedCount] = useState(item.initialLoved || 10);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [hasVotedLoved, setHasVotedLoved] = useState(false);

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
        position: 'relative',
        userSelect: 'none'
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

          {/* Badge Verificada verde */}
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
  const [isPaused, setIsPaused] = useState(false);

  // Duplicamos la lista para crear un bucle infinito continuo
  const infiniteReviews = [...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA];

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
        {/* Encabezado elegante */}
        <div style={{
          textAlign: 'center',
          maxWidth: '750px',
          margin: '0 auto 2.2rem auto'
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
            {/* Detalle de subrayado curvo de acento dorado */}
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
            marginTop: '1.2rem',
            marginBottom: '1rem'
          }}>
            Opiniones verificadas de clientes que ya disfrutan de sus fragancias favoritas en toda Colombia.
          </p>

          {/* Indicador interactivo de pausa al pasar cursor / tocar */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F5F2EB',
            border: '1px solid #E6E1D6',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.72rem',
            color: '#7A756D',
            fontFamily: 'var(--font-sans)'
          }}>
            {isPaused ? <Pause size={12} color="#B99A5B" /> : <Play size={12} color="#B99A5B" />}
            <span>{isPaused ? 'Pausado (continúa al retirar el cursor)' : 'Desplazamiento automático continuo · Toca o pasa el cursor para pausar'}</span>
          </div>
        </div>
      </div>

      {/* Contenedor Marquee de Movimiento Continuo Automático de Derecha a Izquierda */}
      <div 
        className="reviews-marquee-wrapper"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          padding: '1rem 0'
        }}
      >
        {/* Difuminados sutiles en los extremos para una sensación de infinito */}
        <div className="marquee-fade-left" />
        <div className="marquee-fade-right" />

        <div 
          className={`reviews-marquee-track ${isPaused ? 'marquee-paused' : ''}`}
          style={{
            display: 'flex',
            gap: '1.4rem',
            width: 'max-content'
          }}
        >
          {infiniteReviews.map((item, index) => (
            <div key={`${item.id}-${index}`} style={{ flexShrink: 0 }}>
              <ReviewCard item={item} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes autoScrollReviews {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .reviews-marquee-track {
          animation: autoScrollReviews 50s linear infinite;
          will-change: transform;
        }

        .reviews-marquee-track:hover,
        .marquee-paused {
          animation-play-state: paused !important;
        }

        .marquee-fade-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, #FCFBF9, transparent);
          z-index: 3;
          pointer-events: none;
        }

        .marquee-fade-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to left, #FCFBF9, transparent);
          z-index: 3;
          pointer-events: none;
        }

        .review-customer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
          border-color: #D6C29A !important;
        }

        @media (max-width: 768px) {
          .reviews-marquee-track {
            animation-duration: 38s;
          }
          .marquee-fade-left, .marquee-fade-right {
            width: 25px;
          }
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

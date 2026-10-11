import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

const TestimonialsSection = () => {
  const testimonials = TESTIMONIALS_DATA.filter(t => t.isPublished);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Cantidad visible según pantalla (en desktop se muestran 3, en tablet 2, en móvil 1)
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1100) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const prev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const next = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      next();
    } else if (distance < -50) {
      prev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section 
      id="testimonios"
      className="section-padding"
      style={{ 
        backgroundColor: '#F7F5F0', // Blanco cálido / Marfil premium de la marca
        borderTop: '1px solid #EAE6DF',
        borderBottom: '1px solid #EAE6DF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ position: 'relative' }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#B99A5B', // Dorado de la marca
            fontWeight: '600',
            marginBottom: '0.6rem',
            fontFamily: 'var(--font-sans)'
          }}>
            LA EXPERIENCIA DFV
          </p>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: '400',
            color: '#050505',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
            marginBottom: '0.8rem'
          }}>
            Lo que dicen nuestros clientes
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: '#666',
            lineHeight: '1.6',
            fontWeight: '300',
            marginBottom: '1.5rem'
          }}>
            Cada fragancia cuenta una historia. Descubre experiencias y opiniones sobre nuestra selección de perfumes.
          </p>

          {/* Línea decorativa dorada fina centrada */}
          <div style={{
            width: '45px',
            height: '2px',
            backgroundColor: '#B99A5B',
            margin: '0 auto'
          }} />
        </div>

        {/* Carrusel contenedor */}
        <div 
          className="testimonials-carousel-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', overflow: 'hidden', padding: '0.5rem 0' }}
        >
          <div 
            style={{
              display: 'flex',
              transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              gap: '1.5rem',
              boxSizing: 'border-box'
            }}
          >
            {testimonials.map((item) => (
              <div 
                key={item.id}
                style={{
                  flex: `0 0 calc(${100 / visibleCount}% - ${(1.5 * (visibleCount - 1)) / visibleCount}rem)`,
                  boxSizing: 'border-box',
                  display: 'flex'
                }}
              >
                <div 
                  className="testimonial-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #ECE7DE',
                    padding: '2rem 1.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Estrellas doradas */}
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '1.2rem', alignItems: 'center' }}>
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="#B99A5B" color="#B99A5B" />
                      ))}
                    </div>

                    {/* Comentario */}
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.92rem',
                      lineHeight: '1.65',
                      color: '#2B2B2B',
                      fontWeight: '300',
                      marginBottom: '1.8rem',
                      fontStyle: 'normal'
                    }}>
                      «{item.comment}»
                    </p>
                  </div>

                  {/* Autor y Avatar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F3EFE8',
                    paddingTop: '1.2rem',
                    marginTop: 'auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#F5F2EC',
                        border: '1px solid #B99A5B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#B99A5B',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}>
                        {item.avatarLetter}
                      </div>

                      <div>
                        <h4 style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.88rem',
                          fontWeight: '600',
                          color: '#050505',
                          marginBottom: '2px',
                          letterSpacing: '0.3px'
                        }}>
                          {item.name}
                        </h4>
                        <p style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.75rem',
                          color: '#8A857D',
                          fontWeight: '400'
                        }}>
                          {item.city}
                        </p>
                      </div>
                    </div>

                    {item.date && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#A8A39A',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: '300'
                      }}>
                        {item.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles de Navegación del Carrusel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '2.5rem'
        }}>
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            aria-label="Opinión anterior"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #D1B878',
              backgroundColor: '#FFFFFF',
              color: currentIndex === 0 ? '#C2BDB5' : '#050505',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentIndex === 0 ? 'default' : 'pointer',
              transition: 'all 0.25s ease',
              opacity: currentIndex === 0 ? 0.4 : 1
            }}
            onMouseEnter={e => {
              if (currentIndex > 0) {
                e.currentTarget.style.backgroundColor = '#050505';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = currentIndex === 0 ? '#C2BDB5' : '#050505';
            }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          {/* Indicadores de Posición */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir a la opinión ${idx + 1}`}
                style={{
                  width: idx === currentIndex ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  backgroundColor: idx === currentIndex ? '#B99A5B' : '#D9D4CB',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            aria-label="Siguiente opinión"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #D1B878',
              backgroundColor: '#FFFFFF',
              color: currentIndex >= maxIndex ? '#C2BDB5' : '#050505',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentIndex >= maxIndex ? 'default' : 'pointer',
              transition: 'all 0.25s ease',
              opacity: currentIndex >= maxIndex ? 0.4 : 1
            }}
            onMouseEnter={e => {
              if (currentIndex < maxIndex) {
                e.currentTarget.style.backgroundColor = '#050505';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = currentIndex >= maxIndex ? '#C2BDB5' : '#050505';
            }}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Indicación discreta de contenido de demostración según solicitud */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{
            fontSize: '0.68rem',
            letterSpacing: '1px',
            color: '#A8A39A',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase'
          }}>
            * Testimonios ilustrativos de demostración correspondientes a la experiencia de atención DFV Perfumes
          </p>
        </div>
      </div>

      <style>{`
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important;
          border-color: #D1B878 !important;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

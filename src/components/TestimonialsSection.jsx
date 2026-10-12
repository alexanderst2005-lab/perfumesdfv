import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';

const TestimonialsSection = () => {
  const [realReviews, setRealReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setRealReviews(data.map(r => ({
            id: `real-${r.id}`,
            name: r.name,
            city: r.city,
            comment: r.comment,
            rating: r.rating || 5,
            imageUrl: r.image_url,
            avatarLetter: (r.name || '?').trim().charAt(0).toUpperCase(),
            date: new Date(r.created_at).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasRealReviews = realReviews.length > 0;
  // Si hay reseñas reales cargadas desde el panel, se muestran SOLO esas.
  const testimonials = hasRealReviews
    ? realReviews
    : TESTIMONIALS_DATA.filter(t => t.isPublished);

  // Duplicamos la lista para crear un loop infinito sin interrupciones visuales
  const infiniteList = [...testimonials, ...testimonials, ...testimonials];

  const [isPaused, setIsPaused] = useState(false);

  if (!loaded && !hasRealReviews) {
    // Evita mostrar primero las de ejemplo y que luego cambien por las reales
    return null;
  }

  return (
    <section 
      id="testimonios"
      className="section-padding"
      style={{ 
        backgroundColor: '#FCFBF9', // El mismo marfil cálido de la página
        borderTop: '1px solid #EAE8E4',
        borderBottom: '1px solid #EAE8E4',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ position: 'relative', marginBottom: '2.5rem' }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#B99A5B', // Dorado DFV
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
      </div>

      {/* Carrusel de movimiento continuo ultra suave (Marquee infinito de derecha a izquierda) */}
      <div 
        className="marquee-wrapper"
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
        <div 
          className={`marquee-track ${isPaused ? 'marquee-paused' : ''}`}
          style={{
            display: 'flex',
            gap: '1.5rem',
            width: 'max-content'
          }}
        >
          {infiniteList.map((item, index) => (
            <div 
              key={`${item.id}-${index}`}
              className="testimonial-card-marquee"
              style={{
                width: '340px',
                flexShrink: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECE7DE',
                padding: '1.8rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <div>
                {/* Estrellas doradas */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1.1rem', alignItems: 'center' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#B99A5B" color="#B99A5B" />
                  ))}
                </div>

                {/* Captura real del mensaje del cliente */}
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={`Reseña de ${item.name}`}
                    loading="lazy"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                  />
                )}

                {/* Comentario */}
                {item.comment && (
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  color: '#2B2B2B',
                  fontWeight: '300',
                  marginBottom: '1.5rem',
                  fontStyle: 'normal'
                }}>
                  «{item.comment}»
                </p>
                )}
              </div>

              {/* Autor y Avatar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #F5F2EB',
                paddingTop: '1rem',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#F7F5F0',
                    border: '1px solid #B99A5B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B99A5B',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {item.avatarLetter}
                  </div>

                  <div>
                    <h4 style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#050505',
                      marginBottom: '2px',
                      letterSpacing: '0.3px'
                    }}>
                      {item.name}
                    </h4>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.72rem',
                      color: '#8A857D',
                      fontWeight: '400'
                    }}>
                      {item.city}
                    </p>
                  </div>
                </div>

                {item.date && (
                  <span style={{
                    fontSize: '0.68rem',
                    color: '#A8A39A',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: '300'
                  }}>
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota discreta: solo aparece mientras se muestran reseñas de ejemplo */}
      {!hasRealReviews && (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{
          fontSize: '0.65rem',
          letterSpacing: '1px',
          color: '#A8A39A',
          fontFamily: 'var(--font-sans)',
          textTransform: 'uppercase'
        }}>
          * Testimonios ilustrativos de demostración correspondientes a la experiencia de atención DFV Perfumes
        </p>
      </div>
      )}

      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .marquee-track {
          animation: marqueeScroll 28s linear infinite;
        }

        .marquee-paused {
          animation-play-state: paused;
        }

        .testimonial-card-marquee:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.07) !important;
          border-color: #D1B878 !important;
        }

        @media (max-width: 600px) {
          .testimonial-card-marquee {
            width: 285px !important;
            padding: 1.4rem !important;
          }
          .marquee-track {
            animation-duration: 22s;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;

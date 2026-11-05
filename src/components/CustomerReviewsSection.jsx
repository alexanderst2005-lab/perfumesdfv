import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const DEFAULT_DFV_REVIEWS = [
  {
    id: 'r1',
    name: 'Santiago M.',
    initial: 'S',
    avatarBg: '#9C7E1E',
    city: 'Bogotá',
    timeAgo: 'Hace 3 días',
    text: 'Llevaba años buscando un oud que no fuera agresivo. Lo encontré aquí en DFV Perfumes. La proyección dura todo el día y los cumplidos no paran. Vale cada peso.',
    topReview: false,
    usefulCount: 12,
    loveCount: 8
  },
  {
    id: 'r2',
    name: 'Valentina R.',
    initial: 'V',
    avatarBg: '#6B2FA0',
    city: 'Medellín',
    timeAgo: 'Hace 1 semana',
    text: 'Compré el set de regalo para mi esposo y quedó absolutamente enamorado. La presentación es de lujo, parece de boutique europea. Ya pedí el mío.',
    topReview: true,
    usefulCount: 24,
    loveCount: 19
  },
  {
    id: 'r3',
    name: 'Camila T.',
    initial: 'C',
    avatarBg: '#992B1E',
    city: 'Cali',
    timeAgo: 'Hace 2 semanas',
    text: 'Compré en DFV Perfumes por primera vez y no podía creer la calidad 100% original. El envío llegó súper rápido y el empaque es hermoso. Ya soy cliente fiel.',
    topReview: false,
    usefulCount: 17,
    loveCount: 11
  },
  {
    id: 'r4',
    name: 'Andrés P.',
    initial: 'A',
    avatarBg: '#1B5278',
    city: 'Barranquilla',
    timeAgo: 'Hace 1 mes',
    text: 'El asesor de WhatsApp me ayudó a elegir entre tres opciones y terminé comprando dos. La atención es increíble, se nota que conocen de alta perfumería.',
    topReview: false,
    usefulCount: 31,
    loveCount: 22
  },
  {
    id: 'r5',
    name: 'Laura G.',
    initial: 'L',
    avatarBg: '#8B3A62',
    city: 'Palmira',
    timeAgo: 'Hace 4 días',
    text: 'Fui directamente a la sede del C.C. Llanogrande y la experiencia fue espectacular. Me dejaron probar varias fragancias árabes hasta encontrar mi favorita.',
    topReview: true,
    usefulCount: 19,
    loveCount: 15
  },
  {
    id: 'r6',
    name: 'Mateo C.',
    initial: 'M',
    avatarBg: '#1E6B52',
    city: 'Pereira',
    timeAgo: 'Hace 1 semana',
    text: 'Pedí el Bharara King y el Club de Nuit Intense. Llegaron perfectamente sellados al día siguiente y la fijación en piel supera las 12 horas sin problema.',
    topReview: false,
    usefulCount: 15,
    loveCount: 10
  },
  {
    id: 'r7',
    name: 'Daniela V.',
    initial: 'D',
    avatarBg: '#A85D18',
    city: 'Bucaramanga',
    timeAgo: 'Hace 2 semanas',
    text: 'El Yara de Lattafa que compré aquí tiene un aroma dulce y delicado que todo el mundo me pregunta en la oficina. 100% recomendados por su seriedad.',
    topReview: false,
    usefulCount: 21,
    loveCount: 16
  },
  {
    id: 'r8',
    name: 'Julián H.',
    initial: 'J',
    avatarBg: '#2C3E50',
    city: 'Cali',
    timeAgo: 'Hace 3 semanas',
    text: 'Excelente servicio y precios súper competitivos. Compré con Addi en 3 cuotas súper fácil desde la página y al otro día ya tenía mi perfume en casa.',
    topReview: true,
    usefulCount: 28,
    loveCount: 18
  },
  {
    id: 'r9',
    name: 'Natalia S.',
    initial: 'N',
    avatarBg: '#7D3C98',
    city: 'Cartagena',
    timeAgo: 'Hace 3 semanas',
    text: 'Me encantó el detalle con el que empacan cada pedido. Se siente el cariño y el lujo desde que abres la caja. Sin duda mi perfumería de confianza.',
    topReview: false,
    usefulCount: 14,
    loveCount: 12
  },
  {
    id: 'r10',
    name: 'Sebastián L.',
    initial: 'S',
    avatarBg: '#8E6B23',
    city: 'Manizales',
    timeAgo: 'Hace 1 mes',
    text: 'Tenía dudas de comprar perfumería online pero DFV Perfumes superó todas mis expectativas. Sellos intactos, batch code verificable y atención de primera.',
    topReview: false,
    usefulCount: 26,
    loveCount: 20
  }
];

const CustomerReviewsSection = () => {
  const trackRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(5);
  const [reactions, setReactions] = useState({});

  const updatePagination = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
    const pages = Math.max(2, Math.round(el.scrollWidth / el.clientWidth));
    setTotalPages(pages);
    const progress = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
    setCurrentPage(Math.min(pages - 1, Math.round(progress * (pages - 1))));
  };

  useEffect(() => {
    updatePagination();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updatePagination, { passive: true });
    window.addEventListener('resize', updatePagination);
    return () => {
      el.removeEventListener('scroll', updatePagination);
      window.removeEventListener('resize', updatePagination);
    };
  }, []);

  const scrollPrev = () => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -el.clientWidth * 0.85, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 16) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
    }
  };

  const scrollToPage = (pageIdx) => {
    const el = trackRef.current;
    if (!el || totalPages <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const targetLeft = (pageIdx / (totalPages - 1)) * maxScroll;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const toggleReaction = (id, type) => {
    const key = `${id}_${type}`;
    setReactions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="dfv-reviews-section" style={{ backgroundColor: '#FFFFFF', padding: '2.8rem 0 2.2rem' }}>
      <div className="container">
        {/* ENCABEZADO CENTRAL */}
        <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.72rem',
              fontWeight: '600',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#B89728',
              margin: '0 0 0.45rem 0'
            }}
          >
            LO QUE DICEN NUESTROS CLIENTES
          </p>
          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 'clamp(1.55rem, 3.2vw, 2.2rem)',
              fontWeight: '700',
              color: '#111111',
              margin: '0 0 0.65rem 0',
              letterSpacing: '-0.3px'
            }}
          >
            Experiencias que enamoran
          </h2>
          <div
            style={{
              width: '52px',
              height: '2px',
              margin: '0 auto',
              background: 'linear-gradient(90deg, transparent, #C5A43E, transparent)'
            }}
          />
        </div>

        {/* CARRUSEL DE 10 RESEÑAS */}
        <div
          ref={trackRef}
          className="dfv-reviews-track"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '18px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            padding: '8px 2px 14px',
            scrollbarWidth: 'none'
          }}
        >
          {DEFAULT_DFV_REVIEWS.map((r) => {
            const isUseful = Boolean(reactions[`${r.id}_useful`]);
            const isLove = Boolean(reactions[`${r.id}_love`]);

            return (
              <div
                key={r.id}
                className="dfv-review-card"
                style={{
                  scrollSnapAlign: 'start',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: r.topReview ? '1px solid #DFC67A' : '1px solid #EFECE6',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  padding: '1.6rem 1.35rem 1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                {/* LÍNEA SUPERIOR DORADA SUTIL */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20%',
                    right: '20%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #D4B656, transparent)'
                  }}
                />

                {/* ETIQUETA TOP RESEÑA */}
                {r.topReview && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#C5A43E',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(197, 164, 62, 0.3)'
                    }}
                  >
                    <span>★</span> TOP RESEÑA
                  </div>
                )}

                <div>
                  {/* 5 ESTRELLAS DORADAS */}
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#B89728',
                      fontSize: '0.98rem',
                      letterSpacing: '3px',
                      marginBottom: '1rem',
                      marginTop: r.topReview ? '0.4rem' : '0'
                    }}
                  >
                    ★★★★★
                  </div>

                  {/* TEXTO DE LA RESEÑA */}
                  <p
                    style={{
                      fontFamily: "var(--font-name, 'Archivo', 'Inter', sans-serif)",
                      fontSize: '0.86rem',
                      fontStyle: 'italic',
                      color: '#333333',
                      lineHeight: 1.62,
                      textAlign: 'center',
                      margin: '0 0 1.35rem 0'
                    }}
                  >
                    "{r.text}"
                  </p>
                </div>

                <div>
                  {/* SEPARADOR SUTIL */}
                  <div style={{ height: '1px', backgroundColor: '#F3F1EC', marginBottom: '1rem' }} />

                  {/* DATOS DEL CLIENTE + INSIGNIA VERIFICADA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.6rem',
                      marginBottom: '0.95rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: r.avatarBg,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          flexShrink: 0
                        }}
                      >
                        {r.initial}
                      </div>

                      <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            color: '#111111',
                            margin: '0 0 2px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {r.name}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '0.68rem',
                            color: '#888888',
                            margin: 0,
                            lineHeight: 1.25
                          }}
                        >
                          {r.city} · {r.timeAgo}
                        </p>
                      </div>
                    </div>

                    {/* BADGE VERIFICADA */}
                    <div
                      style={{
                        backgroundColor: '#EFFAF3',
                        border: '1px solid #C6F0D5',
                        borderRadius: '10px',
                        padding: '4px 9px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1E8E4E',
                        fontSize: '0.64rem',
                        fontWeight: '600',
                        flexShrink: 0,
                        lineHeight: 1.15
                      }}
                    >
                      <Check size={11} strokeWidth={2.5} style={{ marginBottom: '1px' }} />
                      <span>Verificada</span>
                    </div>
                  </div>

                  {/* BOTONES DE REACCIÓN (ÚTIL / ME ENCANTA) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => toggleReaction(r.id, 'useful')}
                      style={{
                        backgroundColor: isUseful ? '#FEF6E0' : '#F4F4F5',
                        border: isUseful ? '1px solid #E2C15A' : '1px solid transparent',
                        borderRadius: '999px',
                        padding: '4px 11px',
                        fontSize: '0.68rem',
                        color: '#555555',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>🔥</span> Útil ({r.usefulCount + (isUseful ? 1 : 0)})
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleReaction(r.id, 'love')}
                      style={{
                        backgroundColor: isLove ? '#FCEEEF' : '#F4F4F5',
                        border: isLove ? '1px solid #F3B6BE' : '1px solid transparent',
                        borderRadius: '999px',
                        padding: '4px 11px',
                        fontSize: '0.68rem',
                        color: '#555555',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>❤️</span> Me encanta ({r.loveCount + (isLove ? 1 : 0)})
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLES DE NAVEGACIÓN CIRCULARES DORADOS + INDICADORES */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
            marginBottom: '2.2rem'
          }}
        >
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Reseñas anteriores"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid #C5A43E',
              backgroundColor: '#FFFFFF',
              color: '#9A7D22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const active = idx === currentPage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToPage(idx)}
                  aria-label={`Ir a página ${idx + 1}`}
                  style={{
                    width: active ? '22px' : '7px',
                    height: '3px',
                    borderRadius: '999px',
                    backgroundColor: active ? '#B89728' : '#D6D3CD',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Siguientes reseñas"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid #B89728',
              backgroundColor: '#B89728',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(184, 151, 40, 0.28)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowRight size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* CALIFICACIÓN GLOBAL 4.9 / 5 AL PIE (IDÉNTICO A LA IMAGEN 2) */}
        <div
          style={{
            borderTop: '1px solid #F0EDE6',
            paddingTop: '1.6rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#B89728',
              lineHeight: 1.1,
              marginBottom: '0.25rem'
            }}
          >
            4.9 / 5
          </div>
          <div
            style={{
              color: '#B89728',
              fontSize: '0.95rem',
              letterSpacing: '3px',
              marginBottom: '0.35rem'
            }}
          >
            ★★★★★
          </div>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.66rem',
              fontWeight: '500',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#999999',
              margin: 0
            }}
          >
            BASADO EN +1.200 RESEÑAS VERIFICADAS
          </p>
        </div>

        {/* RAYITA DIVISORIA DEBAJO DE RESEÑAS */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '2rem' }} />
      </div>

      <style>{`
        .dfv-reviews-track::-webkit-scrollbar {
          display: none;
        }
        .dfv-review-card {
          flex: 0 0 calc((100% - 54px) / 4);
          min-width: 265px;
        }
        @media (max-width: 1100px) {
          .dfv-review-card {
            flex: 0 0 calc((100% - 36px) / 3);
          }
        }
        @media (max-width: 820px) {
          .dfv-review-card {
            flex: 0 0 calc((100% - 18px) / 2);
          }
        }
        @media (max-width: 560px) {
          .dfv-review-card {
            flex: 0 0 88%;
            min-width: 260px;
          }
        }
      `}</style>
    </section>
  );
};

export default CustomerReviewsSection;

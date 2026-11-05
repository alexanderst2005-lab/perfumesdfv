import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const DEFAULT_DFV_REVIEWS = [
  {
    id: 'r1',
    name: 'Mariana G.',
    initial: 'M',
    avatarBg: '#8B3A62',
    city: 'Palmira',
    timeAgo: 'Hace 2 días',
    text: 'Fui a la sede del C.C. Llanogrande por el estuche de Good Girl Blush y salí encantada. La asesoría es súper personalizada y todos los perfumes son 100% originales.',
    topReview: true,
    usefulCount: 19,
    loveCount: 14
  },
  {
    id: 'r2',
    name: 'Carlos E.',
    initial: 'C',
    avatarBg: '#1E5631',
    city: 'Cali',
    timeAgo: 'Hace 4 días',
    text: 'Pedí el Sauvage de Dior y el 212 Men NYC desde la web. Me llegó al día siguiente perfectamente empacado. La fijación me dura más de 12 horas en la piel.',
    topReview: false,
    usefulCount: 23,
    loveCount: 16
  },
  {
    id: 'r3',
    name: 'Camila D.',
    initial: 'C',
    avatarBg: '#7D3C98',
    city: 'Bogotá',
    timeAgo: 'Hace 1 semana',
    text: 'Me recomendaron el Yara de Lattafa por WhatsApp y huele delicioso, dulce y elegante. Llegó súper bien protegido y en la oficina todas me preguntan cuál uso.',
    topReview: true,
    usefulCount: 31,
    loveCount: 25
  },
  {
    id: 'r4',
    name: 'Felipe O.',
    initial: 'F',
    avatarBg: '#1B4F72',
    city: 'Medellín',
    timeAgo: 'Hace 1 semana',
    text: 'El Odyssey Mandarin Sky de Armaf que compré en DFV Perfumes es una locura de proyección. Llegó con sus sellos intactos y código de lote verificable.',
    topReview: false,
    usefulCount: 15,
    loveCount: 11
  },
  {
    id: 'r5',
    name: 'Paola A.',
    initial: 'P',
    avatarBg: '#A04000',
    city: 'Palmira',
    timeAgo: 'Hace 2 semanas',
    text: 'Siempre compro mis fragancias en la sede de la Calle 31 en el Centro. Tienen las mejores casas árabes y de diseñador, y la atención de todo el equipo es impecable.',
    topReview: false,
    usefulCount: 18,
    loveCount: 13
  },
  {
    id: 'r6',
    name: 'Esteban V.',
    initial: 'E',
    avatarBg: '#2C3E50',
    city: 'Pereira',
    timeAgo: 'Hace 2 semanas',
    text: 'Llevaba meses buscando el Bharara Niche original y aquí en DFV lo conseguí a excelente precio. Pagué en 3 cuotas con Addi desde la página sin complicaciones.',
    topReview: true,
    usefulCount: 27,
    loveCount: 21
  },
  {
    id: 'r7',
    name: 'Gabriela M.',
    initial: 'G',
    avatarBg: '#922B21',
    city: 'Buga',
    timeAgo: 'Hace 3 semanas',
    text: 'Pedí el estuche de Dolce & Gabbana Light Blue para el cumpleaños de mi novio y la presentación fue de total lujo. El envío fue rapidísimo, súper recomendados.',
    topReview: false,
    usefulCount: 14,
    loveCount: 9
  },
  {
    id: 'r8',
    name: 'Alejandro R.',
    initial: 'A',
    avatarBg: '#7E5109',
    city: 'Bucaramanga',
    timeAgo: 'Hace 3 semanas',
    text: 'Compré el Bade’e Al Oud y el Club de Nuit Intense. Se nota de inmediato cuando una perfumería maneja producto legítimo. Excelente empaque de seguridad para el envío.',
    topReview: false,
    usefulCount: 22,
    loveCount: 17
  },
  {
    id: 'r9',
    name: 'Tatiana B.',
    initial: 'T',
    avatarBg: '#117864',
    city: 'Tuluá',
    timeAgo: 'Hace 1 mes',
    text: 'Me encanta cómo te asesoran según las notas que te gustan, ya sean dulces, cítricas o amaderadas. Atinaron 100% con mi perfume ideal. ¡Mil gracias DFV!',
    topReview: false,
    usefulCount: 16,
    loveCount: 12
  },
  {
    id: 'r10',
    name: 'Juan Pablo Z.',
    initial: 'J',
    avatarBg: '#4A235A',
    city: 'Armenia',
    timeAgo: 'Hace 1 mes',
    text: 'El Bleu de Chanel Parfum y el Le Male Elixir que compré aquí superaron mis expectativas. Seriedad, despacho en menos de 24 horas y atención de primera.',
    topReview: true,
    usefulCount: 29,
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


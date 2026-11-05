import React, { useState, useEffect, useRef } from 'react';

// Contadores por defecto oficiales de DFV Perfumes
const DEFAULT_COUNTERS = [
  { id: 'c1', value: 5000, suffix: '+', label: 'CLIENTES FELICES', icon: '👥' },
  { id: 'c2', value: 12000, suffix: '+', label: 'PEDIDOS ENTREGADOS', icon: '📦' },
  { id: 'c3', value: 30, suffix: '+', label: 'AÑOS DE TRAYECTORIA', icon: '⭐' },
  { id: 'c4', value: 100, suffix: '%', label: 'ENVÍOS A TODO EL PAÍS', icon: '🚚' }
];

const DEFAULT_ICONS = ['👥', '📦', '⭐', '🚚'];

// Hook para animar números suavemente de 0 al valor final
function useCountUp(targetValue, shouldStart, duration = 1600) {
  const [count, setCount] = useState(shouldStart ? 0 : targetValue);

  useEffect(() => {
    if (!shouldStart) {
      setCount(targetValue);
      return;
    }
    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * targetValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [shouldStart, targetValue, duration]);

  return count;
}

const SingleCounterCard = ({ counter, index, shouldAnimate }) => {
  const animatedValue = useCountUp(counter.value || 0, shouldAnimate);

  const formattedNumber = () => {
    return animatedValue.toLocaleString('es-CO');
  };

  const getEmoji = () => {
    if (counter.icon) return counter.icon;
    const lbl = (counter.label || '').toUpperCase();
    if (lbl.includes('CLIENTE')) return '👥';
    if (lbl.includes('PEDIDO')) return '📦';
    if (lbl.includes('ENVÍO') || lbl.includes('ENVIO') || lbl.includes('DESPACHO')) return '🚚';
    if (lbl.includes('SATISFAC') || lbl.includes('AÑO') || lbl.includes('TRAYECTORIA')) return '⭐';
    return DEFAULT_ICONS[index % DEFAULT_ICONS.length];
  };

  return (
    <div 
      className="dfv-counter-card"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAEAEA',
        borderRadius: '20px',
        padding: '1.75rem 1rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* ICONO / EMOJI ARRIBA */}
      <div style={{ fontSize: '1.8rem', lineHeight: 1, marginBottom: '0.6rem' }}>
        {getEmoji()}
      </div>

      {/* NÚMERO GRANDE EN NEGRITA MONTSERRAT */}
      <div 
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 'clamp(1.6rem, 4.5vw, 2.2rem)',
          fontWeight: '700',
          color: '#111111',
          lineHeight: 1.15,
          marginBottom: '0.45rem',
          letterSpacing: '-0.5px',
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'center'
        }}
      >
        {counter.prefix && <span>{counter.prefix}</span>}
        <span>{formattedNumber()}</span>
        <span>{counter.suffix || ''}</span>
      </div>

      {/* DESCRIPCIÓN DEBAJO EN MAYÚSCULAS GRIS */}
      <p 
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '0.72rem',
          fontWeight: '400',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#555555',
          margin: 0,
          lineHeight: 1.35
        }}
      >
        {counter.label}
      </p>
    </div>
  );
};

const CountersBar = () => {
  const [counters, setCounters] = useState(DEFAULT_COUNTERS);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch(`/api/site-counters?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.counters)) {
          const activeCounters = data.counters.filter(c => c.active !== false && c.value > 0);
          if (activeCounters.length > 0) {
            setCounters(activeCounters);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="dfv-counters-section" 
      style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '2.75rem 0 2.5rem'
      }}
    >
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* GRID: 2x2 EN MÓVIL, 4 EN ESCRITORIO */}
        <div className="dfv-counters-grid">
          {counters.map((c, idx) => (
            <SingleCounterCard key={c.id || idx} counter={c} index={idx} shouldAnimate={shouldAnimate} />
          ))}
        </div>

        {/* FRASE SENCILLA AL PIE */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p 
            style={{
              fontFamily: "var(--font-name, 'Archivo', 'Inter', sans-serif)",
              fontSize: '0.88rem',
              color: '#777777',
              fontWeight: '400',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            Miles de clientes confían en nosotros cada día
          </p>
        </div>

        {/* RAYITA DIVISORIA DEBAJO DE CONTADORES */}
        <div style={{ height: '1px', backgroundColor: '#e8e8e8', marginTop: '1.8rem' }} />

      </div>

      <style>{`
        .dfv-counters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .dfv-counters-section {
            padding: 2.25rem 0 2rem !important;
          }
          .dfv-counters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .dfv-counter-card {
            padding: 1.5rem 0.75rem !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CountersBar;

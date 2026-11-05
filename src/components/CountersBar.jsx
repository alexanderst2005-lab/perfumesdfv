import React, { useState, useEffect, useRef } from 'react';

// Contadores por defecto oficiales de DFV Perfumes
const DEFAULT_COUNTERS = [
  { id: 'c1', value: 5000, suffix: '+', label: 'CLIENTES SATISFECHOS' },
  { id: 'c2', value: 12000, suffix: '+', label: 'PEDIDOS ENTREGADOS' },
  { id: 'c3', value: 30, suffix: '+', label: 'AÑOS DE TRAYECTORIA' },
  { id: 'c4', value: 100, suffix: '%', label: 'ENVÍOS A TODO EL PAÍS' }
];

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
      // easeOutCubic
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

const SingleCounterCard = ({ counter, shouldAnimate }) => {
  const animatedValue = useCountUp(counter.value || 0, shouldAnimate);

  const formattedNumber = () => {
    if (counter.value === 12000) {
      return animatedValue.toLocaleString('es-CO'); // "12.000"
    }
    if (counter.value === 5000) {
      return animatedValue.toString(); // "5000"
    }
    return animatedValue.toLocaleString('es-CO');
  };

  return (
    <div 
      className="dfv-counter-card"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #EAE6DF',
        borderRadius: '12px',
        padding: '1.85rem 1.25rem',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        style={{
          fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
          fontSize: 'clamp(2rem, 3.6vw, 2.75rem)',
          fontWeight: '500',
          color: '#111111',
          lineHeight: 1.1,
          marginBottom: '0.45rem',
          letterSpacing: '-0.5px',
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'center'
        }}
      >
        {counter.prefix && <span style={{ color: '#B99A5B', marginRight: '2px' }}>{counter.prefix}</span>}
        <span>{formattedNumber()}</span>
        <span style={{ color: '#B99A5B', fontSize: '0.9em', marginLeft: '2px', fontWeight: '400' }}>
          {counter.suffix || ''}
        </span>
      </div>
      <p 
        style={{
          fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
          fontSize: '0.74rem',
          fontWeight: '600',
          letterSpacing: '1.2px',
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
    fetch('/api/site-counters')
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
        backgroundColor: '#FAF8F5', 
        padding: '3.75rem 0 3.5rem',
        borderTop: '1px solid #EAE6DF',
        borderBottom: '1px solid #EAE6DF'
      }}
    >
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* GRID: 2x2 EN MÓVIL, 4 EN ESCRITORIO */}
        <div className="dfv-counters-grid">
          {counters.map((c) => (
            <SingleCounterCard key={c.id} counter={c} shouldAnimate={shouldAnimate} />
          ))}
        </div>

        {/* FRASE INSPIRACIONAL AL PIE */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <div style={{ width: '42px', height: '1px', backgroundColor: '#B99A5B', margin: '0 auto 1.1rem', opacity: 0.6 }} />
          <p 
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)',
              color: '#333333',
              fontStyle: 'italic',
              margin: 0,
              letterSpacing: '0.4px',
              lineHeight: 1.3
            }}
          >
            “Miles de clientes confían en nosotros”
          </p>
          <span style={{ 
            display: 'block', 
            fontSize: '0.68rem', 
            letterSpacing: '2.8px', 
            textTransform: 'uppercase', 
            color: '#888888', 
            marginTop: '0.45rem', 
            fontWeight: '600',
            fontFamily: 'var(--font-sans, "Montserrat", sans-serif)' 
          }}>
            PASIÓN POR LA AUTENTICIDAD & EL LUJO
          </span>
        </div>

      </div>

      <style>{`
        .dfv-counters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .dfv-counter-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          border-color: #B99A5B;
        }

        @media (max-width: 768px) {
          .dfv-counters-section {
            padding: 3rem 0 2.75rem !important;
          }
          .dfv-counters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
          .dfv-counter-card {
            padding: 1.35rem 0.75rem !important;
            border-radius: 10px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CountersBar;

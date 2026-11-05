import React, { useState, useEffect, useRef } from 'react';

// Hook para animar números de 0 al valor final
function useCountUp(targetValue, shouldStart, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
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

  return (
    <div 
      className="dfv-counter-card"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #EAE6DF',
        borderRadius: '12px',
        padding: '1.75rem 1.25rem',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        style={{
          fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
          fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
          fontWeight: '500',
          color: '#111111',
          lineHeight: 1.1,
          marginBottom: '0.4rem',
          letterSpacing: '-0.5px'
        }}
      >
        <span style={{ color: '#B99A5B' }}>{counter.prefix || ''}</span>
        {animatedValue.toLocaleString()}
        <span style={{ color: '#B99A5B', fontSize: '0.85em', marginLeft: '2px' }}>{counter.suffix || ''}</span>
      </div>
      <p 
        style={{
          fontFamily: 'var(--font-sans, "Montserrat", sans-serif)',
          fontSize: '0.78rem',
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#666666',
          margin: 0,
          lineHeight: 1.4
        }}
      >
        {counter.label}
      </p>
    </div>
  );
};

const CountersBar = () => {
  const [counters, setCounters] = useState([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch('/api/site-counters')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.counters)) {
          const activeCounters = data.counters.filter(c => c.active !== false && c.value > 0);
          setCounters(activeCounters);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (counters.length === 0) return;

    // Verificar si ya se animó en esta sesión
    const alreadyAnimated = sessionStorage.getItem('dfv_counters_animated');
    if (alreadyAnimated) {
      setShouldAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldAnimate(true);
          sessionStorage.setItem('dfv_counters_animated', 'true');
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [counters]);

  if (counters.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef}
      className="dfv-counters-section" 
      style={{ 
        backgroundColor: '#FAF8F5', 
        padding: '3.5rem 0 3.25rem',
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
        <div style={{ textAlign: 'center', marginTop: '2.25rem' }}>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#B99A5B', margin: '0 auto 1rem', opacity: 0.6 }} />
          <p 
            style={{
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              color: '#333333',
              fontStyle: 'italic',
              margin: 0,
              letterSpacing: '0.5px'
            }}
          >
            “Miles de clientes confían en nosotros”
          </p>
          <span style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#888888', marginTop: '0.4rem', fontWeight: '500' }}>
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
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          border-color: #B99A5B;
        }

        @media (max-width: 768px) {
          .dfv-counters-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .dfv-counter-card {
            padding: 1.25rem 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CountersBar;


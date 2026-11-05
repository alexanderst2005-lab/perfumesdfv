import React from 'react';
import { Sparkles, Truck, HeartHandshake, CreditCard } from 'lucide-react';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Atención personalizada',
    description: 'Te guiamos en cada paso de tu compra'
  },
  {
    icon: Truck,
    title: 'Envíos a todo el país',
    description: 'Llegamos a cada rincón de Colombia'
  },
  {
    icon: HeartHandshake,
    title: 'Asesoría en fragancias',
    description: 'Encuentra el aroma ideal para tu piel'
  },
  {
    icon: CreditCard,
    title: 'Diferentes medios de pago',
    description: 'Transferencia, efectivo y pasarelas seguras'
  }
];

const BenefitsBar = () => {
  return (
    <section 
      style={{ 
        backgroundColor: '#FAF8F5', 
        borderBottom: '1px solid #EAE6DF',
        padding: '1.25rem 0',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="dfv-benefits-track">
          {BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="dfv-benefit-item">
                <div className="dfv-benefit-icon">
                  <Icon size={19} color="#B99A5B" strokeWidth={1.75} />
                </div>
                <div className="dfv-benefit-text">
                  <h4 className="dfv-benefit-title">{b.title}</h4>
                  <p className="dfv-benefit-desc">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .dfv-benefits-track {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          align-items: center;
        }
        .dfv-benefit-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.4rem 0.6rem;
        }
        .dfv-benefit-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: rgba(185, 154, 91, 0.1);
          border: 1px solid rgba(185, 154, 91, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dfv-benefit-text {
          display: flex;
          flex-direction: column;
        }
        .dfv-benefit-title {
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #111111;
          margin: 0 0 2px 0;
          text-transform: uppercase;
        }
        .dfv-benefit-desc {
          font-family: var(--font-sans, 'Montserrat', sans-serif);
          font-size: 0.72rem;
          color: #666666;
          margin: 0;
          line-height: 1.3;
        }

        @media (max-width: 1024px) {
          .dfv-benefits-track {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }

        @media (max-width: 640px) {
          .dfv-benefits-track {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 1rem;
            padding-bottom: 0.25rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .dfv-benefits-track::-webkit-scrollbar {
            display: none;
          }
          .dfv-benefit-item {
            flex: 0 0 78%;
            scroll-snap-align: start;
            background: #ffffff;
            padding: 0.75rem 0.9rem;
            border-radius: 8px;
            border: 1px solid #EAE6DF;
          }
        }
      `}</style>
    </section>
  );
};

export default BenefitsBar;


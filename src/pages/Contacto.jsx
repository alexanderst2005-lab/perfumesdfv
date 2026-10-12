import React from 'react';
import { MapPin, Mail, AtSign, MessageCircle } from 'lucide-react';

const Contacto = () => {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '6rem', backgroundColor: 'var(--color-white)' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header de la página */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.65rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
            Atención Personalizada
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: '400', color: 'var(--color-black)' }}>
            Contacto <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-gray)' }}>&</span> Asesoría
          </h1>
        </div>

        {/* Layout de dos columnas */}
        <div className="contact-grid" style={{ display: 'grid', gap: '4rem', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Info */}
          <div style={{ paddingRight: '1rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-gray)', lineHeight: '1.7', marginBottom: '3rem', fontWeight: '300' }}>
              Estamos aquí para asesorarte. Ya sea que busques el perfume ideal para una ocasión especial, 
              o necesites ayuda con tu pedido, nuestro equipo está a tu disposición.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Item */}
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <MapPin size={20} strokeWidth={1.5} color="var(--color-black)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-black)' }}>
                    Nuestras Sedes (Palmira, Valle)
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>📍 <strong>Sede Calle 31 · Centro:</strong> Calle 31 #27-44</p>
                  <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.2rem' }}>WA: +57 320 697 0036</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginTop: '0.6rem' }}>📍 <strong>Sede C.C. Llanogrande:</strong> Local Palmira</p>
                  <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.2rem' }}>WA: +57 320 862 7036</p>
                  <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.6rem' }}>Envíos 100% seguros a todo el país.</p>
                </div>
              </div>

              {/* Item */}
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <Mail size={20} strokeWidth={1.5} color="var(--color-black)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-black)' }}>
                    Email
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>info@dfvperfumes.com</p>
                </div>
              </div>

              {/* Item */}
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <AtSign size={20} strokeWidth={1.5} color="var(--color-black)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-black)' }}>
                    Instagram
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>@perfumesdfv</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Atención */}
          <div style={{ 
            backgroundColor: '#FAFAFA', 
            padding: '3rem 2rem', 
            textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '400', color: 'var(--color-black)', marginBottom: '1.5rem' }}>
              Atención Inmediata
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', lineHeight: '1.6', marginBottom: '2.5rem', fontWeight: '300' }}>
              La forma más rápida de comunicarte con nuestros asesores es a través de WhatsApp. 
              Estamos disponibles de Lunes a Sábado para responder todas tus dudas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a 
                href="https://wa.me/573206970036?text=Hola%20DFV%20Perfumes%2C%20quisiera%20asesor%C3%ADa%20de%20la%20Sede%20Calle%2031" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.8rem',
                  backgroundColor: 'var(--color-black)',
                  color: '#fff',
                  padding: '1rem 1.5rem',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <MessageCircle size={18} />
                WhatsApp Sede Calle 31
              </a>

              <a 
                href="https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20quisiera%20asesor%C3%ADa%20de%20la%20Sede%20Llanogrande" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.8rem',
                  backgroundColor: '#B99A5B',
                  color: '#fff',
                  padding: '1rem 1.5rem',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <MessageCircle size={18} />
                WhatsApp Sede Llanogrande
              </a>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .contact-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contacto;

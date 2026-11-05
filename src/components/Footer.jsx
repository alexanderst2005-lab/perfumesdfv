import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const InstagramIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
  </svg>
);

const sectionTitleStyle = {
  fontSize: '0.7rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '1.25rem',
  fontFamily: 'var(--font-sans)',
  fontWeight: '500'
};

const linkStyle = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem',
  textDecoration: 'none',
  transition: 'color 0.2s',
  fontFamily: 'var(--font-sans)',
  fontWeight: '300',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textAlign: 'left'
};

const POLICY_MODALS = {
  envios: {
    eyebrow: 'INFORMACIÓN DE ENTREGA',
    title: 'Política de Envíos',
    sections: [
      {
        heading: 'Cobertura Nacional Asegurada',
        body: 'Realizamos despachos seguros y asegurados desde nuestras sedes en Palmira (Valle del Cauca) hacia cualquier ciudad o municipio de Colombia a través de transportadoras aliadas certificadas.'
      },
      {
        heading: 'Tiempos de Entrega Estimados',
        body: '• Palmira y Cali: Entrega el mismo día o al siguiente día hábil.\n• Ciudades principales (Bogotá, Medellín, Barranquilla, Bucaramanga, Pereira, Armenia): 1 a 3 días hábiles.\n• Resto del país y municipios especiales: 3 a 5 días hábiles.'
      },
      {
        heading: 'Empaque de Lujo y Protección',
        body: 'Cada fragancia se despacha con protección térmica y acolchada de alta resistencia para garantizar que tu perfume llegue intacto, sellado y en óptimas condiciones.'
      },
      {
        heading: 'Seguimiento de tu Pedido',
        body: 'Una vez despachado tu pedido, nuestro equipo te compartirá el número de guía directamente por WhatsApp para que puedas rastrear tu compra en tiempo real.'
      }
    ],
    ctaLabel: 'Consultar estado de envío por WhatsApp',
    ctaHref: 'https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20quisiera%20informaci%C3%B3n%20sobre%20env%C3%ADos.'
  },
  cambios: {
    eyebrow: 'GARANTÍA Y RESPALDO DFV',
    title: 'Cambios y Devoluciones',
    sections: [
      {
        heading: 'Garantía de Originalidad 100%',
        body: 'En DFV Perfumes contamos con más de 30 años de trayectoria comercializando perfumería 100% original e importada. Todos nuestros productos cuentan con garantía total de autenticidad.'
      },
      {
        heading: 'Condiciones para Cambios',
        body: 'Por tratarse de productos de uso personal y perfumería importada, los cambios por referencia se realizan dentro de los primeros 5 días calendario posteriores a la entrega, siempre que el producto conserve su celofán original sellado intacto, sin uso y en perfecto estado.'
      },
      {
        heading: 'Novedades en el Transporte o Garantía de Atomizador',
        body: 'Si tu pedido presenta alguna novedad por transporte o fallo de fábrica en el atomizador al momento de recibirlo, comunícate de inmediato con nuestra línea de atención dentro de las primeras 48 horas tras la entrega para darte solución prioritaria.'
      }
    ],
    ctaLabel: 'Solicitar cambio o garantía por WhatsApp',
    ctaHref: 'https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20necesito%20ayuda%20con%20un%20cambio%20o%20garant%C3%ADa.'
  },
  terminos: {
    eyebrow: 'INFORMACIÓN LEGAL',
    title: 'Términos y Condiciones',
    sections: [
      {
        heading: '1. Generalidades',
        body: 'Bienvenido a DFV Perfumes. Al realizar una compra a través de nuestro sitio web o canales oficiales de WhatsApp, aceptas las condiciones comerciales aquí descritas, orientadas a brindarte una experiencia de compra segura y transparente.'
      },
      {
        heading: '2. Precios y Disponibilidad',
        body: 'Todos los precios están expresados en pesos colombianos (COP). La disponibilidad de cada fragancia se actualiza constantemente en nuestro catálogo y se confirma al procesar tu orden.'
      },
      {
        heading: '3. Medios de Pago Autorizados',
        body: 'Aceptamos transferencias bancarias (Bancolombia, Nequi, Daviplata), pagos en línea y financiación a través de aliados comerciales autorizados como Addi y Sistecrédito, además de pagos presenciales en nuestras dos sedes físicas en Palmira.'
      },
      {
        heading: '4. Propiedad Intelectual',
        body: 'El contenido visual, logotipos y material editorial de este sitio pertenecen a DFV Perfumes. Las marcas y nombres de las casas perfumistas mencionadas son propiedad de sus respectivos fabricantes y se utilizan únicamente para identificar los productos originales comercializados.'
      }
    ],
    ctaLabel: 'Contactar atención al cliente',
    ctaHref: 'https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20tengo%20una%20consulta.'
  },
  privacidad: {
    eyebrow: 'PROTECCIÓN DE DATOS (LEY 1581 DE 2012)',
    title: 'Política de Privacidad',
    sections: [
      {
        heading: 'Uso Responsable de tus Datos',
        body: 'En cumplimiento de la Ley 1581 de 2012 de Protección de Datos Personales en Colombia, DFV Perfumes garantiza que la información suministrada por nuestros clientes (nombre, dirección de entrega, teléfono y correo electrónico) es confidencial.'
      },
      {
        heading: 'Finalidad de la Información',
        body: 'Tus datos se utilizan exclusivamente para procesar, despachar y hacer seguimiento de tus pedidos, brindarte asesoría olfativa personalizada y, si así lo autorizas, informarte sobre lanzamientos o promociones especiales.'
      },
      {
        heading: 'Derechos del Titular',
        body: 'En cualquier momento puedes solicitar la actualización, rectificación o eliminación de tus datos personales escribiéndonos a través de nuestros canales oficiales de atención en Palmira o por WhatsApp.'
      }
    ],
    ctaLabel: 'Escribir a nuestro equipo',
    ctaHref: 'https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%2C%20tengo%20una%20consulta%20sobre%20datos%20personales.'
  }
};

const Footer = () => {
  const [activeModalKey, setActiveModalKey] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleStoreNavigation = (targetPath) => {
    if (`${location.pathname}${location.search}` === targetPath) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleHomeSectionClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
      window.history.replaceState(null, '', `/#${sectionId}`);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const activeModal = activeModalKey ? POLICY_MODALS[activeModalKey] : null;

  return (
    <footer style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-cream)', padding: '4rem 0 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        <div className="footer-grid">
          
          {/* 1. Marca */}
          <div className="footer-brand">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ display: 'inline-block', textDecoration: 'none' }}>
              <svg viewBox="0 0 160 50" height="34" aria-label="DFV Perfumes" style={{ display: 'block', marginBottom: '1.2rem' }}>
                <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill="var(--color-cream)">DFV</text>
                <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill="var(--color-cream)">PERFUMES</text>
              </svg>
            </Link>
            <p style={{ color: 'rgba(245,242,236,0.65)', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '240px', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: '300' }}>
              Tu esencia, tu identidad.<br />Fragancias que cuentan tu historia.
            </p>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
              <a href="https://www.instagram.com/perfumesdfv" target="_blank" rel="noreferrer" aria-label="Instagram DFV Perfumes" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/perfumesdfv" target="_blank" rel="noreferrer" aria-label="Facebook DFV Perfumes" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <FacebookIcon />
              </a>
              <a href="https://www.tiktok.com/@perfumesdfv" target="_blank" rel="noreferrer" aria-label="TikTok DFV Perfumes" style={{ color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* 2. Tienda */}
          <div>
            <h4 style={sectionTitleStyle}>Tienda</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0 }}>
              {[
                ['Todos', '/tienda'],
                ['Mujer', '/tienda?category=Mujer'],
                ['Hombre', '/tienda?category=Hombre'],
                ['Unisex', '/tienda?category=Unisex'],
                ['Ofertas', '/tienda?category=Ofertas']
              ].map(([label, path]) => (
                <li key={label}>
                  <Link
                    to={path}
                    onClick={() => handleStoreNavigation(path)}
                    style={linkStyle}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Ayuda */}
          <div>
            <h4 style={sectionTitleStyle}>Ayuda</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0 }}>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModalKey('envios')}
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  Envíos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModalKey('cambios')}
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  Cambios y devoluciones
                </button>
              </li>
              <li>
                <a
                  href="/#faq"
                  onClick={e => handleHomeSectionClick(e, 'faq')}
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <Link
                  to="/contacto"
                  style={linkStyle}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Nuestras Tiendas */}
          <div>
            <h4 style={sectionTitleStyle}>Nuestras Tiendas (Palmira)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <a
                  href="https://maps.google.com/?q=Calle+31+%2327-44,+Palmira,+Valle+del+Cauca"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: '500', textDecoration: 'none', display: 'inline-block', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B99A5B'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                >
                  Sede Calle 31 · Centro
                </a>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                  <a
                    href="https://maps.google.com/?q=Calle+31+%2327-44,+Palmira,+Valle+del+Cauca"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    Calle 31 #27-44
                  </a>
                  {' · '}
                  <a
                    href="https://wa.me/573206970036?text=Hola%20DFV%20Perfumes%20(Sede%20Calle%2031%20Centro)%2C%20quisiera%20recibir%20asesor%C3%ADa."
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    WA: +57 320 697 0036
                  </a>
                </p>
              </div>
              <div>
                <a
                  href="https://maps.google.com/?q=Centro+Comercial+Llanogrande+Palmira"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: '500', textDecoration: 'none', display: 'inline-block', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#B99A5B'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                >
                  Sede C.C. Llanogrande
                </a>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                  <a
                    href="https://maps.google.com/?q=Centro+Comercial+Llanogrande+Palmira"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    Palmira, Valle
                  </a>
                  {' · '}
                  <a
                    href="https://wa.me/573208627036?text=Hola%20DFV%20Perfumes%20(Sede%20C.C.%20Llanogrande)%2C%20quisiera%20recibir%20asesor%C3%ADa."
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    WA: +57 320 862 7036
                  </a>
                </p>
              </div>
              
              <a
                href="/#sedes"
                onClick={e => handleHomeSectionClick(e, 'sedes')}
                style={{ 
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  letterSpacing: '1px',
                  color: '#fff',
                  textDecoration: 'none',
                  marginTop: '0.5rem',
                  opacity: 0.8,
                  transition: 'opacity 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.8}
              >
                VER UBICACIONES &rarr;
              </a>
            </div>
          </div>

        </div>

        {/* Cierre Final Centrado */}
        <div className="footer-bottom">
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', letterSpacing: '1px', marginBottom: '0.8rem', fontWeight: '500' }}>
            &copy; 2026 DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="footer-legal">
            {[
              ['Términos y condiciones', 'terminos'],
              ['Política de envíos', 'envios'],
              ['Política de cambios', 'cambios'],
              ['Política de privacidad', 'privacidad']
            ].map(([label, modalKey], index) => (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => setActiveModalKey(modalKey)}
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.7rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    letterSpacing: '0.5px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  {label}
                </button>
                {index < 3 && <span className="legal-separator" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Informativo / Legal */}
      {activeModal && (
        <div
          onClick={() => setActiveModalKey(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.68)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#111111',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderRadius: '6px',
              padding: '2.25rem 2rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveModalKey(null)}
              aria-label="Cerrar"
              style={{
                position: 'absolute',
                top: '1.1rem',
                right: '1.1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#555',
                padding: '0.35rem'
              }}
            >
              <X size={20} />
            </button>

            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#B99A5B',
              fontWeight: 600,
              marginBottom: '0.35rem',
              fontFamily: 'var(--font-sans)'
            }}>
              {activeModal.eyebrow}
            </span>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.55rem',
              fontWeight: 400,
              color: '#111',
              marginBottom: '1.4rem',
              borderBottom: '1px solid #EAE8E4',
              paddingBottom: '0.9rem'
            }}>
              {activeModal.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '1.75rem' }}>
              {activeModal.sections.map((sec, idx) => (
                <div key={idx}>
                  <h4 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: '#111',
                    marginBottom: '0.35rem'
                  }}>
                    {sec.heading}
                  </h4>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.86rem',
                    color: '#555',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-line',
                    margin: 0
                  }}>
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end', borderTop: '1px solid #EAE8E4', paddingTop: '1.15rem' }}>
              {activeModal.ctaHref && (
                <a
                  href={activeModal.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#111',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.72rem',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '3px',
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  {activeModal.ctaLabel}
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveModalKey(null)}
                style={{
                  padding: '0.75rem 1.2rem',
                  backgroundColor: 'transparent',
                  color: '#444',
                  border: '1px solid #DDD',
                  fontSize: '0.72rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .footer-legal {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          max-width: 600px;
          line-height: 1.8;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 3rem;
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          footer {
            padding: 3rem 0 2rem !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem 1rem;
            margin-bottom: 2rem;
          }
          .footer-brand {
            grid-column: 1 / -1;
            margin-bottom: 0;
          }
          .footer-legal {
            gap: 0.5rem 0.8rem;
          }
          .legal-separator {
            display: none;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;

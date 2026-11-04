import React, { useState, useEffect, useCallback } from 'react';
import { X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Lógica de frecuencia (localStorage / sessionStorage) ────────────────────

function shouldShowCampaign(campaign) {
  const { id, frequency } = campaign;
  const key = `dfv_campaign_${id}`;

  if (frequency === 'every_visit') return true;

  if (frequency === 'once_session') {
    return !sessionStorage.getItem(key);
  }

  if (frequency === 'once_24h') {
    try {
      const ts = localStorage.getItem(key);
      if (!ts) return true;
      const elapsed = Date.now() - parseInt(ts, 10);
      return elapsed > 24 * 60 * 60 * 1000;
    } catch {
      return true;
    }
  }

  return true;
}

function markCampaignSeen(campaign) {
  const { id, frequency } = campaign;
  const key = `dfv_campaign_${id}`;
  if (frequency === 'once_session') {
    sessionStorage.setItem(key, '1');
  } else if (frequency === 'once_24h') {
    localStorage.setItem(key, String(Date.now()));
  }
  // 'every_visit' → no guardar nada
}

// ─── Componente Popup ─────────────────────────────────────────────────────────

const CampaignPopup = ({ campaigns }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return;

    // Elegir la primera campaña que debe mostrarse según su frecuencia
    const toShow = campaigns.find(c => shouldShowCampaign(c));
    if (!toShow) return;

    // Delay de 1.5s para no interrumpir la carga inicial de la página
    const timer = setTimeout(() => {
      setCurrentCampaign(toShow);
      setImgError(false);
      setVisible(true);
      markCampaignSeen(toShow);
    }, 1500);

    return () => clearTimeout(timer);
  }, [campaigns]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(() => setCurrentCampaign(null), 400);
  }, []);

  const handleVerOfertas = useCallback(() => {
    if (!currentCampaign) return;
    handleClose();
    setTimeout(() => {
      navigate(`/campana/${currentCampaign.id}`);
    }, 300);
  }, [currentCampaign, navigate, handleClose]);

  if (!currentCampaign || !visible) return null;

  const { title, description, badge, image } = currentCampaign;
  const hasImage = image && !imgError;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9000,
          animation: 'fadeIn 0.35s ease',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Popup */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9001,
        width: '90%',
        maxWidth: hasImage ? '700px' : '480px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        animation: 'popupIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popupIn {
            from { transform: translate(-50%, -48%) scale(0.92); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          @media (min-width: 640px) {
            .campaign-popup-inner {
              flex-direction: row !important;
            }
            .campaign-popup-image {
              width: 280px !important;
              height: auto !important;
              min-height: 320px !important;
            }
          }
        `}</style>

        {/* Contenido */}
        <div className="campaign-popup-inner" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Imagen (si existe) */}
          {hasImage && (
            <div className="campaign-popup-image" style={{
              width: '100%', height: '220px',
              flexShrink: 0, overflow: 'hidden',
              backgroundColor: '#f3f4f6'
            }}>
              <img
                src={image}
                alt={title}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Texto */}
          <div style={{
            padding: '2rem', flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              aria-label="Cerrar anuncio"
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: '#f3f4f6', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6b7280',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.color = '#111827'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <X size={16} />
            </button>

            {/* Badge */}
            {badge && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  backgroundColor: '#111827', color: '#fff',
                  padding: '0.35rem 0.9rem', borderRadius: '99px',
                  fontFamily: 'var(--font-sans)', fontSize: '0.68rem',
                  fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase'
                }}>
                  <Tag size={11} />
                  {badge}
                </span>
              </div>
            )}

            {/* Título */}
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              fontWeight: '500', color: '#111827',
              marginBottom: '0.75rem', lineHeight: 1.3,
              paddingRight: '2rem'
            }}>
              {title}
            </h2>

            {/* Descripción */}
            {description && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem', color: '#6b7280',
                lineHeight: 1.6, marginBottom: '1.5rem'
              }}>
                {description}
              </p>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleVerOfertas}
                style={{
                  flex: 1, minWidth: '140px',
                  padding: '0.85rem 1.5rem',
                  backgroundColor: '#111827', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                  fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111827'}
              >
                Ver ofertas
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'transparent', color: '#9ca3af',
                  border: '1px solid #e5e7eb', borderRadius: '8px',
                  fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
                  fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPopup;


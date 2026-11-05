import React, { useState, useEffect } from 'react';
import { Save, Upload, CheckCircle, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';

const PromoBannerModule = () => {
  const [banner, setBanner] = useState({
    title: '',
    subtitle: '',
    button_text: 'COMPRAR AHORA',
    button_link: '/tienda',
    image_url: '',
    active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/promo-banner')
      .then(r => r.json())
      .then(data => {
        if (data && data.banner) {
          setBanner(data.banner);
        }
      })
      .catch(err => console.error('Error fetching banner:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create data URL
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      if (data && data.url) {
        setBanner(prev => ({ ...prev, image_url: data.url }));
        showToast('Imagen subida a Cloudinary exitosamente');
      } else {
        throw new Error(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al subir la imagen: ' + (err.message || ''), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/promo-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Banner promocional actualizado correctamente');
      } else {
        throw new Error(data.error || 'No se pudo guardar');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar: ' + (err.message || ''), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
        <p>Cargando configuración del banner...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#dc2626' : '#059669',
          color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.88rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <CheckCircle size={18} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            ADMINISTRACIÓN WEB
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.3rem 0 0 0' }}>
            Banner Promocional
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
            Personaliza el banner de ancho completo que se muestra en la página de inicio.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#111',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Formulario de configuración */}
        <div style={{ backgroundColor: '#fff', padding: '1.8rem', borderRadius: '12px', border: '1px solid #EAE8E4', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#B99A5B" /> Configuración del Banner
          </h3>

          {/* Activar / Desactivar Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 1.2rem',
            backgroundColor: banner.active ? '#F0FDF4' : '#F9F8F6',
            border: banner.active ? '1px solid #BBF7D0' : '1px solid #EAE8E4',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            cursor: 'pointer'
          }} onClick={() => setBanner(prev => ({ ...prev, active: !prev.active }))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              {banner.active ? <Eye size={18} color="#166534" /> : <EyeOff size={18} color="#888" />}
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: banner.active ? '#166534' : '#666', display: 'block' }}>
                  {banner.active ? 'Banner Activo y Visible' : 'Banner Oculto'}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#888' }}>
                  {banner.active ? 'Se muestra a todos los visitantes en el inicio' : 'No se mostrará en la página principal'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={banner.active}
              onChange={e => setBanner(prev => ({ ...prev, active: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
            />
          </div>

          {/* Subir Imagen */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Imagen de Fondo (Fotografía DFV)
            </label>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <label style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#FAF8F5',
                border: '1px dashed #B99A5B',
                borderRadius: '6px',
                color: '#111',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}>
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} color="#B99A5B" />}
                <span>{isUploading ? 'Subiendo a Cloudinary...' : 'Subir nueva fotografía'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {banner.image_url && (
              <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.4rem', wordBreak: 'break-all' }}>
                URL actual: {banner.image_url}
              </p>
            )}
          </div>

          {/* Título */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Título Principal
            </label>
            <input
              type="text"
              value={banner.title}
              onChange={e => setBanner(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej. COLECCIÓN EXCLUSIVA 2026"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                border: '1px solid #EAE8E4',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Subtítulo */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Subtítulo Descriptivo
            </label>
            <textarea
              rows={3}
              value={banner.subtitle}
              onChange={e => setBanner(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Ej. Descubre las fragancias que definen tu presencia."
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                border: '1px solid #EAE8E4',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Texto del Botón */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Texto del Botón
            </label>
            <input
              type="text"
              value={banner.button_text}
              onChange={e => setBanner(prev => ({ ...prev, button_text: e.target.value }))}
              placeholder="COMPRAR AHORA"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                border: '1px solid #EAE8E4',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Enlace del Botón */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Enlace de Destino
            </label>
            <input
              type="text"
              value={banner.button_link}
              onChange={e => setBanner(prev => ({ ...prev, button_link: e.target.value }))}
              placeholder="/tienda o /tienda?category=Hombre"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                border: '1px solid #EAE8E4',
                borderRadius: '6px',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
            Vista Previa en Tiempo Real
          </h3>
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            minHeight: '340px',
            backgroundColor: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            {/* Imagen de fondo */}
            <img
              src={banner.image_url || '/hero_campaign_2.webp'}
              alt="Preview"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.55
              }}
            />
            {/* Overlay gradiente */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.7) 100%)'
            }} />

            {/* Contenido centrado */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px' }}>
              <span style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                DFV PERFUMES EXCLUSIVO
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', fontWeight: 400, letterSpacing: '1px', marginBottom: '0.6rem', lineHeight: 1.2 }}>
                {banner.title || 'Título del Banner'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginBottom: '1.4rem', lineHeight: 1.4, fontWeight: 300 }}>
                {banner.subtitle || 'Subtítulo descriptivo de la campaña o promoción.'}
              </p>
              <div style={{
                display: 'inline-block',
                backgroundColor: '#111',
                color: '#fff',
                border: '1px solid #B99A5B',
                padding: '0.65rem 1.6rem',
                fontSize: '0.72rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 600,
                borderRadius: '2px'
              }}>
                {banner.button_text || 'COMPRAR AHORA'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromoBannerModule;


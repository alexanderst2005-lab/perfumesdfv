import React, { useState, useEffect } from 'react';
import { Save, Upload, CheckCircle, Plus, Trash2, MapPin, Image as ImageIcon, Loader2 } from 'lucide-react';

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    campaign: 'ROYAL SAPPHIRE',
    title: 'LUJO EN TUS MANOS',
    subtitle: 'Descubre el poder de una joya embotellada.',
    buttonText: 'DESCUBRIR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_1.webp',
    imageMobile: '/hero_campaign_1_m.webp',
    alignment: 'center'
  },
  {
    id: 2,
    campaign: 'BHARARA COLLECTION',
    title: 'LA DUPLA PERFECTA',
    subtitle: 'Fragancias para destacar en cualquier ocasión.',
    buttonText: 'VER COLECCIÓN',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_2.webp',
    imageMobile: '/hero_campaign_2_m.webp',
    alignment: 'center'
  },
  {
    id: 3,
    campaign: 'LATTAFA PARA ELLA',
    title: 'ESENCIA FEMENINA',
    subtitle: 'Aromas dulces y florales que enamoran.',
    buttonText: 'VER CATÁLOGO',
    buttonLink: '/tienda?cat=Mujer',
    imageDesktop: '/hero_campaign_3.webp',
    imageMobile: '/hero_campaign_3_m.webp',
    alignment: 'center'
  },
  {
    id: 4,
    campaign: "BADE'E AL OUD",
    title: 'MISTERIO ÁRABE',
    subtitle: 'Notas intensas y maderas exóticas.',
    buttonText: 'EXPLORAR',
    buttonLink: '/tienda',
    imageDesktop: '/hero_campaign_4.webp',
    imageMobile: '/hero_campaign_4_m.webp',
    alignment: 'center'
  }
];

const DEFAULT_SEDES = [
  {
    id: 1,
    name: 'Sede Calle 31 · Centro',
    img: '/sede_calle31.jpg',
    maps: 'https://maps.google.com/?q=Calle+31+%2327-44+Palmira+Valle+del+Cauca'
  },
  {
    id: 2,
    name: 'Sede C.C. Llanogrande',
    img: '/sede_llanogrande.jpg',
    maps: 'https://maps.google.com/?q=Centro+Comercial+Llanogrande+Palmira'
  }
];

const HeroSedesModule = () => {
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [sedes, setSedes] = useState(DEFAULT_SEDES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`/api/hero-sedes?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          if (Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
            setHeroSlides(data.hero_slides);
          }
          if (Array.isArray(data.sedes) && data.sedes.length > 0) {
            setSedes(data.sedes);
          }
        }
      })
      .catch(err => console.error('Error fetching hero-sedes:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const compressImage = async (src, maxSize = 1800, quality = 0.86) => {
    try {
      const blob = await (await fetch(src)).blob();
      const probe = await createImageBitmap(blob);
      const scale = Math.min(1, maxSize / Math.max(probe.width, probe.height));
      const w = Math.round(probe.width * scale);
      const h = Math.round(probe.height * scale);
      if (probe.close) probe.close();
      const bmp = await createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: 'medium' });
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bmp, 0, 0);
      return canvas.toDataURL('image/jpeg', quality);
    } catch {
      return src;
    }
  };

  const uploadToCloudinary = async (file, keyLabel) => {
    if (!file) return null;
    setUploadingKey(keyLabel);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const compressed = await compressImage(base64, 1800, 0.86);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressed })
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Error del servidor (${res.status})`);
      }
      if (data && data.url) {
        showToast('Fotografía cargada exitosamente');
        return data.url;
      } else {
        throw new Error(data.error || 'Error subiendo imagen');
      }
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen: ' + (err.message || ''), 'error');
      return null;
    } finally {
      setUploadingKey(null);
    }
  };

  // Reemplazar imagen de un Slide de la Hero (actualiza tanto PC como Móvil, o individualmente)
  const handleHeroImageUpload = async (idx, field, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadToCloudinary(file, `hero-${idx}-${field}`);
    if (!url) return;

    setHeroSlides(prev => prev.map((slide, i) => {
      if (i !== idx) return slide;
      if (field === 'both') {
        return { ...slide, imageDesktop: url, imageMobile: url };
      }
      return { ...slide, [field]: url };
    }));
  };

  const handleSlideFieldChange = (idx, field, val) => {
    setHeroSlides(prev => prev.map((slide, i) => (i === idx ? { ...slide, [field]: val } : slide)));
  };

  const addHeroSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        id: Date.now(),
        campaign: 'NUEVA CAMPAÑA',
        title: 'NUEVO TÍTULO',
        subtitle: 'Descripción breve del banner principal.',
        buttonText: 'EXPLORAR',
        buttonLink: '/tienda',
        imageDesktop: '/hero_campaign_1.webp',
        imageMobile: '/hero_campaign_1_m.webp',
        alignment: 'center'
      }
    ]);
  };

  const removeHeroSlide = (idx) => {
    if (heroSlides.length <= 1) {
      showToast('Debe existir al menos 1 imagen en la Hero Principal', 'error');
      return;
    }
    setHeroSlides(prev => prev.filter((_, i) => i !== idx));
  };

  // Reemplazar imagen de una Sede
  const handleSedeImageUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = await uploadToCloudinary(file, `sede-${idx}`);
    if (!url) return;

    setSedes(prev => prev.map((s, i) => (i === idx ? { ...s, img: url } : s)));
  };

  const handleSedeFieldChange = (idx, field, val) => {
    setSedes(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/hero-sedes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_slides: heroSlides,
          sedes: sedes
        })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Hero Principal y Sedes actualizadas en la tienda');
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
        <p>Cargando configuración de Hero Principal y Sedes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1150px', margin: '0 auto' }}>
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

      {/* Cabecera Superior */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            PORTADA PRINCIPAL & TIENDAS FÍSICAS
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.3rem 0 0 0' }}>
            Hero Principal & Nuestras Sedes
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
            Edita o reemplaza las fotografías y textos del carrusel principal (Hero) y las fotos y enlaces de Nuestras Sedes.
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
            padding: '0.85rem 1.6rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 1: IMÁGENES DE LA HERO PRINCIPAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={20} color="#B99A5B" />
            1. Fotografías de la Hero Principal ({heroSlides.length} Slides actuales)
          </h3>

          <button
            type="button"
            onClick={addHeroSlide}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#FAF8F5',
              border: '1px solid #B99A5B',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#111',
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Agregar Slide
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {heroSlides.map((slide, idx) => {
            const isUploadingBoth = uploadingKey === `hero-${idx}-both`;
            const isUploadingMobile = uploadingKey === `hero-${idx}-imageMobile`;

            return (
              <div
                key={slide.id || idx}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #EAE8E4',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Vista previa actual del Slide */}
                <div style={{ position: 'relative', height: '210px', backgroundColor: '#121212', overflow: 'hidden' }}>
                  <img
                    src={slide.imageDesktop || slide.imageMobile}
                    alt={slide.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.78 }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#fff'
                  }}>
                    <span style={{ fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.9 }}>
                      {slide.campaign}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0.3rem 0', fontWeight: 400 }}>
                      {slide.title}
                    </h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '0 0 0.6rem 0' }}>
                      {slide.subtitle}
                    </p>
                    <span style={{ border: '1px solid rgba(255,255,255,0.8)', padding: '4px 14px', fontSize: '0.65rem', letterSpacing: '1.5px' }}>
                      {slide.buttonText || 'DESCUBRIR'}
                    </span>
                  </div>

                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '999px'
                  }}>
                    Slide 0{idx + 1}
                  </span>

                  {heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHeroSlide(idx)}
                      title="Eliminar este slide"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(220, 38, 38, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Controles para reemplazar imagen y editar textos */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.65rem 0.9rem',
                      backgroundColor: '#111',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: isUploadingBoth ? 'not-allowed' : 'pointer'
                    }}>
                      {isUploadingBoth ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      <span>{isUploadingBoth ? 'Subiendo...' : 'Reemplazar Fotografía'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBoth}
                        onChange={(e) => handleHeroImageUpload(idx, 'both', e)}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.65rem 0.8rem',
                      backgroundColor: '#FAF8F5',
                      color: '#333',
                      border: '1px solid #D5D0C6',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: isUploadingMobile ? 'not-allowed' : 'pointer'
                    }} title="Opcional: subir una versión vertical solo para celular">
                      {isUploadingMobile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} color="#B99A5B" />}
                      <span>Foto Móvil (Opcional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingMobile}
                        onChange={(e) => handleHeroImageUpload(idx, 'imageMobile', e)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Subtítulo Superior / Colección
                    </label>
                    <input
                      type="text"
                      value={slide.campaign || ''}
                      onChange={e => handleSlideFieldChange(idx, 'campaign', e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={e => handleSlideFieldChange(idx, 'title', e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={e => handleSlideFieldChange(idx, 'subtitle', e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                        Texto Botón
                      </label>
                      <input
                        type="text"
                        value={slide.buttonText || ''}
                        onChange={e => handleSlideFieldChange(idx, 'buttonText', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                        Enlace Botón
                      </label>
                      <input
                        type="text"
                        value={slide.buttonLink || ''}
                        onChange={e => handleSlideFieldChange(idx, 'buttonLink', e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SECCIÓN 2: NUESTRAS SEDES */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color="#B99A5B" />
          2. Fotografías y Direcciones de Nuestras Sedes ({sedes.length} Sedes)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {sedes.map((sede, idx) => {
            const isUploadingSede = uploadingKey === `sede-${idx}`;
            return (
              <div
                key={sede.id || idx}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #EAE8E4',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Vista previa actual de la Sede */}
                <div style={{ position: 'relative', height: '240px', backgroundColor: '#f4f4f4', overflow: 'hidden' }}>
                  <img
                    src={sede.img}
                    alt={sede.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '999px'
                  }}>
                    Sede 0{idx + 1}
                  </span>
                </div>

                {/* Controles para reemplazar foto y editar nombre/enlace */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.7rem 1rem',
                    backgroundColor: '#111',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: isUploadingSede ? 'not-allowed' : 'pointer'
                  }}>
                    {isUploadingSede ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    <span>{isUploadingSede ? 'Subiendo fotografía...' : 'Reemplazar Foto de la Sede'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingSede}
                      onChange={(e) => handleSedeImageUpload(idx, e)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Nombre de la Sede (Sale arriba de ¿CÓMO LLEGAR?)
                    </label>
                    <input
                      type="text"
                      value={sede.name || ''}
                      onChange={e => handleSedeFieldChange(idx, 'name', e.target.value)}
                      placeholder="Ej. Sede Calle 31 · Centro"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Enlace de Google Maps (Al darle clic en ¿CÓMO LLEGAR?)
                    </label>
                    <input
                      type="text"
                      value={sede.maps || ''}
                      onChange={e => handleSedeFieldChange(idx, 'maps', e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón Guardar Inferior */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
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
            padding: '0.9rem 2rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            letterSpacing: '1px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR TODOS LOS CAMBIOS'}</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSedesModule;

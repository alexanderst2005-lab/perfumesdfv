import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, CheckCircle, Plus, Trash2, MapPin, Image as ImageIcon, Loader2, Film, Star, ChevronLeft, ChevronRight, Play, X, Monitor, Smartphone } from 'lucide-react';
import { optimizeImg, uploadAdminImage, uploadAdminVideo, getVideoThumbnailUrl, normalizeSedeGallery } from '../../utils/img';
import SedeGalleryModal from '../SedeGalleryModal';

let cachedAdminHeroSedes = null;

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
  const [heroSlides, setHeroSlides] = useState(() => cachedAdminHeroSedes?.hero_slides || DEFAULT_HERO_SLIDES);
  const [sedes, setSedes] = useState(() => (cachedAdminHeroSedes?.sedes || DEFAULT_SEDES).map(s => ({ ...s, gallery: normalizeSedeGallery(s) })));
  const [isLoading, setIsLoading] = useState(!cachedAdminHeroSedes);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [galleryUploading, setGalleryUploading] = useState({});
  const [previewSedeGallery, setPreviewSedeGallery] = useState(null);
  const [toast, setToast] = useState(null);
  const uploadsRef = useRef(new Map());

  useEffect(() => {
    fetch(`/api/hero-sedes?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          const nextSlides = Array.isArray(data.hero_slides) && data.hero_slides.length > 0 ? data.hero_slides : DEFAULT_HERO_SLIDES;
          const rawSedes = Array.isArray(data.sedes) && data.sedes.length > 0 ? data.sedes : DEFAULT_SEDES;
          const nextSedes = rawSedes.map(s => ({ ...s, gallery: normalizeSedeGallery(s) }));
          cachedAdminHeroSedes = { hero_slides: nextSlides, sedes: nextSedes };
          setHeroSlides(nextSlides);
          setSedes(nextSedes);
        }
      })
      .catch(err => console.error('Error fetching hero-sedes:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Reemplazar imagen de un Slide de la Hero con vista previa instantánea (0ms) y subida rápida
  const handleHeroImageUpload = async (idx, field, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const keyLabel = `hero-${idx}-${field}`;
    setUploadingKey(keyLabel);

    // Mostrar vista previa de inmediato
    setHeroSlides(prev => prev.map((slide, i) => {
      if (i !== idx) return slide;
      if (field === 'both') return { ...slide, imageDesktop: previewUrl, imageMobile: previewUrl };
      return { ...slide, [field]: previewUrl };
    }));

    const uploadPromise = uploadAdminImage(file, 2000, 0.92);
    uploadsRef.current.set(previewUrl, uploadPromise);

    try {
      const url = await uploadPromise;
      setHeroSlides(prev => prev.map((slide, i) => {
        if (i !== idx) return slide;
        if (field === 'both') return { ...slide, imageDesktop: url, imageMobile: url };
        return { ...slide, [field]: url };
      }));
      showToast('Fotografía cargada exitosamente');
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen: ' + (err.message || ''), 'error');
    } finally {
      uploadsRef.current.delete(previewUrl);
      setUploadingKey(null);
    }
  };

  const handleSlideFieldChange = (idx, field, val) => {
    setHeroSlides(prev => prev.map((slide, i) => (i === idx ? { ...slide, [field]: val } : slide)));
  };

  const addHeroSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        id: Date.now(),
        campaign: '',
        title: '',
        subtitle: '',
        buttonText: 'DESCUBRIR',
        buttonLink: '/tienda',
        imageDesktop: '',
        imageMobile: '',
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

  const handleRemoveHeroMobileImage = (idx) => {
    setHeroSlides(prev => prev.map((s, i) => (i === idx ? { ...s, imageMobile: '' } : s)));
    showToast('Foto para celular eliminada con éxito. En celulares se usará la foto principal.');
  };

  const handleRemoveHeroDesktopImage = (idx) => {
    setHeroSlides(prev => prev.map((s, i) => (i === idx ? { ...s, imageDesktop: '' } : s)));
    showToast('Foto de computador retirada.');
  };

  // Reemplazar imagen principal de una Sede con vista previa instantánea (0ms) y sincronizar con su galería
  const handleSedeImageUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const keyLabel = `sede-${idx}`;
    const newItemId = `sede-main-${idx}-${Date.now()}`;
    setUploadingKey(keyLabel);

    setSedes(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const curGallery = normalizeSedeGallery(s).map(g => ({ ...g, isMain: false }));
      const nextGallery = [
        { id: newItemId, type: 'image', url: previewUrl, thumbnailUrl: previewUrl, isMain: true },
        ...curGallery
      ];
      return { ...s, img: previewUrl, gallery: nextGallery };
    }));

    const uploadPromise = uploadAdminImage(file, 2000, 0.92);
    uploadsRef.current.set(previewUrl, uploadPromise);

    try {
      const url = await uploadPromise;
      setSedes(prev => prev.map((s, i) => {
        if (i !== idx) return s;
        const nextGallery = normalizeSedeGallery(s).map(g =>
          g.id === newItemId || g.url === previewUrl
            ? { ...g, url, thumbnailUrl: url, isMain: true }
            : g
        );
        return { ...s, img: url, gallery: nextGallery };
      }));
      showToast('Fotografía principal de la sede cargada exitosamente');
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen: ' + (err.message || ''), 'error');
    } finally {
      uploadsRef.current.delete(previewUrl);
      setUploadingKey(null);
    }
  };

  // Subir una o varias fotografías a la galería de una sede
  const handleSedeGalleryPhotosUpload = async (sedeIdx, e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    if (files.length === 0) return;

    setGalleryUploading(prev => ({
      ...prev,
      [sedeIdx]: `Subiendo ${files.length} fotografía${files.length > 1 ? 's' : ''}...`
    }));

    let successCount = 0;
    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const tempId = `img-${sedeIdx}-${Date.now()}-${fIdx}`;
      const previewUrl = URL.createObjectURL(file);

      // Vista previa inmediata
      setSedes(prev => prev.map((s, i) => {
        if (i !== sedeIdx) return s;
        const curGallery = normalizeSedeGallery(s);
        const hasMain = curGallery.some(item => item.type === 'image' && item.isMain);
        const newItem = {
          id: tempId,
          type: 'image',
          url: previewUrl,
          thumbnailUrl: previewUrl,
          isMain: !hasMain
        };
        return {
          ...s,
          img: !hasMain ? previewUrl : s.img,
          gallery: [...curGallery, newItem]
        };
      }));

      const uploadPromise = uploadAdminImage(file, 2000, 0.92);
      uploadsRef.current.set(previewUrl, uploadPromise);

      try {
        const uploadedUrl = await uploadPromise;
        successCount++;
        setSedes(prev => prev.map((s, i) => {
          if (i !== sedeIdx) return s;
          const nextGallery = normalizeSedeGallery(s).map(item =>
            item.id === tempId || item.url === previewUrl
              ? { ...item, url: uploadedUrl, thumbnailUrl: uploadedUrl }
              : item
          );
          const mainItem = nextGallery.find(item => item.type === 'image' && item.isMain);
          return {
            ...s,
            img: mainItem ? mainItem.url : (s.img === previewUrl ? uploadedUrl : s.img),
            gallery: nextGallery
          };
        }));
      } catch (err) {
        console.error('Error subiendo foto de galería:', err);
        // Quitar solo el archivo fallido sin perder la información de la sede
        setSedes(prev => prev.map((s, i) => {
          if (i !== sedeIdx) return s;
          const nextGallery = normalizeSedeGallery(s).filter(item => item.id !== tempId && item.url !== previewUrl);
          return { ...s, gallery: nextGallery };
        }));
        showToast(`Error al subir "${file.name}": ${err.message || 'Intenta de nuevo'}`, 'error');
      } finally {
        uploadsRef.current.delete(previewUrl);
      }
    }

    setGalleryUploading(prev => ({ ...prev, [sedeIdx]: null }));
    if (successCount > 0) {
      showToast(`${successCount} fotografía${successCount > 1 ? 's agregadas' : ' agregada'} a la galería. Recuerda pulsar Guardar Cambios.`);
    }
  };

  // Subir uno o varios videos (MP4, MOV, WebM) a la galería de una sede
  const handleSedeGalleryVideosUpload = async (sedeIdx, e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(f.name));
    e.target.value = '';
    if (files.length === 0) {
      showToast('Selecciona archivos de video válidos (.mp4, .mov, .webm)', 'error');
      return;
    }

    let successCount = 0;
    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      setGalleryUploading(prev => ({
        ...prev,
        [sedeIdx]: `Subiendo video ${fIdx + 1} de ${files.length} (${file.name})...`
      }));

      try {
        const { url, thumbnailUrl } = await uploadAdminVideo(file, 'dfv_sedes');
        successCount++;
        const videoItem = {
          id: `vid-${sedeIdx}-${Date.now()}-${fIdx}`,
          type: 'video',
          url,
          thumbnailUrl: thumbnailUrl || getVideoThumbnailUrl(url, 800),
          isMain: false
        };
        setSedes(prev => prev.map((s, i) => {
          if (i !== sedeIdx) return s;
          const curGallery = normalizeSedeGallery(s);
          return {
            ...s,
            gallery: [...curGallery, videoItem]
          };
        }));
      } catch (err) {
        console.error('Error subiendo video de sede:', err);
        showToast(`Error al subir el video "${file.name}": ${err.message || 'Intenta nuevamente'}`, 'error');
      }
    }

    setGalleryUploading(prev => ({ ...prev, [sedeIdx]: null }));
    if (successCount > 0) {
      showToast(`${successCount} video${successCount > 1 ? 's agregados' : ' agregado'} a la galería. Recuerda pulsar Guardar Cambios.`);
    }
  };

  // Seleccionar cuál fotografía de la galería será la imagen principal de la sede
  const handleSetMainSedeImage = (sedeIdx, itemId) => {
    setSedes(prev => prev.map((s, i) => {
      if (i !== sedeIdx) return s;
      const curGallery = normalizeSedeGallery(s);
      const target = curGallery.find(item => item.id === itemId && item.type === 'image');
      if (!target) return s;
      const nextGallery = curGallery.map(item => ({
        ...item,
        isMain: item.type === 'image' && item.id === itemId
      }));
      return {
        ...s,
        img: target.url,
        gallery: nextGallery
      };
    }));
    showToast('Imagen principal de la sede seleccionada');
  };

  // Cambiar el orden de los archivos en la galería de una sede
  const handleMoveGalleryItem = (sedeIdx, itemIdx, direction) => {
    setSedes(prev => prev.map((s, i) => {
      if (i !== sedeIdx) return s;
      const list = [...normalizeSedeGallery(s)];
      const targetIdx = itemIdx + direction;
      if (targetIdx < 0 || targetIdx >= list.length) return s;
      const temp = list[itemIdx];
      list[itemIdx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...s, gallery: list };
    }));
  };

  // Eliminar una fotografía o video de la galería de una sede
  const handleRemoveGalleryItem = (sedeIdx, itemId) => {
    setSedes(prev => prev.map((s, i) => {
      if (i !== sedeIdx) return s;
      const curGallery = normalizeSedeGallery(s);
      const target = curGallery.find(item => item.id === itemId);
      if (!target) return s;

      const remainingImages = curGallery.filter(item => item.id !== itemId && item.type === 'image');
      if (target.type === 'image' && remainingImages.length === 0) {
        showToast('La sede debe conservar al menos una fotografía principal', 'error');
        return s;
      }

      let nextGallery = curGallery.filter(item => item.id !== itemId);
      let nextMainImg = s.img;

      if (target.isMain || target.url === s.img) {
        const firstImgIdx = nextGallery.findIndex(item => item.type === 'image');
        if (firstImgIdx !== -1) {
          nextGallery = nextGallery.map((item, idx) => ({
            ...item,
            isMain: idx === firstImgIdx
          }));
          nextMainImg = nextGallery[firstImgIdx].url;
        }
      }

      return {
        ...s,
        img: nextMainImg,
        gallery: nextGallery
      };
    }));
  };

  const handleSedeFieldChange = (idx, field, val) => {
    setSedes(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const resolveUrl = async (u) => {
    if (!u || typeof u !== 'string') return u;
    if (u.startsWith('blob:') || u.startsWith('data:')) {
      const pending = uploadsRef.current.get(u);
      if (pending) return await pending;
      return await uploadAdminImage(u, 2000, 0.92);
    }
    return u;
  };

  const handleSave = async () => {
    if (Object.values(galleryUploading).some(Boolean)) {
      showToast('Espera unos segundos a que terminen de subir los archivos en curso', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const resolvedSlides = await Promise.all(
        heroSlides.map(async (s) => {
          const dImg = (await resolveUrl(s.imageDesktop)) || '';
          const mImg = s.imageMobile ? (await resolveUrl(s.imageMobile)) : '';
          return {
            ...s,
            imageDesktop: dImg || mImg || '',
            imageMobile: mImg || dImg || ''
          };
        })
      );
      const resolvedSedes = await Promise.all(
        sedes.map(async (s) => {
          const resolvedGallery = await Promise.all(
            normalizeSedeGallery(s).map(async (item) => {
              if (item.type === 'video') {
                return {
                  ...item,
                  thumbnailUrl: item.thumbnailUrl || getVideoThumbnailUrl(item.url, 800),
                  isMain: false
                };
              }
              const cleanUrl = await resolveUrl(item.url);
              return {
                ...item,
                url: cleanUrl,
                thumbnailUrl: cleanUrl,
                isMain: Boolean(item.isMain)
              };
            })
          );
          const mainItem = resolvedGallery.find(item => item.type === 'image' && item.isMain)
            || resolvedGallery.find(item => item.type === 'image');
          const resolvedMainImg = mainItem ? mainItem.url : await resolveUrl(s.img);

          return {
            ...s,
            img: resolvedMainImg,
            gallery: resolvedGallery
          };
        })
      );

      const res = await fetch('/api/hero-sedes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_slides: resolvedSlides,
          sedes: resolvedSedes
        })
      });
      const data = await res.json();
      if (data && data.success) {
        cachedAdminHeroSedes = { hero_slides: resolvedSlides, sedes: resolvedSedes };
        setHeroSlides(resolvedSlides);
        setSedes(resolvedSedes);
        try {
          localStorage.setItem('dfv_hero_sedes_v2', JSON.stringify({
            hero_slides: resolvedSlides,
            sedes: resolvedSedes
          }));
        } catch {}
        showToast('Hero Principal, Sedes y sus galerías actualizadas en la tienda');
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
            const isUploadingDesktop = uploadingKey === `hero-${idx}-imageDesktop` || uploadingKey === `hero-${idx}-both`;
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
                <div style={{ position: 'relative', height: '210px', backgroundColor: '#181818', overflow: 'hidden' }}>
                  {slide.imageDesktop || slide.imageMobile ? (
                    <img
                      src={optimizeImg(slide.imageDesktop || slide.imageMobile, 300)}
                      alt={slide.title || 'Slide'}
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.78 }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#1C1A17',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.4)',
                      gap: '0.4rem',
                      padding: '1rem'
                    }}>
                      <ImageIcon size={26} color="#B99A5B" />
                      <span style={{ fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
                        Sin fotografía asignada
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#888' }}>
                        Sube una foto PC abajo para previsualizar
                      </span>
                    </div>
                  )}

                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.65))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#fff'
                  }}>
                    {slide.campaign ? (
                      <span style={{ fontSize: '0.62rem', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.9 }}>
                        {slide.campaign}
                      </span>
                    ) : null}
                    {slide.title ? (
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0.3rem 0', fontWeight: 400 }}>
                        {slide.title}
                      </h4>
                    ) : (
                      <span style={{ fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic', margin: '0.2rem 0' }}>
                        (Título del slide)
                      </span>
                    )}
                    {slide.subtitle ? (
                      <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '0 0 0.6rem 0' }}>
                        {slide.subtitle}
                      </p>
                    ) : null}
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
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* GESTIÓN VISUAL Y MANEJABLE DE FOTOGRAFÍAS */}
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#FAF8F5',
                  borderBottom: '1px solid #EAE8E4',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ImageIcon size={13} color="#B99A5B" />
                      Fotografías del Slide
                    </span>
                    <span style={{ fontSize: '0.66rem', color: '#777' }}>Previsualiza y edita</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {/* 1. Fotografía Computador (Principal) */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E0D8',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Monitor size={12} color="#111" />
                          Foto PC
                        </span>
                        {slide.imageDesktop && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroDesktopImage(idx)}
                            title="Quitar foto de PC"
                            style={{
                              background: '#F3F4F6',
                              border: 'none',
                              color: '#6B7280',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>

                      {/* Miniatura Foto PC */}
                      {slide.imageDesktop ? (
                        <div style={{ position: 'relative', width: '100%', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#111' }}>
                          <img
                            src={optimizeImg(slide.imageDesktop, 250)}
                            alt="Foto PC"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {isUploadingDesktop && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                              <Loader2 size={16} className="animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '70px', borderRadius: '6px', border: '1px dashed #D5D0C6', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F8F6', color: '#999', fontSize: '0.65rem', textAlign: 'center', padding: '0.25rem' }}>
                          Sin foto
                        </div>
                      )}

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        padding: '0.45rem',
                        backgroundColor: '#111',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: isUploadingDesktop ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}>
                        {isUploadingDesktop ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        <span>{slide.imageDesktop ? 'Cambiar PC' : 'Subir PC'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingDesktop}
                          onChange={(e) => handleHeroImageUpload(idx, 'imageDesktop', e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* 2. Fotografía Celular (Móvil / Opcional con botón X) */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E0D8',
                      borderRadius: '8px',
                      padding: '0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#B99A5B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Smartphone size={12} color="#B99A5B" />
                          Foto Móvil
                        </span>
                        {slide.imageMobile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroMobileImage(idx)}
                            title="Eliminar foto móvil con la X"
                            style={{
                              backgroundColor: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              color: '#DC2626',
                              cursor: 'pointer',
                              padding: '2px 5px',
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              gap: '2px'
                            }}
                          >
                            <X size={12} strokeWidth={2.5} />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>

                      {/* Miniatura Foto Móvil */}
                      {slide.imageMobile ? (
                        <div style={{ position: 'relative', width: '100%', height: '70px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#111' }}>
                          <img
                            src={optimizeImg(slide.imageMobile, 250)}
                            alt="Foto Celular"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {isUploadingMobile && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                              <Loader2 size={16} className="animate-spin" />
                            </div>
                          )}
                          <span style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '3px',
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            color: '#fff',
                            fontSize: '0.55rem',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            letterSpacing: '0.5px'
                          }}>
                            Móvil
                          </span>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '70px', borderRadius: '6px', border: '1px dashed #D5D0C6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F8F6', color: '#888', fontSize: '0.64rem', textAlign: 'center', padding: '0.25rem' }}>
                          <span>Usa foto PC</span>
                          <span style={{ fontSize: '0.56rem', color: '#AAA' }}>(automático)</span>
                        </div>
                      )}

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        padding: '0.45rem',
                        backgroundColor: '#FAF8F5',
                        color: '#333',
                        border: '1px solid #D5D0C6',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: isUploadingMobile ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}>
                        {isUploadingMobile ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} color="#B99A5B" />}
                        <span>{slide.imageMobile ? 'Cambiar Móvil' : '+ Foto Móvil'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingMobile}
                          onChange={(e) => handleHeroImageUpload(idx, 'imageMobile', e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Controles para editar textos */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

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
            const galleryItems = normalizeSedeGallery(sede);
            const uploadingStatus = galleryUploading[idx];

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
                    src={optimizeImg(sede.img, 400)}
                    alt={sede.name}
                    decoding="async"
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
                    Sede 0{idx + 1} · Imagen Principal
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewSedeGallery(sede)}
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(17,17,17,0.85)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Ver galería ({galleryItems.length})
                  </button>
                </div>

                {/* Controles para reemplazar foto, editar nombre/enlace y gestionar Galería de la sede */}
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
                    <span>{isUploadingSede ? 'Subiendo fotografía...' : 'Reemplazar Foto Principal de la Sede'}</span>
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

                  {/* ── SECCIÓN: GALERÍA DE LA SEDE ── */}
                  <div style={{
                    marginTop: '0.4rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #EAE8E4'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Galería de la sede ({galleryItems.length} {galleryItems.length === 1 ? 'archivo' : 'archivos'})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#777' }}>
                          Sube fotos y videos MP4, ordénalos y elige cuál foto será la principal.
                        </span>
                      </div>
                    </div>

                    {/* Botones para subir varias fotografías y varios videos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.85rem' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: '#FAF8F5',
                        color: '#111',
                        border: '1px solid #D5CFC4',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: uploadingStatus ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}>
                        <ImageIcon size={14} color="#B99A5B" />
                        <span>+ Subir Fotografías</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={Boolean(uploadingStatus)}
                          onChange={(e) => handleSedeGalleryPhotosUpload(idx, e)}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem 0.75rem',
                        backgroundColor: '#FAF8F5',
                        color: '#111',
                        border: '1px solid #D5CFC4',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: uploadingStatus ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}>
                        <Film size={14} color="#B99A5B" />
                        <span>+ Subir Videos (MP4)</span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/*"
                          multiple
                          disabled={Boolean(uploadingStatus)}
                          onChange={(e) => handleSedeGalleryVideosUpload(idx, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Indicador de carga mientras se suben archivos */}
                    {uploadingStatus && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 0.8rem',
                        marginBottom: '0.75rem',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        color: '#92400E',
                        fontWeight: 500
                      }}>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{uploadingStatus}</span>
                      </div>
                    )}

                    {/* Grilla de miniaturas de la galería de esta sede */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                      gap: '0.65rem'
                    }}>
                      {galleryItems.map((item, itemIdx) => {
                        const isVideo = item.type === 'video';
                        const isMain = !isVideo && (item.isMain || item.url === sede.img);
                        const thumbUrl = isVideo
                          ? (item.thumbnailUrl || getVideoThumbnailUrl(item.url, 300))
                          : optimizeImg(item.url, 240);

                        return (
                          <div
                            key={item.id || itemIdx}
                            style={{
                              border: isMain ? '2px solid #B99A5B' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              backgroundColor: '#FAFAFA',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            {/* Miniatura */}
                            <div
                              onClick={() => setPreviewSedeGallery(sede)}
                              title="Clic para abrir vista previa de la galería"
                              style={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '1/1',
                                backgroundColor: '#111',
                                cursor: 'pointer',
                                overflow: 'hidden'
                              }}
                            >
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt=""
                                  loading="lazy"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                              ) : (
                                <video
                                  src={`${item.url}#t=0.5`}
                                  preload="metadata"
                                  muted
                                  playsInline
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                                />
                              )}

                              {/* Etiqueta de orden */}
                              <span style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                backgroundColor: 'rgba(0,0,0,0.72)',
                                color: '#fff',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                #{itemIdx + 1}
                              </span>

                              {/* Indicador de Video */}
                              {isVideo && (
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(0,0,0,0.28)'
                                }}>
                                  <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(185,154,91,0.95)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <Play size={13} color="#0a0a0a" fill="#0a0a0a" style={{ marginLeft: '1px' }} />
                                  </div>
                                </div>
                              )}

                              {/* Botón Eliminar */}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveGalleryItem(idx, item.id); }}
                                title="Eliminar archivo"
                                style={{
                                  position: 'absolute',
                                  top: '5px',
                                  right: '5px',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '5px',
                                  border: 'none',
                                  backgroundColor: 'rgba(220, 38, 38, 0.9)',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Controles inferiores de cada archivo: Principal + Ordenar */}
                            <div style={{
                              padding: '0.35rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.3rem',
                              backgroundColor: '#fff'
                            }}>
                              {!isVideo ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainSedeImage(idx, item.id)}
                                  style={{
                                    width: '100%',
                                    padding: '0.28rem 0.35rem',
                                    borderRadius: '4px',
                                    border: isMain ? '1px solid #B99A5B' : '1px solid #E5E7EB',
                                    backgroundColor: isMain ? '#FAF5E8' : '#F9FAFB',
                                    color: isMain ? '#8A6D2F' : '#555',
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <Star size={10} fill={isMain ? '#B99A5B' : 'none'} color={isMain ? '#B99A5B' : '#777'} />
                                  <span>{isMain ? 'Principal' : 'Hacer principal'}</span>
                                </button>
                              ) : (
                                <div style={{
                                  width: '100%',
                                  padding: '0.28rem 0.35rem',
                                  borderRadius: '4px',
                                  backgroundColor: '#F3F4F6',
                                  color: '#4B5563',
                                  fontSize: '0.62rem',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  boxSizing: 'border-box'
                                }}>
                                  VIDEO MP4
                                </div>
                              )}

                              {/* Botones para cambiar el orden */}
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                  type="button"
                                  disabled={itemIdx === 0}
                                  onClick={() => handleMoveGalleryItem(idx, itemIdx, -1)}
                                  title="Mover antes"
                                  style={{
                                    flex: 1,
                                    padding: '2px 0',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff',
                                    color: itemIdx === 0 ? '#D1D5DB' : '#374151',
                                    cursor: itemIdx === 0 ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <ChevronLeft size={13} />
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === galleryItems.length - 1}
                                  onClick={() => handleMoveGalleryItem(idx, itemIdx, 1)}
                                  title="Mover después"
                                  style={{
                                    flex: 1,
                                    padding: '2px 0',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff',
                                    color: itemIdx === galleryItems.length - 1 ? '#D1D5DB' : '#374151',
                                    cursor: itemIdx === galleryItems.length - 1 ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SedeGalleryModal
        sede={previewSedeGallery}
        onClose={() => setPreviewSedeGallery(null)}
      />

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


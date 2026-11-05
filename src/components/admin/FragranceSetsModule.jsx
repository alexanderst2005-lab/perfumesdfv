import React, { useState, useEffect, useMemo } from 'react';
import { Save, Upload, CheckCircle, Loader2, Search, Trash2, Sparkles } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { optimizeImg } from '../../utils/img';

const FragranceSetsModule = () => {
  const { products } = useShop();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchProductQuery, setSearchProductQuery] = useState('');

  const [formData, setFormData] = useState({
    title: 'SETS DE FRAGANCIAS EXCLUSIVAS',
    subtitle: 'Combinaciones cuidadosamente seleccionadas para elevar cada momento',
    button_text: 'VER SETS',
    image_url: '',
    images: [],
    product_ids: [],
    active: true
  });

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/fragrance-sets?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data && data.setsBanner) {
          const b = data.setsBanner;
          const imgs = Array.isArray(b.images) && b.images.length > 0
            ? b.images
            : (b.image_url || b.image ? [b.image_url || b.image] : []);
          setFormData({
            title: b.title || 'SETS DE FRAGANCIAS EXCLUSIVAS',
            subtitle: b.subtitle !== undefined ? b.subtitle : 'Combinaciones cuidadosamente seleccionadas para elevar cada momento',
            button_text: b.button_text || 'VER SETS',
            image_url: imgs[0] || '',
            images: imgs,
            product_ids: Array.isArray(b.product_ids) ? b.product_ids.map(x => Number(x)) : [],
            active: b.active !== false
          });
        }
      })
      .catch(err => console.error('Error loading fragrance sets:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const compressImage = async (src, maxSize = 1400, quality = 0.85) => {
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      const compressed = await compressImage(base64, 1400, 0.85);

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
        setFormData(prev => {
          const updatedImages = [...prev.images, data.url];
          return {
            ...prev,
            image_url: updatedImages[0] || data.url,
            images: updatedImages
          };
        });
        showToast('Imagen subida correctamente');
      } else {
        throw new Error(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error(err);
      showToast('Error subiendo imagen: ' + (err.message || ''), 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImageAt = (idx) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, i) => i !== idx);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || ''
      };
    });
  };

  const toggleProductSelect = (productId) => {
    const numId = Number(productId);
    setFormData(prev => {
      const exists = prev.product_ids.some(id => Number(id) === numId);
      const updated = exists
        ? prev.product_ids.filter(id => Number(id) !== numId)
        : [...prev.product_ids, numId];
      return { ...prev, product_ids: updated };
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/fragrance-sets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('¡Apartado de Sets guardado con éxito!');
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar: ' + (err.message || ''), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchProductQuery.trim()) return products;
    const q = searchProductQuery.toLowerCase();
    return products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [products, searchProductQuery]);

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
        <p>Cargando configuración de Sets de Fragancias...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
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

      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} color="#B99A5B" />
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            SECCIÓN PÁGINA PRINCIPAL (DEBAJO DE CASAS EN TENDENCIA)
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.4rem 0 0 0' }}>
          Sets de Fragancias Exclusivas
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
          Sube la fotografía de los sets y selecciona qué perfumes o sets del catálogo aparecerán cuando el cliente toque "VER SETS".
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: '12px', border: '1px solid #EAE8E4', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          
          {/* Activo */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', backgroundColor: '#FAF8F5', borderRadius: '8px', border: '1px solid #EAE6DF' }}>
            <input
              type="checkbox"
              id="sets_active"
              checked={formData.active}
              onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
            />
            <label htmlFor="sets_active" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', cursor: 'pointer' }}>
              Mostrar sección "Sets de Fragancias Exclusivas" en la página de inicio
            </label>
          </div>

          {/* Fotos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.5rem' }}>
              Fotografía(s) del Apartado (con animación desplegable de derecha a izquierda)
            </label>
            
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#111',
              color: '#fff',
              borderRadius: '6px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.8px'
            }}>
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{isUploading ? 'SUBIENDO IMAGEN...' : '+ SUBIR FOTOGRAFÍA'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
            </label>

            {formData.images.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '140px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #EAE8E4' }}>
                    <img src={optimizeImg(imgUrl, 400)} alt={`Set ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(220,38,38,0.9)',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Quitar imagen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Textos */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
                Título Principal
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="SETS DE FRAGANCIAS EXCLUSIVAS"
                style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
                Texto del Botón
              </label>
              <input
                type="text"
                value={formData.button_text}
                onChange={e => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                placeholder="VER SETS"
                style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
              Subtítulo / Descripción
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Combinaciones cuidadosamente seleccionadas para elevar cada momento"
              style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Selector de Productos / Sets */}
          <div style={{ borderTop: '1px solid #EAE8E4', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111' }}>
                Seleccionar Perfumes / Sets del Catálogo ({formData.product_ids.length} seleccionados)
              </label>
              {formData.product_ids.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, product_ids: [] }))}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer' }}
                >
                  Deseleccionar todos
                </button>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                value={searchProductQuery}
                onChange={e => setSearchProductQuery(e.target.value)}
                placeholder="Buscar perfume o set por nombre o marca..."
                style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.4rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #EAE8E4', borderRadius: '8px', padding: '0.5rem' }}>
              {filteredProducts.map(p => {
                const isSelected = formData.product_ids.some(id => Number(id) === Number(p.id));
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProductSelect(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '0.5rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#FAF8F5' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', accentColor: '#111' }}
                    />
                    <img
                      src={optimizeImg(p.image, 100)}
                      alt={p.name}
                      style={{ width: '36px', height: '36px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#111', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#888' }}>
                        {p.brand} · ${Number(p.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 2rem',
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '1px',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} />
              <span>{isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default FragranceSetsModule;

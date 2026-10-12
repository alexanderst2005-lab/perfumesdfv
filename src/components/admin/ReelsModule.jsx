import React, { useState, useEffect } from 'react';
import { Video, Plus, Trash2, Eye, EyeOff, Upload, CheckCircle2, AlertCircle, X, Play } from 'lucide-react';

const ReelsModule = () => {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [previewVideoModal, setPreviewVideoModal] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    videoFile: null,
    videoPreview: '',
    thumbnailFile: null,
    thumbnailPreview: '',
    videoUrlInput: '',
    active: true
  });

  const fetchReels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reels');
      if (res.ok) {
        const data = await res.json();
        setReels(data);
      }
    } catch (e) {
      console.error('Error fetching reels:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: '',
      videoFile: null,
      videoPreview: '',
      thumbnailFile: null,
      thumbnailPreview: '',
      videoUrlInput: '',
      active: true
    });
    setUploadProgressText('');
    setIsModalOpen(true);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Por favor selecciona un archivo de video válido (.mp4, .mov, .webm)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      videoFile: file,
      videoPreview: objectUrl
    }));
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.videoFile && !formData.videoUrlInput) {
      alert('Debes seleccionar un archivo de video o ingresar una URL de video.');
      return;
    }

    setIsUploading(true);
    setUploadProgressText('Procesando video...');

    try {
      let finalVideoUrl = formData.videoUrlInput;
      let finalThumbUrl = formData.thumbnailPreview;

      // Si subió un archivo de video local, lo convertimos a base64 o lo subimos
      if (formData.videoFile) {
        setUploadProgressText('Subiendo video a Cloudinary CDN (esto puede tardar unos segundos según el tamaño)...');
        
        const videoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.videoFile);
        });

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: videoBase64,
            resourceType: 'video',
            folder: 'dfv_reels'
          })
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Error al subir el video a Cloudinary');
        }

        finalVideoUrl = uploadData.url;
      }

      // Si subió portada personalizada opcional
      if (formData.thumbnailPreview && formData.thumbnailPreview.startsWith('data:image')) {
        setUploadProgressText('Subiendo imagen de portada...');
        const thumbRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: formData.thumbnailPreview,
            resourceType: 'image',
            folder: 'dfv_reels_thumbs'
          })
        });
        const thumbData = await thumbRes.json();
        if (thumbData.url) {
          finalThumbUrl = thumbData.url;
        }
      }

      setUploadProgressText('Guardando en la base de datos...');

      const saveRes = await fetch('/api/admin/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim() || 'Experiencia DFV Perfumes',
          video_url: finalVideoUrl,
          thumbnail_url: finalThumbUrl || '',
          active: formData.active
        })
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || 'Error al guardar el reel');
      }

      setIsModalOpen(false);
      fetchReels();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleToggleActive = async (reel) => {
    try {
      const res = await fetch('/api/admin/reels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reel.id, active: !reel.active })
      });
      if (res.ok) {
        setReels(prev => prev.map(r => r.id === reel.id ? { ...r, active: !r.active } : r));
      }
    } catch (e) {
      console.error(e);
      alert('Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este video reel?')) return;
    try {
      const res = await fetch('/api/admin/reels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setReels(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Error al eliminar');
      }
    } catch (e) {
      console.error(e);
      alert('Error de red al eliminar');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827', margin: 0 }}>
            Reels & Videos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.4rem', margin: 0 }}>
            Sube videos reales (MP4/MOV) para que los clientes los reproduzcan directamente en la tienda sin salir a Instagram.
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#000',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={18} />
          Subir Nuevo Video
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          Cargando videos...
        </div>
      ) : reels.length === 0 ? (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px dashed #d1d5db',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <Video size={48} style={{ margin: '0 auto 1rem auto', color: '#9ca3af' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#111', marginBottom: '0.5rem' }}>No tienes videos subidos</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Descarga tus reels favoritos de Instagram en formato MP4 y súbelos aquí para que tus clientes vivan la experiencia en video dentro de la web.
          </p>
          <button 
            onClick={openCreateModal}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '0.7rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Subir Primer Reel
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {reels.map(r => (
            <div 
              key={r.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Contenedor del Video / Thumbnail */}
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '9/16',
                  maxHeight: '380px',
                  backgroundColor: '#000',
                  cursor: 'pointer'
                }}
                onClick={() => setPreviewVideoModal(r)}
              >
                {r.video_url.endsWith('.mp4') || r.video_url.includes('/video/upload/') ? (
                  <video 
                    src={r.video_url} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                    playsInline
                    poster={r.thumbnail_url || undefined}
                  />
                ) : r.thumbnail_url ? (
                  <img 
                    src={r.thumbnail_url} 
                    alt={r.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    <Video size={36} />
                  </div>
                )}

                {/* Overlay Play */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '2px'
                  }}>
                    <Play size={22} fill="#000" color="#000" />
                  </div>
                </div>

                {/* Badge Activo / Inactivo */}
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: r.active ? '#10b981' : '#ef4444',
                    color: '#fff'
                  }}>
                    {r.active ? 'Visible en tienda' : 'Oculto'}
                  </span>
                </div>
              </div>

              {/* Info y Acciones */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#111827' }}>
                    {r.title || 'Video Reel'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Subido: {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
                  <button 
                    onClick={() => handleToggleActive(r)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: r.active ? '#4b5563' : '#10b981',
                      fontWeight: '500'
                    }}
                  >
                    {r.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    {r.active ? 'Ocultar' : 'Activar'}
                  </button>

                  <button 
                    onClick={() => handleDelete(r.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Subir Nuevo Reel */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0, color: '#111' }}>
                Subir Video Reel
              </h2>
              <button 
                onClick={() => !isUploading && setIsModalOpen(false)}
                disabled={isUploading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
              {/* Título opcional */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Título o Frase del Reel (Opcional)
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Destapando Asad de Lattafa, Unboxing Yara..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Subir Archivo de Video */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Seleccionar Archivo de Video (MP4 / MOV) *
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb'
                }}>
                  {formData.videoPreview ? (
                    <div>
                      <video 
                        src={formData.videoPreview} 
                        style={{ maxHeight: '200px', borderRadius: '8px', margin: '0 auto 0.8rem auto', display: 'block' }}
                        controls
                      />
                      <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '500', marginBottom: '0.5rem' }}>
                        ✓ Video cargado: {formData.videoFile?.name}
                      </p>
                      <label style={{ color: '#3b82f6', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                        Cambiar video
                        <input type="file" accept="video/*" onChange={handleVideoFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} style={{ margin: '0 auto 0.5rem auto', color: '#9ca3af' }} />
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.3rem' }}>
                        Arrastra o haz clic para subir tu video
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '0.8rem' }}>
                        Formato vertical recomendado (9:16)
                      </span>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#000',
                        color: '#fff',
                        padding: '0.55rem 1.2rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        Elegir Video
                        <input type="file" accept="video/*" onChange={handleVideoFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* O ingresar URL directa opcional */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  O ingresar enlace de video directo (MP4 URL de Cloudinary u otro servidor)
                </label>
                <input 
                  type="url"
                  placeholder="https://res.cloudinary.com/.../video.mp4"
                  value={formData.videoUrlInput}
                  onChange={e => setFormData({ ...formData, videoUrlInput: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Portada personalizada Opcional */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Foto de Portada / Miniatura (Opcional)
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnailFileChange}
                  style={{ fontSize: '0.85rem' }}
                />
                {formData.thumbnailPreview && (
                  <div style={{ marginTop: '0.5rem', width: '80px', height: '110px', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={formData.thumbnailPreview} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Estado visible */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="activeCheck"
                  checked={formData.active} 
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '0.85rem', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                  Mostrar inmediatamente en la tienda
                </label>
              </div>

              {/* Progreso de subida */}
              {isUploading && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.9rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{
                    width: '24px', height: '24px', border: '2px solid #bbf7d0', borderTopColor: '#16a34a',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem auto'
                  }} />
                  <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '500', margin: 0 }}>
                    {uploadProgressText}
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                  style={{ padding: '0.75rem 1.4rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  style={{
                    padding: '0.75rem 1.6rem',
                    backgroundColor: '#000',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {isUploading ? 'Subiendo...' : 'Guardar Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reproducción de Prueba */}
      {previewVideoModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
          onClick={() => setPreviewVideoModal(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '420px',
              width: '100%',
              aspectRatio: '9/16',
              maxHeight: '85vh',
              backgroundColor: '#000',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewVideoModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>
            <video 
              src={previewVideoModal.video_url} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelsModule;

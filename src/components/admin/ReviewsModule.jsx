import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Plus, Trash2, Eye, EyeOff, Star, X, Upload } from 'lucide-react';

const emptyForm = { name: '', city: '', comment: '', rating: 5, imageFile: null, imagePreview: '', active: true };

const ReviewsModule = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) setReviews(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const signRes = await fetch('/api/admin/cloudinary-sign?folder=dfv_reviews');
    if (!signRes.ok) throw new Error('No se pudo preparar la subida de la imagen');
    const sign = await signRes.json();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sign.apiKey);
    fd.append('timestamp', sign.timestamp);
    fd.append('signature', sign.signature);
    fd.append('folder', sign.folder);
    const up = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: fd });
    const data = await up.json();
    if (!up.ok || !data.secure_url) throw new Error(data.error?.message || 'Error al subir la imagen');
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Escribe el nombre del cliente.');
    if (!formData.comment.trim() && !formData.imageFile) return alert('Escribe el comentario o sube una captura.');

    setIsSaving(true);
    try {
      let imageUrl = '';
      if (formData.imageFile) imageUrl = await uploadImage(formData.imageFile);

      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          comment: formData.comment,
          rating: formData.rating,
          image_url: imageUrl,
          active: formData.active
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
      setIsModalOpen(false);
      setFormData(emptyForm);
      fetchReviews();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (r) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: r.id, active: !r.active })
    });
    if (res.ok) setReviews(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x));
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setReviews(prev => prev.filter(x => x.id !== id));
  };

  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' };
  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.85rem' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827', margin: 0 }}>Reseñas de Clientes</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0.4rem 0 0 0' }}>
            Agrega opiniones reales de tus clientes (de WhatsApp, Instagram, etc.). Solo se muestran las que estén activas.
          </p>
        </div>
        <button
          onClick={() => { setFormData(emptyForm); setIsModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          <Plus size={18} /> Agregar Reseña
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Cargando reseñas...</div>
      ) : reviews.length === 0 ? (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #d1d5db', padding: '4rem 2rem', textAlign: 'center', color: '#6b7280' }}>
          <MessageSquareQuote size={48} style={{ margin: '0 auto 1rem auto', color: '#9ca3af' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#111', marginBottom: '0.5rem' }}>Aún no hay reseñas reales</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
            Mientras no agregues ninguna, la tienda muestra reseñas de ejemplo. Cuando cargues la primera real, las de ejemplo desaparecen.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.2rem', opacity: r.active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '0.6rem' }}>
                {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#B99A5B" color="#B99A5B" />)}
              </div>
              {r.image_url && (
                <img src={r.image_url} alt="captura" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.7rem' }} />
              )}
              {r.comment && <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, margin: '0 0 0.8rem 0' }}>«{r.comment}»</p>}
              <p style={{ fontSize: '0.82rem', fontWeight: '600', margin: 0 }}>{r.name}{r.city ? ` · ${r.city}` : ''}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.9rem', borderTop: '1px solid #f3f4f6', paddingTop: '0.7rem' }}>
                <button onClick={() => toggleActive(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#4b5563' }}>
                  {r.active ? <EyeOff size={15} /> : <Eye size={15} />} {r.active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onClick={() => remove(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#ef4444' }}>
                  <Trash2 size={15} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>Nueva Reseña</h2>
              <button onClick={() => !isSaving && setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Nombre del cliente *</label>
                  <input style={inputStyle} placeholder="Ej: Laura Gómez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Ciudad (opcional)</label>
                  <input style={inputStyle} placeholder="Ej: Cali" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Comentario del cliente</label>
                <textarea rows={4} style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }} placeholder="Copia aquí lo que te escribió el cliente, tal cual..." value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Calificación</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button type="button" key={n} onClick={() => setFormData({ ...formData, rating: n })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={26} fill={n <= formData.rating ? '#B99A5B' : 'none'} color="#B99A5B" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Captura o foto del mensaje (opcional, da mucha más credibilidad)</label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', backgroundColor: '#000', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <Upload size={15} /> Subir imagen
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {formData.imagePreview && (
                  <img src={formData.imagePreview} alt="preview" style={{ display: 'block', marginTop: '0.7rem', maxHeight: '160px', borderRadius: '8px' }} />
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} style={{ width: 18, height: 18 }} />
                Mostrar inmediatamente en la tienda
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} style={{ padding: '0.7rem 1.3rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSaving} style={{ padding: '0.7rem 1.5rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                  {isSaving ? 'Guardando...' : 'Guardar Reseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsModule;

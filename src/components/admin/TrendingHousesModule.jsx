import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, CheckCircle, TrendingUp, Loader2, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { optimizeImg } from '../../utils/img';

const TrendingHousesModule = () => {
  const { products } = useShop();
  const [houses, setHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal Form State
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    active: true,
    sort_order: 0,
    product_ids: []
  });
  const [searchProductQuery, setSearchProductQuery] = useState('');

  const fetchHouses = () => {
    setIsLoading(true);
    fetch('/api/trending-houses')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.houses)) {
          setHouses(data.houses);
        }
      })
      .catch(err => console.error('Error fetching trending houses:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      image_url: '',
      active: true,
      sort_order: houses.length,
      product_ids: []
    });
    setSearchProductQuery('');
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditId(h.id);
    setFormData({
      name: h.name || '',
      image_url: h.image_url || '',
      active: h.active !== false,
      sort_order: h.sort_order || 0,
      product_ids: Array.isArray(h.product_ids) ? [...h.product_ids] : []
    });
    setSearchProductQuery('');
    setIsModalOpen(true);
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

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      const data = await res.json();
      if (data && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        showToast('Imagen de la casa subida');
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

  const toggleProductSelect = (productId) => {
    setFormData(prev => {
      const exists = prev.product_ids.includes(productId);
      const updated = exists
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId];
      return { ...prev, product_ids: updated };
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor escribe el nombre de la casa de perfumería');
      return;
    }

    setIsSaving(true);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = editId ? { id: editId, ...formData } : formData;

      const res = await fetch('/api/trending-houses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(editId ? 'Casa actualizada' : 'Casa agregada con éxito');
        setIsModalOpen(false);
        fetchHouses();
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la casa "${name}"?`)) return;

    try {
      const res = await fetch(`/api/trending-houses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data && data.success) {
        showToast('Casa eliminada');
        fetchHouses();
      } else {
        throw new Error(data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar: ' + (err.message || ''), 'error');
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

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Toast */}
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
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            MARCAS & CASAS DESTACADAS
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.3rem 0 0 0' }}>
            Casas en Tendencia
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
            Destaca marcas y casas perfumistas de mayor demanda (Lattafa, Bharara, Dior, Chanel, Versace, etc.).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#111',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.4rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <Plus size={16} />
          <span>NUEVA CASA EN TENDENCIA</span>
        </button>
      </div>

      {/* Grid de Casas */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
          <p>Cargando casas en tendencia...</p>
        </div>
      ) : houses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #D5D0C6' }}>
          <TrendingUp size={44} color="#B99A5B" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#111', marginBottom: '0.5rem' }}>
            No hay casas en tendencia registradas
          </h3>
          <p style={{ color: '#777', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            Agrega casas o marcas principales para que aparezcan en el carrusel de la página de inicio con sus productos asociados.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.78rem',
              letterSpacing: '1px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + AGREGAR PRIMERA CASA
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {houses.map(h => (
            <div
              key={h.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #EAE8E4',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Imagen / Banner */}
              <div style={{ position: 'relative', height: '160px', backgroundColor: '#F9F8F6' }}>
                {h.image_url ? (
                  <img
                    src={optimizeImg(h.image_url, 400)}
                    alt={h.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>
                    <TrendingUp size={36} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <span style={{
                    backgroundColor: h.active ? '#dcfce7' : '#fee2e2',
                    color: h.active ? '#166534' : '#991b1b',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}>
                    {h.active ? 'Activa' : 'Inactiva'}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 500
                  }}>
                    Orden: {h.sort_order}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#111', margin: '0 0 0.4rem 0' }}>
                  {h.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 1rem 0' }}>
                  {h.product_count || (h.product_ids ? h.product_ids.length : 0)} fragancias vinculadas
                </p>

                {/* Acciones */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.8rem' }}>
                  <button
                    onClick={() => openEditModal(h)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem',
                      backgroundColor: '#FAF8F5',
                      border: '1px solid #EAE8E4',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#111',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(h.id, h.name)}
                    style={{
                      padding: '0.6rem 0.9rem',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#991B1B',
                      cursor: 'pointer'
                    }}
                    title="Eliminar casa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.2rem 1.6rem', borderBottom: '1px solid #EAE8E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#111', margin: 0 }}>
                  {editId ? 'Editar Casa en Tendencia' : 'Nueva Casa en Tendencia'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                  Define el nombre, banner y selecciona los perfumes que pertenecen a esta casa
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              
              {/* Nombre */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
                  Nombre de la Casa / Marca *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. LATTAFA, BHARARA, DIOR, CHANEL..."
                  style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Imagen y Orden */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
                    Banner / Fotografía
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#FAF8F5',
                    border: '1px dashed #B99A5B',
                    borderRadius: '6px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 500
                  }}>
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} color="#B99A5B" />}
                    <span>{isUploading ? 'Subiendo...' : 'Subir imagen'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} style={{ display: 'none' }} />
                  </label>
                  {formData.image_url && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={formData.image_url} alt="Portada" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 500 }}>✓ Imagen cargada</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#333', marginBottom: '0.4rem' }}>
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Activo Checkbox */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="house_active"
                  checked={formData.active}
                  onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#111' }}
                />
                <label htmlFor="house_active" style={{ fontSize: '0.85rem', color: '#333', cursor: 'pointer', fontWeight: 500 }}>
                  Mostrar en la página principal
                </label>
              </div>

              {/* Selector de Productos */}
              <div style={{ borderTop: '1px solid #EAE8E4', paddingTop: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111' }}>
                    Vincular Perfumes ({formData.product_ids.length} elegidos)
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

                {/* Buscador */}
                <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                  <input
                    type="text"
                    value={searchProductQuery}
                    onChange={e => setSearchProductQuery(e.target.value)}
                    placeholder="Buscar producto por nombre o marca..."
                    style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.4rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Lista */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #EAE8E4', borderRadius: '8px', padding: '0.5rem' }}>
                  {filteredProducts.map(p => {
                    const isSelected = formData.product_ids.includes(p.id);
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
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
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
                          style={{ width: '32px', height: '32px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#111', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#888' }}>
                            {p.brand} · ${Number(p.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.6rem', borderTop: '1px solid #EAE8E4', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.7rem 1.2rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#666', cursor: 'pointer' }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '0.7rem 1.6rem',
                  backgroundColor: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  letterSpacing: '1px',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'GUARDANDO...' : 'GUARDAR CASA'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TrendingHousesModule;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, X, Save, Trash2, CheckCircle, XCircle,
  Clock, Edit, ChevronDown, ChevronUp, Image as ImageIcon,
  Tag, Calendar, Zap, AlertTriangle, RefreshCw, Eye, List
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { optimizeImg } from '../../utils/img';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const FREQ_OPTIONS = [
  {
    id: 'once_session',
    label: 'Una vez por sesión',
    desc: 'Se muestra al entrar y no vuelve a aparecer durante la misma sesión.',
    icon: '🔁'
  },
  {
    id: 'once_24h',
    label: 'Una vez cada 24 horas',
    desc: 'Si el visitante cierra el anuncio, esperará 24 horas antes de mostrarse de nuevo.',
    icon: '⏰'
  },
  {
    id: 'every_visit',
    label: 'En cada visita',
    desc: 'Se muestra cada vez que el visitante entra o recarga la página.',
    icon: '👁️'
  }
];

const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50];

const STATUS_LABELS = {
  draft: { label: 'Borrador', color: '#6b7280', bg: '#f3f4f6' },
  active: { label: 'Activa', color: '#059669', bg: '#d1fae5' },
  scheduled: { label: 'Programada', color: '#d97706', bg: '#fef3c7' },
  finished: { label: 'Finalizada', color: '#6b7280', bg: '#f3f4f6' },
  draft_inactive: { label: 'Desactivada', color: '#6b7280', bg: '#f3f4f6' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.65rem', borderRadius: '99px',
      backgroundColor: s.bg, color: s.color,
      fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.5px'
    }}>
      {s.label}
    </span>
  );
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
      backgroundColor: type === 'error' ? '#dc2626' : type === 'warning' ? '#d97706' : '#059669',
      color: '#fff', padding: '1rem 1.5rem', borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: '380px',
      fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: '500',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      animation: 'slideUp 0.3s ease'
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, opacity: 0.8 }}>
        <X size={16} />
      </button>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '14px', padding: '2rem',
        maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <AlertTriangle size={22} color="#dc2626" />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb',
            backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.85rem'
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none',
            backgroundColor: '#dc2626', color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: '600'
          }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Producto seleccionado en la campaña ────────────────────────────────────

function SelectedProductCard({ item, onChange, onRemove }) {
  const refPrice = item.ref_price || item.refPrice;
  const promoPrice = refPrice ? Math.round(refPrice * (1 - item.discount_pct / 100)) : 0;

  const handleDiscountChange = (val) => {
    const pct = Math.min(99, Math.max(1, parseInt(val, 10) || 1));
    onChange({ ...item, discount_pct: pct });
  };

  const imgSrc = item.product_image || item.image;
  const optImg = imgSrc && imgSrc.includes('/image/upload/')
    ? imgSrc.replace('/image/upload/', '/image/upload/w_80,f_auto,q_auto/')
    : imgSrc;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px 1fr auto',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      marginBottom: '0.65rem'
    }}>
      {/* Foto */}
      <div style={{
        width: 64, height: 64, borderRadius: '8px',
        backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0
      }}>
        {optImg
          ? <img src={optImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <ImageIcon size={20} color="#9ca3af" />
          </div>
        }
      </div>

      {/* Info + controles */}
      <div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontWeight: '500', margin: '0 0 0.1rem' }}>
          {item.product_name || item.name}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          {item.product_brand || item.brand}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Botones rápidos */}
          {QUICK_DISCOUNTS.map(d => (
            <button key={d} onClick={() => handleDiscountChange(d)} style={{
              padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600',
              border: item.discount_pct === d ? '1.5px solid #111827' : '1px solid #e5e7eb',
              backgroundColor: item.discount_pct === d ? '#111827' : '#fff',
              color: item.discount_pct === d ? '#fff' : '#374151',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {d}%
            </button>
          ))}

          {/* Input manual */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="number"
              min="1" max="99"
              value={item.discount_pct}
              onChange={e => handleDiscountChange(e.target.value)}
              style={{
                width: '54px', padding: '0.2rem 0.4rem', borderRadius: '4px',
                border: '1px solid #e5e7eb', fontSize: '0.8rem',
                fontFamily: 'var(--font-sans)', textAlign: 'center'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>%</span>
          </div>
        </div>

        {/* Precios */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'line-through' }}>
            {fmt(refPrice)}
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#059669' }}>
            {fmt(promoPrice)}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#fff', backgroundColor: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
            -{item.discount_pct}%
          </span>
        </div>
      </div>

      {/* Quitar */}
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#9ca3af', padding: '0.25rem', borderRadius: '6px',
        transition: 'color 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
      >
        <X size={18} />
      </button>
    </div>
  );
}

// ─── Formulario de campaña ───────────────────────────────────────────────────

function CampaignForm({ initialData, allProducts, onSave, onCancel, onActivate, onDeactivate, onDelete }) {
  const isEdit = !!initialData?.id;

  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    badge: '',
    image: '',
    frequency: 'once_session',
    starts_at: '',
    ends_at: '',
    ...initialData
  });

  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [selectedProducts, setSelectedProducts] = useState(
    (initialData?.products || []).map(p => ({
      ...p,
      discount_pct: p.discount_pct || 10
    }))
  );
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [sectionOpen, setSectionOpen] = useState({
    popup: true, frequency: true, dates: false, products: true
  });

  const searchRef = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Filtrar productos para el buscador
  const filteredProducts = allProducts.filter(p => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
  }).filter(p => !selectedProducts.find(s => s.product_id === p.id));

  const addProduct = (p) => {
    const refPrice = p.oldPrice || p.price;
    setSelectedProducts(prev => [...prev, {
      product_id: p.id,
      product_name: p.name,
      product_brand: p.brand,
      product_image: p.image,
      ref_price: refPrice,
      original_price: p.price,
      original_old_price: p.oldPrice || null,
      original_discount: p.discount || null,
      discount_pct: 10,
      promo_price: Math.round(refPrice * 0.9)
    }]);
    setProductSearch('');
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  const updateProduct = (updated) => {
    setSelectedProducts(prev => prev.map(p =>
      p.product_id === updated.product_id ? updated : p
    ));
  };

  const handleImageUrl = (url) => {
    setField('image', url);
    setImagePreview(url);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!form.title.trim()) errs.title = 'El título del anuncio es obligatorio';
    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      errs.ends_at = 'La fecha de fin debe ser posterior a la de inicio';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (activateAfterSave = false) => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        products: selectedProducts.map(p => ({
          product_id: p.product_id,
          discount_pct: p.discount_pct,
          ref_price: p.ref_price,
          promo_price: Math.round(p.ref_price * (1 - p.discount_pct / 100)),
          original_price: p.original_price,
          original_old_price: p.original_old_price || null,
          original_discount: p.original_discount || null
        }))
      };

      const url = isEdit ? `/api/admin/promo-campaigns?id=${form.id}` : '/api/admin/promo-campaigns';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.conflicts) {
          const names = data.conflicts.map(c => `"${c.product_id}" (en campaña "${c.campaign_name}")`).join(', ');
          showToast(`⚠️ Conflicto: los siguientes productos ya están en otra campaña activa: ${names}`, 'error');
        } else {
          showToast(data.error || 'Error al guardar', 'error');
        }
        return;
      }

      const campaignId = data.data.id;

      if (activateAfterSave) {
        const actRes = await fetch(`/api/admin/promo-campaigns?id=${campaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: campaignId, action: 'activate' })
        });
        const actData = await actRes.json();
        if (!actRes.ok) {
          showToast(actData.error || 'Guardada pero no se pudo activar', 'warning');
        } else {
          showToast('✅ Campaña guardada y activada correctamente');
        }
      } else {
        showToast(isEdit ? '✅ Campaña actualizada' : '✅ Campaña guardada como borrador');
      }

      setTimeout(() => onSave(), 1500);
    } catch (e) {
      showToast('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (key) => setSectionOpen(s => ({ ...s, [key]: !s[key] }));

  // ── Render ──────────────────────────────────────────────────────────────────

  const SectionHeader = ({ title, icon: Icon, sectionKey }) => (
    <div
      onClick={() => toggleSection(sectionKey)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', padding: '1rem 1.5rem',
        borderBottom: sectionOpen[sectionKey] ? '1px solid #f3f4f6' : 'none',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Icon size={16} color="#6b7280" />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#374151' }}>
          {title}
        </span>
      </div>
      {sectionOpen[sectionKey] ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
    </div>
  );

  const field = (label, key, type = 'text', placeholder = '', required = false) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block', fontFamily: 'var(--font-sans)',
        fontSize: '0.78rem', fontWeight: '600', color: '#374151',
        marginBottom: '0.4rem', letterSpacing: '0.3px'
      }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {type === 'textarea'
        ? <textarea
          rows={3}
          value={form[key]}
          onChange={e => setField(key, e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
            border: `1px solid ${errors[key] ? '#dc2626' : '#e5e7eb'}`,
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
            resize: 'vertical', outline: 'none', lineHeight: 1.5
          }}
        />
        : <input
          type={type}
          value={form[key]}
          onChange={e => setField(key, e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
            border: `1px solid ${errors[key] ? '#dc2626' : '#e5e7eb'}`,
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none'
          }}
        />
      }
      {errors[key] && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '500', color: '#111827', margin: 0 }}>
            {isEdit ? 'Editar campaña' : 'Nueva campaña promocional'}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {isEdit ? `Editando: ${form.name}` : 'Configura todos los detalles de tu campaña'}
          </p>
        </div>
        <button onClick={onCancel} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 1.25rem', border: '1px solid #e5e7eb',
          borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#6b7280'
        }}>
          <List size={16} />
          Ver campañas
        </button>
      </div>

      {/* Datos de administración en caso de campaña existente */}
      {isEdit && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: '600', color: '#111827' }}>
                {form.name}
              </span>
              <StatusBadge status={form.computed_status || form.status} />
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#6b7280' }}>
              <span>📦 <strong>{selectedProducts.length}</strong> perfume{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}</span>
              {form.starts_at && <span>📅 Inicio: {new Date(form.starts_at).toLocaleString('es-CO')}</span>}
              {form.ends_at && <span>⏰ Fin: {new Date(form.ends_at).toLocaleString('es-CO')}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(form.computed_status === 'draft' || form.computed_status === 'finished' || form.computed_status === 'draft_inactive') && onActivate && (
              <button
                type="button"
                onClick={async () => {
                  await onActivate(form.id);
                  setForm(f => ({ ...f, computed_status: 'active', status: 'active' }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                  backgroundColor: '#d1fae5', color: '#059669',
                  fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <CheckCircle size={14} /> Activar campaña
              </button>
            )}
            {(form.computed_status === 'active' || form.computed_status === 'scheduled') && onDeactivate && (
              <button
                type="button"
                onClick={async () => {
                  await onDeactivate(form.id);
                  setForm(f => ({ ...f, computed_status: 'draft', status: 'draft' }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                  backgroundColor: '#fef3c7', color: '#d97706',
                  fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <XCircle size={14} /> Desactivar campaña
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.9rem', borderRadius: '6px',
                  border: '1px solid #fee2e2', backgroundColor: '#fff',
                  fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                  color: '#dc2626'
                }}
              >
                <Trash2 size={14} /> Eliminar
              </button>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Eliminar campaña"
          message="¿Estás seguro de eliminar esta campaña? Se restaurarán los precios originales del inventario de forma inmediata."
          onConfirm={() => {
            setShowDeleteConfirm(false);
            if (onDelete) onDelete(form.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* ── Sección 1: Configuración del popup ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <SectionHeader title="Configuración del anuncio" icon={Zap} sectionKey="popup" />
        {sectionOpen.popup && (
          <div style={{ padding: '1.5rem' }}>
            {field('Nombre de la campaña', 'name', 'text', 'Ej: Black Friday 2026', true)}
            {field('Título del anuncio (aparece en el popup)', 'title', 'text', 'Ej: ¡Llegaron los descuentos que estabas esperando!', true)}
            {field('Descripción o mensaje', 'description', 'textarea', 'Ej: Descubre nuestros perfumes favoritos con descuentos especiales por tiempo limitado.')}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Texto promocional destacado (Badge)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {['HASTA 40% OFF', 'OFERTAS ESPECIALES', 'DESCUENTOS EXCLUSIVOS', 'PROMOCIÓN POR TIEMPO LIMITADO'].map(b => (
                  <button key={b} onClick={() => setField('badge', b)} style={{
                    padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                    border: form.badge === b ? '1.5px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: form.badge === b ? '#111827' : '#fff',
                    color: form.badge === b ? '#fff' : '#374151'
                  }}>
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={form.badge}
                onChange={e => setField('badge', e.target.value)}
                placeholder="O escribe tu propio badge..."
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                  border: '1px solid #e5e7eb', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>

            {/* Imagen */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Imagen promocional (opcional)
              </label>
              <input
                type="text"
                value={form.image}
                onChange={e => handleImageUrl(e.target.value)}
                placeholder="https://... URL directa de la imagen"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                  border: '1px solid #e5e7eb', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none',
                  marginBottom: '0.75rem'
                }}
              />
              {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    onError={() => setImagePreview('')}
                    style={{
                      maxHeight: '200px', maxWidth: '100%', borderRadius: '8px',
                      objectFit: 'cover', border: '1px solid #e5e7eb'
                    }}
                  />
                  <button onClick={() => { setField('image', ''); setImagePreview(''); }} style={{
                    position: 'absolute', top: '6px', right: '6px',
                    backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '24px', height: '24px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#fff'
                  }}>
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Sección 2: Frecuencia ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <SectionHeader title="Frecuencia de aparición" icon={RefreshCw} sectionKey="frequency" />
        {sectionOpen.frequency && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FREQ_OPTIONS.map(opt => (
              <div
                key={opt.id}
                onClick={() => setField('frequency', opt.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1rem 1.25rem', borderRadius: '10px', cursor: 'pointer',
                  border: form.frequency === opt.id ? '2px solid #111827' : '1px solid #e5e7eb',
                  backgroundColor: form.frequency === opt.id ? '#f9fafb' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: form.frequency === opt.id ? '6px solid #111827' : '2px solid #d1d5db',
                  flexShrink: 0, marginTop: '2px', transition: 'all 0.2s'
                }} />
                <div>
                  <span style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>{opt.icon}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                    {opt.label}
                  </span>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#6b7280', marginTop: '0.2rem', lineHeight: 1.5 }}>
                    {opt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sección 3: Fechas ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <SectionHeader title="Programar campaña (opcional)" icon={Calendar} sectionKey="dates" />
        {sectionOpen.dates && (
          <div style={{ padding: '1.5rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Si no configuras fechas, podrás activar y desactivar la campaña manualmente. Las horas corresponden a la zona horaria de Colombia (UTC-5).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                  Fecha y hora de inicio
                </label>
                <input
                  type="datetime-local"
                  value={form.starts_at ? form.starts_at.slice(0, 16) : ''}
                  onChange={e => setField('starts_at', e.target.value ? e.target.value + ':00' : '')}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    border: '1px solid #e5e7eb', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                  Fecha y hora de fin
                </label>
                <input
                  type="datetime-local"
                  value={form.ends_at ? form.ends_at.slice(0, 16) : ''}
                  onChange={e => setField('ends_at', e.target.value ? e.target.value + ':00' : '')}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                    border: `1px solid ${errors.ends_at ? '#dc2626' : '#e5e7eb'}`,
                    fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none'
                  }}
                />
                {errors.ends_at && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.ends_at}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sección 4: Productos ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '2rem', overflow: 'hidden' }}>
        <SectionHeader title={`Productos de la campaña ${selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''}`} icon={Tag} sectionKey="products" />
        {sectionOpen.products && (
          <div style={{ padding: '1.5rem' }}>
            {/* Buscador */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Search size={16} color="#9ca3af" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar perfume por nombre o marca..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  onFocus={() => setShowProductSearch(true)}
                  style={{
                    flex: 1, border: 'none', backgroundColor: 'transparent',
                    fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none'
                  }}
                />
                {productSearch && (
                  <button onClick={() => { setProductSearch(''); setShowProductSearch(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown de resultados */}
              {showProductSearch && productSearch && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 100,
                  maxHeight: '280px', overflowY: 'auto'
                }}>
                  {filteredProducts.length === 0
                    ? <p style={{ padding: '1rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>No se encontraron productos</p>
                    : filteredProducts.slice(0, 12).map(p => {
                      const imgUrl = p.image && p.image.includes('/image/upload/')
                        ? p.image.replace('/image/upload/', '/image/upload/w_60,f_auto,q_auto/')
                        : p.image;
                      return (
                        <div
                          key={p.id}
                          onClick={() => { addProduct(p); setShowProductSearch(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.65rem 1rem', cursor: 'pointer', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                            {imgUrl
                              ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ImageIcon size={16} color="#9ca3af" /></div>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: '500', margin: 0, truncate: true }}>{p.name}</p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#6b7280', margin: 0 }}>{p.brand} · {fmt(p.oldPrice || p.price)}</p>
                          </div>
                          <Plus size={14} color="#6b7280" />
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>

            {/* Click fuera cierra el dropdown */}
            {showProductSearch && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowProductSearch(false)} />
            )}

            {/* Lista de productos seleccionados */}
            {selectedProducts.length === 0
              ? <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px dashed #e5e7eb' }}>
                <Tag size={28} color="#d1d5db" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: '#9ca3af' }}>
                  Busca y agrega perfumes desde tu inventario
                </p>
              </div>
              : selectedProducts.map(item => (
                <SelectedProductCard
                  key={item.product_id}
                  item={item}
                  onChange={updateProduct}
                  onRemove={() => removeProduct(item.product_id)}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* ── Botones de acción ── */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        paddingBottom: '3rem'
      }}>
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '8px',
            border: '1px solid #e5e7eb', backgroundColor: '#fff',
            color: '#374151', cursor: isSaving ? 'default' : 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600',
            opacity: isSaving ? 0.6 : 1
          }}
        >
          <Save size={16} />
          {isEdit ? 'Guardar cambios' : 'Guardar borrador'}
        </button>

        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '8px',
            border: 'none', backgroundColor: '#111827',
            color: '#fff', cursor: isSaving ? 'default' : 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600',
            opacity: isSaving ? 0.6 : 1
          }}
        >
          <Zap size={16} />
          {isSaving ? 'Guardando...' : (isEdit ? 'Guardar y activar' : 'Crear y activar')}
        </button>
      </div>
    </div>
  );
}

// ─── Lista de campañas existentes ───────────────────────────────────────────

function CampaignsList({ campaigns, onEdit, onCreate, onActivate, onDeactivate, onDelete, isLoading }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontFamily: 'var(--font-sans)' }}>
        Cargando campañas...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '500', color: '#111827', margin: 0 }}>
            Campañas promocionales
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''} creada{campaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={onCreate} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.5rem', borderRadius: '8px',
          border: 'none', backgroundColor: '#111827',
          color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600'
        }}>
          <Plus size={16} />
          Nueva campaña
        </button>
      </div>

      {campaigns.length === 0
        ? <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb'
        }}>
          <Zap size={40} color="#d1d5db" style={{ marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#374151', marginBottom: '0.5rem' }}>
            No hay campañas aún
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            Crea tu primera campaña promocional para mostrar descuentos especiales en tu tienda.
          </p>
          <button onClick={onCreate} style={{
            padding: '0.75rem 2rem', borderRadius: '8px', border: 'none',
            backgroundColor: '#111827', color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600'
          }}>
            Crear primera campaña
          </button>
        </div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {campaigns.map(c => (
              <div key={c.id} style={{
                backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
                padding: '1.25rem 1.5rem',
                borderLeft: c.computed_status === 'active' ? '4px solid #059669'
                  : c.computed_status === 'scheduled' ? '4px solid #d97706'
                    : '4px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: '500', color: '#111827' }}>
                        {c.name}
                      </span>
                      <StatusBadge status={c.computed_status} />
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                      {c.title}
                    </p>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={12} /> {c.product_count || 0} productos
                      </span>
                      {c.starts_at && (
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> Inicio: {new Date(c.starts_at).toLocaleDateString('es-CO')}
                        </span>
                      )}
                      {c.ends_at && (
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> Fin: {new Date(c.ends_at).toLocaleDateString('es-CO')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                    {(c.computed_status === 'draft' || c.computed_status === 'finished' || c.computed_status === 'draft_inactive') && (
                      <button onClick={() => onActivate(c.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                        backgroundColor: '#d1fae5', color: '#059669',
                        fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)'
                      }}>
                        <CheckCircle size={14} /> Activar
                      </button>
                    )}
                    {(c.computed_status === 'active' || c.computed_status === 'scheduled') && (
                      <button onClick={() => onDeactivate(c.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
                        backgroundColor: '#fef3c7', color: '#d97706',
                        fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)'
                      }}>
                        <XCircle size={14} /> Desactivar
                      </button>
                    )}
                    <button onClick={() => onEdit(c.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.5rem 0.9rem', borderRadius: '6px',
                      border: '1px solid #e5e7eb', backgroundColor: '#fff',
                      fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                      color: '#374151', fontFamily: 'var(--font-sans)'
                    }}>
                      <Edit size={14} /> Editar
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.5rem 0.9rem', borderRadius: '6px',
                      border: '1px solid #fee2e2', backgroundColor: '#fff',
                      fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                      color: '#dc2626', fontFamily: 'var(--font-sans)'
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar campaña"
          message="¿Estás seguro? Se restaurarán los precios originales de los productos y la campaña no podrá recuperarse."
          onConfirm={() => { onDelete(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Módulo principal ────────────────────────────────────────────────────────

const CampaignsModule = () => {
  const { allProducts } = useShop();

  // 'form_new' | 'form_edit' | 'list'
  const [view, setView] = useState('form_new');
  const [campaigns, setCampaigns] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/promo-campaigns');
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleEdit = async (id) => {
    try {
      const res = await fetch(`/api/admin/promo-campaigns?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setEditData(data.data);
        setView('form_edit');
      }
    } catch (e) {
      showToast('Error al cargar la campaña', 'error');
    }
  };

  const handleActivate = async (id) => {
    try {
      const res = await fetch(`/api/admin/promo-campaigns?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'activate' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('✅ Campaña activada correctamente');
        loadCampaigns();
      } else if (data.conflicts) {
        const names = data.conflicts.map(c => c.product_id).join(', ');
        showToast(`⚠️ Conflicto en productos: ${names}`, 'warning');
      } else {
        showToast(data.error || 'Error al activar', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const res = await fetch(`/api/admin/promo-campaigns?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'deactivate' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Campaña desactivada. Precios restaurados.');
        loadCampaigns();
      } else {
        showToast(data.error || 'Error al desactivar', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/admin/promo-campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Campaña eliminada. Inventario intacto.');
        loadCampaigns();
        if (view !== 'list') setView('form_new');
      } else {
        showToast(data.error || 'Error al eliminar', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleSaved = () => {
    loadCampaigns();
    setView('form_new');
    setEditData(null);
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {view === 'form_new' && (
        <CampaignForm
          initialData={null}
          allProducts={allProducts.filter(p => p.active !== false)}
          onSave={handleSaved}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'form_edit' && editData && (
        <CampaignForm
          initialData={editData}
          allProducts={allProducts.filter(p => p.active !== false)}
          onSave={handleSaved}
          onCancel={() => { setView('list'); setEditData(null); }}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}

      {view === 'list' && (
        <CampaignsList
          campaigns={campaigns}
          isLoading={isLoading}
          onEdit={handleEdit}
          onCreate={() => setView('form_new')}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CampaignsModule;

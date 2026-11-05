import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, BarChart2, Loader2, Sparkles } from 'lucide-react';

const CountersModule = () => {
  const [counters, setCounters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/site-counters')
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.counters)) {
          setCounters(data.counters);
        }
      })
      .catch(err => console.error('Error fetching counters:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFieldChange = (id, field, value) => {
    setCounters(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/site-counters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counters })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Cifras y contadores actualizados');
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

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
        <p>Cargando contadores...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
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
            TRAYECTORIA & CIFRAS
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.3rem 0 0 0' }}>
            Barra de Contadores
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
            Personaliza las cifras que se muestran con animación progresiva en la página de inicio.
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

      {/* Grid de Contadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {counters.map((c, idx) => (
          <div
            key={c.id}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #EAE8E4',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
                CONTADOR #{idx + 1}
              </span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', color: '#555' }}>
                <input
                  type="checkbox"
                  checked={c.active !== false}
                  onChange={e => handleFieldChange(c.id, 'active', e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#111' }}
                />
                Activo
              </label>
            </div>

            {/* Valor Numérico */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#444', marginBottom: '0.3rem' }}>
                Cifra Numérica
              </label>
              <input
                type="number"
                value={c.value}
                onChange={e => handleFieldChange(c.id, 'value', parseInt(e.target.value, 10) || 0)}
                style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
              />
            </div>

            {/* Prefijo y Sufijo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#444', marginBottom: '0.3rem' }}>
                  Prefijo (opcional)
                </label>
                <input
                  type="text"
                  value={c.prefix || ''}
                  onChange={e => handleFieldChange(c.id, 'prefix', e.target.value)}
                  placeholder="Ej. +"
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#444', marginBottom: '0.3rem' }}>
                  Sufijo (ej. +, %)
                </label>
                <input
                  type="text"
                  value={c.suffix || ''}
                  onChange={e => handleFieldChange(c.id, 'suffix', e.target.value)}
                  placeholder="Ej. + o %"
                  style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Etiqueta / Texto */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: '#444', marginBottom: '0.3rem' }}>
                Etiqueta / Descripción
              </label>
              <input
                type="text"
                value={c.label || ''}
                onChange={e => handleFieldChange(c.id, 'label', e.target.value)}
                placeholder="Ej. Clientes satisfechos"
                style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid #EAE8E4', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Vista previa mini */}
            <div style={{
              backgroundColor: '#FAF8F5',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #EAE8E4'
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#111', display: 'block', lineHeight: 1.1 }}>
                {c.prefix || ''}{Number(c.value || 0).toLocaleString()}{c.suffix || ''}
              </span>
              <span style={{ fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#777', fontWeight: 500, marginTop: '0.3rem', display: 'block' }}>
                {c.label || 'Etiqueta'}
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default CountersModule;


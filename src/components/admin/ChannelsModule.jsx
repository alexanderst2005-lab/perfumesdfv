import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Save, CheckCircle, Share2, MessageCircle, Shuffle, Smartphone, AlertCircle, Mail } from 'lucide-react';
import { notifyStoreSync } from '../../utils/img';

const InstagramIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
  </svg>
);

const ChannelsModule = () => {
  const { channels: contextChannels, setChannels, refreshChannels } = useShop();

  const [formData, setFormData] = useState({
    email: 'info@dfvperfumes.com',
    instagram: 'https://www.instagram.com/perfumesdfv',
    facebook: 'https://www.facebook.com/perfumesdfv',
    tiktok: 'https://www.tiktok.com/@perfumesdfv',
    sede1_name: 'Sede Calle 31 · Centro',
    sede1_phone: '573206970036',
    sede2_name: 'Sede C.C. Llanogrande',
    sede2_phone: '573208627036',
    floating_mode: 'random',
    floating_phone: '573027642208'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (contextChannels) {
      setFormData(prev => ({ ...prev, ...contextChannels }));
    }
  }, [contextChannels]);

  useEffect(() => {
    fetch(`/api/contact-channels?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.channels) {
          setFormData(prev => ({ ...prev, ...data.channels }));
          if (setChannels) setChannels(data.channels);
        }
      })
      .catch(err => console.error('Error cargando canales en admin:', err));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const formatExternalUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    if (!clean) return '';
    if (/^https?:\/\//i.test(clean)) return clean;
    return `https://${clean}`;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      email: (formData.email || '').trim().toLowerCase(),
      instagram: formatExternalUrl(formData.instagram),
      facebook: formatExternalUrl(formData.facebook),
      tiktok: formatExternalUrl(formData.tiktok),
      sede1_name: (formData.sede1_name || '').trim(),
      sede1_phone: (formData.sede1_phone || '').replace(/[^0-9]/g, ''),
      sede2_name: (formData.sede2_name || '').trim(),
      sede2_phone: (formData.sede2_phone || '').replace(/[^0-9]/g, ''),
      floating_phone: (formData.floating_phone || '').replace(/[^0-9]/g, '')
    };

    // Actualización optimista inmediata en contexto y localStorage
    setFormData(payload);
    if (setChannels) setChannels(payload);
    try { localStorage.setItem('dfv_channels_cache', JSON.stringify(payload)); } catch {}
    notifyStoreSync('channels', payload);

    try {
      const res = await fetch('/api/contact-channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: payload })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast('Canales de WhatsApp, Correo y Redes Sociales actualizados correctamente');
        if (data.channels) {
          setFormData(prev => ({ ...prev, ...data.channels }));
          if (setChannels) setChannels(data.channels);
          try { localStorage.setItem('dfv_channels_cache', JSON.stringify(data.channels)); } catch {}
          notifyStoreSync('channels', data.channels);
        }
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar configuración: ' + (err.message || ''), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? '#EF4444' : '#10B981',
          color: '#fff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 9999,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #ECE7DE',
        paddingBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageCircle size={24} color="#25D366" />
            WhatsApp y Redes Sociales
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0.3rem 0 0 0' }}>
            Configura las líneas de atención de ambas sedes, el botón flotante y los enlaces oficiales del footer.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

        {/* ════ BLOQUE 1: LÍNEAS DE WHATSAPP POR SEDE ════ */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} color="#B99A5B" />
                Líneas de WhatsApp por Sede
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.2rem 0 0 0' }}>
                Estas son las líneas que se mostrarán en la página web y que recibirán los pedidos.
              </p>
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: '#F0FDF4', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
              2 Sedes Activas
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Sede 1 */}
            <div style={{
              backgroundColor: '#FAF8F5',
              border: '1px solid #ECE7DE',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📍 Sede 1
                </span>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#E0E7FF', color: '#3730A3', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Principal
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.3rem' }}>
                  Nombre de la Sede
                </label>
                <input
                  type="text"
                  value={formData.sede1_name}
                  onChange={e => handleChange('sede1_name', e.target.value)}
                  placeholder="Ej: Sede Calle 31 · Centro"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.3rem' }}>
                  Número de WhatsApp (con indicativo, sin espacios ni símbolos)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.sede1_phone}
                    onChange={e => handleChange('sede1_phone', e.target.value)}
                    placeholder="Ej: 573206970036"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                  />
                </div>
                <span style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.2rem', display: 'block' }}>
                  Formato Colombia: 57 + número (ej. 573206970036)
                </span>
              </div>
            </div>

            {/* Sede 2 */}
            <div style={{
              backgroundColor: '#FAF8F5',
              border: '1px solid #ECE7DE',
              borderRadius: '8px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📍 Sede 2
                </span>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Secundaria
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.3rem' }}>
                  Nombre de la Sede
                </label>
                <input
                  type="text"
                  value={formData.sede2_name}
                  onChange={e => handleChange('sede2_name', e.target.value)}
                  placeholder="Ej: Sede C.C. Llanogrande"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.3rem' }}>
                  Número de WhatsApp (con indicativo, sin espacios ni símbolos)
                </label>
                <input
                  type="text"
                  value={formData.sede2_phone}
                  onChange={e => handleChange('sede2_phone', e.target.value)}
                  placeholder="Ej: 573208627036"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.2rem', display: 'block' }}>
                  Formato Colombia: 57 + número (ej. 573208627036)
                </span>
              </div>
            </div>
          </div>

          {/* Banner explicativo del Balanceo Aleatorio */}
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Shuffle size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#1E40AF' }}>
                Asignación y Balanceo Aleatorio de Compras (50% / 50%)
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.72rem', color: '#1E3A8A', lineHeight: '1.4' }}>
                Al pulsar <strong>«Finalizar Pedido por WhatsApp»</strong> en el Checkout o <strong>«Comprar por WhatsApp»</strong> en la página de cualquier producto, el sistema seleccionará aleatoriamente una de las 2 sedes. Así se distribuyen las ventas y la atención a clientes equitativamente sin sobrecargar una sola línea.
              </p>
            </div>
          </div>
        </div>

        {/* ════ BLOQUE 2: BOTÓN FLOTANTE DE WHATSAPP ════ */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageCircle size={18} color="#25D366" />
            Configuración del Botón Flotante de WhatsApp
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.2rem 0 1.25rem 0' }}>
            Elige qué línea atenderá a los usuarios que pulsen el botón verde flotante en la esquina de la pantalla.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1.5px solid ${formData.floating_mode === 'random' ? '#25D366' : '#E5E7EB'}`,
              backgroundColor: formData.floating_mode === 'random' ? '#F0FDF4' : '#FAFAFA',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="floating_mode"
                checked={formData.floating_mode === 'random'}
                onChange={() => handleChange('floating_mode', 'random')}
              />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                  🎲 Aleatorio (50% / 50%)
                </span>
                <span style={{ fontSize: '0.67rem', color: '#6B7280' }}>
                  Rota entre Sede 1 y Sede 2
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1.5px solid ${formData.floating_mode === 'sede1' ? '#25D366' : '#E5E7EB'}`,
              backgroundColor: formData.floating_mode === 'sede1' ? '#F0FDF4' : '#FAFAFA',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="floating_mode"
                checked={formData.floating_mode === 'sede1'}
                onChange={() => handleChange('floating_mode', 'sede1')}
              />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                  Solo Sede 1
                </span>
                <span style={{ fontSize: '0.67rem', color: '#6B7280' }}>
                  {formData.sede1_name || 'Sede 1'}
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1.5px solid ${formData.floating_mode === 'sede2' ? '#25D366' : '#E5E7EB'}`,
              backgroundColor: formData.floating_mode === 'sede2' ? '#F0FDF4' : '#FAFAFA',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="floating_mode"
                checked={formData.floating_mode === 'sede2'}
                onChange={() => handleChange('floating_mode', 'sede2')}
              />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                  Solo Sede 2
                </span>
                <span style={{ fontSize: '0.67rem', color: '#6B7280' }}>
                  {formData.sede2_name || 'Sede 2'}
                </span>
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: `1.5px solid ${formData.floating_mode === 'custom' ? '#25D366' : '#E5E7EB'}`,
              backgroundColor: formData.floating_mode === 'custom' ? '#F0FDF4' : '#FAFAFA',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="floating_mode"
                checked={formData.floating_mode === 'custom'}
                onChange={() => handleChange('floating_mode', 'custom')}
              />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827', display: 'block' }}>
                  Número personalizado
                </span>
                <span style={{ fontSize: '0.67rem', color: '#6B7280' }}>
                  Línea especial independiente
                </span>
              </div>
            </label>
          </div>

          {formData.floating_mode === 'custom' && (
            <div style={{ maxWidth: '400px', marginTop: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.3rem' }}>
                Número personalizado para el botón flotante
              </label>
              <input
                type="text"
                value={formData.floating_phone}
                onChange={e => handleChange('floating_phone', e.target.value)}
                placeholder="Ej: 573027642208"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>

        {/* ════ BLOQUE 3: CORREO Y REDES SOCIALES (FOOTER Y CONTACTO) ════ */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={18} color="#111827" />
            Correo Electrónico y Redes Sociales
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.2rem 0 1.25rem 0' }}>
            Personaliza el correo electrónico oficial y los enlaces de Instagram, Facebook y TikTok para el pie de página y la sección de contacto.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Correo Electrónico Oficial */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem',
              backgroundColor: '#FAF8F5',
              borderRadius: '8px',
              border: '1px solid #ECE7DE'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={22} color="#D97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>
                    Correo Electrónico Oficial (Email)
                  </label>
                  <span style={{ fontSize: '0.65rem', color: '#B99A5B', fontWeight: 600 }}>Visible en Footer y Contacto</span>
                </div>
                <input
                  type="text"
                  value={formData.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="info@dfvperfumes.com"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Instagram */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#FDF2F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <InstagramIcon size={20} color="#DB2777" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
                  Enlace Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={e => handleChange('instagram', e.target.value)}
                  placeholder="https://www.instagram.com/perfumesdfv"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Facebook */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FacebookIcon size={20} color="#2563EB" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
                  Enlace Facebook
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={e => handleChange('facebook', e.target.value)}
                  placeholder="https://www.facebook.com/perfumesdfv"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* TikTok */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TikTokIcon size={20} color="#111827" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
                  Enlace TikTok
                </label>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={e => handleChange('tiktok', e.target.value)}
                  placeholder="https://www.tiktok.com/@perfumesdfv"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.82rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ChannelsModule;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, X, Save, Trash2, CheckCircle, XCircle,
  Clock, Edit, ChevronDown, ChevronUp, Image as ImageIcon,
  Tag, Calendar, Zap, AlertTriangle, RefreshCw, Eye, List,
  Upload, Megaphone, Loader2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { optimizeImg } from '../../utils/img';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;

const compressImage = async (src, maxSize = 2000, quality = 0.92) => {
  try {
    const blob = await (await fetch(src)).blob();
    const probe = await createImageBitmap(blob);
    const scale = Math.min(1, maxSize / Math.max(probe.width, probe.height));
    const w = Math.round(probe.width * scale);
    const h = Math.round(probe.height * scale);
    probe.close && probe.close();
    const bmp = await createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: 'medium' });
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0);
    return canvas.toDataURL('image/jpeg', quality);
  } catch (e) {
    return src;
  }
};

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

// ─── Modal de previsualización del popup ─────────────────────────────────────

function CampaignPreviewModal({ form, selectedProducts, onClose }) {
  const [tab, setTab] = useState('popup'); // 'popup' | 'products'

  // Simula cómo se verá el popup en la tienda
  const hasImage = !!form.image;
  const hasProducts = selectedProducts.length > 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      backgroundColor: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Contenedor del modal */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px',
        width: '100%', maxWidth: '860px', maxHeight: '92vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'fadeIn 0.25s ease'
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
          @keyframes badgePop { 0%{transform:scale(0.8) rotate(-3deg);opacity:0} 70%{transform:scale(1.08) rotate(1deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes productSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Header del modal de previsualización */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #f1f2f5',
          backgroundColor: '#fafafa',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Eye size={16} color="#e11d48" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Vista previa de la campaña
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
                Así se verá tu anuncio en la tienda
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              {[
                { id: 'popup', label: '📢 Popup del anuncio' },
                { id: 'products', label: `🛍️ Productos (${selectedProducts.length})` }
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: '0.4rem 0.9rem', borderRadius: '6px', border: 'none',
                  backgroundColor: tab === t.id ? '#fff' : 'transparent',
                  color: tab === t.id ? '#111827' : '#6b7280',
                  fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: tab === t.id ? '600' : '400',
                  cursor: 'pointer',
                  boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s'
                }}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{
              width: '32px', height: '32px', borderRadius: '8px', border: 'none',
              backgroundColor: '#f3f4f6', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#6b7280',
              transition: 'background-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ overflow: 'auto', flex: 1 }}>

          {/* ── TAB: Popup del anuncio ── */}
          {tab === 'popup' && (
            <div style={{ padding: '2.5rem 1rem', backgroundColor: '#0a0a0a', minHeight: '100%' }}>
              {/* Contenedor simulador de tienda */}
              <div style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {/* Popup de lujo DFV vertical */}
                <div style={{
                  width: '100%',
                  maxWidth: '400px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '18px',
                  border: '1px solid rgba(185, 154, 91, 0.35)',
                  boxShadow: '0 25px 80px rgba(0,0,0,0.85), 0 0 40px rgba(185,154,91,0.14)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Botón cerrar flotante simulado */}
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 30,
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.22)',
                    backgroundColor: 'rgba(10,10,10,0.72)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', cursor: 'default'
                  }}>
                    ✕
                  </div>

                  {/* FOTO COMPLETA Y NÍTIDA EN LA PARTE SUPERIOR */}
                  {hasImage ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      backgroundColor: '#0a0a0a',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={form.image}
                        alt="Imagen de campaña"
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '290px',
                          objectFit: 'contain',
                          backgroundColor: '#0a0a0a',
                          display: 'block'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ paddingTop: '1.75rem', textAlign: 'center' }}>
                      <div style={{
                        width: '46px', height: '46px', margin: '0 auto', borderRadius: '50%',
                        backgroundColor: 'rgba(185, 154, 91, 0.12)',
                        border: '1px solid rgba(185, 154, 91, 0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#B99A5B', fontSize: '1.1rem'
                      }}>
                        ✦
                      </div>
                    </div>
                  )}

                  {/* CUERPO CENTRADO ELEGANTE */}
                  <div style={{
                    padding: hasImage ? '1rem 1.35rem 1.25rem' : '1rem 1.5rem 1.6rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 10,
                    borderTop: hasImage ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    {/* Badge dorado metalizado */}
                    {form.badge && (
                      <div style={{ marginBottom: '0.65rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.32rem 1rem',
                          borderRadius: '999px',
                          background: 'linear-gradient(135deg, #B99A5B 0%, #E6D39E 50%, #B99A5B 100%)',
                          color: '#0a0a0a',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.64rem',
                          fontWeight: '800',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          boxShadow: '0 3px 14px rgba(185, 154, 91, 0.4)'
                        }}>
                          ✦ {form.badge} ✦
                        </span>
                      </div>
                    )}

                    {/* Título de la campaña en Playfair Display */}
                    <h2 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: form.title ? 'clamp(1.2rem, 3vw, 1.48rem)' : '1.15rem',
                      fontWeight: '500',
                      color: form.title ? '#ffffff' : '#6b7280',
                      lineHeight: 1.22,
                      margin: '0 0 0.5rem',
                      letterSpacing: '0.2px',
                      maxWidth: '360px',
                      fontStyle: form.title ? 'normal' : 'italic'
                    }}>
                      {form.title || '(Aquí aparecerá el título del anuncio)'}
                    </h2>

                    {/* Mensaje o descripción */}
                    {(form.description || !form.title) && (
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.82rem',
                        color: form.description ? '#b4b4bc' : '#4b5563',
                        lineHeight: 1.45,
                        margin: '0 0 1rem',
                        maxWidth: '350px',
                        fontWeight: '400',
                        fontStyle: form.description ? 'normal' : 'italic'
                      }}>
                        {form.description || '(Aquí aparecerá la descripción o mensaje promocional)'}
                      </p>
                    )}

                    {/* Botón de acción principal de lujo */}
                    <div style={{
                      width: '100%',
                      padding: '0.82rem 1.25rem',
                      background: 'linear-gradient(135deg, #B99A5B 0%, #E2CE93 50%, #B99A5B 100%)',
                      color: '#0a0a0a',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      cursor: 'default',
                      boxShadow: '0 8px 24px rgba(185, 154, 91, 0.32)'
                    }}>
                      Ver ofertas exclusivas
                    </div>


                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              <div style={{
                backgroundColor: '#18181b', borderRadius: '10px',
                padding: '1rem 1.25rem', border: '1px solid #27272a',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                maxWidth: '560px', margin: '1.5rem auto 0'
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>✨</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#B99A5B', margin: '0 0 0.2rem' }}>
                    Diseño de alta perfumería DFV
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                    La foto se luce completa en la parte superior sin recortes forzados, el botón resalta en dorado y la tipografía Playfair realza la elegancia de la marca.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Productos ── */}
          {tab === 'products' && (
            <div style={{ padding: '2rem' }}>
              {selectedProducts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '4rem 2rem',
                  color: '#9ca3af', fontFamily: 'var(--font-sans)'
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Tag size={22} color="#d1d5db" />
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.4rem' }}>
                    No has seleccionado productos
                  </p>
                  <p style={{ fontSize: '0.78rem' }}>
                    Cierra esta vista previa y agrega perfumes a la campaña para verlos aquí.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem', marginBottom: '1.5rem'
                  }}>
                    {selectedProducts.map((item, i) => {
                      const ref = item.ref_price || item.refPrice;
                      const promo = ref ? Math.round(ref * (1 - item.discount_pct / 100)) : 0;
                      const imgSrc = item.product_image || item.image;
                      const optImg = imgSrc && imgSrc.includes('/image/upload/')
                        ? imgSrc.replace('/image/upload/', '/image/upload/w_300,f_auto,q_auto/')
                        : imgSrc;

                      return (
                        <div key={item.product_id} style={{
                          backgroundColor: '#fff',
                          borderRadius: '14px',
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          animation: `productSlideIn 0.3s ease ${i * 0.06}s both`
                        }}>
                          {/* Imagen del producto */}
                          <div style={{ position: 'relative', backgroundColor: '#f9fafb', height: '180px', overflow: 'hidden' }}>
                            {optImg
                              ? <img src={optImg} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <ImageIcon size={32} color="#d1d5db" />
                              </div>
                            }
                            {/* Badge de descuento */}
                            <div style={{
                              position: 'absolute', top: '10px', left: '10px',
                              backgroundColor: '#e11d48', color: '#fff',
                              padding: '0.2rem 0.6rem', borderRadius: '99px',
                              fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: '800',
                              boxShadow: '0 2px 6px rgba(225,29,72,0.4)'
                            }}>
                              -{item.discount_pct}% OFF
                            </div>
                          </div>

                          {/* Info */}
                          <div style={{ padding: '1rem' }}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: '#9ca3af', margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {item.product_brand || item.brand || 'Sin marca'}
                            </p>
                            <p style={{
                              fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: '500',
                              color: '#111827', margin: '0 0 0.65rem', lineHeight: 1.3
                            }}>
                              {item.product_name || item.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                fontFamily: 'var(--font-sans)', fontSize: '0.78rem',
                                color: '#9ca3af', textDecoration: 'line-through'
                              }}>
                                {fmt(ref)}
                              </span>
                              <span style={{
                                fontFamily: 'var(--font-sans)', fontSize: '1.05rem',
                                fontWeight: '800', color: '#059669'
                              }}>
                                {fmt(promo)}
                              </span>
                            </div>
                            <p style={{
                              fontFamily: 'var(--font-sans)', fontSize: '0.68rem',
                              color: '#6b7280', margin: '0.25rem 0 0'
                            }}>
                              Ahorrás {fmt(ref - promo)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen total */}
                  <div style={{
                    backgroundColor: '#f0fdf4', borderRadius: '12px',
                    padding: '1rem 1.25rem', border: '1px solid #bbf7d0',
                    display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: '#6b7280', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Total de productos</p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', color: '#059669', margin: 0 }}>
                        {selectedProducts.length} perfume{selectedProducts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: '#6b7280', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Descuento promedio</p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', color: '#059669', margin: 0 }}>
                        {Math.round(selectedProducts.reduce((s, p) => s + p.discount_pct, 0) / selectedProducts.length)}%
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: '#6b7280', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Ahorro máximo</p>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: '600', color: '#059669', margin: 0 }}>
                        {Math.max(...selectedProducts.map(p => p.discount_pct))}% OFF
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer del preview */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid #f1f2f5',
          backgroundColor: '#fafafa',
          display: 'flex', justifyContent: 'flex-end',
          flexShrink: 0
        }}>
          <button onClick={onClose} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none',
            backgroundColor: '#111827', color: '#fff',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: '600',
            cursor: 'pointer'
          }}>
            ← Volver al formulario
          </button>
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

// ─── Formulario de campaña (Imagen 2) ────────────────────────────────────────

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

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

  // Subida de imagen desde el dispositivo
  const handleDeviceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    // Previsualización instantánea mientras sube
    const localBlob = URL.createObjectURL(file);
    setImagePreview(localBlob);
    setIsUploadingImage(true);

    try {
      // Leer a base64
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Comprimir antes de enviar
      const compressed = await compressImage(base64Data, 2000, 0.92);

      // Subir a Cloudinary vía /api/admin/upload
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: compressed, folder: 'dfv_campaigns' })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      // Guardar la URL final en el formulario
      setField('image', data.url);
      setImagePreview(data.url);
      showToast('✓ Imagen subida con éxito');
    } catch (err) {
      console.error(err);
      showToast('Error al procesar la imagen. Intenta nuevamente.', 'error');
      setImagePreview(form.image || '');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setField('image', '');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

      const url = isEdit ? `/api/promo-campaigns?admin=true&id=${form.id}` : '/api/promo-campaigns?admin=true';
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
          showToast(data.details || data.error || 'Error al guardar', 'error');
        }
        return;
      }

      const campaignId = data.data.id;

      if (activateAfterSave) {
        const actRes = await fetch(`/api/promo-campaigns?admin=true&id=${campaignId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: campaignId, action: 'activate' })
        });
        const actData = await actRes.json();
        if (!actRes.ok) {
          showToast(actData.details || actData.error || 'Guardada pero no se pudo activar', 'warning');
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

  // ── Render Form ─────────────────────────────────────────────────────────────

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

      {/* Modal de previsualización */}
      {showPreview && (
        <CampaignPreviewModal
          form={form}
          selectedProducts={selectedProducts}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Header con botón para regresar a "Ver campañas" */}
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
          fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: '#6b7280',
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111827'; e.currentTarget.style.color = '#111827'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
        >
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

      {/* ── Sección 1: Configuración del anuncio (POPUP) ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <SectionHeader title="Configuración del anuncio" icon={Zap} sectionKey="popup" />
        {sectionOpen.popup && (
          <div style={{ padding: '1.5rem' }}>
            {field('Nombre de la campaña', 'name', 'text', 'Ej: Black Friday 2026', true)}
            {field('Título del anuncio (aparece en el popup)', 'title', 'text', 'Ej: ¡Llegaron los descuentos que estabas esperando!', true)}
            {field('Descripción o mensaje', 'description', 'textarea', 'Ej: Descubre nuestros perfumes favoritos con descuentos especiales por tiempo limitado.')}

            <div style={{ marginBottom: '1.5rem' }}>
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

            {/* Subida de Imagen desde el Dispositivo */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Imagen promocional (opcional)
              </label>

              {/* Input de archivo oculto */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleDeviceFileUpload}
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                /* Vista previa con controles */
                <div style={{
                  padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '10px',
                  backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden',
                    backgroundColor: '#e5e7eb', flexShrink: 0, position: 'relative'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isUploadingImage && (
                      <div style={{
                        position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.7rem'
                      }}>
                        <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <span style={{ marginTop: '4px' }}>Subiendo...</span>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem' }}>
                      {isUploadingImage ? 'Subiendo imagen a Cloudinary...' : '✓ Imagen cargada para el anuncio'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: '#6b7280', margin: '0 0 0.75rem' }}>
                      Se adaptará automáticamente a móviles, tablets y computadores.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.45rem 0.85rem', borderRadius: '6px', border: '1px solid #e5e7eb',
                          backgroundColor: '#fff', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        <Upload size={13} /> Cambiar imagen
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isUploadingImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.45rem 0.85rem', borderRadius: '6px', border: '1px solid #fee2e2',
                          backgroundColor: '#fff', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={13} /> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Zona interactiva para subir desde el dispositivo */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.backgroundColor = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#fafafa'; }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    backgroundColor: '#fce7f3', color: '#e11d48',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem'
                  }}>
                    <Upload size={22} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem' }}>
                    Haz clic para subir una imagen desde tu dispositivo
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    Formatos soportados: JPG, PNG, WEBP (se optimiza y aloja en Cloudinary automáticamente)
                  </p>
                </div>
              )}

              {/* Opción secundaria: URL directa */}
              <div style={{ marginTop: '0.75rem' }}>
                {!showUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    style={{
                      background: 'none', border: 'none', color: '#6b7280',
                      fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer', padding: 0
                    }}
                  >
                    O introduce una URL directa de imagen si lo prefieres
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      value={form.image}
                      onChange={e => { setField('image', e.target.value); setImagePreview(e.target.value); }}
                      placeholder="https://... URL directa de imagen"
                      style={{
                        flex: 1, padding: '0.5rem 0.85rem', borderRadius: '6px',
                        border: '1px solid #e5e7eb', fontSize: '0.8rem', fontFamily: 'var(--font-sans)', outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
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
        paddingBottom: '3rem', alignItems: 'center'
      }}>
        {/* Botón de Vista previa — destacado con borde fucsia */}
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '8px',
            border: '2px solid #e11d48', backgroundColor: '#fff',
            color: '#e11d48', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '700',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff0f3'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
        >
          <Eye size={16} /> Vista previa
        </button>

        {/* Separador visual */}
        <div style={{ width: '1px', height: '36px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isSaving || isUploadingImage}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '8px',
            border: '1px solid #e5e7eb', backgroundColor: '#fff',
            color: '#374151', cursor: (isSaving || isUploadingImage) ? 'default' : 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600',
            opacity: (isSaving || isUploadingImage) ? 0.6 : 1
          }}
        >
          <Save size={16} />
          {isEdit ? 'Guardar cambios' : 'Guardar borrador'}
        </button>

        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isSaving || isUploadingImage}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '8px',
            border: 'none', backgroundColor: '#111827',
            color: '#fff', cursor: (isSaving || isUploadingImage) ? 'default' : 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: '600',
            opacity: (isSaving || isUploadingImage) ? 0.6 : 1
          }}
        >
          <Zap size={16} />
          {isSaving ? 'Guardando...' : (isEdit ? 'Guardar y activar' : 'Crear y activar')}
        </button>
      </div>
    </div>
  );
}

// ─── Lista de campañas existentes (Imagen 1) ─────────────────────────────────

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
      {/* Encabezado elegante: "Todas las Campañas (0)" */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.45rem',
          fontWeight: '400',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.3px'
        }}>
          Todas las Campañas ({campaigns.length})
        </h1>

        {campaigns.length > 0 && (
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.4rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} /> Crear Campaña
          </button>
        )}
      </div>

      {campaigns.length === 0 ? (
        /* Estado vacío idéntico a la Imagen 1 proporcionada */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #f1f2f5',
          padding: '5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)'
        }}>
          {/* Círculo suave con icono de megáfono rosado */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#fce7f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Megaphone size={28} color="#ec4899" />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.35rem',
            fontWeight: '400',
            color: '#111827',
            margin: '0 0 0.6rem',
            letterSpacing: '-0.2px'
          }}>
            No hay campañas registradas
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.88rem',
            color: '#6b7280',
            maxWidth: '440px',
            margin: '0 auto 1.85rem',
            lineHeight: 1.55
          }}>
            Crea tu primera campaña promocional para mostrar ofertas o anuncios importantes a tus visitantes.
          </p>

          {/* Botón rosado redondeado "+ Crear Campaña" */}
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.78rem 2rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.28)',
              transition: 'transform 0.15s, opacity 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={16} /> Crear Campaña
          </button>
        </div>
      ) : (
        /* Lista de campañas cuando ya existen */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map(c => (
            <div key={c.id} style={{
              backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
              padding: '1.25rem 1.5rem',
              borderLeft: c.computed_status === 'active' ? '4px solid #059669'
                : c.computed_status === 'scheduled' ? '4px solid #d97706'
                  : '4px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: '500', color: '#111827' }}>
                      {c.name}
                    </span>
                    <StatusBadge status={c.computed_status} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                    {c.title}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Tag size={12} /> {c.product_count || 0} perfumes
                    </span>
                    {c.starts_at && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> Inicio: {new Date(c.starts_at).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    {c.ends_at && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.74rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar campaña"
          message="¿Estás seguro? Se restaurarán los precios originales de los productos en el inventario y la campaña se eliminará de forma permanente."
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

  // Inicia mostrando la pantalla de "Todas las Campañas (0)" como solicita la Imagen 1
  const [view, setView] = useState('list');
  const [campaigns, setCampaigns] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/promo-campaigns?admin=true');
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
      const res = await fetch(`/api/promo-campaigns?admin=true&id=${id}`);
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
      const res = await fetch(`/api/promo-campaigns?admin=true&id=${id}`, {
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
      const res = await fetch(`/api/promo-campaigns?admin=true&id=${id}`, {
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
      const res = await fetch('/api/promo-campaigns?admin=true', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Campaña eliminada. Inventario intacto.');
        loadCampaigns();
        if (view !== 'list') setView('list');
      } else {
        showToast(data.error || 'Error al eliminar', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleSaved = () => {
    loadCampaigns();
    setView('list');
    setEditData(null);
  };

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

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
    </div>
  );
};

export default CampaignsModule;

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Edit2, Save, CheckCircle, AlertCircle, Loader2, Clock, MapPin, DollarSign, ToggleLeft, ToggleRight, X } from 'lucide-react';

const DEFAULT_SHIPPING_ZONES = [
  {
    id: 'palmira-urbano',
    name: 'Palmira (Casco Urbano)',
    price: 6000,
    estimated_delivery: 'Mismo día o 24 horas',
    active: true,
    notes: 'Domicilio local en la ciudad de Palmira'
  },
  {
    id: 'cali-am',
    name: 'Cali, Yumbo y Jamundí',
    price: 12000,
    estimated_delivery: '24 a 48 horas hábiles',
    active: true,
    notes: 'Área metropolitana del Valle'
  },
  {
    id: 'ciudades-principales',
    name: 'Ciudades Principales (Bogotá, Medellín, Barranquilla, Eje Cafetero)',
    price: 18000,
    estimated_delivery: '2 a 4 días hábiles',
    active: true,
    notes: 'Envío asegurado con transportadora aliada'
  },
  {
    id: 'resto-pais',
    name: 'Resto del País (Otros municipios)',
    price: 22000,
    estimated_delivery: '3 a 5 días hábiles',
    active: true,
    notes: 'Cobertura nacional por transportadora'
  }
];

let cachedShippingZones = null;

const ShippingModule = () => {
  const [zones, setZones] = useState(() => cachedShippingZones || DEFAULT_SHIPPING_ZONES);
  const [isLoading, setIsLoading] = useState(!cachedShippingZones);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal para agregar / editar zona
  const [showModal, setShowModal] = useState(false);
  const [isNewZone, setIsNewZone] = useState(false);
  const [formZone, setFormZone] = useState({
    id: '',
    name: '',
    price: 0,
    estimated_delivery: '',
    active: true,
    notes: ''
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch(`/api/shipping-zones?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.zones)) {
          cachedShippingZones = data.zones;
          setZones(data.zones);
        }
      })
      .catch(err => {
        console.error('Error cargando zonas de envío:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistZones = async (updatedZones, successMessage = 'Tarifas de envío actualizadas') => {
    setIsSaving(true);
    setZones(updatedZones);
    cachedShippingZones = updatedZones;
    try {
      const res = await fetch('/api/shipping-zones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones: updatedZones })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(successMessage);
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

  const handleToggleActive = (zoneId) => {
    const updated = zones.map(z => z.id === zoneId ? { ...z, active: !z.active } : z);
    persistZones(updated, 'Estado de la zona actualizado');
  };

  const handleDeleteZone = (zoneId, zoneName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la zona "${zoneName}"?`)) return;
    const updated = zones.filter(z => z.id !== zoneId);
    persistZones(updated, 'Zona eliminada correctamente');
  };

  const openNewZoneModal = () => {
    setIsNewZone(true);
    setFormZone({
      id: 'zona_' + Date.now(),
      name: '',
      price: 15000,
      estimated_delivery: '24 a 48 horas',
      active: true,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditZoneModal = (zone) => {
    setIsNewZone(false);
    setFormZone({ ...zone });
    setShowModal(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!formZone.name.trim()) {
      alert('Por favor escribe el nombre de la ciudad o zona.');
      return;
    }
    const cleanPrice = Math.max(0, parseInt(formZone.price, 10) || 0);
    const finalZone = {
      ...formZone,
      name: formZone.name.trim(),
      price: cleanPrice,
      estimated_delivery: (formZone.estimated_delivery || '').trim(),
      notes: (formZone.notes || '').trim()
    };

    let updated;
    if (isNewZone) {
      updated = [...zones, finalZone];
    } else {
      updated = zones.map(z => z.id === finalZone.id ? finalZone : z);
    }

    setShowModal(false);
    persistZones(updated, isNewZone ? 'Nueva zona de envío agregada' : 'Zona de envío actualizada');
  };

  const activeZonesCount = zones.filter(z => z.active !== false).length;

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem auto' }} />
        <p>Cargando configuración de envíos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#dc2626' : '#059669',
          color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.88rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            LOGÍSTICA & DOMICILIOS
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111', margin: '0.2rem 0' }}>
            Configuración de Envíos
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            Administra las zonas de cobertura, tarifas de domicilio y tiempos de entrega que se calculan automáticamente al finalizar la compra.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={openNewZoneModal}
            style={{
              padding: '0.65rem 1.2rem',
              backgroundColor: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111827'}
          >
            <Plus size={16} />
            Agregar Zona
          </button>
        </div>
      </div>

      {/* Resumen de Zonas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>ZONAS ACTIVAS</span>
            <Truck size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
            {activeZonesCount} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#6b7280' }}>/ {zones.length} total</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>TARIFA LOCAL</span>
            <DollarSign size={16} color="#B99A5B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>
            ${(zones.find(z => z.id.includes('palmira') || z.name.toLowerCase().includes('palmira'))?.price || 6000).toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#6b7280' }}>COP</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>COBERTURA</span>
            <MapPin size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginTop: '0.3rem' }}>
            Nacional
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.2rem 0 0 0', fontWeight: 400 }}>Cálculo automático en checkout</p>
          </div>
        </div>
      </div>

      {/* Regla de negocio destacada */}
      <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
          <strong>Protección activa contra cobros erróneos:</strong> Si un comprador elige <em>"Otra ciudad o municipio no listado"</em> o su destino no cuenta con tarifa activa, la tienda <strong>nunca mostrará envío gratis ni inventará un precio</strong>; en su lugar le notificará que el costo exacto del flete se confirmará con un asesor por WhatsApp antes del despacho.
        </div>
      </div>

      {/* Listado de Zonas de Cobertura */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {zones.map((zone, idx) => {
          const isActive = zone.active !== false;
          return (
            <div
              key={zone.id || idx}
              style={{
                backgroundColor: '#fff',
                border: isActive ? '1px solid #e5e7eb' : '1px dashed #d1d5db',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                opacity: isActive ? 1 : 0.7,
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.02)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <MapPin size={17} color={isActive ? '#111827' : '#9ca3af'} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {zone.name}
                  </h3>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: isActive ? '#ecfdf5' : '#f3f4f6',
                    color: isActive ? '#059669' : '#6b7280',
                    border: `1px solid ${isActive ? '#a7f3d0' : '#e5e7eb'}`
                  }}>
                    {isActive ? 'Activa' : 'Pausada'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {zone.estimated_delivery && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} /> {zone.estimated_delivery}
                    </span>
                  )}
                  {zone.notes && (
                    <span style={{ color: '#9ca3af' }}>• {zone.notes}</span>
                  )}
                </div>
              </div>

              {/* Precio y Acciones */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Costo de Envío</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
                    ${(Number(zone.price) || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>COP</span>
                  </span>
                </div>

                {/* Botón Activar / Pausar */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(zone.id)}
                  title={isActive ? 'Pausar zona' : 'Activar zona'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? '#059669' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem'
                  }}
                >
                  {isActive ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
                </button>

                {/* Botón Editar */}
                <button
                  type="button"
                  onClick={() => openEditZoneModal(zone)}
                  title="Editar zona y tarifa"
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <Edit2 size={16} />
                </button>

                {/* Botón Eliminar */}
                <button
                  type="button"
                  onClick={() => handleDeleteZone(zone.id, zone.name)}
                  title="Eliminar zona"
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear / Editar Zona */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#B99A5B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  {isNewZone ? 'NUEVA ZONA DE COBERTURA' : 'MODIFICAR TARIFA'}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111', margin: '0.1rem 0 0 0' }}>
                  {isNewZone ? 'Agregar Zona de Envío' : 'Editar Zona de Envío'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ padding: '1.5rem' }}>
              
              {/* Nombre de la Ciudad / Zona */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ciudad o Zona de Cobertura *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Palmira (Casco Urbano), Cali, Bogotá..."
                  value={formZone.name}
                  onChange={e => setFormZone({ ...formZone, name: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>

              {/* Costo de Domicilio */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Costo del Domicilio (COP) *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 600 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    placeholder="6000"
                    value={formZone.price}
                    onChange={e => setFormZone({ ...formZone, price: e.target.value })}
                    style={{
                      width: '100%', padding: '0.75rem 0.9rem 0.75rem 2rem',
                      border: '1px solid #d1d5db', borderRadius: '8px',
                      fontSize: '0.95rem', fontWeight: 600, outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.3rem', display: 'block' }}>
                  Valor en pesos colombianos que se sumará automáticamente al subtotal.
                </span>
              </div>

              {/* Tiempo Estimado de Entrega */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tiempo Estimado de Entrega (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mismo día o 24 horas / 2 a 4 días hábiles"
                  value={formZone.estimated_delivery}
                  onChange={e => setFormZone({ ...formZone, estimated_delivery: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>

              {/* Notas adicionales */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Notas o Condiciones (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Domicilio local en Palmira / Envíos nacionales con guía"
                  value={formZone.notes}
                  onChange={e => setFormZone({ ...formZone, notes: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem 0.9rem',
                    border: '1px solid #d1d5db', borderRadius: '8px',
                    fontSize: '0.9rem', outline: 'none'
                  }}
                />
              </div>

              {/* Estado Activo */}
              <div style={{ marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                <input
                  type="checkbox"
                  id="zoneActiveCheck"
                  checked={formZone.active}
                  onChange={e => setFormZone({ ...formZone, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#111827', cursor: 'pointer' }}
                />
                <label htmlFor="zoneActiveCheck" style={{ fontSize: '0.85rem', color: '#111827', cursor: 'pointer', fontWeight: 500 }}>
                  Zona habilitada para compras en línea
                </label>
              </div>

              {/* Botones del Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: '#374151',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: '#fff',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isNewZone ? 'Crear Zona' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShippingModule;

import React, { useState, useEffect } from 'react';
import { Eye, Edit, CheckCircle, Package, Truck, XCircle, Clock } from 'lucide-react';

const OrdersModule = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const [shippingInfo, setShippingInfo] = useState({ carrier: '', tracking: '' });

  const handleStatusChange = (id, newStatus, carrier = null, tracking = null) => {
    const payload = { id, status: newStatus };
    if (carrier && tracking) {
      payload.shipping_carrier = carrier;
      payload.tracking_number = tracking;
    }

    fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus, shipping_carrier: carrier || o.shipping_carrier, tracking_number: tracking || o.tracking_number } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, shipping_carrier: carrier || selectedOrder.shipping_carrier, tracking_number: tracking || selectedOrder.tracking_number });
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'NUEVO': return { bg: '#dbeafe', color: '#1e40af', icon: <Clock size={14} /> };
      case 'CONFIRMADO': return { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={14} /> };
      case 'EN PREPARACIÓN': return { bg: '#fef3c7', color: '#92400e', icon: <Package size={14} /> };
      case 'ENVIADO': return { bg: '#e0e7ff', color: '#3730a3', icon: <Truck size={14} /> };
      case 'CANCELADO': return { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={14} /> };
      default: return { bg: '#f3f4f6', color: '#374151', icon: <Clock size={14} /> };
    }
  };

  const formatOrderId = (id) => `DFV-${String(id).padStart(4, '0')}`;

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShippingInfo({ carrier: order.shipping_carrier || '', tracking: order.tracking_number || '' });
  };

  const [shippingPrompt, setShippingPrompt] = useState(null);

  const handleStatusSelect = (id, newStatus) => {
    if (newStatus === 'ENVIADO') {
      const order = orders.find(o => o.id === id);
      setShippingPrompt(id);
      setShippingInfo({ carrier: order?.shipping_carrier || '', tracking: order?.tracking_number || '' });
    } else {
      handleStatusChange(id, newStatus);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Pedidos</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Pedido #</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Cliente</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Fecha</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Estado</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Total</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Cargando pedidos...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay pedidos registrados todavía.</td></tr>
            ) : orders.map(o => {
              const statusStyle = getStatusColor(o.status);
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{formatOrderId(o.id)}</td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ color: '#111827' }}>{o.customer_name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{o.customer_city}</p>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusSelect(o.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '1px solid ' + statusStyle.color,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="NUEVO">NUEVO</option>
                      <option value="EN PREPARACIÓN">EN PREPARACIÓN</option>
                      <option value="ENVIADO">ENVIADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>${o.total.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openOrderDetails(o)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal para Transportadora y Guía cuando se marca ENVIADO desde la tabla */}
      {shippingPrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#111827' }}>Información de Envío</h2>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>Para marcar el pedido como ENVIADO, por favor ingresa los datos de envío que se enviarán al cliente.</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Transportadora *</label>
              <input 
                type="text" 
                placeholder="Ej. Envía, Inter-Rapidísimo" 
                value={shippingInfo.carrier}
                onChange={(e) => setShippingInfo({ ...shippingInfo, carrier: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Número de Guía *</label>
              <input 
                type="text" 
                placeholder="Ej. 9876543210" 
                value={shippingInfo.tracking}
                onChange={(e) => setShippingInfo({ ...shippingInfo, tracking: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShippingPrompt(null)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if(!shippingInfo.carrier || !shippingInfo.tracking) {
                    alert('Por favor llena la transportadora y el número de guía');
                    return;
                  }
                  handleStatusChange(shippingPrompt, 'ENVIADO', shippingInfo.carrier, shippingInfo.tracking);
                  setShippingPrompt(null);
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#3730a3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <XCircle size={24} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              Detalles del Pedido {formatOrderId(selectedOrder.id)}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Cliente</p>
                <p style={{ fontWeight: '500' }}>{selectedOrder.customer_name}</p>
                <p style={{ fontSize: '0.9rem', color: '#374151' }}>CC: {selectedOrder.customer_cedula}</p>
                <p style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedOrder.customer_phone}</p>
                <p style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Envío y Pago</p>
                <p style={{ fontWeight: '500' }}>{selectedOrder.customer_departamento}, {selectedOrder.customer_city}</p>
                <p style={{ fontSize: '0.9rem', color: '#374151' }}>{selectedOrder.customer_address}</p>
                <p style={{ fontSize: '0.9rem', color: '#374151', marginTop: '0.5rem', fontWeight: '500' }}>Método: <span style={{ color: '#059669' }}>{selectedOrder.payment_method}</span></p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#eef2ff', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3730a3', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Información de Envío</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Transportadora (Ej. Envía, Inter-Rapidísimo)" 
                  value={shippingInfo.carrier}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, carrier: e.target.value })}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #c7d2fe', fontSize: '0.85rem' }}
                />
                <input 
                  type="text" 
                  placeholder="Número de Guía" 
                  value={shippingInfo.tracking}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, tracking: e.target.value })}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #c7d2fe', fontSize: '0.85rem' }}
                />
              </div>
              <button 
                onClick={() => handleStatusChange(selectedOrder.id, 'ENVIADO', shippingInfo.carrier, shippingInfo.tracking)}
                style={{ marginTop: '0.8rem', padding: '0.5rem 1rem', backgroundColor: '#3730a3', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}
              >
                Guardar Guía y Marcar como ENVIADO
              </button>
            </div>

            {selectedOrder.customer_notes && (
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong style={{ color: '#374151' }}>Notas del cliente:</strong> {selectedOrder.customer_notes}
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Productos ({selectedOrder.items?.length || 0})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: '#f9fafb', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.selectedSize || item.brand}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Cant: {item.quantity}</p>
                    <p style={{ fontWeight: '600' }}>${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: '600' }}>
              <span>Total Pedido:</span>
              <span>${selectedOrder.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;

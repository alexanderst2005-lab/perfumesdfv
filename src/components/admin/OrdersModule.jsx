import React, { useState, useEffect } from 'react';
import { Eye, Edit, CheckCircle, Package, Truck, XCircle, Clock, Trash2 } from 'lucide-react';

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
                    <button onClick={() => openOrderDetails(o)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '0.75rem' }}>
                      <Eye size={18} />
                    </button>
                    <button onClick={async () => {
                      if(window.confirm('¿Seguro que deseas eliminar definitivamente este pedido?')) {
                        try {
                          const res = await fetch('/api/orders', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id: o.id}) });
                          if(res.ok) window.location.reload();
                          else alert('Error al eliminar');
                        } catch(e) { alert('Error de red'); }
                      }
                    }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
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
            <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>Ingresa la transportadora y guía para el cliente. <br/><strong style={{color:'#059669'}}>Si es entrega local, puedes dejarlo en blanco.</strong></p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Transportadora (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej. Envía, Inter-Rapidísimo (Opcional)" 
                value={shippingInfo.carrier}
                onChange={(e) => setShippingInfo({ ...shippingInfo, carrier: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Número de Guía (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej. 9876543210 (Opcional)" 
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="no-scrollbar" style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '1.5rem 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>Orden</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0, color: '#111827' }}>
                  #{formatOrderId(selectedOrder.id)}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4b5563', transition: 'all 0.2s' }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              {/* Información del Cliente y Envío en Tarjetas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                
                {/* Tarjeta Cliente */}
                <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '600' }}>Información del Cliente</p>
                  <p style={{ fontWeight: '600', fontSize: '1rem', color: '#111', margin: '0 0 0.25rem 0' }}>{selectedOrder.customer_name}</p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0.2rem 0' }}>CC: {selectedOrder.customer_cedula}</p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0.2rem 0' }}>{selectedOrder.customer_phone}</p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0.2rem 0' }}>{selectedOrder.customer_email}</p>
                </div>
                
                {/* Tarjeta Envío */}
                <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: '600' }}>Detalles de Envío y Pago</p>
                  <p style={{ fontWeight: '500', fontSize: '0.9rem', color: '#111', margin: '0 0 0.25rem 0' }}>{selectedOrder.customer_departamento}, {selectedOrder.customer_city}</p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0.2rem 0' }}>{selectedOrder.customer_address}</p>
                  <div style={{ marginTop: '0.75rem', display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#065f46', margin: 0, fontWeight: '600' }}>{selectedOrder.payment_method}</p>
                  </div>
                </div>

              </div>

              {selectedOrder.customer_notes && (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px' }}>
                  <p style={{ fontSize: '0.7rem', color: '#b45309', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: '600', margin: 0 }}>Notas del cliente</p>
                  <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0 }}>{selectedOrder.customer_notes}</p>
                </div>
              )}

              {/* Transportadora */}
              <div style={{ marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#111', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Logística de Envío</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1rem 0' }}>Si gestionas un envío nacional, ingresa la guía.</p>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Empresa (Ej. Envía)" 
                    value={shippingInfo.carrier}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, carrier: e.target.value })}
                    style={{ flex: 1, minWidth: '150px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Número de Guía" 
                    value={shippingInfo.tracking}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, tracking: e.target.value })}
                    style={{ flex: 1, minWidth: '150px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button 
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, 'ENVIADO', shippingInfo.carrier, shippingInfo.tracking);
                      setSelectedOrder(null);
                    }}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#333'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#000'}
                  >
                    Marcar como ENVIADO
                  </button>
                </div>
              </div>

              {/* Lista de Productos */}
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Productos Comprados ({selectedOrder.items?.length || 0})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#111', margin: '0 0 0.2rem 0' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{item.selectedSize || item.brand}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.2rem 0' }}>Cant: {item.quantity}</p>
                        <p style={{ fontWeight: '600', fontSize: '1rem', color: '#111', margin: 0 }}>${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Footer / Total */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem 2rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Pagado</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111' }}>${selectedOrder.total?.toLocaleString()}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;

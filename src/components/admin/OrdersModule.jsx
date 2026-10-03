import React, { useState, useEffect } from 'react';
import { Eye, Edit, CheckCircle, Package, Truck, XCircle, Clock } from 'lucide-react';

const OrdersModule = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We will fetch real orders once the API is ready, for now we show empty state or mock
    setIsLoading(false);
  }, []);

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
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{o.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ color: '#111827' }}>{o.customer_name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{o.customer_city}</p>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: statusStyle.bg, color: statusStyle.color, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {statusStyle.icon} {o.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>${o.total.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersModule;

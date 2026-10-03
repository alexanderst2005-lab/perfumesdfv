import React, { useState } from 'react';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';

const CustomersModule = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setCustomers([
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', phone: '3001234567', total_spent: 145000, orders_count: 2 },
      { id: 2, name: 'María Gómez', email: 'maria@example.com', phone: '3109876543', total_spent: 210000, orders_count: 1 }
    ]);
    setIsLoading(false);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Base de Clientes</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Cliente</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Contacto</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Pedidos Totales</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Total Gastado</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando clientes...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay clientes registrados.</td></tr>
            ) : customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{c.name}</td>
                <td style={{ padding: '1rem', color: '#6b7280' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Mail size={14} /> {c.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} /> {c.phone}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{c.orders_count}</td>
                <td style={{ padding: '1rem', fontWeight: '600', color: '#10b981' }}>${c.total_spent.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>
                    <Edit size={18} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersModule;

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Edit, Trash2 } from 'lucide-react';

const CustomersModule = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando clientes de la base de datos...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No hay clientes registrados por compras.</td></tr>
            ) : customers.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
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
                <td style={{ padding: '1rem', fontWeight: '600', color: '#10b981' }}>${Number(c.total_spent).toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={async () => {
                    if(window.confirm('¿Seguro que deseas eliminar a este cliente? Esto borrará su historial de pedidos.')) {
                      try {
                        const res = await fetch('/api/customers', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: c.email })
                        });
                        if (res.ok) fetchCustomers();
                        else alert('Error al eliminar');
                      } catch (e) {
                        alert('Error de red');
                      }
                    }
                  }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
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

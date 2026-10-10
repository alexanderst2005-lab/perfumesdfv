import React, { useState } from 'react';
import { Mail, Phone, Edit, Trash2, Plus, XCircle } from 'lucide-react';

const CustomersModule = () => {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Andrés López', email: 'andres@example.com', phone: '3001234567', orders_count: 3, total_spent: 450000 },
    { id: 2, name: 'María Gómez', email: 'maria@example.com', phone: '3109876543', orders_count: 1, total_spent: 120000 }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCus, setCurrentCus] = useState({ id: null, name: '', email: '', phone: '' });

  const handleSave = () => {
    if (!currentCus.name || !currentCus.email) return alert('Llena nombre y correo');
    if (currentCus.id) {
      setCustomers(customers.map(c => c.id === currentCus.id ? { ...c, name: currentCus.name, email: currentCus.email, phone: currentCus.phone } : c));
    } else {
      setCustomers([...customers, { id: Date.now(), name: currentCus.name, email: currentCus.email, phone: currentCus.phone, orders_count: 0, total_spent: 0 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Base de Clientes</h1>
        <button onClick={() => { setCurrentCus({id: null, name: '', email: '', phone: ''}); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          <Plus size={16} /> Agregar Cliente
        </button>
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
            {customers.length === 0 ? (
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
                  <button onClick={() => { setCurrentCus(c); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => {
                    if(window.confirm('¿Seguro que deseas eliminar a este cliente?')) {
                      setCustomers(customers.filter(x => x.id !== c.id));
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

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <XCircle size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>{currentCus.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Nombre Completo</label>
              <input 
                type="text" 
                value={currentCus.name}
                onChange={(e) => setCurrentCus({ ...currentCus, name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <input 
                type="email" 
                value={currentCus.email}
                onChange={(e) => setCurrentCus({ ...currentCus, email: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Teléfono</label>
              <input 
                type="tel" 
                value={currentCus.phone}
                onChange={(e) => setCurrentCus({ ...currentCus, phone: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>

            <button onClick={handleSave} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersModule;

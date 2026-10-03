import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

const StoresModule = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Aquí se cargarán las sedes desde la base de datos
    setStores([]);
    setIsLoading(false);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Sedes Físicas</h1>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} />
          Añadir Sede
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          <p>Cargando sedes...</p>
        ) : stores.map(store => (
          <div key={store.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="#3b82f6" /> {store.name}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Dirección:</strong> {store.address}</p>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}><strong>Teléfono:</strong> {store.phone}</p>
            
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                <Edit size={16} /> Editar
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoresModule;

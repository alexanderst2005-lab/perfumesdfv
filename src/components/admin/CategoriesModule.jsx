import React from 'react';
import { Tags, Plus, Edit, Trash2 } from 'lucide-react';

const CategoriesModule = () => {
  const categories = [
    { id: 1, name: 'Hombre', slug: 'hombre', count: 45 },
    { id: 2, name: 'Mujer', slug: 'mujer', count: 52 },
    { id: 3, name: 'Unisex', slug: 'unisex', count: 12 },
    { id: 4, name: 'Nichos', slug: 'nichos', count: 8 },
  ];

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Categorías</h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          <Plus size={16} /> Agregar Categoría
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>Nombre</th>
            <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>URL (Slug)</th>
            <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>Productos</th>
            <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600', textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tags size={16} color="#9ca3af" /> {c.name}
                </div>
              </td>
              <td style={{ padding: '1rem', color: '#6b7280' }}>/{c.slug}</td>
              <td style={{ padding: '1rem', color: '#6b7280' }}>{c.count}</td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}><Edit size={16}/></button>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesModule;

import React, { useState } from 'react';
import { Tags, Plus, Edit, Trash2, XCircle } from 'lucide-react';

const CategoriesModule = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Hombre', slug: 'hombre', count: 45 },
    { id: 2, name: 'Mujer', slug: 'mujer', count: 52 },
    { id: 3, name: 'Unisex', slug: 'unisex', count: 12 },
    { id: 4, name: 'Nichos', slug: 'nichos', count: 8 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState({ id: null, name: '', slug: '' });

  const handleSave = () => {
    if (!currentCat.name) return alert('Por favor, ingresa el nombre de la categoría');
    
    // Auto-generate slug from name
    const generatedSlug = currentCat.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    if (currentCat.id) {
      setCategories(categories.map(c => c.id === currentCat.id ? { ...c, name: currentCat.name, slug: generatedSlug } : c));
    } else {
      setCategories([...categories, { id: Date.now(), name: currentCat.name, slug: generatedSlug, count: 0 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Categorías</h2>
        <button onClick={() => { setCurrentCat({id: null, name: '', slug: ''}); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          <Plus size={16} /> Agregar Categoría
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '1rem', color: '#4b5563', fontWeight: '600' }}>Nombre</th>
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
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <button onClick={() => { setCurrentCat(c); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}><Edit size={16}/></button>
                <button onClick={() => {
                  if(window.confirm('¿Seguro que deseas eliminar esta categoría?')) {
                    setCategories(categories.filter(x => x.id !== c.id));
                  }
                }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={16}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <XCircle size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#111827' }}>{currentCat.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Nombre</label>
              <input 
                type="text" 
                value={currentCat.name}
                onChange={(e) => setCurrentCat({ ...currentCat, name: e.target.value })}
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

export default CategoriesModule;

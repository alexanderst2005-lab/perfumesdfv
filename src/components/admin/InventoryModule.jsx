import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';

const InventoryModule = () => {
  const { products, isLoadingProducts } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Placeholder data for the form. We'll wire up the save logic soon.
  const [formData, setFormData] = useState({
    id: '', name: '', brand: '', category: 'Mujer', family: '', 
    price: '', oldPrice: '', discount: '', sizes: '["100ml"]', 
    description: '', concentration: 'Eau de Parfum', 
    stockCount: 10, inStock: true, active: true, image: ''
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      id: '', name: '', brand: '', category: 'Mujer', family: '', 
      price: '', oldPrice: '', discount: '', sizes: '["100ml"]', 
      description: '', concentration: 'Eau de Parfum', 
      stockCount: 10, inStock: true, active: true, image: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p.id);
    setFormData({
      id: p.id, name: p.name, brand: p.brand, category: p.category, family: p.family || '', 
      price: p.price, oldPrice: p.oldPrice || '', discount: p.discount || '', 
      sizes: JSON.stringify(p.sizes || []), description: p.description || '', 
      concentration: p.concentration || '', stockCount: p.stockCount || 10, 
      inStock: p.inStock, active: p.active !== false, image: p.image || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Inventario de Productos</h1>
        <button 
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} />
          Crear Producto
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Producto</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Precio</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Stock</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Estado</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingProducts ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando inventario...</td></tr>
            ) : products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <p style={{ fontWeight: '600', color: '#111827' }}>{p.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.brand} | {p.category}</p>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>${p.price.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: p.stockCount > 5 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{p.stockCount} unid.</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {p.active !== false ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <CheckCircle size={14} /> Activo
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <XCircle size={14} /> Inactivo
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => openEditModal(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>
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

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <input type="text" placeholder="ID único (ej. p-15)" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%' }} disabled={!!editingProduct} />
              <input type="text" placeholder="Nombre del perfume" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Marca" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }} />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }}>
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" placeholder="Precio ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }} />
                <input type="number" placeholder="Stock" value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                Producto Activo (Visible en la tienda)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;

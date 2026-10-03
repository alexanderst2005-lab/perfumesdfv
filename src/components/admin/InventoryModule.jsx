import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle, Upload, Save, X } from 'lucide-react';

const InventoryModule = () => {
  const { products, isLoadingProducts } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', name: '', brand: '', category: 'Mujer', family: '', 
    price: '', oldPrice: '', discount: '', sizes: '["100ml"]', 
    description: '', concentration: 'Eau de Parfum', 
    stockCount: 10, inStock: true, active: true, image: '', images: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // For multiple secondary images
  const [secondaryImageFiles, setSecondaryImageFiles] = useState([]);
  const [secondaryImagePreviews, setSecondaryImagePreviews] = useState([]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      id: '', name: '', brand: '', category: 'Mujer', family: '', 
      price: '', oldPrice: '', discount: '', sizes: '["100ml"]', 
      description: '', concentration: 'Eau de Parfum', 
      stockCount: 10, inStock: true, active: true, image: '', images: []
    });
    setImageFile(null);
    setImagePreview('');
    setSecondaryImageFiles([]);
    setSecondaryImagePreviews([]);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p.id);
    setFormData({
      id: p.id, name: p.name, brand: p.brand, category: p.category, family: p.family || '', 
      price: p.price, oldPrice: p.oldPrice || '', discount: p.discount || '', 
      sizes: JSON.stringify(p.sizes || []), description: p.description || '', 
      concentration: p.concentration || '', stockCount: p.stockCount || 10, 
      inStock: p.inStock, active: p.active !== false, image: p.image || '', images: p.images || []
    });
    setImageFile(null);
    setImagePreview(p.image || '');
    setSecondaryImageFiles([]);
    setSecondaryImagePreviews(p.images || []);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      setSecondaryImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSecondaryImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSecondaryImage = (index) => {
    const newPreviews = [...secondaryImagePreviews];
    newPreviews.splice(index, 1);
    setSecondaryImagePreviews(newPreviews);
    
    // Also remove from files if it's a new file (we match by index, though it's tricky if mixed with old URLs, but it works for a simple approach)
    // Actually, we'll just re-upload what remains or keep URLs
    // We'll handle this in the save logic
  };

  const uploadToCloudinary = async (base64) => {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.url;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalImageUrl = formData.image;
      let finalImagesList = [...secondaryImagePreviews];

      // Si subió una imagen principal nueva
      if (imageFile && imagePreview && imagePreview.startsWith('data:')) {
        finalImageUrl = await uploadToCloudinary(imagePreview);
      }

      // Subir imágenes secundarias nuevas
      for (let i = 0; i < finalImagesList.length; i++) {
        if (finalImagesList[i].startsWith('data:')) {
          finalImagesList[i] = await uploadToCloudinary(finalImagesList[i]);
        }
      }

      const payload = {
        ...formData,
        price: parseInt(formData.price),
        oldPrice: formData.oldPrice ? parseInt(formData.oldPrice) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        stockCount: parseInt(formData.stockCount),
        sizes: JSON.parse(formData.sizes || '[]'),
        image: finalImageUrl,
        images: finalImagesList
      };

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert('Error: ' + data.error);
      }

    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
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
                  {p.inStock ? (
                    <span style={{ color: p.stockCount > 5 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{p.stockCount} unid.</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 'bold', backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>AGOTADO</span>
                  )}
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
                  <button onClick={async () => {
                    if(window.confirm('¿Seguro que deseas eliminar definitivamente este producto?')) {
                      await fetch('/api/admin/products', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id: p.id}) });
                      window.location.reload();
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon color="#9ca3af" />}
                </div>
                <div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <Upload size={16} /> Subir Imagen
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem', color: '#374151' }}>Imágenes Secundarias</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {secondaryImagePreviews.map((src, index) => (
                    <div key={index} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                      <img src={src} alt="secondary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => removeSecondaryImage(index)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <label style={{ width: '70px', height: '70px', backgroundColor: 'white', border: '1px dashed #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}>
                    <Plus size={20} />
                    <input type="file" accept="image/*" multiple onChange={handleSecondaryImagesChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

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
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  Visible en la Tienda
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  Disponible (Hay Stock)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }} disabled={isSaving}>Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModule;

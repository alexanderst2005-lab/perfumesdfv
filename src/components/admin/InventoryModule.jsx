import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle, Upload, Save, X } from 'lucide-react';

const InventoryModule = () => {
  const { allProducts: products, refreshProducts, categories, isLoadingProducts } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', name: '', brand: '', category: '', categoryId: null, family: '', 
    price: '', oldPrice: '', discount: '', sizesText: '', 
    description: '', occasion: '', concentration: '', 
    stockCount: 10, inStock: true, active: true, image: '', images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const openCreateModal = () => {
    setEditingProduct(null);
    const defaultCat = categories.length > 0 ? categories[0] : null;
    setFormData({
      id: '', name: '', brand: '', 
      category: defaultCat ? defaultCat.name : '', 
      categoryId: defaultCat ? defaultCat.id : null,
      family: '', 
      price: '', oldPrice: '', discount: '', sizesText: '', 
      description: '', occasion: '', concentration: '', 
      stockCount: 10, inStock: true, active: true, image: '', images: []
    });
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p.id);
    let existingSizes = '';
    if (Array.isArray(p.sizes)) {
      existingSizes = p.sizes.filter(Boolean).join(', ');
    } else if (typeof p.sizes === 'string') {
      try {
        const parsed = JSON.parse(p.sizes);
        if (Array.isArray(parsed)) existingSizes = parsed.filter(Boolean).join(', ');
        else existingSizes = p.sizes;
      } catch (e) {
        existingSizes = p.sizes;
      }
    }
    // Helper to find category by id or name or legacy name (e.g. Mujer -> Femenino, Hombre -> Masculino)
    let matchedCat = null;
    if (p.categoryId) {
      matchedCat = categories.find(c => c.id === p.categoryId);
    }
    if (!matchedCat && p.category) {
      const pCatLower = String(p.category).trim().toLowerCase();
      matchedCat = categories.find(c => c.name.trim().toLowerCase() === pCatLower);
      if (!matchedCat) {
        if (pCatLower.includes('muj') || pCatLower.includes('fem') || pCatLower.includes('dama')) {
          matchedCat = categories.find(c => c.name.toLowerCase().includes('fem') || c.name.toLowerCase().includes('muj'));
        } else if (pCatLower.includes('homb') || pCatLower.includes('masc') || pCatLower.includes('caba')) {
          matchedCat = categories.find(c => c.name.toLowerCase().includes('masc') || c.name.toLowerCase().includes('homb'));
        } else if (pCatLower.includes('uni')) {
          matchedCat = categories.find(c => c.name.toLowerCase().includes('uni'));
        }
      }
    }

    setFormData({
      id: p.id, 
      name: p.name, 
      brand: p.brand, 
      category: matchedCat ? matchedCat.name : (p.category || ''), 
      categoryId: matchedCat ? matchedCat.id : (p.categoryId || null),
      family: p.family || '', 
      price: p.price, oldPrice: p.oldPrice || '', discount: p.discount || '', 
      sizesText: existingSizes, 
      description: p.description || '', 
      occasion: p.occasion || '',
      concentration: p.concentration || '', stockCount: p.stockCount || 10, 
      inStock: p.inStock, active: p.active !== false, image: p.image || '', images: p.images || [],
      notes: p.notes || {}, isNew: !!p.isNew, isBestSeller: !!p.isBestSeller
    });
    const rawExisting = [];
    if (p.image && typeof p.image === 'string' && p.image.trim()) {
      rawExisting.push(p.image.trim());
    }
    let secondary = [];
    if (Array.isArray(p.images)) {
      secondary = p.images;
    } else if (typeof p.images === 'string') {
      try {
        const parsed = JSON.parse(p.images);
        if (Array.isArray(parsed)) secondary = parsed;
        else if (typeof parsed === 'string' && parsed.trim()) secondary = [parsed.trim()];
      } catch (e) {
        if (p.images.trim()) secondary = [p.images.trim()];
      }
    }
    secondary.forEach(img => {
      if (img && typeof img === 'string' && img.trim()) {
        rawExisting.push(img.trim());
      }
    });
    const existingImages = Array.from(new Set(rawExisting));
    setImagePreviews(existingImages);
    setIsModalOpen(true);
  };

  const setAsPrimary = (index) => {
    if (index === 0) return;
    setImagePreviews(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const compressImage = (dataUrl, maxSize = 1600, quality = 0.85) => new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  const uploadToCloudinary = async (base64) => {
    const compressed = await compressImage(base64);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: compressed })
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* non-JSON response */ }
    if (!data.success) throw new Error(data.details || data.error || `Error ${res.status}`);
    return data.url;
  };

  const handleSave = async () => {
    // Resolve valid category
    const matchedCat = (formData.categoryId && categories.find(c => c.id === formData.categoryId)) ||
                       (formData.category && categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase())) ||
                       (categories.length > 0 ? categories[0] : null);

    if (!matchedCat && !formData.category) {
      alert('Selecciona una categoría');
      return;
    }

    const finalCategoryName = matchedCat ? matchedCat.name : formData.category;
    const finalCategoryId = matchedCat ? matchedCat.id : (formData.categoryId || null);

    if (!formData.name?.trim() || !formData.brand?.trim()) {
      alert('El nombre y la casa son obligatorios');
      return;
    }
    if (!finalCategoryName) {
      alert('Selecciona una categoría');
      return;
    }
    if (!formData.price || isNaN(parseInt(formData.price))) {
      alert('Ingresa un precio válido');
      return;
    }
    setIsSaving(true);
    try {
      let finalImagesList = Array.from(new Set(imagePreviews.filter(Boolean)));

      // Subir imágenes nuevas
      for (let i = 0; i < finalImagesList.length; i++) {
        if (finalImagesList[i].startsWith('data:')) {
          finalImagesList[i] = await uploadToCloudinary(finalImagesList[i]);
        }
      }

      finalImagesList = Array.from(new Set(finalImagesList.filter(Boolean)));

      const finalImageUrl = finalImagesList.length > 0 ? finalImagesList[0] : '';
      const secondaryImages = finalImagesList.length > 1 ? finalImagesList.slice(1).filter(img => img !== finalImageUrl) : [];

      let finalPrice = parseInt(formData.price);
      let finalOldPrice = formData.oldPrice ? parseInt(formData.oldPrice) : null;
      let finalDiscount = null;

      if (finalOldPrice && finalOldPrice > finalPrice) {
        finalDiscount = Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100);
      }

      let parsedSizes = [];
      if (formData.sizesText && formData.sizesText.trim()) {
        parsedSizes = formData.sizesText.split(',').map(s => s.trim()).filter(Boolean);
      }

      const payload = {
        ...formData,
        categoryId: finalCategoryId,
        category: finalCategoryName,
        price: finalPrice,
        oldPrice: finalOldPrice,
        discount: finalDiscount,
        stockCount: formData.stockCount || 10,
        notes: formData.notes || {},
        isNew: !!formData.isNew,
        isBestSeller: !!formData.isBestSeller,
        sizes: parsedSizes,
        image: finalImageUrl,
        images: secondaryImages
      };

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      try { data = await res.json(); } catch (e) { /* non-JSON response */ }
      if (res.ok && data.success) {
        await refreshProducts();
        setIsModalOpen(false);
      } else {
        alert('Error: ' + (data.details || data.error || `HTTP ${res.status}`));
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
                  <select 
                    value={p.inStock ? 'true' : 'false'}
                    onChange={async (e) => {
                      const newInStock = e.target.value === 'true';
                      try {
                        const updatedProduct = { ...p, inStock: newInStock };
                        const res = await fetch('/api/admin/products', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatedProduct)
                        });
                        if (res.ok) await refreshProducts();
                        else alert('Error al actualizar el estado');
                      } catch(err) { alert('Error de red'); }
                    }}
                    style={{ 
                      padding: '0.3rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      backgroundColor: p.inStock ? '#d1fae5' : '#fee2e2',
                      color: p.inStock ? '#059669' : '#dc2626'
                    }}
                  >
                    <option value="true">DISPONIBLE</option>
                    <option value="false">AGOTADO</option>
                  </select>
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
                      try {
                        const res = await fetch('/api/admin/products', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id: p.id}) });
                        if(res.ok) await refreshProducts();
                        else alert('Error al eliminar');
                      } catch(e) { alert('Error de red'); }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} color="#6b7280" />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Imágenes del Producto</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>La primera imagen será la principal</p>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <Upload size={16} /> Subir Imágenes
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} style={{ display: 'none' }} />
                  </label>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {imagePreviews.length === 0 && (
                    <div style={{ width: '100%', padding: '2rem', textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', color: '#9ca3af' }}>
                      <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                      <p>No hay imágenes subidas</p>
                    </div>
                  )}
                  {imagePreviews.map((src, index) => (
                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: index === 0 ? '2px solid #3b82f6' : '1px solid #d1d5db' }}>
                      <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {index === 0 ? (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#3b82f6', color: 'white', fontSize: '0.65rem', textAlign: 'center', padding: '2px 0', fontWeight: '600' }}>
                          Principal
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAsPrimary(index)}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(17, 24, 39, 0.85)',
                            color: 'white',
                            fontSize: '0.6rem',
                            textAlign: 'center',
                            padding: '3px 0',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Hacer Principal
                        </button>
                      )}
                      <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Nombre del Perfume
                </label>
                <input type="text" placeholder="Ej: Khamrah, Club de Nuit..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Casa
                  </label>
                  <input type="text" placeholder="Ej: Lattafa, Armaf, Dior..." value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Categoría
                  </label>
                  <select 
                    value={
                      formData.categoryId || 
                      categories.find(c => c.name.toLowerCase() === formData.category?.toLowerCase())?.id || 
                      ''
                    } 
                    onChange={e => {
                      const selectedId = parseInt(e.target.value, 10);
                      const catObj = categories.find(c => c.id === selectedId);
                      setFormData({
                        ...formData, 
                        categoryId: selectedId || null,
                        category: catObj ? catObj.name : ''
                      });
                    }} 
                    style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Precio Actual ($)
                  </label>
                  <input type="number" placeholder="Ej: 185000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Precio Anterior ($ Tachado - Opcional)
                  </label>
                  <input type="number" placeholder="Ej: 220000" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} title="Opcional. Si lo llenas, saldrá como precio tachado." />
                </div>
              </div>

              {/* Presentación / Mililitros (Opcional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Presentación / Mililitros (Opcional - Ej: 100 ml)
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: 100 ml (dejar vacío si no aplica)" 
                  value={formData.sizesText} 
                  onChange={e => setFormData({...formData, sizesText: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} 
                />
                <span style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem', display: 'block' }}>
                  Opcional. Si no se llena, no aparecerá el apartado de presentación en la página del producto. Para varios tamaños, sepáralos por comas (ej: 50 ml, 100 ml).
                </span>
              </div>

              {/* Ocasión de Uso */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Ocasión de Uso (Ej: Noche, Citas especiales, Diario, Oficina, Eventos de gala)
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Citas románticas, Eventos nocturnos, Uso diario..." 
                  value={formData.occasion} 
                  onChange={e => setFormData({...formData, occasion: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} 
                />
              </div>

              {/* Descripción Detallada */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                  Descripción del Perfume
                </label>
                <textarea 
                  rows={3}
                  placeholder="Escribe la historia o descripción de las notas, proyección y sensaciones de la fragancia..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
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

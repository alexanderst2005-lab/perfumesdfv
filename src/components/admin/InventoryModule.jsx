import React, { useState, useRef, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle, Upload, Save, X, Search } from 'lucide-react';
import { optimizeImg, uploadAdminImage } from '../../utils/img';

const InventoryModule = () => {
  const { allProducts: products, upsertProductLocal, removeProductLocal, refreshProducts, categories, isLoadingProducts } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'visible' | 'out' | 'wanted'

  const [formData, setFormData] = useState({
    id: '', name: '', brand: '', category: '', categoryId: null, family: '',
    price: '', oldPrice: '', discount: '', sizesText: '',
    description: '', occasion: '', concentration: '',
    stockCount: 10, inStock: true, active: true, image: '', images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [uploadedKeys, setUploadedKeys] = useState({});
  // Subidas en curso/terminadas por preview (blob:/data:) para no esperar al pulsar Guardar
  const uploadsRef = useRef(new Map());

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      id: '', name: '', brand: '',
      category: '',
      categoryId: null,
      family: '',
      price: '', oldPrice: '', discount: '', sizesText: '',
      description: '', occasion: '', concentration: '',
      stockCount: 10, inStock: true, active: true, image: '', images: [],
      isMostWanted: false
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
      notes: p.notes || {}, isNew: !!p.isNew, isBestSeller: !!p.isBestSeller,
      isMostWanted: !!p.isMostWanted
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
      // Preview instantáneo en 0ms y subida inmediata en segundo plano
      const url = URL.createObjectURL(file);
      setImagePreviews(prev => [...prev, url]);
      if (window.createImageBitmap) {
        createImageBitmap(file, { resizeWidth: 240, resizeQuality: 'low' }).then(bmp => {
          const c = document.createElement('canvas');
          c.width = bmp.width; c.height = bmp.height;
          c.getContext('2d').drawImage(bmp, 0, 0);
          if (bmp.close) bmp.close();
          setThumbs(prev => ({ ...prev, [url]: c.toDataURL('image/webp', 0.75) }));
        }).catch(() => { });
      }
      const p = uploadAdminImage(file, 2000, 0.92);
      p.then(() => setUploadedKeys(prev => ({ ...prev, [url]: true }))).catch(() => { });
      uploadsRef.current.set(url, p);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (statusFilter === 'visible') list = list.filter(p => p.active !== false);
    else if (statusFilter === 'out') list = list.filter(p => !p.inStock);
    else if (statusFilter === 'wanted') list = list.filter(p => p.isMostWanted);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, searchQuery, statusFilter]);

  const handleSave = async () => {
    // Resolve valid category
    const matchedCat = (formData.categoryId && categories.find(c => c.id === formData.categoryId)) ||
      (formData.category && categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase())) ||
      null;

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

      // Las imágenes nuevas ya se están subiendo desde que se eligieron; solo esperamos el resultado
      finalImagesList = await Promise.all(
        finalImagesList.map(async (img) => {
          if (img && (img.startsWith('blob:') || img.startsWith('data:'))) {
            const pending = uploadsRef.current.get(img);
            if (pending) {
              try { return await pending; } catch (e) { /* reintentar abajo */ }
            }
            return await uploadAdminImage(img, 2000, 0.92);
          }
          return img;
        })
      );
      uploadsRef.current.clear();

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
        id: editingProduct || formData.id || `p-${Date.now()}`,
        categoryId: finalCategoryId,
        category: finalCategoryName,
        price: finalPrice,
        oldPrice: finalOldPrice,
        discount: finalDiscount,
        stockCount: formData.stockCount || 10,
        notes: formData.notes || {},
        isNew: !!formData.isNew,
        isBestSeller: !!formData.isBestSeller,
        isMostWanted: !!formData.isMostWanted,
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
        // Actualización instantánea en memoria sin esperar recarga de red
        upsertProductLocal(payload);
        setIsModalOpen(false);
        refreshProducts().catch(() => { });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827', margin: 0 }}>Inventario de Productos</h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{ padding: '0.3rem 0.85rem', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'all' ? '#111827' : '#e5e7eb', color: statusFilter === 'all' ? '#fff' : '#374151', fontSize: '0.78rem', fontWeight: '600' }}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('visible')}
              style={{ padding: '0.3rem 0.85rem', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'visible' ? '#065f46' : '#d1fae5', color: statusFilter === 'visible' ? '#fff' : '#065f46', fontSize: '0.78rem', fontWeight: '600' }}
            >
              {products.filter(p => p.active !== false).length} visibles
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('out')}
              style={{ padding: '0.3rem 0.85rem', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'out' ? '#991b1b' : '#fee2e2', color: statusFilter === 'out' ? '#fff' : '#991b1b', fontSize: '0.78rem', fontWeight: '600' }}
            >
              {products.filter(p => !p.inStock).length} agotados
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('wanted')}
              style={{ padding: '0.3rem 0.85rem', borderRadius: '999px', border: 'none', cursor: 'pointer', backgroundColor: statusFilter === 'wanted' ? '#92400e' : '#fef3c7', color: statusFilter === 'wanted' ? '#fff' : '#92400e', fontSize: '0.78rem', fontWeight: '600' }}
            >
              ★ {products.filter(p => p.isMostWanted).length} Más Deseados
            </button>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} />
          Crear Producto
        </button>
      </div>

      {/* Buscador instantáneo */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={17} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar perfume por nombre, casa o categoría..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.6rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '0.88rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
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
            {isLoadingProducts && products.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Cargando inventario...</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={optimizeImg(p.image, 120)} alt={p.name} loading="lazy" decoding="async" width="40" height="40" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#f9fafb' }} />
                  <div>
                    <p style={{ fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {p.name}
                      {p.isMostWanted && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          ★ MÁS DESEADO
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.brand} | {p.category}</p>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>${Number(p.price || 0).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <select
                    value={p.inStock ? 'true' : 'false'}
                    onChange={async (e) => {
                      const newInStock = e.target.value === 'true';
                      const updatedProduct = { ...p, inStock: newInStock };
                      upsertProductLocal(updatedProduct);
                      try {
                        const res = await fetch('/api/admin/products', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatedProduct)
                        });
                        if (!res.ok) {
                          upsertProductLocal(p);
                          alert('Error al actualizar el estado');
                        }
                      } catch (err) {
                        upsertProductLocal(p);
                        alert('Error de red');
                      }
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
                    if (window.confirm('¿Seguro que deseas eliminar definitivamente este producto?')) {
                      removeProductLocal(p.id);
                      try {
                        const res = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) });
                        if (!res.ok) {
                          upsertProductLocal(p);
                          alert('Error al eliminar');
                        }
                      } catch (e) {
                        upsertProductLocal(p);
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
                      <img src={thumbs[src] || optimizeImg(src, 200)} alt="preview" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {src.startsWith('blob:') && !uploadedKeys[src] && (
                        <div style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px' }}>Subiendo…</div>
                      )}
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
                <input type="text" placeholder="Ej: Khamrah, Club de Nuit..." value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Casa
                  </label>
                  <input type="text" placeholder="Ej: Lattafa, Armaf, Dior..." value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
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
                  <input type="number" placeholder="Ej: 185000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#374151', marginBottom: '0.3rem' }}>
                    Precio Anterior ($ Tachado - Opcional)
                  </label>
                  <input type="number" placeholder="Ej: 220000" value={formData.oldPrice} onChange={e => setFormData({ ...formData, oldPrice: e.target.value })} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }} title="Opcional. Si lo llenas, saldrá como precio tachado." />
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
                  onChange={e => setFormData({ ...formData, sizesText: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, occasion: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  Visible en la Tienda
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({ ...formData, inStock: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  Disponible (Hay Stock)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', color: '#B99A5B' }}>
                  <input type="checkbox" checked={!!formData.isMostWanted} onChange={e => setFormData({ ...formData, isMostWanted: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#B99A5B' }} />
                  ✦ Más deseado del mes
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

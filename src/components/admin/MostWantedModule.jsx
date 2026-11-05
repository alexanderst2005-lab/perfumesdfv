import React, { useState, useMemo } from 'react';
import { Star, Search, CheckCircle, Loader2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { optimizeImg } from '../../utils/img';

const MostWantedModule = () => {
  const { products, upsertProductLocal } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'selected'
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const selectedCount = useMemo(() => {
    return products.filter(p => p.isMostWanted).length;
  }, [products]);

  const toggleMostWanted = async (product) => {
    setLoadingId(product.id);
    const newStatus = !product.isMostWanted;

    try {
      // Optimistic update instantáneo
      upsertProductLocal({ ...product, isMostWanted: newStatus });

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isMostWanted: newStatus
        })
      });

      const data = await res.json();
      if (data && data.success) {
        showToast(
          newStatus
            ? `"${product.name}" agregado a Los Más Deseados`
            : `"${product.name}" retirado de Los Más Deseados`
        );
      } else {
        throw new Error(data.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      upsertProductLocal({ ...product, isMostWanted: !newStatus });
      showToast('Error al actualizar: ' + err.message, 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (filterMode === 'selected') {
      list = list.filter(p => p.isMostWanted);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, searchQuery, filterMode]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          backgroundColor: toast.type === 'error' ? '#dc2626' : '#059669',
          color: '#fff', padding: '0.85rem 1.4rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.85rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.6rem'
        }}>
          <CheckCircle size={18} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid #EAE8E4', paddingBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#B99A5B', fontWeight: 600 }}>
            ADMINISTRACIÓN DE PORTADA
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#111', margin: '0.3rem 0 0 0' }}>
            Los Más Deseados del Mes
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.3rem 0 0 0' }}>
            Selecciona qué perfumes del catálogo rotarán aleatoriamente en el carrusel de la página de inicio (máximo 12 a la vez).
          </p>
        </div>

        {/* Badge contador */}
        <div style={{
          backgroundColor: selectedCount > 0 ? '#FAF8F5' : '#F9F8F6',
          border: selectedCount > 0 ? '1.5px solid #B99A5B' : '1px solid #EAE8E4',
          borderRadius: '10px',
          padding: '0.65rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Star size={18} color="#B99A5B" fill={selectedCount > 0 ? '#B99A5B' : 'none'} />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', display: 'block' }}>
              {selectedCount} de 12 perfumes activos
            </span>
            <span style={{ fontSize: '0.7rem', color: '#777' }}>
              {selectedCount >= 12 ? 'Límite sugerido alcanzado' : 'Recomendado entre 8 y 12'}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              border: '1px solid #EAE8E4',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              backgroundColor: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filterMode === 'all' ? '#fff' : 'transparent',
              color: filterMode === 'all' ? '#111' : '#666',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: filterMode === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('selected')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filterMode === 'selected' ? '#fff' : 'transparent',
              color: filterMode === 'selected' ? '#111' : '#666',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: filterMode === 'selected' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Solo Seleccionados ({selectedCount})
          </button>
        </div>
      </div>

      {/* Grid de Productos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {filteredProducts.map(p => {
          const isSelected = !!p.isMostWanted;
          const isLoadingThis = loadingId === p.id;

          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                border: isSelected ? '1.5px solid #B99A5B' : '1px solid #EAE8E4',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: isSelected ? '0 4px 16px rgba(185, 154, 91, 0.15)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#B99A5B',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Star size={10} fill="#fff" /> EN CARRUSEL
                </div>
              )}

              <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', backgroundColor: '#FAF9F6', borderRadius: '6px' }}>
                <img
                  src={optimizeImg(p.image, 200)}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                {p.brand}
              </span>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#111', margin: '0.2rem 0 0.4rem 0', minHeight: '2.4em', lineHeight: 1.2 }}>
                {p.name}
              </h4>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', marginBottom: '1rem' }}>
                ${Number(p.price || 0).toLocaleString()}
              </span>

              {/* Botón de toggle */}
              <button
                onClick={() => toggleMostWanted(p)}
                disabled={isLoadingThis}
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #B99A5B' : '1px solid #111',
                  backgroundColor: isSelected ? '#111' : '#fff',
                  color: isSelected ? '#B99A5B' : '#111',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  cursor: isLoadingThis ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                {isLoadingThis ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Star size={14} fill={isSelected ? '#B99A5B' : 'none'} />
                    <span>{isSelected ? '✓ SELECCIONADO' : '+ AGREGAR AL CARRUSEL'}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MostWantedModule;


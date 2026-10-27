import React, { useState } from 'react';
import { Tags, Plus, Edit, Trash2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const CategoriesModule = () => {
  const { categories, refreshCategories } = useShop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCat, setCurrentCat] = useState({ id: null, name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setCurrentCat({ id: null, name: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setCurrentCat({ id: cat.id, name: cat.name });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const trimmed = currentCat.name?.trim();
    if (!trimmed) {
      setErrorMsg('Por favor, ingresa el nombre de la categoría');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const method = currentCat.id ? 'PUT' : 'POST';
      const payload = {
        name: trimmed,
        ...(currentCat.id ? { id: currentCat.id } : {})
      };

      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = {};
      }

      if (res.ok && data.success) {
        if (refreshCategories) {
          await refreshCategories();
        }
        setIsModalOpen(false);
        setCurrentCat({ id: null, name: '' });
      } else {
        const message = data.error || data.details || 'Error al guardar la categoría';
        setErrorMsg(message);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setErrorMsg('Error de conexión con el servidor: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`¿Seguro que deseas eliminar la categoría "${catName}"?`)) {
      setDeletingId(id);
      try {
        const res = await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          if (refreshCategories) {
            await refreshCategories();
          }
        } else {
          alert(data.error || 'Error al eliminar la categoría');
        }
      } catch (err) {
        alert('Error de conexión con el servidor');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>Categorías</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Gestiona las categorías de perfumes disponibles en tu tienda
          </p>
        </div>
        <button 
          onClick={openCreateModal} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.6rem 1.2rem', 
            backgroundColor: '#111827', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: '500', 
            cursor: 'pointer',
            fontSize: '0.88rem',
            transition: 'background-color 0.2s'
          }}
        >
          <Plus size={16} /> Agregar Categoría
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.9rem 1rem', color: '#4b5563', fontWeight: '600', fontSize: '0.85rem' }}>Nombre de Categoría</th>
              <th style={{ padding: '0.9rem 1rem', color: '#4b5563', fontWeight: '600', textAlign: 'right', fontSize: '0.85rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                  No hay categorías registradas. Haz clic en "Agregar Categoría" para crear la primera.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem', fontWeight: '500', color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Tags size={16} color="#9ca3af" />
                      <span style={{ fontSize: '0.92rem' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => openEditModal(c)} 
                      title="Editar categoría"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2563eb', 
                        cursor: 'pointer', 
                        marginRight: '0.75rem',
                        padding: '0.4rem',
                        borderRadius: '4px'
                      }}
                    >
                      <Edit size={17}/>
                    </button>
                    <button 
                      disabled={deletingId === c.id}
                      onClick={() => handleDelete(c.id, c.name)} 
                      title="Eliminar categoría"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: deletingId === c.id ? '#9ca3af' : '#dc2626', 
                        cursor: deletingId === c.id ? 'not-allowed' : 'pointer',
                        padding: '0.4rem',
                        borderRadius: '4px'
                      }}
                    >
                      {deletingId === c.id ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17}/>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <button 
              type="button"
              onClick={() => !isSaving && setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
            >
              <XCircle size={22} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', color: '#111827' }}>
              {currentCat.id ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <AlertCircle size={16} flexShrink={0} />
                <span>{errorMsg}</span>
              </div>
            )}
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Nombre de la categoría
                </label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Ej: Hombre, Mujer, Árabes, Nicho..."
                  value={currentCat.name}
                  onChange={(e) => {
                    setCurrentCat({ ...currentCat, name: e.target.value });
                    if (errorMsg) setErrorMsg('');
                  }}
                  disabled={isSaving}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.88rem' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{ 
                    flex: 1, 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem', 
                    backgroundColor: '#111827', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: isSaving ? 'not-allowed' : 'pointer', 
                    fontWeight: '500', 
                    fontSize: '0.88rem',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Guardando...' : (currentCat.id ? 'Guardar Cambios' : 'Crear Categoría')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesModule;


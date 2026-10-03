import React, { useState } from 'react';
import { Save, Upload, Image as ImageIcon } from 'lucide-react';

const SettingsModule = () => {
  const [formData, setFormData] = useState({
    brandName: 'DFV PERFUMES',
    whatsappNumber: '+573000000000',
    email: 'contacto@dfvperfumes.com',
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: 'https://tiktok.com/'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert("Configuraciones guardadas correctamente (Fase 3: Pendiente integración BD)");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Configuración General</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Save size={18} />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        
        {/* Identidad */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Identidad de Marca</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Nombre de la Tienda</label>
              <input type="text" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Logo Principal</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '100px', height: '100px', backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon color="#9ca3af" />
                  </div>
                  <button style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cambiar Logo</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto y Redes */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Contacto y Redes Sociales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>WhatsApp (Número con código de país)</label>
              <input type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Enlace de Instagram</label>
              <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}>Enlace de TikTok</label>
              <input type="text" value={formData.tiktok} onChange={e => setFormData({...formData, tiktok: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModule;

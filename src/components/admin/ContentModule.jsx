import React, { useState } from 'react';
import FaqModule from './FaqModule';
import StoresModule from './StoresModule';

const ContentModule = () => {
  const [tab, setTab] = useState('faq');

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem 3rem 3rem 3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
        <button 
          onClick={() => setTab('faq')}
          style={{ 
            background: 'none', border: 'none', borderBottom: tab === 'faq' ? '2px solid #111827' : '2px solid transparent', 
            padding: '1rem 0', fontWeight: tab === 'faq' ? '600' : '500', color: tab === 'faq' ? '#111827' : '#6b7280', 
            cursor: 'pointer', fontSize: '1rem' 
          }}
        >
          Preguntas Frecuentes
        </button>
        <button 
          onClick={() => setTab('stores')}
          style={{ 
            background: 'none', border: 'none', borderBottom: tab === 'stores' ? '2px solid #111827' : '2px solid transparent', 
            padding: '1rem 0', fontWeight: tab === 'stores' ? '600' : '500', color: tab === 'stores' ? '#111827' : '#6b7280', 
            cursor: 'pointer', fontSize: '1rem' 
          }}
        >
          Tiendas Físicas
        </button>
      </div>
      
      {tab === 'faq' && <FaqModule />}
      {tab === 'stores' && <StoresModule />}
    </div>
  );
};

export default ContentModule;

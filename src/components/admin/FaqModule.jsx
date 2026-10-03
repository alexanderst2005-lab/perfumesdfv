import React, { useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const FaqModule = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    setFaqs([
      { id: 1, question: '¿Cuánto cuesta el envío?', answer: 'El envío es gratis por compras superiores a...', active: true },
      { id: 2, question: '¿Son originales?', answer: 'Sí, 100% originales garantizados.', active: true }
    ]);
    setIsLoading(false);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#111827' }}>Preguntas Frecuentes (FAQ)</h1>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} />
          Agregar Pregunta
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Pregunta</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Respuesta</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500' }}>Estado</th>
              <th style={{ padding: '1rem', color: '#6b7280', fontWeight: '500', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Cargando preguntas...</td></tr>
            ) : faqs.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontWeight: '600', maxWidth: '300px' }}>{f.question}</td>
                <td style={{ padding: '1rem', color: '#6b7280', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.answer}</td>
                <td style={{ padding: '1rem' }}>
                  {f.active ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <CheckCircle size={14} /> Activa
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <XCircle size={14} /> Oculta
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem' }}>
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
    </div>
  );
};

export default FaqModule;

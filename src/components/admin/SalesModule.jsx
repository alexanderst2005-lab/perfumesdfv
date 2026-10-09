import React from 'react';
import { BarChart2, DollarSign, TrendingUp } from 'lucide-react';

const SalesModule = () => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Reporte de Ventas</h2>
        <button style={{ padding: '0.5rem 1rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>
          Descargar Reporte
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Ingresos Hoy</p>
          <h3 style={{ fontSize: '2rem', color: '#111827', margin: '0.5rem 0' }}>$0</h3>
          <p style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><TrendingUp size={14}/> +0%</p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Ticket Promedio</p>
          <h3 style={{ fontSize: '2rem', color: '#111827', margin: '0.5rem 0' }}>$0</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Por pedido</p>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Tasa de Conversión</p>
          <h3 style={{ fontSize: '2rem', color: '#111827', margin: '0.5rem 0' }}>0.0%</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Visitantes a compradores</p>
        </div>
      </div>

      <div style={{ height: '300px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9ca3af' }}>
        <BarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>Los gráficos de ventas se generarán cuando haya suficientes datos históricos.</p>
      </div>
    </div>
  );
};

export default SalesModule;

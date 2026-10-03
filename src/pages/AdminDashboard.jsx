import React from 'react';
import { products } from '../data/mockProducts';

const AdminDashboard = () => {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#f5f5f5', padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Panel Administrativo</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>VENTAS TOTALES</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>$4,520</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PEDIDOS</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>PRODUCTOS</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{products.length}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CLIENTES</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>18</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Gestión de la Tienda</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>GESTIONAR SEDES</button>
              <button className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>+ NUEVO PRODUCTO</button>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-gray-light)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Producto</th>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Marca</th>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Categoría</th>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Precio</th>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Stock</th>
                <th style={{ padding: '1rem', color: 'var(--color-gray)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '50px', objectFit: 'cover' }} />
                    {p.name}
                  </td>
                  <td style={{ padding: '1rem' }}>{p.brand}</td>
                  <td style={{ padding: '1rem' }}>{p.category}</td>
                  <td style={{ padding: '1rem' }}>${p.price}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: p.inStock ? 'green' : 'red', fontWeight: '500' }}>
                      {p.inStock ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ color: 'blue', marginRight: '1rem' }}>Editar</button>
                    <button style={{ color: 'red' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

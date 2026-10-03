import React from 'react';
import { useShop } from '../context/ShopContext';

const Checkout = () => {
  const { cart, cartTotal } = useShop();

  return (
    <div className="container section-padding">
      <h1 className="title-medium text-center" style={{ marginBottom: '3rem' }}>Finalizar Compra</h1>
      
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem' }}>
        {/* Formulario */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Información del Cliente</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <input type="text" placeholder="Nombre" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
            <input type="text" placeholder="Apellido" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
            <input type="email" placeholder="Correo electrónico" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2' }} />
            <input type="tel" placeholder="Teléfono" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2' }} />
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Dirección de Entrega</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <input type="text" placeholder="Departamento" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
            <input type="text" placeholder="Ciudad" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%' }} />
            <input type="text" placeholder="Barrio" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2' }} />
            <input type="text" placeholder="Dirección" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2' }} />
            <textarea placeholder="Información adicional" rows="3" style={{ padding: '1rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2' }}></textarea>
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Método de Pago</h3>
          <div style={{ padding: '2rem', border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-cream)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-gray)' }}>Pago en línea</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Los métodos de pago estarán disponibles próximamente.</p>
          </div>
        </div>

        {/* Resumen */}
        <div style={{ backgroundColor: 'var(--color-cream)', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Resumen del Pedido</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '1rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '60px', height: '80px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>{item.selectedSize} x {item.quantity}</p>
                  <p style={{ fontWeight: '500' }}>${item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>${cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span>Envío</span>
              <span>Calculado después</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>${cartTotal}</span>
            </div>
          </div>
          
          <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
            FINALIZAR PEDIDO
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;

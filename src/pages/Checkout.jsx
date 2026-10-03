import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal } = useShop();
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    notas: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    
    if (!formData.nombre || !formData.telefono || !formData.ciudad || !formData.direccion) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    let message = "Hola, quiero realizar el siguiente pedido:\n\n";

    cart.forEach(item => {
      message += `Producto: ${item.name} ${item.selectedSize ? `(${item.selectedSize})` : ''}\n`;
      message += `Marca: ${item.brand || 'DFV'}\n`;
      message += `Cantidad: ${item.quantity}\n`;
      message += `Precio: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });

    message += `*Total: $${cartTotal.toLocaleString()}*\n\n`;
    message += `Nombre: ${formData.nombre}\n`;
    message += `Teléfono: ${formData.telefono}\n`;
    if (formData.email) message += `Email: ${formData.email}\n`;
    message += `Ciudad: ${formData.ciudad}\n`;
    message += `Dirección: ${formData.direccion}\n`;
    if (formData.notas) message += `Notas: ${formData.notas}\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "573000000000"; // Reemplazar con el número real
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="container section-padding" style={{ textAlign: 'center', paddingTop: '150px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Tu carrito está vacío</h1>
        <Link to="/tienda" className="btn-primary" style={{ textDecoration: 'none' }}>VOLVER A LA TIENDA</Link>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ paddingTop: '120px' }}>
      <h1 className="title-medium text-center" style={{ marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>Finalizar Compra</h1>
      
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '4rem' }}>
        {/* Formulario */}
        <form onSubmit={handleCheckout}>
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-black)' }}>Información del Cliente</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <input required name="nombre" value={formData.nombre} onChange={handleChange} type="text" placeholder="Nombre completo *" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', gridColumn: 'span 2', fontSize: '0.85rem' }} />
            <input required name="telefono" value={formData.telefono} onChange={handleChange} type="tel" placeholder="Teléfono *" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', fontSize: '0.85rem' }} />
            <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Correo electrónico" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', fontSize: '0.85rem' }} />
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-black)' }}>Dirección de Entrega</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <input required name="ciudad" value={formData.ciudad} onChange={handleChange} type="text" placeholder="Ciudad *" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', fontSize: '0.85rem' }} />
            <input required name="direccion" value={formData.direccion} onChange={handleChange} type="text" placeholder="Dirección *" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', fontSize: '0.85rem' }} />
            <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Notas adicionales (opcional)" rows="3" style={{ padding: '0.85rem', border: '1px solid var(--color-gray-light)', width: '100%', fontSize: '0.85rem', resize: 'vertical' }}></textarea>
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-black)' }}>Método de Pago</h3>
          <div style={{ padding: '2rem', border: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-cream)', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: 'var(--color-black)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: '500' }}>Pedido por WhatsApp</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-gray)', lineHeight: '1.5' }}>Tu pedido será enviado directamente a nuestro equipo a través de WhatsApp, donde coordinaremos el pago y envío de manera personalizada.</p>
          </div>
          
          {/* Botón en móvil, lo duplicamos o dejamos solo el del resumen. Mejor en el resumen. */}
        </form>

        {/* Resumen */}
        <div>
          <div style={{ backgroundColor: '#FDFBF7', border: '1px solid rgba(0,0,0,0.05)', padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '2rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Resumen del Pedido</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.2rem' }}>{item.selectedSize ? item.selectedSize : item.brand} | Cantidad: {item.quantity}</p>
                    <p style={{ fontWeight: '500', fontSize: '0.85rem', marginTop: '0.4rem' }}>${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-gray)' }}>Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-gray)' }}>Envío</span>
                <span>Por calcular</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '400', fontFamily: 'var(--font-serif)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
                <span>Total</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button className="btn-primary" onClick={handleCheckout} style={{ width: '100%', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              ENVIAR PEDIDO A WHATSAPP
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-gray)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Compra segura y personalizada</p>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;

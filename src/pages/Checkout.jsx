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

  const inputStyle = {
    padding: '0.9rem 1rem',
    border: '1px solid #EAE8E4',
    borderRadius: '4px',
    width: '100%',
    fontSize: '0.85rem',
    outline: 'none',
    backgroundColor: '#FCFBF9',
    fontFamily: 'var(--font-sans)',
    color: '#333',
    transition: 'border-color 0.2s ease'
  };

  const sectionTitleStyle = {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.85rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: '1.2rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #EAE8E4'
  };

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        
        {/* Encabezado */}
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/tienda" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: '#666', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#000'} onMouseLeave={e => e.target.style.color = '#666'}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>&larr;</span> VOLVER AL CARRITO
          </Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: '400', color: '#111', letterSpacing: '1px', textTransform: 'uppercase' }}>
            FINALIZAR COMPRA
          </h1>
        </div>

        <div className="checkout-grid">
          
          {/* Columna Izquierda: Formulario */}
          <form onSubmit={handleCheckout} className="checkout-form">
            
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={sectionTitleStyle}>Información del Cliente</h3>
              <div className="form-group-full" style={{ marginBottom: '1rem' }}>
                <input required name="nombre" value={formData.nombre} onChange={handleChange} type="text" placeholder="Nombre completo *" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>
              <div className="form-group-split">
                <input required name="telefono" value={formData.telefono} onChange={handleChange} type="tel" placeholder="Teléfono *" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
                <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Correo electrónico" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={sectionTitleStyle}>Dirección de Entrega</h3>
              <div className="form-group-full" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input required name="ciudad" value={formData.ciudad} onChange={handleChange} type="text" placeholder="Ciudad *" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
                <input required name="direccion" value={formData.direccion} onChange={handleChange} type="text" placeholder="Dirección *" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
                <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Notas adicionales (opcional)" rows="3" style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'}></textarea>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={sectionTitleStyle}>Método de Pago</h3>
              <div style={{ padding: '1.2rem', border: '1px solid #EAE8E4', backgroundColor: '#fff', borderRadius: '4px', textAlign: 'center' }}>
                <p style={{ color: '#111', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>Pedido por WhatsApp</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: '#666', lineHeight: '1.5', fontFamily: 'var(--font-sans)' }}>Tu pedido será enviado directamente a nuestro equipo a través de WhatsApp, donde coordinaremos el pago y envío de manera personalizada.</p>
              </div>
            </div>

          </form>

          {/* Columna Derecha: Resumen */}
          <div className="checkout-summary-wrap">
            <div className="checkout-summary">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '1.5rem', color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Resumen del Pedido</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}-${idx}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#F9F8F6', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>{item.selectedSize ? item.selectedSize : item.brand} | Cantidad: {item.quantity}</p>
                      <p style={{ fontWeight: '500', fontSize: '0.8rem', marginTop: '0.3rem', color: '#000' }}>${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #EAE8E4', paddingTop: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
                  <span style={{ color: '#666' }}>Subtotal</span>
                  <span style={{ color: '#111' }}>${cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: '#666' }}>Envío</span>
                  <span style={{ color: '#111' }}>Por calcular</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '400', fontFamily: 'var(--font-serif)', borderTop: '1px solid #EAE8E4', paddingTop: '1rem', color: '#111' }}>
                  <span>Total</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
              </div>
              
              <button className="btn-primary" onClick={handleCheckout} style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '0.75rem', letterSpacing: '2px' }}>
                FINALIZAR PEDIDO
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.6rem', color: '#999', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Compra segura y personalizada</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .checkout-container {
          padding-top: 3rem; /* Much closer to top */
          padding-bottom: 4rem;
          display: flex;
          justify-content: center;
        }
        .checkout-wrapper {
          width: 100%;
          max-width: 1000px;
          padding: 0 20px;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 4rem;
          align-items: start;
        }
        .form-group-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .checkout-summary {
          background-color: #fff;
          border: 1px solid #EAE8E4;
          padding: 2rem;
          position: sticky;
          top: 120px;
        }

        /* Mobile Adjustments */
        @media (max-width: 850px) {
          .checkout-container {
            padding-top: 1.5rem;
            padding-bottom: 6rem; /* Extra padding to avoid WhatsApp overlap */
          }
          .checkout-wrapper {
            padding: 0 16px;
          }
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .form-group-split {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .checkout-summary {
            padding: 1.5rem;
            position: relative;
            top: 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            border-top: 1px solid #EAE8E4;
            background-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;

import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal } = useShop();
  
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    departamento: '',
    ciudad: '',
    direccion: '',
    notas: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('contra_entrega');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    
    if (!formData.nombre || !formData.email || !formData.cedula || !formData.departamento || !formData.ciudad || !formData.direccion || !formData.telefono) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    if (paymentMethod === 'wompi') {
      const reference = `pedido_${Date.now()}`;
      const amountInCents = cartTotal * 100;
      alert(`Aquí se abrirá la pasarela de WOMPI por un valor de $${cartTotal.toLocaleString()}\nFalta configurar la llave pública.`);
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
    
    const metodos = {
      'contra_entrega': 'Pago Contra Entrega',
      'transferencia': 'Transferencia Bancaria',
    };
    
    // 1. Guardar en BD
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono,
        email: formData.email,
        departamento: formData.departamento,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        notas: formData.notas,
        metodoPago: metodos[paymentMethod],
        total: cartTotal,
        cart: cart
      })
    }).then(res => res.json()).then(data => {
      // 2. Redirigir a WhatsApp
      if (data.success) {
        message = `*NUEVO PEDIDO #DFV-${String(data.orderId).padStart(4, '0')}*\n\n` + message;
      }
      message += `Método de Pago: ${metodos[paymentMethod]}\n\n`;
      message += `Email: ${formData.email}\n`;
      message += `Nombre: ${formData.nombre}\n`;
      message += `Cédula: ${formData.cedula}\n`;
      message += `Departamento: ${formData.departamento}\n`;
      message += `Ciudad: ${formData.ciudad}\n`;
      message += `Dirección: ${formData.direccion}\n`;
      message += `Teléfono: ${formData.telefono}\n`;
      if (formData.notas) message += `Notas: ${formData.notas}\n`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = "573027642208"; 
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    }).catch(err => {
      console.error(err);
      alert("Hubo un error guardando el pedido, por favor intenta nuevamente.");
    });
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
    transition: 'border-color 0.2s ease',
    marginBottom: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.4rem',
    letterSpacing: '1px',
    textTransform: 'uppercase'
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Correo Electrónico *</label>
                <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Ej. juan@gmail.com (Para enviarte la factura)" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Nombre Completo *</label>
                <input required name="nombre" value={formData.nombre} onChange={handleChange} type="text" placeholder="Ej. Juan Pérez" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Cédula (Para el envío) *</label>
                <input required name="cedula" value={formData.cedula} onChange={handleChange} type="text" placeholder="Ej. 1010123456" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Departamento *</label>
                <input required name="departamento" value={formData.departamento} onChange={handleChange} type="text" placeholder="Ej. Antioquia" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Ciudad *</label>
                <input required name="ciudad" value={formData.ciudad} onChange={handleChange} type="text" placeholder="Ej. Medellín" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Dirección Exacta *</label>
                <input required name="direccion" value={formData.direccion} onChange={handleChange} type="text" placeholder="Ej. Calle 123 # 45-67 Apto 8" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Teléfono / WhatsApp *</label>
                <input required name="telefono" value={formData.telefono} onChange={handleChange} type="tel" placeholder="Ej. 3001234567" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Notas Adicionales (Opcional)</label>
                <textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Instrucciones especiales de entrega, referencias, etc." rows="3" style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', marginBottom: 0 }} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'}></textarea>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={sectionTitleStyle}>MÉTODO DE PAGO</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Contra Entrega */}
                <label style={{ display: 'flex', gap: '1rem', padding: '1.2rem', border: paymentMethod === 'contra_entrega' ? '1px solid #111' : '1px solid #EAE8E4', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff', alignItems: 'flex-start' }}>
                  <input type="radio" name="paymentMethod" value="contra_entrega" checked={paymentMethod === 'contra_entrega'} onChange={() => setPaymentMethod('contra_entrega')} style={{ marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '500', fontSize: '0.9rem', color: '#111', marginBottom: '0.2rem' }}>Pago Contra Entrega</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Paga en efectivo al recibir tu pedido en casa.</span>
                  </div>
                </label>

                {/* Transferencia */}
                <label style={{ display: 'flex', gap: '1rem', padding: '1.2rem', border: paymentMethod === 'transferencia' ? '1px solid #111' : '1px solid #EAE8E4', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff', alignItems: 'flex-start' }}>
                  <input type="radio" name="paymentMethod" value="transferencia" checked={paymentMethod === 'transferencia'} onChange={() => setPaymentMethod('transferencia')} style={{ marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '500', fontSize: '0.9rem', color: '#111', marginBottom: '0.2rem' }}>Pago por transferencia (WHATSAPP)</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Acuerda el pago por transferencia bancaria directa (Nequi, Daviplata, Bancolombia).</span>
                  </div>
                </label>

                {/* Wompi */}
                <label style={{ display: 'flex', gap: '1rem', padding: '1.2rem', border: paymentMethod === 'wompi' ? '1px solid #111' : '1px solid #EAE8E4', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff', alignItems: 'flex-start' }}>
                  <input type="radio" name="paymentMethod" value="wompi" checked={paymentMethod === 'wompi'} onChange={() => setPaymentMethod('wompi')} style={{ marginTop: '0.2rem' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: '500', fontSize: '0.9rem', color: '#111', marginBottom: '0.2rem' }}>Pago Seguro en línea (Wompi)</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Tarjetas de crédito, débito, PSE, Nequi y más.</span>
                  </div>
                </label>

              </div>

              {/* Info Box */}
              {(paymentMethod === 'contra_entrega' || paymentMethod === 'transferencia') && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: '#16a34a', marginTop: '2px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: '500', color: '#166534', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Confirmación por WhatsApp</p>
                    <p style={{ fontSize: '0.75rem', color: '#166534', lineHeight: '1.4' }}>Al presionar el botón se abrirá WhatsApp con toda la información de tu pedido lista para enviarnos. Nosotros confirmaremos tu compra y te indicaremos los pasos a seguir.</p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop: '3px' }} />
                <label htmlFor="terms" style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>
                  Acepto los <a href="#" style={{ color: '#111' }}>Términos y Condiciones</a> y la Política de Tratamiento de Datos Personales.
                </label>
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
              
              <button className="btn-primary" onClick={handleCheckout} style={{ 
                width: '100%', 
                marginTop: '2rem', 
                padding: '1rem', 
                fontSize: '0.75rem', 
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: paymentMethod === 'wompi' ? '#111' : '#25D366',
                color: '#fff',
                border: 'none',
              }}>
                {paymentMethod === 'wompi' ? (
                  'PAGAR SEGURO CON WOMPI'
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    ENVIAR PEDIDO POR WHATSAPP
                  </>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.6rem', color: '#999', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Compra segura y protegida</p>
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

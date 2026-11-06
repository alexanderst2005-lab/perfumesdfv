import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { optimizeImg } from '../utils/img';

const DEFAULT_SHIPPING_ZONES = [
  {
    id: 'palmira-urbano',
    name: 'Palmira (Casco Urbano)',
    price: 6000,
    estimated_delivery: 'Mismo día o 24 horas',
    active: true,
    notes: 'Domicilio local en la ciudad de Palmira'
  },
  {
    id: 'cali-am',
    name: 'Cali, Yumbo y Jamundí',
    price: 12000,
    estimated_delivery: '24 a 48 horas hábiles',
    active: true,
    notes: 'Área metropolitana del Valle'
  },
  {
    id: 'ciudades-principales',
    name: 'Ciudades Principales (Bogotá, Medellín, Barranquilla, Eje Cafetero)',
    price: 18000,
    estimated_delivery: '2 a 4 días hábiles',
    active: true,
    notes: 'Envío asegurado con transportadora aliada'
  },
  {
    id: 'resto-pais',
    name: 'Resto del País (Otros municipios)',
    price: 22000,
    estimated_delivery: '3 a 5 días hábiles',
    active: true,
    notes: 'Cobertura nacional por transportadora'
  }
];

let cachedShippingZones = null;

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useShop();
  const navigate = useNavigate();

  // Zonas de cobertura y tarifas configuradas desde el panel administrativo
  const [shippingZones, setShippingZones] = useState(() => {
    if (cachedShippingZones) return cachedShippingZones;
    try {
      const stored = localStorage.getItem('dfv_shipping_zones');
      return stored ? JSON.parse(stored) : DEFAULT_SHIPPING_ZONES;
    } catch {
      return DEFAULT_SHIPPING_ZONES;
    }
  });

  const [selectedZoneId, setSelectedZoneId] = useState('');
  
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

  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    fetch(`/api/shipping-zones?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.zones)) {
          cachedShippingZones = data.zones;
          setShippingZones(data.zones);
          try {
            localStorage.setItem('dfv_shipping_zones', JSON.stringify(data.zones));
          } catch {}
        }
      })
      .catch(err => console.error('Error fetching shipping zones in Checkout:', err));
  }, []);

  const activeZones = shippingZones.filter(z => z.active !== false);
  const selectedZone = activeZones.find(z => z.id === selectedZoneId);
  const isUnlistedZone = selectedZoneId === 'unlisted';

  // Costo del domicilio: precio exacto si está en la zona, null si no está listada
  const shippingCost = selectedZone ? Number(selectedZone.price) : (isUnlistedZone ? null : null);
  const finalOrderTotal = selectedZone ? (cartTotal + shippingCost) : cartTotal;

  const handleZoneChange = (e) => {
    const val = e.target.value;
    setSelectedZoneId(val);

    const zone = activeZones.find(z => z.id === val);
    if (zone) {
      // Auto-ayuda para completar departamento y ciudad si están vacíos
      if (zone.id.includes('palmira') || zone.name.toLowerCase().includes('palmira')) {
        setFormData(prev => ({
          ...prev,
          departamento: prev.departamento || 'Valle del Cauca',
          ciudad: prev.ciudad || 'Palmira'
        }));
      } else if (zone.id.includes('cali') || zone.name.toLowerCase().includes('cali')) {
        setFormData(prev => ({
          ...prev,
          departamento: prev.departamento || 'Valle del Cauca',
          ciudad: prev.ciudad || 'Cali'
        }));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (!selectedZoneId) {
      alert("Por favor selecciona tu zona o ciudad de entrega para calcular el domicilio.");
      return;
    }
    
    if (!formData.nombre || !formData.email || !formData.cedula || !formData.departamento || !formData.ciudad || !formData.direccion || !formData.telefono) {
      alert("Por favor completa todos los campos obligatorios marcados con *.");
      return;
    }

    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    const shippingZoneName = selectedZone
      ? selectedZone.name
      : (formData.ciudad ? `Otra ciudad / municipio (${formData.ciudad})` : 'Otra ciudad no listada');

    if (paymentMethod === 'wompi') {
      alert(`Aquí se abrirá la pasarela de WOMPI por un valor total de $${finalOrderTotal.toLocaleString()}\nFalta configurar la llave pública.`);
      return;
    }

    // Mensaje para WhatsApp con el desglose exacto solicitado
    let message = "Hola DFV Perfumes, quiero realizar el siguiente pedido:\n\n";

    cart.forEach(item => {
      message += `• *${item.name}* ${item.selectedSize ? `(${item.selectedSize})` : ''}\n`;
      message += `  Marca: ${item.brand || 'DFV'} | Cantidad: ${item.quantity}\n`;
      message += `  Precio: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });

    message += `--------------------------------\n`;
    message += `*Subtotal productos:* $${cartTotal.toLocaleString()}\n`;
    message += `*Zona de entrega:* ${shippingZoneName}\n`;
    message += `*Costo del domicilio:* ${selectedZone ? `$${shippingCost.toLocaleString()} COP` : 'Por confirmar con asesor (según transportadora)'}\n`;
    message += `*TOTAL DE LA COMPRA:* $${finalOrderTotal.toLocaleString()} COP${!selectedZone ? ' (+ envío por confirmar)' : ''}\n`;
    message += `--------------------------------\n\n`;

    message += `*DATOS PARA EL DESPACHO:*\n`;
    message += `• Nombre completo: ${formData.nombre}\n`;
    message += `• Cédula: ${formData.cedula}\n`;
    message += `• Teléfono / WhatsApp: ${formData.telefono}\n`;
    message += `• Correo: ${formData.email}\n`;
    message += `• Departamento: ${formData.departamento}\n`;
    message += `• Ciudad / Municipio: ${formData.ciudad}\n`;
    message += `• Dirección exacta: ${formData.direccion}\n`;
    if (formData.notas) message += `• Notas adicionales: ${formData.notas}\n`;
    
    const metodos = {
      'contra_entrega': 'Pago Contra Entrega',
      'transferencia': 'Transferencia Bancaria',
    };
    message += `• Método de Pago: ${metodos[paymentMethod]}\n`;
    
    // 1. Guardar en BD con registro de subtotal, zona y costo de envío
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
        subtotal: cartTotal,
        costoEnvio: selectedZone ? shippingCost : 0,
        zonaEnvio: shippingZoneName,
        total: finalOrderTotal,
        cart: cart
      })
    }).then(res => res.json()).then(data => {
      // 2. Redirigir a WhatsApp con el pedido generado
      if (data.success && data.orderId) {
        message = `*NUEVO PEDIDO #DFV-${String(data.orderId).padStart(4, '0')}*\n\n` + message;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = "573027642208"; 
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
      
      clearCart();
      navigate('/');
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

              {/* Selector Automático de Zona de Entrega / Domicilio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Zona o Ciudad de Entrega *</label>
                <select
                  required
                  value={selectedZoneId}
                  onChange={handleZoneChange}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    fontWeight: selectedZoneId ? '500' : 'normal',
                    color: selectedZoneId ? '#111' : '#666',
                    marginBottom: '0.5rem'
                  }}
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#EAE8E4'}
                >
                  <option value="">-- Selecciona tu ciudad o zona para calcular el envío --</option>
                  {activeZones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — ${(Number(zone.price) || 0).toLocaleString()} COP
                    </option>
                  ))}
                  <option value="unlisted">
                    📍 Otra ciudad o municipio no listado (Confirmar flete con asesor)
                  </option>
                </select>

                {/* Badge informativa de la tarifa seleccionada */}
                {selectedZone && (
                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '4px', fontSize: '0.78rem', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>
                      <strong>Domicilio liquidado:</strong> ${(Number(selectedZone.price) || 0).toLocaleString()} COP
                      {selectedZone.estimated_delivery ? ` • Entrega estimada: ${selectedZone.estimated_delivery}` : ''}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#047857' }}>{selectedZone.notes || ''}</span>
                  </div>
                )}

                {/* Alerta de tarifa no listada: NUNCA gratis ni inventada */}
                {isUnlistedZone && (
                  <div style={{ padding: '0.75rem 0.9rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '4px', fontSize: '0.78rem', color: '#92400e', lineHeight: '1.4' }}>
                    ⚠️ <strong>Tarifa por confirmar:</strong> Tu ciudad o municipio no cuenta con tarifa fija automática en la plataforma. Al finalizar tu pedido por WhatsApp, nuestro asesor te confirmará el costo exacto del envío según la transportadora antes de realizar el despacho.
                  </div>
                )}
              </div>

              <div className="form-group-split">
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Departamento *</label>
                  <input required name="departamento" value={formData.departamento} onChange={handleChange} type="text" placeholder="Ej. Valle del Cauca" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Ciudad / Municipio *</label>
                  <input required name="ciudad" value={formData.ciudad} onChange={handleChange} type="text" placeholder="Ej. Palmira, Cali, Bogotá..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Dirección Exacta de Entrega *</label>
                <input required name="direccion" value={formData.direccion} onChange={handleChange} type="text" placeholder="Ej. Calle 123 # 45-67 Barrio / Apto 8" style={inputStyle} onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#EAE8E4'} />
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
              {paymentMethod === 'transferencia' && (
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
                      <img src={optimizeImg(item.image, 400)} alt={item.name} loading="eager" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#666' }}>Subtotal de productos</span>
                  <span style={{ color: '#111', fontWeight: '500' }}>${cartTotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ color: '#666', display: 'block' }}>Costo del domicilio</span>
                    {selectedZone && (
                      <span style={{ fontSize: '0.72rem', color: '#059669', display: 'block', marginTop: '0.1rem' }}>
                        {selectedZone.name}
                      </span>
                    )}
                    {isUnlistedZone && (
                      <span style={{ fontSize: '0.72rem', color: '#b45309', display: 'block', marginTop: '0.1rem' }}>
                        Zona especial (por cotizar)
                      </span>
                    )}
                  </div>
                  <span style={{
                    color: selectedZone ? '#111' : (isUnlistedZone ? '#b45309' : '#888'),
                    fontWeight: selectedZone ? '600' : '500',
                    textAlign: 'right'
                  }}>
                    {selectedZone
                      ? `$${shippingCost.toLocaleString()}`
                      : (isUnlistedZone ? 'Por confirmar con asesor' : 'Por seleccionar zona')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '600', fontFamily: 'var(--font-serif)', borderTop: '1px solid #EAE8E4', paddingTop: '1rem', color: '#111' }}>
                  <span>Total de la compra</span>
                  <div style={{ textAlign: 'right' }}>
                    <span>${finalOrderTotal.toLocaleString()}</span>
                    {(!selectedZone || isUnlistedZone) && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: '#b45309', fontWeight: 'normal', fontFamily: 'var(--font-sans)', marginTop: '0.15rem' }}>
                        (+ costo de flete por confirmar)
                      </span>
                    )}
                  </div>
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

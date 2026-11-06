import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImg } from '../utils/img';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useShop();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-dark-overlay)', zIndex: 1001 }}
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-white)', zIndex: 1002, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' }}
          >
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-gray-light)' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Tu Carrito</h2>
              <button onClick={() => setIsCartOpen(false)}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-gray)', marginTop: '2rem' }}>Tu carrito está vacío.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {cart.map(item => (
                    <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '1rem' }}>
                      <img src={optimizeImg(item.image, 400)} alt={item.name} loading="eager" decoding="async" style={{ width: '80px', height: '100px', objectFit: 'contain' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                        {item.selectedSize ? (
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '0.5rem' }}>{item.selectedSize}</p>
                        ) : null}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-gray-light)' }}>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} style={{ padding: '0.2rem 0.5rem' }}>-</button>
                            <span style={{ padding: '0 0.5rem', fontSize: '0.9rem' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} style={{ padding: '0.2rem 0.5rem' }}>+</button>
                          </div>
                          <p style={{ fontWeight: '600' }}>${item.price * item.quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={{ color: 'var(--color-gray)' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '1.75rem', borderTop: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-cream)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem', color: '#555' }}>
                  <span>Subtotal productos</span>
                  <span style={{ fontWeight: '600', color: '#111' }}>${cartTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem', color: '#777' }}>
                  <span>Costo del domicilio</span>
                  <span style={{ color: '#111', fontWeight: '500' }}>Según zona en checkout</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.9rem', fontSize: '1.2rem', fontWeight: '600', borderTop: '1px solid #EAE8E4', paddingTop: '0.75rem', color: '#111' }}>
                  <span>Total compra</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  El valor del domicilio se calcula de forma automática según la ciudad de entrega que selecciones en el siguiente paso.
                </p>
                <Link to="/checkout" className="btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }} onClick={() => setIsCartOpen(false)}>
                  CONTINUAR CON LA COMPRA
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '100px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '0.5rem' }}>{item.selectedSize}</p>
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
              <div style={{ padding: '2rem', borderTop: '1px solid var(--color-gray-light)', backgroundColor: 'var(--color-cream)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '500' }}>
                  <span>Subtotal</span>
                  <span>${cartTotal}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '1.5rem' }}>Los impuestos y el envío se calculan en el checkout.</p>
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

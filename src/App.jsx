import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import Maintenance from './components/Maintenance';

// Pon en false para volver a mostrar la página
const MAINTENANCE_MODE = false;

import Home from './pages/Home';
import Store from './pages/Store';
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Contacto = lazy(() => import('./pages/Contacto'));

// Home handles its own marginTop via negative hero offset
// Other pages handle their own paddingTop
function AppInner() {
  const { pathname, key } = useLocation();
  const navType = useNavigationType();
  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  // Guarda la posición de scroll de cada entrada del historial
  const positions = useRef(new Map());
  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onScroll = () => positions.current.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navegar hacia adelante: arriba del todo. Volver atrás: restaurar donde estaba sin lag ni bucles
  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    } else {
      const target = positions.current.get(key);
      if (typeof target === 'number' && target > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: target, behavior: 'instant' });
        });
      }
    }
  }, [key, navType]);

  // Precarga las demás pantallas en segundo plano para que navegar sea instantáneo
  useEffect(() => {
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 800));
    idle(() => {
      import('./pages/ProductDetail');
      import('./pages/Favorites');
      import('./pages/Checkout');
      import('./pages/Contacto');
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Header />}
      {!isAdmin && <CartDrawer />}
      <main style={{ flex: 1, marginTop: isHome || isAdmin ? 0 : '106px' }}>
        <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Store />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mi-cuenta" element={<Account />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
    </div>
  );
}

function App() {
  if (MAINTENANCE_MODE) return <Maintenance />;
  return (
    <ShopProvider>
      <Router>
        <AppInner />
      </Router>
    </ShopProvider>
  );
}

export default App;

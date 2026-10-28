import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  // SCROLL AL INICIO CADA VEZ QUE CAMBIA LA RUTA
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

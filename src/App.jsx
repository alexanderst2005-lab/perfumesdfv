import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';

import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';

// Home handles its own marginTop via negative hero offset
// Other pages handle their own paddingTop
function AppInner() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <CartDrawer />
      <main style={{ flex: 1, marginTop: isHome ? 0 : '106px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Store />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mi-cuenta" element={<Account />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <ShopProvider>
      <Router>
        <AppInner />
      </Router>
    </ShopProvider>
  );
}

export default App;

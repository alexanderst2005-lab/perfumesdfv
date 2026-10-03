import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <CartDrawer />
          <main style={{ flex: 1, marginTop: '115px' }}>
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
        </div>
      </Router>
    </ShopProvider>
  );
}

export default App;

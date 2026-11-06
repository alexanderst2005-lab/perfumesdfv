import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import Maintenance from './components/Maintenance';
import CampaignPopup from './components/CampaignPopup';
import { useShop } from './context/ShopContext';

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
const CampaignPage = lazy(() => import('./pages/CampaignPage'));

// Al recargar (F5 / actualizar) la página siempre debe empezar desde el principio, sin posiciones guardadas ni #hash
const isPageReload = (() => {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    return !!nav && nav.type === 'reload';
  } catch { return false; }
})();
if (isPageReload && typeof window !== 'undefined') {
  try {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('dfv_scroll_') || k === 'perfume_store_page')
      .forEach(k => sessionStorage.removeItem(k));
  } catch {}
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}

function AppInner() {
  const { pathname, search, hash, key } = useLocation();
  const navType = useNavigationType();
  const isHome = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');
  const fullPath = `${pathname}${search}`;

  // Campañas activas del contexto
  const { activeCampaigns } = useShop();

  // Guarda la posición exacta de scroll de cada pantalla en memoria y sessionStorage
  const positions = useRef(new Map());
  const pathPositions = useRef(new Map());
  const activeKeyRef = useRef(key);
  const activePathRef = useRef(fullPath);
  const isRestoringRef = useRef(false);
  const isInitialMount = useRef(true);

  // Evitar saltos involuntarios al pie de página provocados por la tecla 'End' (que en muchas laptops
  // comparte tecla física con 'PrtSc' / PrintScreen) o por la captura de pantalla del sistema.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isEditable = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (isEditable) return;

      if (e.key === 'End' || e.code === 'End') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.key === 'Snapshot') {
        const currentY = window.scrollY;
        requestAnimationFrame(() => {
          window.scrollTo({ top: currentY, behavior: 'instant' });
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const onScroll = () => {
      if (isRestoringRef.current) return;
      const y = window.scrollY;
      positions.current.set(activeKeyRef.current, y);
      pathPositions.current.set(activePathRef.current, y);
      try {
        sessionStorage.setItem(`dfv_scroll_key_${activeKeyRef.current}`, String(y));
        sessionStorage.setItem(`dfv_scroll_path_${activePathRef.current}`, String(y));
      } catch {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cuando cambia la ruta:
  // - En la carga inicial de la aplicación o navegación nueva (PUSH / REPLACE): siempre arriba limpio (0,0)
  // - Si el usuario le dio ATRÁS en el celular (POP): restaurar exactamente donde estaba
  useEffect(() => {
    isRestoringRef.current = true;
    activeKeyRef.current = key;
    activePathRef.current = fullPath;

    let timers = [];

    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const scrollToHash = () => {
        const el = document.getElementById(targetId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      };
      scrollToHash();
      [60, 180, 350].forEach(ms => {
        timers.push(setTimeout(scrollToHash, ms));
      });
      timers.push(
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 400)
      );
    } else if (isInitialMount.current || navType !== 'POP') {
      isInitialMount.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const t = setTimeout(() => {
        isRestoringRef.current = false;
      }, 120);
      timers.push(t);
    } else {
      let target = positions.current.get(key);
      if (typeof target !== 'number') {
        try {
          const savedByKey = sessionStorage.getItem(`dfv_scroll_key_${key}`);
          if (savedByKey !== null && !isNaN(Number(savedByKey))) {
            target = Number(savedByKey);
          } else {
            const savedByPath = sessionStorage.getItem(`dfv_scroll_path_${fullPath}`);
            if (savedByPath !== null && !isNaN(Number(savedByPath))) {
              target = Number(savedByPath);
            }
          }
        } catch {}
      }
      if (typeof target !== 'number') {
        target = pathPositions.current.get(fullPath) || 0;
      }

      const restoreToTarget = () => {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' });
      };

      restoreToTarget();
      requestAnimationFrame(restoreToTarget);
      [40, 110, 220, 360].forEach(ms => {
        timers.push(setTimeout(restoreToTarget, ms));
      });
      timers.push(
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 400)
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [key, fullPath, hash, navType]);

  // Precarga las demás pantallas en segundo plano para que navegar sea instantáneo
  useEffect(() => {
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 800));
    idle(() => {
      import('./pages/ProductDetail');
      import('./pages/Favorites');
      import('./pages/Checkout');
      import('./pages/Contacto');
      import('./pages/CampaignPage');
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && <Header />}
      {!isAdmin && <CartDrawer />}
      {/* Popup de campañas: solo en tienda pública */}
      {!isAdmin && activeCampaigns && activeCampaigns.length > 0 && (
        <CampaignPopup campaigns={activeCampaigns} />
      )}
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
          <Route path="/campana/:id" element={<CampaignPage />} />
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

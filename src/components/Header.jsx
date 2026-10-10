import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';

const HEADER_H = 70;
const ANNOUNCE_H = 36;

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, favorites, setIsCartOpen, categories } = useShop();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // En Home el header siempre es transparente (ya que sube con el scroll). En otras páginas es sólido.
  const solid = !isHome;

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Tienda', path: '/tienda' },
    { label: 'Contacto', path: '/contacto' }
  ];

  return (
    <>
      {/* ── Container (absolute, para que suba y desaparezca con el scroll) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <AnnouncementBar transparent={!solid} />

        <header style={{
          height: `${HEADER_H}px`,
          backgroundColor: solid ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: solid ? 'blur(12px)' : 'none',
          borderBottom: solid ? '1px solid var(--color-gray-light)' : 'none',
          color: solid ? 'var(--color-black)' : '#fff',
          transition: 'background-color 0.3s ease, color 0.3s ease, border 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}>
          <div className="header-container" style={{
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative', /* Importante para el centrado absoluto del logo */
          }}>

            {/* LEFT / CENTER — Logo and Hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button
                className="mobile-only"
                aria-label="Menú"
                style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '1rem' }}
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
              
              <Link to="/" className="header-logo" style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                zIndex: 10,
              }}>
                <svg
                  viewBox="0 0 160 50"
                  height="38"
                  aria-label="DFV Perfumes"
                  style={{ display: 'block', transition: 'all 0.3s ease', overflow: 'visible' }}
                >
                  <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill={solid ? '#111111' : '#ffffff'}>DFV</text>
                  <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill={solid ? '#111111' : '#ffffff'}>PERFUMES</text>
                </svg>
              </Link>
            </div>

            {/* CENTER — Desktop Nav */}
            <nav className="desktop-only" style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flex: 2 }}>
              {navLinks.map(l => (
                <Link key={l.label} to={l.path} style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: '500',
                  opacity: 0.8,
                  transition: 'opacity 0.2s'
                }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.8}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* RIGHT — Icons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.2rem', flex: 1 }}>
              <button style={{ color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Buscar"><Search size={20} strokeWidth={1.5} /></button>

              <Link to="/favoritos" style={{ position: 'relative', color: 'inherit' }} aria-label="Favoritos">
                <Heart size={20} strokeWidth={1.5} />
                {favorites.length > 0 && (
                  <span style={badgeStyle}>{favorites.length}</span>
                )}
              </Link>

              <button
                style={{ position: 'relative', color: 'inherit', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label="Carrito"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && <span style={badgeStyle}>{cartCount}</span>}
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* ── Mobile side menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1998 }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '100%', backgroundColor: '#fff', zIndex: 1999,
                padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <svg viewBox="0 0 160 50" height="30" aria-label="DFV Perfumes" style={{ display: 'block' }}>
                  <text x="0" y="36" fontFamily="Georgia, 'Times New Roman', serif" fontSize="46" fontWeight="400" letterSpacing="-1" fill="#050505">DFV</text>
                  <text x="0" y="50" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="10" fontWeight="400" letterSpacing="6" fill="#050505">PERFUMES</text>
                </svg>
                <button onClick={() => setMenuOpen(false)}><X size={22} strokeWidth={1.5} /></button>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.8rem' }}>
                {navLinks.map(l => (
                  <Link key={l.label} to={l.path} onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`
        .header-container { padding: 0 2.5rem; }
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        .header-logo { justify-content: flex-start; }
        
        @media (max-width: 768px) {
          .header-container { padding: 0 1.2rem !important; }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .header-logo { position: absolute !important; left: 50% !important; transform: translateX(-50%) !important; justify-content: center !important; }
        }
      `}</style>
    </>
  );
};

const badgeStyle = {
  position: 'absolute', top: '-7px', right: '-9px',
  background: 'var(--color-gold)', color: '#fff',
  fontSize: '9px', minWidth: '16px', height: '16px',
  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: '600',
};

const menuLinkStyle = {
  fontSize: '1.2rem',
  fontFamily: 'var(--font-sans)',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  color: 'var(--color-black)',
  fontWeight: '700',
  padding: '0.8rem 0',
  textAlign: 'center',
  textDecoration: 'none',
};

export default Header;

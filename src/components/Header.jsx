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
  const { cartCount, favorites, setIsCartOpen } = useShop();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = !isHome || scrolled;

  const navLinks = [
    { label: 'Tienda',   path: '/tienda' },
    { label: 'Hombre',   path: '/tienda?category=Hombre' },
    { label: 'Mujer',    path: '/tienda?category=Mujer' },
    { label: 'Unisex',   path: '/tienda?category=Unisex' },
    { label: 'Marcas',   path: '/tienda?category=Marcas' },
    { label: 'Ofertas',  path: '/tienda?offers=true' },
  ];

  return (
    <>
      {/* ── Container (fixed, stacks AnnouncementBar + header) ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <AnnouncementBar />

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
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 2.5rem',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '1rem',
          }}>

            {/* LEFT — Hamburger (mobile) + Desktop Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Mobile hamburger */}
              <button
                className="mobile-only"
                aria-label="Menú"
                style={{ color: 'inherit' }}
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Desktop nav */}
              <nav className="desktop-only" style={{ display: 'flex', gap: '1.8rem' }}>
                {navLinks.map(l => (
                  <Link
                    key={l.label}
                    to={l.path}
                    style={{
                      fontSize: '0.78rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'inherit',
                      fontWeight: '500',
                      opacity: 0.85,
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* CENTER — Logo siempre visible */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/logo.png"
                alt="DFV Perfumes"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  maxWidth: '180px',
                  filter: solid ? 'none' : 'invert(1) brightness(2)',
                  mixBlendMode: solid ? 'normal' : 'screen',
                  transition: 'filter 0.3s ease',
                }}
              />
            </Link>

            {/* RIGHT — Icons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.2rem' }}>
              <button style={{ color: 'inherit' }} aria-label="Buscar"><Search size={20} /></button>

              <Link to="/favoritos" style={{ position: 'relative', color: 'inherit' }} aria-label="Favoritos">
                <Heart size={20} />
                {favorites.length > 0 && (
                  <span style={badgeStyle}>{favorites.length}</span>
                )}
              </Link>

              <button
                style={{ position: 'relative', color: 'inherit' }}
                aria-label="Carrito"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={20} />
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
                width: '280px', backgroundColor: '#fff', zIndex: 1999,
                padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <img src="/logo.png" alt="DFV Perfumes" style={{ height: '40px', objectFit: 'contain' }} />
                <button onClick={() => setMenuOpen(false)}><X size={22} /></button>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <Link to="/" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>Inicio</Link>
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
  fontSize: '1rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'var(--color-black)',
  fontWeight: '400',
  padding: '0.3rem 0',
  borderBottom: '1px solid var(--color-gray-light)',
};

export default Header;

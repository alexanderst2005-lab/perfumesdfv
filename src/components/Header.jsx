import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, favorites, setIsCartOpen } = useShop();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = !isHomePage || isScrolled;

  const headerContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  };

  const headerStyle = {
    height: '80px',
    backgroundColor: isSolid ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
    backdropFilter: isSolid ? 'blur(10px)' : 'none',
    boxShadow: isSolid ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
    color: isSolid ? 'var(--color-black)' : 'var(--color-white)',
    transition: 'var(--transition-smooth)',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Tienda', path: '/tienda' },
    { name: 'Hombre', path: '/tienda?category=Hombre' },
    { name: 'Mujer', path: '/tienda?category=Mujer' },
    { name: 'Unisex', path: '/tienda?category=Unisex' },
    { name: 'Ofertas', path: '/tienda?offers=true' }
  ];

  return (
    <>
      <div style={headerContainerStyle}>
        <AnnouncementBar />
        <header style={headerStyle}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            
            {/* Mobile Menu Button */}
            <button 
              style={{ display: 'none', color: 'inherit' }} 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

          {/* Logo */}
          <Link to="/" className="header-logo" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
            NÖIT NOIR
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem' }}>
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="header-icons" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button style={{ color: 'inherit' }}><Search size={20} /></button>
            <Link to="/favoritos" style={{ position: 'relative', color: 'inherit' }}>
              <Heart size={20} />
              {favorites.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-gold)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {favorites.length}
                </span>
              )}
            </Link>
            <button style={{ position: 'relative', color: 'inherit' }} onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-gold)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              )}
            </button>
            <Link to="/mi-cuenta" style={{ color: 'inherit' }}><User size={20} /></Link>
          </div>
        </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '-100%' }}
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '300px', backgroundColor: 'var(--color-white)', zIndex: 2000, padding: '2rem', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => setIsMobileMenuOpen(false)}>NÖIT NOIR</Link>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--color-black)' }}>
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .header-logo { font-size: 1.2rem !important; }
          .header-icons { gap: 1rem !important; }
        }
      `}</style>
    </>
  );
};

export default Header;

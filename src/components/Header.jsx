import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Home as HomeIcon, Grid } from 'lucide-react';
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
    { name: 'Tienda', path: '/tienda' },
    { name: 'Hombre', path: '/tienda?category=Hombre' },
    { name: 'Mujer', path: '/tienda?category=Mujer' },
    { name: 'Unisex', path: '/tienda?category=Unisex' },
    { name: 'Marcas', path: '/tienda?category=Marcas' },
    { name: 'Ofertas', path: '/tienda?offers=true' }
  ];

  return (
    <>
      <div style={headerContainerStyle}>
        <AnnouncementBar />
        <header style={headerStyle}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            
            {/* Mobile Menu Button (Left) */}
            <div className="mobile-header-left" style={{ flex: 1, display: 'none' }}>
              <button style={{ color: 'inherit' }} onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>

            {/* Logo (Left on Desktop, Centered on Mobile) */}
            <div className="header-logo-container" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/logo.png" 
                  alt="DFV Perfumes" 
                  style={{ 
                    height: '54px', 
                    width: '54px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    display: 'block'
                  }} 
                />
              </Link>
            </div>

            {/* Desktop Nav (Centered) */}
            <nav className="desktop-nav" style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
              <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} style={{ color: 'inherit', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Icons (Right) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.2rem' }}>
              <button style={{ color: 'inherit' }}><Search size={22} /></button>
              
              <Link to="/favoritos" style={{ position: 'relative', color: 'inherit' }}>
                <Heart size={22} />
                {favorites.length > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--color-gold)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {favorites.length}
                  </span>
                )}
              </Link>
              
              <button style={{ position: 'relative', color: 'inherit' }} onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--color-gold)', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount}
                  </span>
                )}
              </button>
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
              <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => setIsMobileMenuOpen(false)}>DFV PERFUMES</Link>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--color-black)' }}>Inicio</Link>
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--color-black)' }}>
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link to="/" className="bottom-nav-item">
          <HomeIcon size={20} />
          <span>INICIO</span>
        </Link>
        <Link to="/tienda" className="bottom-nav-item">
          <Grid size={20} />
          <span>TIENDA</span>
        </Link>
        <Link to="/favoritos" className="bottom-nav-item">
          <div style={{ position: 'relative' }}>
            <Heart size={20} />
            {favorites.length > 0 && <span className="bottom-nav-badge">{favorites.length}</span>}
          </div>
          <span>FAVORITOS</span>
        </Link>
        <button className="bottom-nav-item" onClick={() => setIsCartOpen(true)}>
          <div style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
          </div>
          <span>CARRITO</span>
        </button>
      </div>

      <style>{`
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-header-left { display: flex !important; }
          .header-logo-container { justify-content: center !important; }
          
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background-color: var(--color-black);
            color: var(--color-white);
            z-index: 999;
            justify-content: space-around;
            align-items: center;
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: var(--color-white);
            font-size: 0.6rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            width: 25%;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
          }
          .bottom-nav-item:active {
            color: var(--color-gold);
          }
          .bottom-nav-badge {
            position: absolute;
            top: -5px;
            right: -8px;
            background: var(--color-gold);
            color: white;
            font-size: 9px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Header;

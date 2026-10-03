import React from 'react';

const items = [
  'ATENCIÓN PERSONALIZADA',
  'ENVÍOS A TODO EL PAÍS',
  'ASESORÍA PARA ELEGIR TU FRAGANCIA',
  'COMPRA SEGURA',
  'EMPAQUE ESPECIAL',
];

const single = items.map(i => `✦ ${i}`).join('   ·   ');
const content = `${single}   ·   ${single}`;

const AnnouncementBar = ({ transparent = false }) => (
  <div style={{
    background: transparent
      ? 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.2))'
      : '#0a0a0a',
    color: '#fff',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1001,
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    letterSpacing: '1.5px',
    userSelect: 'none',
    transition: 'background 0.4s ease',
  }}>
    <div className="marquee-track" style={{ whiteSpace: 'nowrap' }}>
      {content}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{content}
    </div>
  </div>
);

export default AnnouncementBar;

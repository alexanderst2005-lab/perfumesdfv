import React from 'react';

const items = [
  'ATENCIÓN PERSONALIZADA',
  'ENVÍOS A TODO EL PAÍS',
  'ASESORÍA PARA ELEGIR TU FRAGANCIA',
  'COMPRA SEGURA',
  'EMPAQUE ESPECIAL',
];

const AnnouncementBar = () => {
  // Build one long string, then duplicate it exactly once for seamless loop
  const single = items.map(i => `✦ ${i}`).join('   ·   ');
  const content = `${single}   ·   ${single}`;

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#fff',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1001,
      width: '100%',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.7rem',
      letterSpacing: '1.5px',
      userSelect: 'none',
    }}>
      <div className="marquee-track" style={{ whiteSpace: 'nowrap' }}>
        {content}
        &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
        {content}
      </div>
    </div>
  );
};

export default AnnouncementBar;

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
      ? 'linear-gradient(to bottom, rgba(5,5,5,0.7), rgba(5,5,5,0))'
      : 'var(--color-black)',
    color: 'var(--color-cream)',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1001,
    width: '100%',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.68rem',
    letterSpacing: '2px',
    userSelect: 'none',
    transition: 'background 0.4s ease',
    borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.05)'
  }}>
    <div className="marquee-track" style={{ whiteSpace: 'nowrap' }}>
      <span dangerouslySetInnerHTML={{ __html: content.replace(/✦/g, '<span style="color:var(--color-gold);">✦</span>') }} />
      &nbsp;&nbsp;&nbsp;<span style={{color:'var(--color-gold)'}}>✦</span>&nbsp;&nbsp;&nbsp;
      <span dangerouslySetInnerHTML={{ __html: content.replace(/✦/g, '<span style="color:var(--color-gold);">✦</span>') }} />
    </div>
  </div>
);

export default AnnouncementBar;

import React from 'react';

const AnnouncementBar = () => {
  const messages = [
    "✦ ATENCIÓN PERSONALIZADA",
    "✦ ENVÍOS A TODO EL PAÍS",
    "✦ ASESORÍA PARA ELEGIR TU FRAGANCIA",
    "✦ COMPRA SEGURA",
    "✦ EMPAQUE ESPECIAL"
  ];

  const duplicatedMessages = [...messages, ...messages, ...messages]; // Duplicate to ensure smooth loop

  return (
    <div style={{
      backgroundColor: '#050505',
      color: 'var(--color-white)',
      height: '35px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1001,
      width: '100%',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.75rem',
      letterSpacing: '1px'
    }}>
      <div className="marquee-content">
        {duplicatedMessages.map((msg, index) => (
          <span key={index} style={{
            marginRight: '3rem',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--color-gold)', marginRight: '0.5rem' }}>✦</span>
            {msg.replace('✦', '').trim()}
          </span>
        ))}
      </div>
      <style>{`
        .marquee-content {
          display: flex;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;

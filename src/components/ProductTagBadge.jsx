import React from 'react';

export const getTagConfig = (tag) => {
  if (!tag) return null;
  const raw = String(tag).trim();
  const normalized = raw.toLowerCase();

  if (normalized === 'nuevo') {
    return {
      label: 'NUEVO',
      style: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        border: '1px solid #000000'
      }
    };
  }

  if (normalized === 'más vendido' || normalized === 'mas vendido') {
    return {
      label: 'MÁS VENDIDO',
      style: {
        backgroundColor: '#B99A5B',
        color: '#000000',
        border: '1px solid #A88849'
      }
    };
  }

  if (normalized === 'últimas unidades' || normalized === 'ultimas unidades') {
    return {
      label: 'ÚLTIMAS UNIDADES',
      style: {
        backgroundColor: '#FFEDD5',
        color: '#7C2D12',
        border: '1px solid #FDBA74'
      }
    };
  }

  if (normalized === 'edición limitada' || normalized === 'edicion limitada') {
    return {
      label: 'EDICIÓN LIMITADA',
      style: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        border: '1.5px solid #000000'
      }
    };
  }

  return null;
};

export const ProductTagBadge = ({ tag, style = {}, className = '' }) => {
  const config = getTagConfig(tag);
  if (!config) return null;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3px 8px',
        fontSize: '0.62rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        borderRadius: '999px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        pointerEvents: 'none',
        ...config.style,
        ...style
      }}
    >
      {config.label}
    </span>
  );
};

export default ProductTagBadge;


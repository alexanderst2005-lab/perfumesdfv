import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { optimizeImg } from '../utils/img';

/**
 * Tarjeta de producto — rediseño visual (Etapa 1).
 * Solo cambia la presentación. Recibe las mismas props que la tarjeta actual:
 *   product, onAdd, priority  (onFav / fav se aceptan pero ya no se muestran).
 */
const ProductCardV2 = ({ product, onAdd, priority = false }) => {
  const discountNum = Number(String(product.discount ?? '').replace(/[^0-9.]/g, ''));
  const hasDiscount = Number.isFinite(discountNum) && discountNum > 0;
  const hasOldPrice = hasDiscount && Number(product.oldPrice) > Number(product.price);
  const canAdd = Boolean(onAdd && product.inStock);

  return (
    <article className="dfv-pc">
      <div className="dfv-pc__media">
        <Link
          to={`/producto/${product.id}`}
          className="dfv-pc__link"
          aria-label={product.name}
        >
          <img
            src={optimizeImg(product.image, 400)}
            alt={product.name}
            className="dfv-pc__img"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </Link>

        {hasDiscount && (
          <span className="dfv-pc__badge">-{Math.round(discountNum)}% OFF</span>
        )}

        {!product.inStock && <span className="dfv-pc__soldout">AGOTADO</span>}

        {canAdd && (
          <button
            type="button"
            className="dfv-pc__add"
            aria-label={`Agregar ${product.name} al carrito`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
          >
            <Plus size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <Link to={`/producto/${product.id}`} className="dfv-pc__name">
        {product.name}
      </Link>

      <div className="dfv-pc__prices">
        {hasOldPrice && (
          <span className="dfv-pc__old">${Number(product.oldPrice).toLocaleString()}</span>
        )}
        <span className="dfv-pc__price">${Number(product.price).toLocaleString()}</span>
      </div>

      <style>{`
        .dfv-pc {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
          height: 100%;
          background: transparent;
          border: 0;
          box-shadow: none;
          padding-bottom: 32px;
          text-align: center;
        }
        .dfv-pc__media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
        }
        .dfv-pc__link {
          display: block;
          width: 100%;
          height: 100%;
        }
        .dfv-pc__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .dfv-pc__badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 3;
          background: #e8321e;
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 7px 12px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .dfv-pc__soldout {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 3;
          background: #1a1a1a;
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 6px 10px;
          border-radius: 999px;
        }
        .dfv-pc__add {
          position: absolute;
          right: 8px;
          bottom: 8px;
          z-index: 3;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          padding: 0;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .dfv-pc__add:hover,
        .dfv-pc__add:focus-visible {
          background: #f7f7f7;
          border-color: #1a1a1a;
          outline: none;
        }
        .dfv-pc__add:active { transform: scale(0.96); }
        .dfv-pc__name {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-top: 16px;
          font-family: 'Archivo', 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.4;
          color: #1a1a1a;
          text-align: center;
          text-decoration: none;
          overflow-wrap: anywhere;
          min-height: 2.8em;
        }
        .dfv-pc__name:hover { text-decoration: underline; text-underline-offset: 3px; }
        .dfv-pc__prices {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          font-family: 'Montserrat', sans-serif;
          white-space: nowrap;
        }
        .dfv-pc__price {
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: #1a1a1a;
        }
        .dfv-pc__old {
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #8a8a8a;
          text-decoration: line-through;
        }
        @media (max-width: 400px) {
          .dfv-pc__price { font-size: 17px; }
          .dfv-pc__old { font-size: 14px; }
        }
      `}</style>
    </article>
  );
};

export default ProductCardV2;


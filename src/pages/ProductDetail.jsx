import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/mockProducts';
import { useShop } from '../context/ShopContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleFavorite, isFavorite } = useShop();
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fake array of images for the gallery
  const productImages = [product?.image, product?.image, product?.image];

  if (!product) return <div className="container section-padding text-center">Producto no encontrado</div>;

  const nextImage = () => setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  return (
    <div className="container section-padding">
      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
        
        {/* Left: Image Gallery */}
        <div className="product-image-container" style={{ position: 'relative' }}>
          <div style={{ backgroundColor: 'var(--color-cream)', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
            <img src={productImages[currentImageIndex]} alt={product.name} className="product-image" style={{ width: '100%', height: '100%', maxHeight: '500px', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={prevImage} style={{ padding: '0.5rem' }}><ChevronLeft size={20} /></button>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-gray)' }}>{currentImageIndex + 1} / {productImages.length}</span>
            <button onClick={nextImage} style={{ padding: '0.5rem' }}><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gray)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {product.brand}
          </p>
          <h1 className="title-medium" style={{ marginBottom: '1rem' }}>{product.name}</h1>
          <p style={{ color: 'var(--color-gray)', marginBottom: '2rem' }}>⭐⭐⭐⭐⭐ 4.9 | 25 reseñas</p>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '500' }}>${product.price}</span>
            {product.oldPrice && (
              <span style={{ textDecoration: 'line-through', color: 'var(--color-gray)', fontSize: '1.1rem' }}>
                ${product.oldPrice}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ marginBottom: '1rem', fontWeight: '500' }}>Tamaño</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    border: `1px solid ${selectedSize === size ? 'var(--color-black)' : 'var(--color-gray-light)'}`,
                    backgroundColor: selectedSize === size ? 'var(--color-black)' : 'transparent',
                    color: selectedSize === size ? 'var(--color-white)' : 'var(--color-black)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <p style={{ color: 'green', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'green', display: 'inline-block' }}></span>
              Disponible
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-gray-light)', padding: '0.5rem 1rem' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={18} /></button>
              <span style={{ margin: '0 1.5rem', fontWeight: '500' }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}><Plus size={18} /></button>
            </div>
            <button className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={handleAddToCart}>
              <ShoppingBag size={18} /> AGREGAR AL CARRITO
            </button>
          </div>

          <button 
            onClick={() => toggleFavorite(product)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isFavorite(product.id) ? 'var(--color-gold)' : 'var(--color-gray)', marginBottom: '3rem', fontWeight: '500' }}
          >
            <Heart size={20} fill={isFavorite(product.id) ? 'var(--color-gold)' : 'none'} /> 
            {isFavorite(product.id) ? 'EN FAVORITOS' : 'AGREGAR A FAVORITOS'}
          </button>

          <div style={{ borderTop: '1px solid var(--color-gray-light)', paddingTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Descripción</h4>
            <p style={{ color: 'var(--color-gray)', lineHeight: '1.8' }}>{product.description}</p>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <p><strong>Familia olfativa:</strong> {product.family}</p>
            <p><strong>Concentración:</strong> {product.concentration}</p>
            <p><strong>Notas de salida:</strong> {product.notes.top}</p>
            <p><strong>Notas de corazón:</strong> {product.notes.heart}</p>
            <p><strong>Notas de fondo:</strong> {product.notes.base}</p>
          </div>

        </div>
      </div>

      {/* Relacionados */}
      <div style={{ marginTop: '5rem' }}>
        <h3 className="title-medium text-center" style={{ marginBottom: '2rem' }}>También te puede gustar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
          {products.slice(0, 4).map(p => (
            <Link key={p.id} to={`/producto/${p.id}`} style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-cream)', marginBottom: '1rem', overflow: 'hidden', borderRadius: '8px' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>{p.brand}</p>
              <h4 style={{ fontSize: '1rem' }}>{p.name}</h4>
              <p>${p.price}</p>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .product-grid { gap: 2rem !important; }
          .product-image { max-height: 350px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;

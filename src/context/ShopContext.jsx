import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('perfume_cart');
    const savedFavs = localStorage.getItem('perfume_favs');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  // Fetch products and categories from Neon DB via API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resP, resC] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        if (resP.ok) {
          const data = await resP.json();
          setProducts(data);
          const uniqueBrands = [...new Set(data.map(p => p.brand))];
          setBrands(uniqueBrands);
        }
        if (resC.ok) {
          const data = await resC.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchData();
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('perfume_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('perfume_favs', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product, quantity = 1, size) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId, size, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === size) {
        const newQty = item.quantity + amount;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const isFav = prev.some(item => item.id === product.id);
      if (isFav) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      products, brands, categories, isLoadingProducts,
      cart, favorites, isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQuantity, toggleFavorite, isFavorite,
      cartTotal, cartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [allProducts, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Storefront only shows active products; admin uses allProducts
  const products = allProducts.filter(p => p.active !== false);

  const refreshProducts = async () => {
    const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo recargar los productos');
    const data = await res.json();
    setProducts(data);
    setBrands([...new Set(data.map(p => p.brand))]);
    try { localStorage.setItem('perfume_products_cache', JSON.stringify(data)); } catch (e) {}
    return data;
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo recargar las categorías');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        try { localStorage.setItem('perfume_categories_cache', JSON.stringify(data.data)); } catch (e) {}
        return data.data;
      }
    } catch (e) {
      console.error('Error al refrescar categorías:', e);
    }
    return [];
  };

  const [brands, setBrands] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return [...new Set(parsed.map(p => p.brand))];
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_categories_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [isLoadingProducts, setIsLoadingProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_products_cache');
      return !cached;
    } catch (e) {
      return true;
    }
  });
  const [isFresh, setIsFresh] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('perfume_cart');
    const savedFavs = localStorage.getItem('perfume_favs');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  // Fetch products and categories from Neon DB via API
  useEffect(() => {
    const fetchData = async (retries = 2) => {
      try {
        // Reuse the request started in index.html (if any); otherwise fetch normally.
        const early = window.__early;
        window.__early = null;
        const [earlyP, earlyC] = early ? await Promise.all([early.products, early.categories]) : [null, null];
        const [resP, resC] = await Promise.all([
          earlyP || fetch('/api/products'),
          earlyC || fetch('/api/categories')
        ]);
        
        if (resP.ok) {
          const data = await resP.json();
          setProducts(data);
          try {
            localStorage.setItem('perfume_products_cache', JSON.stringify(data));
          } catch (e) {}
          const uniqueBrands = [...new Set(data.map(p => p.brand))];
          setBrands(uniqueBrands);
        } else {
          console.error("Products API returned status:", resP.status);
          if (retries > 0) {
            console.log("Retrying fetch...");
            setTimeout(() => fetchData(retries - 1), 1000);
            return;
          }
        }
        
        if (resC.ok) {
          const data = await resC.json();
          if (data.success) {
            setCategories(data.data);
            try {
              localStorage.setItem('perfume_categories_cache', JSON.stringify(data.data));
            } catch (e) {}
          }
        }
        // If we reach here successfully
        setIsLoadingProducts(false);
        setIsFresh(true);
      } catch (err) {
        console.error("Failed to fetch data", err);
        if (retries > 0) {
          console.log("Retrying fetch...");
          setTimeout(() => fetchData(retries - 1), 1000);
        } else {
          setIsLoadingProducts(false);
          setIsFresh(true);
        }
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

  const clearCart = () => setCart([]);

  return (
    <ShopContext.Provider value={{
      products, allProducts, refreshProducts, brands, categories, refreshCategories, isLoadingProducts, isFresh,
      cart, favorites, isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQuantity, toggleFavorite, isFavorite, clearCart,
      cartTotal, cartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

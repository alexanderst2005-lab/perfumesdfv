import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { optimizeImg, prefetchImg, notifyStoreSync } from '../utils/img';
import initialSnapshot from '../data/initialSnapshot.json';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [allProducts, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return Array.isArray(initialSnapshot?.products) ? initialSnapshot.products : [];
  });

  // Storefront only shows active products; admin uses allProducts
  const products = allProducts.filter(p => p.active !== false);

  const upsertProductLocal = useCallback((prod) => {
    if (!prod || !prod.id) return;
    if (prod.image) {
      prefetchImg(prod.image, 200);
      prefetchImg(prod.image, 800);
    }
    if (Array.isArray(prod.images)) {
      prod.images.forEach(img => {
        if (img) {
          prefetchImg(img, 200);
          prefetchImg(img, 800);
        }
      });
    }
    setProducts(prev => {
      const idx = prev.findIndex(item => String(item.id) === String(prod.id));
      const next = idx >= 0
        ? prev.map((item, i) => (i === idx ? { ...item, ...prod } : item))
        : [prod, ...prev];
      try { localStorage.setItem('perfume_products_cache', JSON.stringify(next)); } catch { }
      setBrands([...new Set(next.map(p => p.brand).filter(Boolean))]);
      return next;
    });
    notifyStoreSync('products', prod);
  }, []);

  const removeProductLocal = useCallback((id) => {
    setProducts(prev => {
      const next = prev.filter(item => String(item.id) !== String(id));
      try { localStorage.setItem('perfume_products_cache', JSON.stringify(next)); } catch { }
      setBrands([...new Set(next.map(p => p.brand).filter(Boolean))]);
      return next;
    });
    notifyStoreSync('products', { id, deleted: true });
  }, []);

  const refreshProducts = async () => {
    const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo recargar los productos');
    const data = await res.json();
    if (Array.isArray(data)) {
      setProducts(prev => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
      setBrands([...new Set(data.map(p => p.brand).filter(Boolean))]);
      try { localStorage.setItem('perfume_products_cache', JSON.stringify(data)); } catch (e) { }
    }
    return data;
  };

  const refreshCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo recargar las categorías');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
        try { localStorage.setItem('perfume_categories_cache', JSON.stringify(data.data)); } catch (e) { }
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...new Set(parsed.map(p => p.brand).filter(Boolean))];
        }
      }
    } catch (e) { }
    const snap = Array.isArray(initialSnapshot?.products) ? initialSnapshot.products : [];
    return [...new Set(snap.map(p => p.brand).filter(Boolean))];
  });

  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_categories_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return Array.isArray(initialSnapshot?.categories) ? initialSnapshot.categories : [];
  });

  const [isLoadingProducts, setIsLoadingProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('perfume_products_cache');
      if (cached) return false;
    } catch (e) { }
    return !(Array.isArray(initialSnapshot?.products) && initialSnapshot.products.length > 0);
  });
  const [isFresh, setIsFresh] = useState(false);

  // ── Campañas promocionales activas ──────────────────────────────────────
  const [activeCampaigns, setActiveCampaigns] = useState(() => {
    try {
      const cached = localStorage.getItem('dfv_active_campaigns');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const DEFAULT_CHANNELS = {
    email: 'info@dfvperfumes.com',
    instagram: 'https://www.instagram.com/perfumesdfv',
    facebook: 'https://www.facebook.com/perfumesdfv',
    tiktok: 'https://www.tiktok.com/@perfumesdfv',
    sede1_name: 'Sede Calle 31 · Centro',
    sede1_phone: '573206970036',
    sede2_name: 'Sede C.C. Llanogrande',
    sede2_phone: '573208627036',
    floating_mode: 'random',
    floating_phone: '573027642208',
    ...(initialSnapshot?.channels || {})
  };

  const [channels, setChannels] = useState(() => {
    try {
      const cached = localStorage.getItem('dfv_channels_cache');
      return cached ? JSON.parse(cached) : DEFAULT_CHANNELS;
    } catch {
      return DEFAULT_CHANNELS;
    }
  });

  const refreshChannels = useCallback(async () => {
    try {
      const res = await fetch(`/api/contact-channels?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return DEFAULT_CHANNELS;
      const data = await res.json();
      if (data && data.success && data.channels) {
        const next = { ...DEFAULT_CHANNELS, ...data.channels };
        setChannels(next);
        try { localStorage.setItem('dfv_channels_cache', JSON.stringify(next)); } catch {}
        return next;
      }
    } catch (e) {
      console.error('Error cargando canales de contacto:', e);
    }
    return DEFAULT_CHANNELS;
  }, []);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  const getRandomWhatsApp = useCallback((config = channels) => {
    const ch = config || channels || DEFAULT_CHANNELS;
    const phone1 = (ch.sede1_phone || '').replace(/[^0-9]/g, '');
    const phone2 = (ch.sede2_phone || '').replace(/[^0-9]/g, '');
    const list = [phone1, phone2].filter(Boolean);
    if (list.length === 0) return '573027642208';
    if (list.length === 1) return list[0];
    return list[Math.floor(Math.random() * list.length)];
  }, [channels]);

  const getFloatingWhatsApp = useCallback((config = channels) => {
    const ch = config || channels || DEFAULT_CHANNELS;
    if (ch.floating_mode === 'sede1' && ch.sede1_phone) return ch.sede1_phone.replace(/[^0-9]/g, '');
    if (ch.floating_mode === 'sede2' && ch.sede2_phone) return ch.sede2_phone.replace(/[^0-9]/g, '');
    if (ch.floating_mode === 'custom' && ch.floating_phone) return ch.floating_phone.replace(/[^0-9]/g, '');
    return getRandomWhatsApp(ch);
  }, [channels, getRandomWhatsApp]);

  const refreshCampaigns = useCallback(async (earlyCampPromise = null) => {
    try {
      const earlyRes = earlyCampPromise ? await earlyCampPromise : null;
      const res = earlyRes || await fetch(`/api/promo-campaigns?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Pre-cargar en memoria la imagen de la campaña activa para que el popup abra con foto e info al instante
        data.data.forEach(c => {
          if (c && c.image) {
            const img = new Image();
            img.src = c.image;
          }
        });
        setActiveCampaigns(data.data);
        try { localStorage.setItem('dfv_active_campaigns', JSON.stringify(data.data)); } catch { }
        return data.data;
      }
    } catch (e) {
      console.error('Error al cargar campañas:', e);
    }
    return [];
  }, []);

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
        // Cargar campañas activas en paralelo desde el primer milisegundo
        refreshCampaigns(early?.campaigns);
        const [earlyP, earlyC] = early ? await Promise.all([early.products, early.categories]) : [null, null];
        const [resP, resC] = await Promise.all([
          earlyP || fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' }),
          earlyC || fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        if (resP.ok) {
          const data = await resP.json();
          setProducts(data);
          try {
            localStorage.setItem('perfume_products_cache', JSON.stringify(data));
          } catch (e) { }
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
            } catch (e) { }
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

    // Sincronización instantánea entre pestañas (/admin -> tienda) vía BroadcastChannel, storage y foco
    const syncFromCacheOrNetwork = (msg) => {
      try {
        const cached = localStorage.getItem('perfume_products_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setProducts(prev => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
            setBrands([...new Set(parsed.map(p => p.brand).filter(Boolean))]);
          }
        }
      } catch {}
      if (msg?.payload?.image) {
        prefetchImg(msg.payload.image, 800);
      }
      refreshProducts().catch(() => {});
      refreshCategories().catch(() => {});
      refreshChannels().catch(() => {});
    };

    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('dfv_sync');
        bc.onmessage = (ev) => syncFromCacheOrNetwork(ev.data);
      }
    } catch {}

    const handleStorage = (e) => {
      if (!e.key || e.key === 'perfume_products_cache' || e.key === 'dfv_last_sync') {
        syncFromCacheOrNetwork();
      }
    };

    let lastFocusRefresh = Date.now();
    const handleFocus = () => {
      if (Date.now() - lastFocusRefresh < 2500) return;
      lastFocusRefresh = Date.now();
      refreshProducts().catch(() => { });
      refreshCategories().catch(() => { });
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleFocus();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (bc) { try { bc.close(); } catch {} }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Precarga en segundo plano TODAS las fotos del catálogo en bloques rápidos para que paginar en /tienda sea instantáneo (0ms)
  useEffect(() => {
    if (!allProducts.length) return;
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;
    const activeList = allProducts.filter(p => p.active !== false && typeof p.image === 'string' && p.image.includes('/image/upload/'));
    const priorityProducts = [
      ...activeList.filter(p => p.isMostWanted),
      ...activeList.filter(p => p.discount && Number(p.discount) > 0),
      ...activeList
    ];
    const uniqueUrls = [...new Set(priorityProducts.map(p => p.image))];
    let cancelled = false;
    let i = 0;
    const next = () => {
      if (cancelled || i >= uniqueUrls.length) return;
      uniqueUrls.slice(i, i + 12).forEach(u => prefetchImg(u, 800));
      i += 12;
      if (i < uniqueUrls.length) {
        setTimeout(next, 35);
      }
    };
    next();
    return () => { cancelled = true; };
  }, [allProducts]);

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
      products, allProducts, setProducts, upsertProductLocal, removeProductLocal, refreshProducts, brands, categories, refreshCategories, isLoadingProducts, isFresh,
      activeCampaigns, refreshCampaigns,
      channels, setChannels, refreshChannels, getRandomWhatsApp, getFloatingWhatsApp,
      cart, favorites, isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQuantity, toggleFavorite, isFavorite, clearCart,
      cartTotal, cartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

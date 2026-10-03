export const products = [
  {
    id: '1',
    name: 'Khamrah',
    brand: 'Lattafa',
    category: 'Unisex',
    family: 'Oriental Vainilla',
    price: 185000,
    oldPrice: 220000,
    discount: 15,
    sizes: ['100 ml'],
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600&auto=format&fit=crop',
    description: 'Khamrah es una fragancia oriental amaderada y dulce que cautiva con sus ricas notas de praliné, vainilla y especias cálidas. Una verdadera joya de Lattafa que evoca lujo y sofisticación.',
    notes: {
      top: 'Canela, Nuez moscada, Bergamota',
      heart: 'Dátiles, Praliné, Nardos, Mahonial',
      base: 'Vainilla, Haba tonka, Madera de ámbar, Mirra'
    },
    concentration: 'Eau de Parfum',
    inStock: true,
    isNew: true,
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Yara',
    brand: 'Lattafa',
    category: 'Mujer',
    family: 'Floral Frutal',
    price: 165000,
    sizes: ['100 ml'],
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop',
    description: 'Yara es una fragancia deliciosamente femenina, dulce y cremosa. Una explosión de fresas, orquídeas y vainilla suave que deja una estela encantadora e inolvidable.',
    notes: {
      top: 'Heliotropo, Orquídea, Mandarina',
      heart: 'Frutas tropicales, Acorde Gourmand',
      base: 'Vainilla, Sándalo, Almizcle'
    },
    concentration: 'Eau de Parfum',
    inStock: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: '3',
    name: 'Club de Nuit Intense Man',
    brand: 'Armaf',
    category: 'Hombre',
    family: 'Amaderado Especiado',
    price: 210000,
    sizes: ['105 ml', '200 ml'],
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
    description: 'Una fragancia masculina icónica, potente y ahumada. Abre con un estallido cítrico y se asienta en un corazón ahumado de abedul y pachulí, ideal para dejar huella.',
    notes: {
      top: 'Limón, Piña, Bergamota, Grosellas negras, Manzana',
      heart: 'Abedul, Jazmín, Rosa',
      base: 'Almizcle, Ámbar gris, Pachulí, Vainilla'
    },
    concentration: 'Eau de Toilette',
    inStock: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: '4',
    name: 'Asad',
    brand: 'Lattafa',
    category: 'Hombre',
    family: 'Oriental Especiado',
    price: 155000,
    oldPrice: 180000,
    discount: 14,
    sizes: ['100 ml'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
    description: 'Lattafa Asad es una fragancia ambarina especiada con un carácter intenso, cálido y seductor. Perfecto para el hombre moderno que busca elegancia con un toque exótico.',
    notes: {
      top: 'Pimienta negra, Piña, Tabaco',
      heart: 'Café, Pachulí, Iris',
      base: 'Ámbar, Vainilla, Maderas secas, Benjuí'
    },
    concentration: 'Eau de Parfum',
    inStock: true,
    isNew: true,
    isBestSeller: false
  }
];

export const brands = [
  'Lattafa', 'Armaf', 'Maison Alhambra', 'Afnan', 'Rasasi', 'Swiss Arabian', 'Fragrance World'
];

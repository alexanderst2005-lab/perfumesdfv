export const products = [
  {
    id: '1',
    name: 'Oud Wood Intense',
    brand: 'Tom Ford',
    category: 'Unisex',
    family: 'Amaderado',
    price: 350,
    oldPrice: 400,
    discount: 12.5,
    sizes: ['50 ml', '100 ml'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
    description: 'Una fragancia intensa y exótica que captura la esencia pura de la madera de oud.',
    notes: {
      top: 'Pimienta rosa, Cardamomo',
      heart: 'Madera de Oud, Sándalo, Vetiver',
      base: 'Haba tonka, Vainilla, Ámbar'
    },
    concentration: 'Eau de Parfum',
    inStock: true,
    isNew: true,
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    category: 'Unisex',
    family: 'Floral',
    price: 450,
    sizes: ['70 ml', '200 ml'],
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=600&auto=format&fit=crop',
    description: 'Luminoso y sofisticado, Baccarat Rouge 540 se posa en la piel como un soplo floral y amaderado.',
    notes: {
      top: 'Jazmín, Azafrán',
      heart: 'Madera de cedro',
      base: 'Ámbar gris'
    },
    concentration: 'Eau de Parfum',
    inStock: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: '3',
    name: 'Sauvage Elixir',
    brand: 'Dior',
    category: 'Hombre',
    family: 'Fresco',
    price: 180,
    sizes: ['60 ml', '100 ml'],
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop',
    description: 'Una fragancia concentrada extraída de la frescura extrema con un corazón especiado cálido.',
    notes: {
      top: 'Pomelo, Especias',
      heart: 'Lavanda',
      base: 'Maderas ricas, Pachulí'
    },
    concentration: 'Elixir',
    inStock: true,
    isNew: false,
    isBestSeller: true
  },
  {
    id: '4',
    name: 'Libre Intense',
    brand: 'YSL',
    category: 'Mujer',
    family: 'Oriental',
    price: 160,
    oldPrice: 190,
    discount: 15,
    sizes: ['50 ml', '90 ml'],
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop',
    description: 'La fragancia de la libertad, audaz y floral, para la mujer que vive según sus propias reglas.',
    notes: {
      top: 'Mandarina, Lavanda',
      heart: 'Jazmín, Orquídea',
      base: 'Vainilla, Haba Tonka, Ámbar gris'
    },
    concentration: 'Eau de Parfum Intense',
    inStock: true,
    isNew: true,
    isBestSeller: false
  }
];

export const brands = [
  'Dior', 'Chanel', 'Tom Ford', 'YSL', 'Maison Francis Kurkdjian', 'Creed', 'Byredo', 'Jo Malone'
];

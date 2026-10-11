// Configuración manual y modular de Instagram Reels para DFV Perfumes
// Permite modificar URLs, portadas/miniaturas, títulos y estado sin reconstruir la sección.
// Enlace oficial de la cuenta: https://www.instagram.com/perfumesdfv

export const INSTAGRAM_ACCOUNT = {
  handle: '@perfumesdfv',
  profileUrl: 'https://www.instagram.com/perfumesdfv',
  displayName: 'DFV Perfumes'
};

export const INSTAGRAM_REELS_DATA = [
  {
    id: 'reel-1',
    title: 'Colección Exclusiva de Lujo',
    category: 'Presentación',
    reelUrl: 'https://www.instagram.com/perfumesdfv/reels/',
    // Imagen de portada elegante en proporción 9:16 con tonos acordes a DFV
    thumbnailUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=700&auto=format&fit=crop',
    duration: '0:35',
    active: true,
    order: 1
  },
  {
    id: 'reel-2',
    title: 'Fragancias Árabes & Maderas Exóticas',
    category: 'Novedades',
    reelUrl: 'https://www.instagram.com/perfumesdfv/reels/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=700&auto=format&fit=crop',
    duration: '0:42',
    active: true,
    order: 2
  },
  {
    id: 'reel-3',
    title: 'Unboxing & Empaque Premium',
    category: 'Experiencia DFV',
    reelUrl: 'https://www.instagram.com/perfumesdfv/reels/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=700&auto=format&fit=crop',
    duration: '0:28',
    active: true,
    order: 3
  },
  {
    id: 'reel-4',
    title: 'Guía de Selección: ¿Cuál va con tu estilo?',
    category: 'Asesoría',
    reelUrl: 'https://www.instagram.com/perfumesdfv/reels/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=700&auto=format&fit=crop',
    duration: '0:50',
    active: true,
    order: 4
  }
];

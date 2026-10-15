import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // No caching: admin edits must be reflected immediately
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    // Fetch all products from the database
    const rows = await sql`SELECT * FROM products ORDER BY id ASC`;
    
    // Map the snake_case database columns back to camelCase for the frontend
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      category: row.category,
      family: row.family,
      price: row.price,
      oldPrice: row.old_price,
      discount: row.discount,
      sizes: row.sizes,
      image: row.image,
      images: row.images || [],
      description: row.description,
      occasion: row.occasion,
      notes: row.notes,
      concentration: row.concentration,
      inStock: row.in_stock,
      stockCount: row.stock_count,
      active: row.active !== false,
      isNew: row.is_new,
      isBestSeller: row.is_best_seller
    }));

    return res.status(200).json(products);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
}

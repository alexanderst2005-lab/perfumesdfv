import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Always disable cache so any edits in the admin panel reflect immediately everywhere
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const sql = neon(process.env.DATABASE_URL);

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // Admin writes routed here or normal GET
  if (req.method === 'GET') {
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT ''`.catch(() => {});
      const rows = await sql`
        SELECT 
          p.*,
          c.name AS category_table_name,
          c.id AS category_table_id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id ASC
      `;

      const products = rows.map(row => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category_table_name || row.category,
        categoryId: row.category_id || row.category_table_id || null,
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
        isBestSeller: row.is_best_seller,
        isMostWanted: row.is_most_wanted === true,
        tag: row.tag || null
      }));

      return res.status(200).json(products);
    } catch (error) {
      console.error('Fetch Products Error:', error);
      return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

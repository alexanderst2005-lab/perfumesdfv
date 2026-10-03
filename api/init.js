import { neon } from '@neondatabase/serverless';
import { products as mockProducts } from '../src/data/mockProducts.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // 1. Create the products table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        family VARCHAR(100),
        price INTEGER NOT NULL,
        old_price INTEGER,
        discount INTEGER,
        sizes JSONB,
        image TEXT,
        description TEXT,
        notes JSONB,
        concentration VARCHAR(50),
        in_stock BOOLEAN DEFAULT true,
        is_new BOOLEAN DEFAULT false,
        is_best_seller BOOLEAN DEFAULT false
      );
    `;

    // 2. Check if the table is empty
    const countResult = await sql`SELECT COUNT(*) FROM products`;
    const count = parseInt(countResult[0].count, 10);

    let inserted = 0;

    // 3. If empty, insert mock data
    if (count === 0) {
      for (const p of mockProducts) {
        await sql`
          INSERT INTO products (
            id, name, brand, category, family, price, old_price, discount, sizes,
            image, description, notes, concentration, in_stock, is_new, is_best_seller
          ) VALUES (
            ${p.id}, ${p.name}, ${p.brand}, ${p.category}, ${p.family}, ${p.price},
            ${p.oldPrice || null}, ${p.discount || null}, ${JSON.stringify(p.sizes || [])},
            ${p.image}, ${p.description}, ${JSON.stringify(p.notes || {})}, ${p.concentration},
            ${p.inStock}, ${p.isNew}, ${p.isBestSeller}
          )
        `;
        inserted++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully', 
      table_created: true,
      records_inserted: inserted
    });

  } catch (error) {
    console.error('Database Init Error:', error);
    return res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
}

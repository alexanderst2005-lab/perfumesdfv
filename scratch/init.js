import { neon } from '@neondatabase/serverless';
import { products as mockProducts } from '../src/data/mockProducts.js';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // 1. PRODUCTS
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
        stock_count INTEGER DEFAULT 10,
        is_new BOOLEAN DEFAULT false,
        is_best_seller BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true
      );
    `;

    // 2. MEDIA LIBRARY
    await sql`
      CREATE TABLE IF NOT EXISTS media_library (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. ORDERS
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_email VARCHAR(255),
        customer_city VARCHAR(100),
        customer_address TEXT,
        customer_notes TEXT,
        subtotal INTEGER,
        discount INTEGER DEFAULT 0,
        total INTEGER,
        status VARCHAR(50) DEFAULT 'NUEVO',
        history JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. ORDER ITEMS
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id),
        product_id VARCHAR(50),
        product_name VARCHAR(255),
        brand VARCHAR(100),
        image TEXT,
        quantity INTEGER,
        price INTEGER,
        subtotal INTEGER
      );
    `;

    // 5. CUSTOMERS
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255) UNIQUE,
        city VARCHAR(100),
        total_orders INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        last_order_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. CAMPAIGNS (Hero)
    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        button_text VARCHAR(100),
        button_link VARCHAR(255),
        image_desktop TEXT,
        image_mobile TEXT,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
      );
    `;

    // 7. FAQ
    await sql`
      CREATE TABLE IF NOT EXISTS faq (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
      );
    `;

    // 8. STORES (Sedes)
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        address TEXT,
        image TEXT,
        hours_morning VARCHAR(100),
        hours_afternoon VARCHAR(100),
        map_link TEXT,
        active BOOLEAN DEFAULT true
      );
    `;

    // 9. SETTINGS (Configuración General)
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY,
        brand_name VARCHAR(255) DEFAULT 'DFV PERFUMES',
        logo_url TEXT,
        favicon_url TEXT,
        whatsapp_number VARCHAR(50),
        email VARCHAR(255),
        instagram_url TEXT,
        facebook_url TEXT,
        tiktok_url TEXT
      );
    `;

    // 10. Check if products table is empty and insert mock data
    const countResult = await sql`SELECT COUNT(*) FROM products`;
    const count = parseInt(countResult[0].count, 10);

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
      }
    }

    // Insert Default Settings if empty
    const settingsCount = await sql`SELECT COUNT(*) FROM settings`;
    if (parseInt(settingsCount[0].count, 10) === 0) {
      await sql`
        INSERT INTO settings (id, brand_name, whatsapp_number, instagram_url) 
        VALUES ('default', 'DFV PERFUMES', '+573000000000', 'https://instagram.com')
      `;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'All CMS tables initialized successfully!'
    });

  } catch (error) {
    console.error('Database Init Error:', error);
    return res.status(500).json({ error: 'Failed to initialize database schemas', details: error.message });
  }
}

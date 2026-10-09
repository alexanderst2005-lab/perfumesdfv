const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255),
        customer_city VARCHAR(100),
        customer_address TEXT,
        customer_notes TEXT,
        payment_method VARCHAR(50),
        total INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'NUEVO',
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Orders table created successfully');
  } catch (error) {
    console.error('Error creating orders table:', error);
  }
}
main();

const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const tableExists = await sql`SELECT to_regclass('public.categories');`;
    console.log('Table Exists:', tableExists);

    await sql`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, count INTEGER DEFAULT 0)`;
    
    await sql`INSERT INTO categories (name) VALUES ('Hombre'), ('Mujer'), ('Unisex'), ('Nichos') ON CONFLICT DO NOTHING`;
    
    const cats = await sql`SELECT * FROM categories`;
    console.log('Categories:', cats);
  } catch(e) {
    console.error(e);
  }
}
main();

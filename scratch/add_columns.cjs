const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`;
    console.log('Success adding stock_count and active');
  } catch(e) {
    console.error('DB ERROR:', e.message);
  }
}
main();

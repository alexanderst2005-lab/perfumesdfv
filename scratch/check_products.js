const { neon } = require('@neondatabase/serverless');

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const products = await sql`SELECT COUNT(*) FROM products`;
    console.log('Products:', products[0].count);
  } catch (e) {
    console.error(e);
  }
}
check();

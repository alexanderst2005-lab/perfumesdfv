const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function main() {
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSON DEFAULT '[]'::json`;
    console.log('Success altering table');
  } catch(e) {
    console.error(e);
  }
}
main();

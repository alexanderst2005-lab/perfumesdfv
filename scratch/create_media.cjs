
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS media_library (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Success creating media_library table');
  } catch(e) {
    console.error(e);
  }
}

main();

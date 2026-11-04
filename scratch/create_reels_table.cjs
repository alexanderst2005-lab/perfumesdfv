const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS reels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table reels created successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

main();

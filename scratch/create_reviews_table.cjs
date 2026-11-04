const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      city VARCHAR(255),
      comment TEXT,
      rating INTEGER DEFAULT 5,
      image_url TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log('Table reviews created successfully');
}

main().catch(e => { console.error(e); process.exit(1); });

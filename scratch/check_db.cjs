const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function main() {
  const reels = await sql`SELECT * FROM reels`;
  console.log('REELS_COUNT:', reels.length);
  console.log('REELS:', JSON.stringify(reels, null, 2));
}

main().catch(console.error);

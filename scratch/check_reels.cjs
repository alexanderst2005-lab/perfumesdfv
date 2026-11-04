const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function main() {
  const rows = await sql`SELECT * FROM reels`;
  console.log(JSON.stringify(rows, null, 2));
}
main();

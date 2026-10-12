const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_mqA9nyzVg0rj@ep-tiny-smoke-b5u2hnf5-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function main() {
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion VARCHAR(255)`;
    console.log('SUCCESS: Column occasion added to products table.');
  } catch(e) {
    console.error('ERROR:', e);
  }
}

main();

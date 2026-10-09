const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS customer_cedula VARCHAR(50),
      ADD COLUMN IF NOT EXISTS customer_departamento VARCHAR(100),
      ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100)
    `;
    console.log('Orders table altered successfully');
  } catch (error) {
    console.error('Error altering orders table:', error);
  }
}
main();

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    const rows = await sql`SELECT * FROM reviews WHERE active = true ORDER BY created_at DESC`;
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
}

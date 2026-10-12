import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT * FROM reels 
        WHERE active = true 
        ORDER BY id DESC
      `;
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Fetch Reels Error:', error);
      return res.status(500).json({ error: 'Failed to fetch reels', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

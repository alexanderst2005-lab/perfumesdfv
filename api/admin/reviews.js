import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, city = '', comment = '', rating = 5, image_url = '', active = true } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
      if (!comment.trim() && !image_url) {
        return res.status(400).json({ error: 'Comment or image is required' });
      }
      const safeRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
      const result = await sql`
        INSERT INTO reviews (name, city, comment, rating, image_url, active)
        VALUES (${name.trim()}, ${city.trim()}, ${comment.trim()}, ${safeRating}, ${image_url}, ${active})
        RETURNING *
      `;
      return res.status(201).json({ success: true, review: result[0] });
    }

    if (req.method === 'PUT') {
      const { id, active } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });
      const result = await sql`
        UPDATE reviews SET active = COALESCE(${active}, active) WHERE id = ${id} RETURNING *
      `;
      return res.status(200).json({ success: true, review: result[0] });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Admin Reviews Error:', error);
    return res.status(500).json({ error: 'Reviews operation failed', details: error.message });
  }
}

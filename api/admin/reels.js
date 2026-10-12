import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM reels ORDER BY id DESC`;
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Admin Fetch Reels Error:', error);
      return res.status(500).json({ error: 'Failed to fetch reels', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title = '', video_url, thumbnail_url = '', active = true } = req.body;
      if (!video_url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      const result = await sql`
        INSERT INTO reels (title, video_url, thumbnail_url, active)
        VALUES (${title}, ${video_url}, ${thumbnail_url}, ${active})
        RETURNING *
      `;

      return res.status(201).json({ success: true, reel: result[0] });
    } catch (error) {
      console.error('Create Reel Error:', error);
      return res.status(500).json({ error: 'Failed to create reel', details: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, video_url, thumbnail_url, active } = req.body;
      if (!id) return res.status(400).json({ error: 'Reel ID is required' });

      const result = await sql`
        UPDATE reels SET
          title = COALESCE(${title}, title),
          video_url = COALESCE(${video_url}, video_url),
          thumbnail_url = COALESCE(${thumbnail_url}, thumbnail_url),
          active = COALESCE(${active}, active)
        WHERE id = ${id}
        RETURNING *
      `;

      return res.status(200).json({ success: true, reel: result[0] });
    } catch (error) {
      console.error('Update Reel Error:', error);
      return res.status(500).json({ error: 'Failed to update reel', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Reel ID is required' });

      await sql`DELETE FROM reels WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete Reel Error:', error);
      return res.status(500).json({ error: 'Failed to delete reel', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

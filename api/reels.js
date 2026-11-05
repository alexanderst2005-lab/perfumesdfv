import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const isAdmin = req.query && (req.query.admin === 'true' || req.query.admin === '1');

  // GET: Si es admin, devuelve todos los reels; si es público, solo activos con cache
  if (req.method === 'GET') {
    try {
      if (isAdmin) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        const rows = await sql`SELECT * FROM reels ORDER BY id DESC`;
        return res.status(200).json(rows);
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400');
        const rows = await sql`SELECT * FROM reels WHERE active = true ORDER BY id DESC`;
        return res.status(200).json(rows);
      }
    } catch (error) {
      console.error('Fetch Reels Error:', error);
      return res.status(500).json({ error: 'Failed to fetch reels', details: error.message });
    }
  }

  // POST: Crear nuevo reel (admin)
  if (req.method === 'POST') {
    try {
      const { title = '', video_url, thumbnail_url = '', active = true } = body;
      if (!video_url) return res.status(400).json({ error: 'Video URL is required' });

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

  // PUT: Actualizar reel (admin)
  if (req.method === 'PUT') {
    try {
      const { id, title, video_url, thumbnail_url, active } = body;
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

  // DELETE: Eliminar reel (admin)
  if (req.method === 'DELETE') {
    try {
      const id = (body && body.id) || req.query.id;
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

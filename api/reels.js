import { neon } from '@neondatabase/serverless';
import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function resolveInstagramReelVideo(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const match = rawUrl.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match || !match[1]) return null;
  const shortcode = match[1];

  let directMp4 = null;

  // 1. Intentar obtener el MP4 directo vía redirección de kkinstagram
  try {
    const r1 = await fetch(`https://www.kkinstagram.com/reel/${shortcode}/`, {
      headers: { 'User-Agent': 'TelegramBot (like TwitterBot)' },
      redirect: 'manual'
    });
    const loc = r1.headers.get('location');
    if (loc && loc.includes('.mp4')) {
      directMp4 = loc;
    }
  } catch {}

  // 2. Respaldo vía vxinstagram OpenGraph
  if (!directMp4) {
    try {
      const r2 = await fetch(`https://www.vxinstagram.com/reel/${shortcode}/`, {
        headers: { 'User-Agent': 'TelegramBot (like TwitterBot)' }
      });
      const html = await r2.text();
      const m = html.match(/property="og:video"[^>]*content="([^"]+)"/) || html.match(/content="([^"]+)"[^>]*property="og:video"/);
      if (m && m[1]) {
        directMp4 = m[1].replace(/&amp;/g, '&');
      }
    } catch {}
  }

  // 3. Si encontramos MP4 directo y tenemos Cloudinary configurado, subirlo a nuestro Cloudinary CDN para que nunca caduque y reproduzca al instante
  if (directMp4 && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const uploaded = await cloudinary.uploader.upload(directMp4, {
        resource_type: 'video',
        folder: 'dfv_reels'
      });
      if (uploaded && uploaded.secure_url) {
        const thumbUrl = uploaded.secure_url
          .replace('/video/upload/', '/video/upload/so_1,w_600,h_1067,c_fill,q_auto,f_jpg/')
          .replace(/\.[^/.]+$/, '.jpg');
        return { videoUrl: uploaded.secure_url, thumbnailUrl: thumbUrl };
      }
    } catch (err) {
      console.error('Cloudinary IG upload fallback:', err.message);
    }
  }

  // 4. Si no se pudo subir a Cloudinary pero hay enlace de Instagram, normalizar la URL para que el reproductor embebido o directo funcione
  return {
    videoUrl: `https://www.instagram.com/reel/${shortcode}/`,
    thumbnailUrl: ''
  };
}

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
      let { title = '', video_url, thumbnail_url = '', active = true } = body;
      if (!video_url) return res.status(400).json({ error: 'Video URL is required' });

      // Si el usuario pegó un enlace de Instagram (reel / post), extraer el video automáticamente
      const igResolved = await resolveInstagramReelVideo(video_url);
      if (igResolved) {
        video_url = igResolved.videoUrl || video_url;
        if (!thumbnail_url && igResolved.thumbnailUrl) {
          thumbnail_url = igResolved.thumbnailUrl;
        }
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

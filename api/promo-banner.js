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

  // GET: Obtener banner activo para la tienda o para el panel admin
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT * FROM promo_banners ORDER BY id ASC LIMIT 1`;
      if (rows.length === 0) {
        return res.status(200).json({ success: true, banner: null });
      }
      return res.status(200).json({ success: true, banner: rows[0] });
    } catch (error) {
      console.error('Error fetching promo banner:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  // PUT: Actualizar banner desde el panel administrativo
  if (req.method === 'PUT') {
    try {
      const { title, subtitle, button_text, button_link, image, active } = body || {};

      const existing = await sql`SELECT id FROM promo_banners ORDER BY id ASC LIMIT 1`;
      let result;

      if (existing.length === 0) {
        result = await sql`
          INSERT INTO promo_banners (title, subtitle, button_text, button_link, image, active, updated_at)
          VALUES (
            ${title || 'ELEGANCIA QUE PERDURA'},
            ${subtitle || 'Descubre fragancias que definen tu presencia.'},
            ${button_text || 'COMPRAR AHORA'},
            ${button_link || '/tienda'},
            ${image || null},
            ${active !== false},
            NOW()
          ) RETURNING *
        `;
      } else {
        result = await sql`
          UPDATE promo_banners SET
            title = ${title || 'ELEGANCIA QUE PERDURA'},
            subtitle = ${subtitle || 'Descubre fragancias que definen tu presencia.'},
            button_text = ${button_text || 'COMPRAR AHORA'},
            button_link = ${button_link || '/tienda'},
            image = ${image !== undefined ? image : null},
            active = ${active !== false},
            updated_at = NOW()
          WHERE id = ${existing[0].id}
          RETURNING *
        `;
      }

      return res.status(200).json({ success: true, banner: result[0] });
    } catch (error) {
      console.error('Error updating promo banner:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}


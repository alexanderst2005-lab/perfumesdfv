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

  // GET: Obtener contadores ordenados
  if (req.method === 'GET') {
    try {
      const counters = await sql`
        SELECT * FROM site_counters ORDER BY sort_order ASC, id ASC
      `;
      return res.status(200).json({ success: true, counters });
    } catch (error) {
      console.error('Error fetching site counters:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  // PUT: Actualizar contadores desde el panel
  if (req.method === 'PUT') {
    try {
      const { counters } = body || {};
      if (!Array.isArray(counters)) {
        return res.status(400).json({ success: false, error: 'Formato inválido' });
      }

      for (const item of counters) {
        if (item.id) {
          await sql`
            UPDATE site_counters SET
              label = ${item.label || ''},
              value = ${parseInt(item.value, 10) || 0},
              prefix = ${item.prefix || ''},
              suffix = ${item.suffix || ''},
              active = ${item.active !== false},
              sort_order = ${item.sort_order || 0},
              updated_at = NOW()
            WHERE id = ${item.id}
          `;
        }
      }

      const updated = await sql`SELECT * FROM site_counters ORDER BY sort_order ASC, id ASC`;
      return res.status(200).json({ success: true, counters: updated });
    } catch (error) {
      console.error('Error updating site counters:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}


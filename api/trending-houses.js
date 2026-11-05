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

  // GET: Obtener todas las casas en tendencia
  if (req.method === 'GET') {
    try {
      const houses = await sql`
        SELECT 
          h.*,
          COALESCE(
            json_agg(p.id) FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) AS product_ids,
          COUNT(p.id)::int AS product_count
        FROM trending_houses h
        LEFT JOIN trending_house_products hp ON h.id = hp.house_id
        LEFT JOIN products p ON hp.product_id = p.id AND p.active != false
        GROUP BY h.id
        ORDER BY h.sort_order ASC, h.id ASC
      `;

      return res.status(200).json({ success: true, houses });
    } catch (error) {
      console.error('Error fetching trending houses:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  // POST: Crear nueva casa en tendencia
  if (req.method === 'POST') {
    try {
      const { name, image, sort_order, active, product_ids } = body || {};
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
      }

      const inserted = await sql`
        INSERT INTO trending_houses (name, image, sort_order, active)
        VALUES (${name.trim()}, ${image || null}, ${sort_order || 0}, ${active !== false})
        RETURNING *
      `;
      const house = inserted[0];

      // Asociar productos
      if (Array.isArray(product_ids) && product_ids.length > 0) {
        for (const pid of product_ids) {
          if (pid) {
            await sql`
              INSERT INTO trending_house_products (house_id, product_id)
              VALUES (${house.id}, ${pid})
              ON CONFLICT (house_id, product_id) DO NOTHING
            `;
          }
        }
      }

      return res.status(201).json({ success: true, house });
    } catch (error) {
      console.error('Error creating trending house:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT: Actualizar casa existente
  if (req.method === 'PUT') {
    try {
      const { id, name, image, sort_order, active, product_ids } = body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID es obligatorio' });
      }

      const updated = await sql`
        UPDATE trending_houses SET
          name = ${name ? name.trim() : 'Casa'},
          image = ${image !== undefined ? image : null},
          sort_order = ${sort_order || 0},
          active = ${active !== false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // Actualizar productos asociados
      if (Array.isArray(product_ids)) {
        await sql`DELETE FROM trending_house_products WHERE house_id = ${id}`;
        for (const pid of product_ids) {
          if (pid) {
            await sql`
              INSERT INTO trending_house_products (house_id, product_id)
              VALUES (${id}, ${pid})
              ON CONFLICT (house_id, product_id) DO NOTHING
            `;
          }
        }
      }

      return res.status(200).json({ success: true, house: updated[0] });
    } catch (error) {
      console.error('Error updating trending house:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE: Eliminar casa
  if (req.method === 'DELETE') {
    try {
      const { id } = body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID es obligatorio' });
      }

      await sql`DELETE FROM trending_houses WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting trending house:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}


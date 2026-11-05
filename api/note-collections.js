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

  // GET: Obtener todas las colecciones (público o admin)
  if (req.method === 'GET') {
    try {
      const collections = await sql`
        SELECT 
          c.*,
          COALESCE(
            json_agg(p.id) FILTER (WHERE p.id IS NOT NULL),
            '[]'
          ) AS product_ids,
          COUNT(p.id)::int AS product_count
        FROM note_collections c
        LEFT JOIN note_collection_products cp ON c.id = cp.collection_id
        LEFT JOIN products p ON cp.product_id = p.id AND p.active != false
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.id ASC
      `;

      return res.status(200).json({ success: true, collections });
    } catch (error) {
      console.error('Error fetching note collections:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  // POST: Crear nueva colección
  if (req.method === 'POST') {
    try {
      const { name, image, sort_order, active, product_ids } = body || {};
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
      }

      const inserted = await sql`
        INSERT INTO note_collections (name, image, sort_order, active)
        VALUES (${name.trim()}, ${image || null}, ${sort_order || 0}, ${active !== false})
        RETURNING *
      `;
      const collection = inserted[0];

      // Asociar productos
      if (Array.isArray(product_ids) && product_ids.length > 0) {
        for (const pid of product_ids) {
          if (pid) {
            await sql`
              INSERT INTO note_collection_products (collection_id, product_id)
              VALUES (${collection.id}, ${pid})
              ON CONFLICT (collection_id, product_id) DO NOTHING
            `;
          }
        }
      }

      return res.status(201).json({ success: true, collection });
    } catch (error) {
      console.error('Error creating note collection:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT: Actualizar colección existente
  if (req.method === 'PUT') {
    try {
      const { id, name, image, sort_order, active, product_ids } = body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID es obligatorio' });
      }

      const updated = await sql`
        UPDATE note_collections SET
          name = ${name ? name.trim() : 'Colección'},
          image = ${image !== undefined ? image : null},
          sort_order = ${sort_order || 0},
          active = ${active !== false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // Actualizar productos asociados si se envían
      if (Array.isArray(product_ids)) {
        await sql`DELETE FROM note_collection_products WHERE collection_id = ${id}`;
        for (const pid of product_ids) {
          if (pid) {
            await sql`
              INSERT INTO note_collection_products (collection_id, product_id)
              VALUES (${id}, ${pid})
              ON CONFLICT (collection_id, product_id) DO NOTHING
            `;
          }
        }
      }

      return res.status(200).json({ success: true, collection: updated[0] });
    } catch (error) {
      console.error('Error updating note collection:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE: Eliminar colección
  if (req.method === 'DELETE') {
    try {
      const { id } = body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID es obligatorio' });
      }

      await sql`DELETE FROM note_collections WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting note collection:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}


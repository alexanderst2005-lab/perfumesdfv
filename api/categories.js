import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Always disable cache for real-time updates
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const sql = neon(process.env.DATABASE_URL);

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    if (req.method === 'GET') {
      const categories = await sql`SELECT * FROM categories ORDER BY id ASC`;
      return res.status(200).json({ success: true, data: categories });
    }

    if (req.method === 'POST') {
      const name = body.name?.trim();
      if (!name) {
        return res.status(400).json({ success: false, error: 'El nombre de la categoría es requerido' });
      }

      const existing = await sql`
        SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER(${name})
      `;
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: `Ya existe una categoría llamada "${name}"` });
      }
      
      const newCategory = await sql`
        INSERT INTO categories (name) 
        VALUES (${name}) 
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: newCategory[0] });
    }

    if (req.method === 'PUT') {
      const { id, name } = body;
      if (!id || !name?.trim()) {
        return res.status(400).json({ success: false, error: 'ID y nuevo nombre son requeridos' });
      }

      const existing = await sql`
        SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER(${name.trim()}) AND id != ${id}
      `;
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: `Ya existe otra categoría llamada "${name}"` });
      }

      const updated = await sql`
        UPDATE categories 
        SET name = ${name.trim()} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      if (updated.length === 0) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
      }

      return res.status(200).json({ success: true, data: updated[0] });
    }

    if (req.method === 'DELETE') {
      const { id } = body;
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID es requerido' });
      }

      // Check if products exist in category
      const assigned = await sql`
        SELECT COUNT(*)::int as count FROM products WHERE category_id = ${id}
      `;
      
      if (assigned[0]?.count > 0) {
        return res.status(400).json({ 
          success: false, 
          error: `No se puede eliminar: tiene ${assigned[0].count} producto(s) asignado(s)` 
        });
      }

      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Categories API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
  }
}

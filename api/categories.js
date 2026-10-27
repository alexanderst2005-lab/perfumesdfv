import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Always prevent caching on categories API so admin changes reflect immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Safely parse body if sent as string
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

      // Check if category already exists (case-insensitive)
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
      const id = body.id !== undefined && body.id !== null ? parseInt(body.id, 10) : null;
      const name = body.name?.trim();

      if (!id || isNaN(id) || !name) {
        return res.status(400).json({ success: false, error: 'ID y Nombre de categoría son requeridos' });
      }

      // Check existing category
      const current = await sql`SELECT * FROM categories WHERE id = ${id}`;
      if (current.length === 0) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
      }
      const oldName = current[0].name;

      // Check if another category already has this name
      const duplicate = await sql`
        SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER(${name}) AND id != ${id}
      `;
      if (duplicate.length > 0) {
        return res.status(400).json({ success: false, error: `Ya existe otra categoría llamada "${name}"` });
      }

      const updated = await sql`
        UPDATE categories 
        SET name = ${name} 
        WHERE id = ${id} 
        RETURNING *
      `;

      // If category name was renamed, update all products referencing old category name or linked by category_id
      if (oldName && oldName !== name) {
        try {
          await sql`
            UPDATE products 
            SET category = ${name} 
            WHERE category_id = ${id} 
               OR LOWER(TRIM(category)) = LOWER(TRIM(${oldName}))
          `;
        } catch (cascadeErr) {
          console.error('Cascade Category Update Error:', cascadeErr);
        }
      }

      return res.status(200).json({ success: true, data: updated[0] });
    }

    if (req.method === 'DELETE') {
      const id = body.id !== undefined && body.id !== null ? parseInt(body.id, 10) : null;
      if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, error: 'ID de categoría es requerido' });
      }

      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Categories API Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error del servidor', details: error.message });
  }
}


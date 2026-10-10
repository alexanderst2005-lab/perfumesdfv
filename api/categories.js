import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
      const categories = await sql`SELECT * FROM categories ORDER BY id ASC`;
      return res.status(200).json({ success: true, data: categories });
    }

    if (req.method === 'POST') {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      
      const newCategory = await sql`
        INSERT INTO categories (name) 
        VALUES (${name}) 
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: newCategory[0] });
    }

    if (req.method === 'PUT') {
      const { id, name } = req.body;
      if (!id || !name) return res.status(400).json({ error: 'ID and Name are required' });

      const updated = await sql`
        UPDATE categories 
        SET name = ${name} 
        WHERE id = ${id} 
        RETURNING *
      `;
      return res.status(200).json({ success: true, data: updated[0] });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Categories API Error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

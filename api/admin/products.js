import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    // Create new product
    try {
      const p = req.body;
      const result = await sql`
        INSERT INTO products (
          id, name, brand, category, family, price, old_price, discount, sizes,
          image, description, notes, concentration, in_stock, stock_count, is_new, is_best_seller, active
        ) VALUES (
          ${p.id}, ${p.name}, ${p.brand}, ${p.category}, ${p.family}, ${p.price},
          ${p.oldPrice || null}, ${p.discount || null}, ${JSON.stringify(p.sizes || [])},
          ${p.image}, ${p.description}, ${JSON.stringify(p.notes || {})}, ${p.concentration},
          ${p.inStock}, ${p.stockCount || 0}, ${p.isNew}, ${p.isBestSeller}, ${p.active}
        ) RETURNING *
      `;
      return res.status(201).json({ success: true, product: result[0] });
    } catch (error) {
      console.error('Create Product Error:', error);
      return res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
  } 
  
  else if (req.method === 'PUT') {
    // Update existing product
    try {
      const p = req.body;
      if (!p.id) return res.status(400).json({ error: 'Product ID is required' });

      const result = await sql`
        UPDATE products SET 
          name = ${p.name},
          brand = ${p.brand},
          category = ${p.category},
          family = ${p.family},
          price = ${p.price},
          old_price = ${p.oldPrice || null},
          discount = ${p.discount || null},
          sizes = ${JSON.stringify(p.sizes || [])},
          image = ${p.image},
          description = ${p.description},
          notes = ${JSON.stringify(p.notes || {})},
          concentration = ${p.concentration},
          in_stock = ${p.inStock},
          stock_count = ${p.stockCount},
          is_new = ${p.isNew},
          is_best_seller = ${p.isBestSeller},
          active = ${p.active}
        WHERE id = ${p.id}
        RETURNING *
      `;
      return res.status(200).json({ success: true, product: result[0] });
    } catch (error) {
      console.error('Update Product Error:', error);
      return res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
  }

  else if (req.method === 'DELETE') {
    // Soft delete or hard delete product
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      // Usually it's better to deactivate than delete to keep order history intact
      const result = await sql`
        UPDATE products SET active = false WHERE id = ${id} RETURNING *
      `;
      return res.status(200).json({ success: true, product: result[0] });
    } catch (error) {
      console.error('Delete Product Error:', error);
      return res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
  }

  else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

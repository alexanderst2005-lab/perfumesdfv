import { neon } from '@neondatabase/serverless';

// Pre-calienta en Cloudinary las imágenes optimizadas en segundo plano (sin frenar la respuesta al admin)
function warmProductImages(images) {
  if (!images || !Array.isArray(images) || images.length === 0) return;
  for (const raw of images) {
    if (!raw || typeof raw !== 'string' || !raw.includes('/image/upload/')) continue;
    const uThumb = raw.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_200,c_limit/');
    const uStore = raw.replace('/image/upload/', '/image/upload/f_auto,q_100,w_1200,c_limit/');
    fetch(uThumb).catch(() => {});
    fetch(uStore).catch(() => {});
  }
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    try {
      const p = req.body;
      p.id = p.id || `p-${Date.now()}`;

      let categoryId = p.categoryId ? parseInt(p.categoryId, 10) : null;
      let categoryName = p.category || '';

      // Solo consultar categories si falta el nombre o el ID
      if (categoryId && !categoryName) {
        const catRow = await sql`SELECT id, name FROM categories WHERE id = ${categoryId}`;
        if (catRow.length > 0) categoryName = catRow[0].name;
      } else if (!categoryId && categoryName) {
        const catRow = await sql`SELECT id, name FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(${categoryName}))`;
        if (catRow.length > 0) {
          categoryId = catRow[0].id;
          categoryName = catRow[0].name;
        }
      }

      const result = await sql`
        INSERT INTO products (
          id, name, brand, category, category_id, family, price, old_price, discount, sizes,
          image, images, description, occasion, notes, concentration, in_stock, stock_count, is_new, is_best_seller, is_most_wanted, active
        ) VALUES (
          ${p.id}, ${p.name}, ${p.brand}, ${categoryName}, ${categoryId}, ${p.family}, ${p.price},
          ${p.oldPrice || null}, ${p.discount || null}, ${JSON.stringify(p.sizes || [])},
          ${p.image}, ${JSON.stringify(p.images || [])}, ${p.description}, ${p.occasion || null}, ${JSON.stringify(p.notes || {})}, ${p.concentration},
          ${p.inStock}, ${p.stockCount || 0}, ${p.isNew}, ${p.isBestSeller}, ${p.isMostWanted === true}, ${p.active}
        ) RETURNING *
      `;

      const allImgs = [p.image];
      if (Array.isArray(p.images)) allImgs.push(...p.images);
      else if (typeof p.images === 'string') {
        try { const parsed = JSON.parse(p.images); if (Array.isArray(parsed)) allImgs.push(...parsed); } catch {}
      }
      warmProductImages(allImgs);

      return res.status(201).json({ success: true, product: result[0] });
    } catch (error) {
      console.error('Create Product Error:', error);
      return res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const p = req.body;
      if (!p.id) return res.status(400).json({ error: 'Product ID is required' });

      let categoryId = p.categoryId ? parseInt(p.categoryId, 10) : null;
      let categoryName = p.category || '';

      if (categoryId && !categoryName) {
        const catRow = await sql`SELECT id, name FROM categories WHERE id = ${categoryId}`;
        if (catRow.length > 0) categoryName = catRow[0].name;
      } else if (!categoryId && categoryName) {
        const catRow = await sql`SELECT id, name FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(${categoryName}))`;
        if (catRow.length > 0) {
          categoryId = catRow[0].id;
          categoryName = catRow[0].name;
        }
      }

      const result = await sql`
        UPDATE products SET 
          name = ${p.name},
          brand = ${p.brand},
          category = ${categoryName},
          category_id = ${categoryId},
          family = ${p.family},
          price = ${p.price},
          old_price = ${p.oldPrice || null},
          discount = ${p.discount || null},
          sizes = ${JSON.stringify(p.sizes || [])},
          image = ${p.image},
          images = ${JSON.stringify(p.images || [])},
          description = ${p.description},
          occasion = ${p.occasion || null},
          notes = ${JSON.stringify(p.notes || {})},
          concentration = ${p.concentration},
          in_stock = ${p.inStock},
          stock_count = ${p.stockCount},
          is_new = ${p.isNew},
          is_best_seller = ${p.isBestSeller},
          is_most_wanted = ${p.isMostWanted === true},
          active = ${p.active}
        WHERE id = ${p.id}
        RETURNING *
      `;

      const allImgs = [p.image];
      if (Array.isArray(p.images)) allImgs.push(...p.images);
      else if (typeof p.images === 'string') {
        try { const parsed = JSON.parse(p.images); if (Array.isArray(parsed)) allImgs.push(...parsed); } catch {}
      }
      warmProductImages(allImgs);

      return res.status(200).json({ success: true, product: result[0] });
    } catch (error) {
      console.error('Update Product Error:', error);
      return res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      const result = await sql`
        DELETE FROM products WHERE id = ${id} RETURNING *
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

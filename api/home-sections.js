import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const sql = neon(process.env.DATABASE_URL);

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // Detectar la sección solicitada (soporta ?type=... o ?section=... o ruta directa)
  const rawUrl = req.url || '';
  const type = req.query.type || req.query.section ||
    (rawUrl.includes('promo-banner') ? 'promo-banner' :
     rawUrl.includes('note-collections') ? 'note-collections' :
     rawUrl.includes('trending-houses') ? 'trending-houses' :
     rawUrl.includes('fragrance-sets') ? 'fragrance-sets' :
     rawUrl.includes('site-counters') ? 'site-counters' : '');

  // Helper para normalizar los campos de imagen en respuesta (image e image_url)
  const withDualImage = (row) => {
    if (!row) return row;
    const img = row.image || row.image_url || null;
    return { ...row, image: img, image_url: img };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PROMO BANNER
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'promo-banner') {
    if (req.method === 'GET') {
      try {
        const rows = await sql`SELECT * FROM promo_banners ORDER BY id ASC LIMIT 1`;
        if (rows.length === 0) return res.status(200).json({ success: true, banner: null });
        return res.status(200).json({ success: true, banner: withDualImage(rows[0]) });
      } catch (error) {
        console.error('Error fetching promo banner:', error);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
    }

    if (req.method === 'PUT') {
      try {
        const { title, subtitle, button_text, button_link, image_url, image, active } = body || {};
        const bannerImg = image_url !== undefined ? image_url : image;
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
              ${bannerImg || null},
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
              image = ${bannerImg !== undefined ? bannerImg : null},
              active = ${active !== false},
              updated_at = NOW()
            WHERE id = ${existing[0].id}
            RETURNING *
          `;
        }
        return res.status(200).json({ success: true, banner: withDualImage(result[0]) });
      } catch (error) {
        console.error('Error updating promo banner:', error);
        return res.status(500).json({ success: false, error: error.message || 'Database error' });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. SITE COUNTERS
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'site-counters') {
    if (req.method === 'GET') {
      try {
        const counters = await sql`SELECT * FROM site_counters ORDER BY sort_order ASC, id ASC`;
        return res.status(200).json({ success: true, counters });
      } catch (error) {
        console.error('Error fetching site counters:', error);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
    }

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
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. NOTE COLLECTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'note-collections') {
    await sql`
      CREATE TABLE IF NOT EXISTS note_collection_products (
        collection_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        PRIMARY KEY (collection_id, product_id)
      )
    `.catch(() => {});
    await sql`
      ALTER TABLE note_collection_products DROP CONSTRAINT IF EXISTS note_collection_products_product_id_fkey
    `.catch(() => {});
    await sql`
      ALTER TABLE note_collection_products ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT
    `.catch(() => {});

    if (req.method === 'GET') {
      try {
        const collections = await sql`
          SELECT 
            c.*,
            COALESCE(
              json_agg(cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL),
              '[]'
            ) AS product_ids,
            COUNT(cp.product_id)::int AS product_count
          FROM note_collections c
          LEFT JOIN note_collection_products cp ON c.id = cp.collection_id
          GROUP BY c.id
          ORDER BY c.sort_order ASC, c.id ASC
        `;
        return res.status(200).json({
          success: true,
          collections: collections.map(withDualImage)
        });
      } catch (error) {
        console.error('Error fetching note collections:', error);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
    }

    if (req.method === 'POST') {
      try {
        const { name, image_url, image, sort_order, active, product_ids } = body || {};
        const colImg = image_url !== undefined ? image_url : image;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
        }

        const inserted = await sql`
          INSERT INTO note_collections (name, image, sort_order, active)
          VALUES (${name.trim()}, ${colImg || null}, ${sort_order || 0}, ${active !== false})
          RETURNING *
        `;
        const collection = inserted[0];

        const cleanIds = Array.isArray(product_ids) ? [...new Set(product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];
        for (const pid of cleanIds) {
          await sql`
            INSERT INTO note_collection_products (collection_id, product_id)
            VALUES (${collection.id}, ${pid})
            ON CONFLICT (collection_id, product_id) DO NOTHING
          `;
        }
        return res.status(201).json({
          success: true,
          collection: { ...withDualImage(collection), product_ids: cleanIds, product_count: cleanIds.length }
        });
      } catch (error) {
        console.error('Error creating note collection:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'PUT') {
      try {
        const { id, name, image_url, image, sort_order, active, product_ids } = body || {};
        const colImg = image_url !== undefined ? image_url : image;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });

        const updated = await sql`
          UPDATE note_collections SET
            name = ${name ? name.trim() : 'Colección'},
            image = ${colImg !== undefined ? colImg : null},
            sort_order = ${sort_order || 0},
            active = ${active !== false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        const cleanIds = Array.isArray(product_ids) ? [...new Set(product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];
        if (Array.isArray(product_ids)) {
          await sql`DELETE FROM note_collection_products WHERE collection_id = ${id}`;
          for (const pid of cleanIds) {
            await sql`
              INSERT INTO note_collection_products (collection_id, product_id)
              VALUES (${id}, ${pid})
              ON CONFLICT (collection_id, product_id) DO NOTHING
            `;
          }
        }
        return res.status(200).json({
          success: true,
          collection: { ...withDualImage(updated[0]), product_ids: cleanIds, product_count: cleanIds.length }
        });
      } catch (error) {
        console.error('Error updating note collection:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'DELETE') {
      try {
        const id = (body && body.id) || req.query.id;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });
        await sql`DELETE FROM note_collection_products WHERE collection_id = ${id}`.catch(() => {});
        await sql`DELETE FROM note_collections WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting note collection:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. TRENDING HOUSES
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'trending-houses') {
    await sql`
      CREATE TABLE IF NOT EXISTS trending_house_products (
        house_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        PRIMARY KEY (house_id, product_id)
      )
    `.catch(() => {});
    await sql`
      ALTER TABLE trending_house_products DROP CONSTRAINT IF EXISTS trending_house_products_product_id_fkey
    `.catch(() => {});
    await sql`
      ALTER TABLE trending_house_products ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT
    `.catch(() => {});

    if (req.method === 'GET') {
      try {
        const houses = await sql`
          SELECT 
            h.*,
            COALESCE(
              json_agg(hp.product_id) FILTER (WHERE hp.product_id IS NOT NULL),
              '[]'
            ) AS product_ids,
            COUNT(hp.product_id)::int AS product_count
          FROM trending_houses h
          LEFT JOIN trending_house_products hp ON h.id = hp.house_id
          GROUP BY h.id
          ORDER BY h.sort_order ASC, h.id ASC
        `;
        return res.status(200).json({
          success: true,
          houses: houses.map(withDualImage)
        });
      } catch (error) {
        console.error('Error fetching trending houses:', error);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
    }

    if (req.method === 'POST') {
      try {
        const { name, image_url, image, sort_order, active, product_ids } = body || {};
        const houseImg = image_url !== undefined ? image_url : image;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
        }

        const inserted = await sql`
          INSERT INTO trending_houses (name, image, sort_order, active)
          VALUES (${name.trim()}, ${houseImg || null}, ${sort_order || 0}, ${active !== false})
          RETURNING *
        `;
        const house = inserted[0];

        const cleanIds = Array.isArray(product_ids) ? [...new Set(product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];
        for (const pid of cleanIds) {
          await sql`
            INSERT INTO trending_house_products (house_id, product_id)
            VALUES (${house.id}, ${pid})
            ON CONFLICT (house_id, product_id) DO NOTHING
          `;
        }
        return res.status(201).json({
          success: true,
          house: { ...withDualImage(house), product_ids: cleanIds, product_count: cleanIds.length }
        });
      } catch (error) {
        console.error('Error creating trending house:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'PUT') {
      try {
        const { id, name, image_url, image, sort_order, active, product_ids } = body || {};
        const houseImg = image_url !== undefined ? image_url : image;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });

        const updated = await sql`
          UPDATE trending_houses SET
            name = ${name ? name.trim() : 'Casa'},
            image = ${houseImg !== undefined ? houseImg : null},
            sort_order = ${sort_order || 0},
            active = ${active !== false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

        const cleanIds = Array.isArray(product_ids) ? [...new Set(product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];
        if (Array.isArray(product_ids)) {
          await sql`DELETE FROM trending_house_products WHERE house_id = ${id}`;
          for (const pid of cleanIds) {
            await sql`
              INSERT INTO trending_house_products (house_id, product_id)
              VALUES (${id}, ${pid})
              ON CONFLICT (house_id, product_id) DO NOTHING
            `;
          }
        }
        return res.status(200).json({
          success: true,
          house: { ...withDualImage(updated[0]), product_ids: cleanIds, product_count: cleanIds.length }
        });
      } catch (error) {
        console.error('Error updating trending house:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    if (req.method === 'DELETE') {
      try {
        const id = (body && body.id) || req.query.id;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });
        await sql`DELETE FROM trending_house_products WHERE house_id = ${id}`.catch(() => {});
        await sql`DELETE FROM trending_houses WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting trending house:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. FRAGRANCE SETS (SETS DE FRAGANCIAS EXCLUSIVAS)
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'fragrance-sets') {
    await sql`
      CREATE TABLE IF NOT EXISTS fragrance_sets_banner (
        id SERIAL PRIMARY KEY,
        title TEXT DEFAULT 'SETS DE FRAGANCIAS EXCLUSIVAS',
        subtitle TEXT DEFAULT 'Combinaciones cuidadosamente seleccionadas para elevar cada momento',
        button_text TEXT DEFAULT 'VER SETS',
        image TEXT,
        images JSONB DEFAULT '[]',
        product_ids JSONB DEFAULT '[]',
        active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `.catch(() => {});

    if (req.method === 'GET') {
      try {
        const rows = await sql`SELECT * FROM fragrance_sets_banner ORDER BY id ASC LIMIT 1`;
        if (rows.length === 0) {
          return res.status(200).json({ success: true, setsBanner: null });
        }
        const row = rows[0];
        const productIds = Array.isArray(row.product_ids) ? [...new Set(row.product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];
        const imagesList = Array.isArray(row.images) ? row.images.filter(Boolean) : (row.image ? [row.image] : []);
        return res.status(200).json({
          success: true,
          setsBanner: {
            ...withDualImage(row),
            images: imagesList,
            product_ids: productIds
          }
        });
      } catch (error) {
        console.error('Error fetching fragrance sets banner:', error);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      try {
        const { title, subtitle, button_text, image_url, image, images, product_ids, active } = body || {};
        const mainImg = image_url !== undefined ? image_url : (image !== undefined ? image : (Array.isArray(images) && images[0] ? images[0] : null));
        const cleanImages = Array.isArray(images) ? images.filter(Boolean) : (mainImg ? [mainImg] : []);
        const cleanIds = Array.isArray(product_ids) ? [...new Set(product_ids.map(x => String(x || '').trim()).filter(Boolean))] : [];

        const existing = await sql`SELECT id FROM fragrance_sets_banner ORDER BY id ASC LIMIT 1`;
        let result;

        if (existing.length === 0) {
          result = await sql`
            INSERT INTO fragrance_sets_banner (title, subtitle, button_text, image, images, product_ids, active, updated_at)
            VALUES (
              ${title || 'SETS DE FRAGANCIAS EXCLUSIVAS'},
              ${subtitle !== undefined ? subtitle : 'Combinaciones cuidadosamente seleccionadas para elevar cada momento'},
              ${button_text || 'VER SETS'},
              ${mainImg || null},
              ${JSON.stringify(cleanImages)}::jsonb,
              ${JSON.stringify(cleanIds)}::jsonb,
              ${active !== false},
              NOW()
            ) RETURNING *
          `;
        } else {
          result = await sql`
            UPDATE fragrance_sets_banner SET
              title = ${title || 'SETS DE FRAGANCIAS EXCLUSIVAS'},
              subtitle = ${subtitle !== undefined ? subtitle : 'Combinaciones cuidadosamente seleccionadas para elevar cada momento'},
              button_text = ${button_text || 'VER SETS'},
              image = ${mainImg || null},
              images = ${JSON.stringify(cleanImages)}::jsonb,
              product_ids = ${JSON.stringify(cleanIds)}::jsonb,
              active = ${active !== false},
              updated_at = NOW()
            WHERE id = ${existing[0].id}
            RETURNING *
          `;
        }

        const saved = result[0];
        return res.status(200).json({
          success: true,
          setsBanner: {
            ...withDualImage(saved),
            images: cleanImages,
            product_ids: cleanIds
          }
        });
      } catch (error) {
        console.error('Error saving fragrance sets banner:', error);
        return res.status(500).json({ success: false, error: error.message || 'Database error' });
      }
    }
  }

  return res.status(405).json({ success: false, error: 'Method or section not allowed' });
}

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

  // Detectar la sección solicitada
  const rawUrl = req.url || '';
  const type = req.query.type ||
    (rawUrl.includes('promo-banner') ? 'promo-banner' :
     rawUrl.includes('note-collections') ? 'note-collections' :
     rawUrl.includes('trending-houses') ? 'trending-houses' :
     rawUrl.includes('site-counters') ? 'site-counters' : '');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PROMO BANNER
  // ═══════════════════════════════════════════════════════════════════════════
  if (type === 'promo-banner') {
    if (req.method === 'GET') {
      try {
        const rows = await sql`SELECT * FROM promo_banners ORDER BY id ASC LIMIT 1`;
        if (rows.length === 0) return res.status(200).json({ success: true, banner: null });
        return res.status(200).json({ success: true, banner: rows[0] });
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
            INSERT INTO promo_banners (title, subtitle, button_text, button_link, image_url, active, updated_at)
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
              image_url = ${bannerImg !== undefined ? bannerImg : null},
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

    if (req.method === 'POST') {
      try {
        const { name, image_url, image, sort_order, active, product_ids } = body || {};
        const colImg = image_url !== undefined ? image_url : image;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
        }

        const inserted = await sql`
          INSERT INTO note_collections (name, image_url, sort_order, active)
          VALUES (${name.trim()}, ${colImg || null}, ${sort_order || 0}, ${active !== false})
          RETURNING *
        `;
        const collection = inserted[0];

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

    if (req.method === 'PUT') {
      try {
        const { id, name, image_url, image, sort_order, active, product_ids } = body || {};
        const colImg = image_url !== undefined ? image_url : image;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });

        const updated = await sql`
          UPDATE note_collections SET
            name = ${name ? name.trim() : 'Colección'},
            image_url = ${colImg !== undefined ? colImg : null},
            sort_order = ${sort_order || 0},
            active = ${active !== false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

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

    if (req.method === 'DELETE') {
      try {
        const id = (body && body.id) || req.query.id;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });
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

    if (req.method === 'POST') {
      try {
        const { name, image_url, image, sort_order, active, product_ids } = body || {};
        const houseImg = image_url !== undefined ? image_url : image;
        if (!name || !name.trim()) {
          return res.status(400).json({ success: false, error: 'El nombre es obligatorio' });
        }

        const inserted = await sql`
          INSERT INTO trending_houses (name, image_url, sort_order, active)
          VALUES (${name.trim()}, ${houseImg || null}, ${sort_order || 0}, ${active !== false})
          RETURNING *
        `;
        const house = inserted[0];

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

    if (req.method === 'PUT') {
      try {
        const { id, name, image_url, image, sort_order, active, product_ids } = body || {};
        const houseImg = image_url !== undefined ? image_url : image;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });

        const updated = await sql`
          UPDATE trending_houses SET
            name = ${name ? name.trim() : 'Casa'},
            image_url = ${houseImg !== undefined ? houseImg : null},
            sort_order = ${sort_order || 0},
            active = ${active !== false},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `;

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

    if (req.method === 'DELETE') {
      try {
        const id = (body && body.id) || req.query.id;
        if (!id) return res.status(400).json({ success: false, error: 'ID es obligatorio' });
        await sql`DELETE FROM trending_houses WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting trending house:', error);
        return res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  return res.status(404).json({ success: false, error: 'Section not found' });
}

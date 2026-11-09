import { neon } from '@neondatabase/serverless';

const sql_conn = () => neon(process.env.DATABASE_URL);

// ─── Helpers ────────────────────────────────────────────────────────────────

async function ensureTables(sql) {
  // Tabla principal de campañas promocionales
  await sql`
    CREATE TABLE IF NOT EXISTS promo_campaigns (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      badge TEXT,
      image TEXT,
      frequency VARCHAR(50) DEFAULT 'once_session',
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Tabla de productos asociados a cada campaña
  await sql`
    CREATE TABLE IF NOT EXISTS promo_campaign_products (
      id SERIAL PRIMARY KEY,
      campaign_id INTEGER NOT NULL REFERENCES promo_campaigns(id) ON DELETE CASCADE,
      product_id VARCHAR(50) NOT NULL,
      discount_pct INTEGER NOT NULL CHECK (discount_pct >= 1 AND discount_pct <= 99),
      ref_price INTEGER NOT NULL,
      promo_price INTEGER NOT NULL,
      original_price INTEGER,
      original_old_price INTEGER,
      original_discount INTEGER,
      UNIQUE (campaign_id, product_id)
    )
  `;
}

// ─── Calcula estado actual de una campaña ─────────────────────────────────

function computeStatus(campaign) {
  const now = new Date();
  const { status, starts_at, ends_at } = campaign;

  if (status === 'deleted') return 'deleted';

  if (ends_at && new Date(ends_at) < now) return 'finished';

  if (status === 'active') {
    if (starts_at && new Date(starts_at) > now) return 'scheduled';
    return 'active';
  }
  if (status === 'scheduled') {
    if (starts_at && new Date(starts_at) <= now) return 'active';
    return 'scheduled';
  }

  return status || 'draft';
}

// ─── Restaurar precios originales de productos de una campaña ─────────────

async function restoreProductPrices(sql, campaignId) {
  const items = await sql`
    SELECT product_id, original_price, original_old_price, original_discount
    FROM promo_campaign_products
    WHERE campaign_id = ${campaignId}
  `;

  for (const item of items) {
    await sql`
      UPDATE products SET
        price       = ${item.original_price},
        old_price   = ${item.original_old_price},
        discount    = ${item.original_discount}
      WHERE id = ${item.product_id}
    `;
  }
}

// ─── Aplicar descuentos de campaña a productos ───────────────────────────

async function applyProductDiscounts(sql, campaignId) {
  const items = await sql`
    SELECT product_id, ref_price, promo_price, discount_pct,
           original_price, original_old_price, original_discount
    FROM promo_campaign_products
    WHERE campaign_id = ${campaignId}
  `;

  for (const item of items) {
    await sql`
      UPDATE products SET
        price     = ${item.promo_price},
        old_price = ${item.ref_price},
        discount  = ${item.discount_pct}
      WHERE id = ${item.product_id}
    `;
  }
}

// ─── Verificar conflictos de producto entre campañas activas/programadas ──

async function checkConflicts(sql, productIds, excludeCampaignId = null) {
  if (!productIds || productIds.length === 0) return [];

  const excId = excludeCampaignId ? parseInt(excludeCampaignId, 10) : null;

  if (excId) {
    return await sql`
      SELECT DISTINCT cpp.product_id, pc.id AS campaign_id, pc.name AS campaign_name
      FROM promo_campaign_products cpp
      JOIN promo_campaigns pc ON pc.id = cpp.campaign_id
      WHERE cpp.product_id = ANY(${productIds}::varchar[])
        AND pc.status IN ('active', 'scheduled')
        AND pc.id != ${excId}
    `;
  }

  return await sql`
    SELECT DISTINCT cpp.product_id, pc.id AS campaign_id, pc.name AS campaign_name
    FROM promo_campaign_products cpp
    JOIN promo_campaigns pc ON pc.id = cpp.campaign_id
    WHERE cpp.product_id = ANY(${productIds}::varchar[])
      AND pc.status IN ('active', 'scheduled')
  `;
}

// ─── HANDLER PRINCIPAL (PÚBLICO Y ADMIN) ──────────────────────────────────

export default async function handler(req, res) {
  const sql = sql_conn();
  const { method, query } = req;

  if (method !== 'GET') {
    try {
      await ensureTables(sql);
    } catch (e) {
      console.error('ensureTables error:', e);
      return res.status(500).json({ error: 'DB init error', details: e.message });
    }
  }

  const isAdmin = query && (query.admin === 'true' || query.admin === '1');

  // ── GET ──────────────────────────────────────────────────────────────────
  if (method === 'GET') {
    // Si NO es llamada de admin, responde las campañas públicas activas
    if (!isAdmin && !query.id) {
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=120');

      try {
        const now = new Date();

        // 1. Finalizar campañas vencidas
        const expiredCampaigns = await sql`
          SELECT id FROM promo_campaigns
          WHERE status = 'active'
            AND ends_at IS NOT NULL
            AND ends_at < ${now.toISOString()}
        `;
        for (const camp of expiredCampaigns) {
          await restoreProductPrices(sql, camp.id);
          await sql`
            UPDATE promo_campaigns SET status = 'finished', updated_at = NOW()
            WHERE id = ${camp.id}
          `;
        }

        // 2. Activar programadas cuya hora de inicio ya llegó
        const toActivate = await sql`
          SELECT id FROM promo_campaigns
          WHERE status = 'scheduled'
            AND starts_at IS NOT NULL
            AND starts_at <= ${now.toISOString()}
        `;
        for (const camp of toActivate) {
          await applyProductDiscounts(sql, camp.id);
          await sql`
            UPDATE promo_campaigns SET status = 'active', updated_at = NOW()
            WHERE id = ${camp.id}
          `;
        }

        // 3. Devolver campañas activas para la tienda
        const campaigns = await sql`
          SELECT pc.id, pc.name, pc.title, pc.description, pc.badge,
                 pc.image, pc.frequency, pc.starts_at, pc.ends_at
          FROM promo_campaigns pc
          WHERE pc.status = 'active'
          ORDER BY pc.created_at DESC
        `;

        const result = [];
        for (const campaign of campaigns) {
          const products = await sql`
            SELECT cpp.product_id, cpp.discount_pct, cpp.ref_price, cpp.promo_price,
                   p.name, p.brand, p.image, p.images, p.price, p.old_price, p.discount
            FROM promo_campaign_products cpp
            LEFT JOIN products p ON p.id = cpp.product_id
            WHERE cpp.campaign_id = ${campaign.id}
              AND p.active = true
          `;
          result.push({ ...campaign, products });
        }

        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error('Public campaigns API error:', error);
        return res.status(500).json({ error: 'Failed to fetch campaigns', details: error.message });
      }
    }

    // ── Si es Admin o se consulta por ID específico ────────────────────────
    try {
      const { id } = query;

      if (id) {
        const [campaign] = await sql`
          SELECT * FROM promo_campaigns WHERE id = ${parseInt(id, 10)}
        `;
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        const products = await sql`
          SELECT cpp.*, p.name AS product_name, p.image AS product_image,
                 p.brand AS product_brand
          FROM promo_campaign_products cpp
          LEFT JOIN products p ON p.id = cpp.product_id
          WHERE cpp.campaign_id = ${parseInt(id, 10)}
        `;

        return res.status(200).json({
          success: true,
          data: { ...campaign, computed_status: computeStatus(campaign), products }
        });
      }

      // Obtener todas las campañas para el panel de administración
      const campaigns = await sql`
        SELECT pc.*,
          (SELECT COUNT(*) FROM promo_campaign_products WHERE campaign_id = pc.id) AS product_count
        FROM promo_campaigns pc
        ORDER BY pc.created_at DESC
      `;

      const withStatus = campaigns.map(c => ({ ...c, computed_status: computeStatus(c) }));

      return res.status(200).json({ success: true, data: withStatus });
    } catch (e) {
      console.error('GET campaigns error:', e);
      return res.status(500).json({ error: 'Failed to fetch campaigns', details: e.message });
    }
  }

  // ── POST (crear campaña - Admin) ─────────────────────────────────────────
  if (method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Formato JSON inválido' }); }
      }
      body = body || {};

      if (!body.name || !body.title) {
        return res.status(400).json({ error: 'name y title son obligatorios' });
      }

      if (body.starts_at && body.ends_at) {
        if (new Date(body.ends_at) <= new Date(body.starts_at)) {
          return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
        }
      }

      const products = body.products || [];

      if (products.length > 0) {
        const productIds = products.map(p => p.product_id);
        const conflicts = await checkConflicts(sql, productIds);
        if (conflicts.length > 0) {
          return res.status(409).json({
            error: 'Conflicto de productos',
            conflicts: conflicts.map(c => ({
              product_id: c.product_id,
              campaign_name: c.campaign_name
            }))
          });
        }
      }

      const [campaign] = await sql`
        INSERT INTO promo_campaigns (name, title, description, badge, image, frequency, starts_at, ends_at, status)
        VALUES (
          ${body.name},
          ${body.title},
          ${body.description || null},
          ${body.badge || null},
          ${body.image || null},
          ${body.frequency || 'once_session'},
          ${body.starts_at || null},
          ${body.ends_at || null},
          ${'draft'}
        )
        RETURNING *
      `;

      for (const p of products) {
        const [prod] = await sql`
          SELECT price, old_price, discount FROM products WHERE id = ${p.product_id}
        `;
        if (!prod) continue;

        const refPrice = prod.old_price || prod.price;
        const promoPrice = Math.round(refPrice * (1 - p.discount_pct / 100));

        await sql`
          INSERT INTO promo_campaign_products
            (campaign_id, product_id, discount_pct, ref_price, promo_price,
             original_price, original_old_price, original_discount)
          VALUES (
            ${campaign.id}, ${p.product_id}, ${p.discount_pct},
            ${refPrice}, ${promoPrice},
            ${prod.price}, ${prod.old_price || null}, ${prod.discount || null}
          )
          ON CONFLICT (campaign_id, product_id) DO UPDATE SET
            discount_pct = EXCLUDED.discount_pct,
            ref_price = EXCLUDED.ref_price,
            promo_price = EXCLUDED.promo_price
        `;
      }

      return res.status(201).json({
        success: true,
        data: { ...campaign, computed_status: computeStatus(campaign) }
      });
    } catch (e) {
      console.error('POST campaign error:', e);
      return res.status(500).json({ error: 'Failed to create campaign', details: e.message });
    }
  }

  // ── PUT (actualizar / activar / desactivar - Admin) ────────────────────────
  if (method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Formato JSON inválido' }); }
      }
      body = body || {};
      const id = parseInt(body.id || query.id, 10);
      if (!id) return res.status(400).json({ error: 'id es obligatorio' });

      const [existing] = await sql`SELECT * FROM promo_campaigns WHERE id = ${id}`;
      if (!existing) return res.status(404).json({ error: 'Campaign not found' });

      const action = body.action;

      if (action === 'activate') {
        const myProducts = await sql`
          SELECT product_id FROM promo_campaign_products WHERE campaign_id = ${id}
        `;
        const myProductIds = myProducts.map(p => p.product_id);
        const conflicts = await checkConflicts(sql, myProductIds, id);
        if (conflicts.length > 0) {
          return res.status(409).json({
            error: 'Conflicto de productos',
            conflicts: conflicts.map(c => ({
              product_id: c.product_id,
              campaign_name: c.campaign_name
            }))
          });
        }

        const now = new Date();
        const startsAt = existing.starts_at ? new Date(existing.starts_at) : null;
        const newStatus = (startsAt && startsAt > now) ? 'scheduled' : 'active';

        await sql`
          UPDATE promo_campaigns SET status = ${newStatus}, updated_at = NOW()
          WHERE id = ${id}
        `;

        if (newStatus === 'active') {
          await applyProductDiscounts(sql, id);
        }

        const [updated] = await sql`SELECT * FROM promo_campaigns WHERE id = ${id}`;
        return res.status(200).json({
          success: true,
          data: { ...updated, computed_status: computeStatus(updated) }
        });
      }

      if (action === 'deactivate') {
        await restoreProductPrices(sql, id);
        await sql`
          UPDATE promo_campaigns SET status = 'draft', updated_at = NOW()
          WHERE id = ${id}
        `;
        const [updated] = await sql`SELECT * FROM promo_campaigns WHERE id = ${id}`;
        return res.status(200).json({
          success: true,
          data: { ...updated, computed_status: computeStatus(updated) }
        });
      }

      if (body.starts_at && body.ends_at) {
        if (new Date(body.ends_at) <= new Date(body.starts_at)) {
          return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
        }
      }

      const wasActive = existing.status === 'active';
      const products = body.products;

      if (products && products.length > 0) {
        const productIds = products.map(p => p.product_id);
        const conflicts = await checkConflicts(sql, productIds, id);
        if (conflicts.length > 0) {
          return res.status(409).json({
            error: 'Conflicto de productos',
            conflicts: conflicts.map(c => ({
              product_id: c.product_id,
              campaign_name: c.campaign_name
            }))
          });
        }
      }

      if (wasActive) {
        await restoreProductPrices(sql, id);
      }

      await sql`
        UPDATE promo_campaigns SET
          name        = COALESCE(${body.name || null}, name),
          title       = COALESCE(${body.title || null}, title),
          description = ${body.description !== undefined ? (body.description || null) : existing.description},
          badge       = ${body.badge !== undefined ? (body.badge || null) : existing.badge},
          image       = ${body.image !== undefined ? (body.image || null) : existing.image},
          frequency   = COALESCE(${body.frequency || null}, frequency),
          starts_at   = ${body.starts_at !== undefined ? (body.starts_at || null) : existing.starts_at},
          ends_at     = ${body.ends_at !== undefined ? (body.ends_at || null) : existing.ends_at},
          updated_at  = NOW()
        WHERE id = ${id}
      `;

      if (products !== undefined) {
        await sql`DELETE FROM promo_campaign_products WHERE campaign_id = ${id}`;

        for (const p of products) {
          const [prod] = await sql`
            SELECT price, old_price, discount FROM products WHERE id = ${p.product_id}
          `;
          if (!prod) continue;

          const origPrice = p.original_price || prod.price;
          const origOldPrice = p.original_old_price !== undefined ? p.original_old_price : prod.old_price;
          const origDiscount = p.original_discount !== undefined ? p.original_discount : prod.discount;

          const refPrice = origOldPrice || origPrice;
          const promoPrice = Math.round(refPrice * (1 - p.discount_pct / 100));

          await sql`
            INSERT INTO promo_campaign_products
              (campaign_id, product_id, discount_pct, ref_price, promo_price,
               original_price, original_old_price, original_discount)
            VALUES (
              ${id}, ${p.product_id}, ${p.discount_pct},
              ${refPrice}, ${promoPrice},
              ${origPrice}, ${origOldPrice || null}, ${origDiscount || null}
            )
          `;
        }
      }

      if (wasActive) {
        await applyProductDiscounts(sql, id);
      }

      const [updated] = await sql`SELECT * FROM promo_campaigns WHERE id = ${id}`;
      return res.status(200).json({
        success: true,
        data: { ...updated, computed_status: computeStatus(updated) }
      });
    } catch (e) {
      console.error('PUT campaign error:', e);
      return res.status(500).json({ error: 'Failed to update campaign', details: e.message });
    }
  }

  // ── DELETE (eliminar campaña - Admin) ─────────────────────────────────────
  if (method === 'DELETE') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};
      const id = body.id || query.id;
      if (!id) return res.status(400).json({ error: 'id es obligatorio' });

      const campaignId = parseInt(id, 10);
      const [existing] = await sql`SELECT * FROM promo_campaigns WHERE id = ${campaignId}`;
      if (!existing) return res.status(404).json({ error: 'Campaign not found' });

      if (existing.status === 'active' || existing.status === 'scheduled') {
        await restoreProductPrices(sql, campaignId);
      }

      await sql`DELETE FROM promo_campaigns WHERE id = ${campaignId}`;

      return res.status(200).json({ success: true, message: 'Campaña eliminada' });
    } catch (e) {
      console.error('DELETE campaign error:', e);
      return res.status(500).json({ error: 'Failed to delete campaign', details: e.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

import { neon } from '@neondatabase/serverless';

// API pública para que la tienda consulte campañas activas
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=120');

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Auto-finalizar campañas vencidas y activar las programadas
    const now = new Date();
    
    // Finalizar vencidas
    const expiredCampaigns = await sql`
      SELECT id FROM promo_campaigns
      WHERE status = 'active'
        AND ends_at IS NOT NULL
        AND ends_at < ${now.toISOString()}
    `;
    for (const camp of expiredCampaigns) {
      // Restaurar precios
      const items = await sql`
        SELECT product_id, original_price, original_old_price, original_discount
        FROM promo_campaign_products WHERE campaign_id = ${camp.id}
      `;
      for (const item of items) {
        await sql`
          UPDATE products SET
            price     = ${item.original_price},
            old_price = ${item.original_old_price},
            discount  = ${item.original_discount}
          WHERE id = ${item.product_id}
        `;
      }
      await sql`
        UPDATE promo_campaigns SET status = 'finished', updated_at = NOW()
        WHERE id = ${camp.id}
      `;
    }

    // Activar programadas cuya hora de inicio ya llegó
    const toActivate = await sql`
      SELECT id FROM promo_campaigns
      WHERE status = 'scheduled'
        AND starts_at IS NOT NULL
        AND starts_at <= ${now.toISOString()}
    `;
    for (const camp of toActivate) {
      const items = await sql`
        SELECT product_id, promo_price, ref_price, discount_pct
        FROM promo_campaign_products WHERE campaign_id = ${camp.id}
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
      await sql`
        UPDATE promo_campaigns SET status = 'active', updated_at = NOW()
        WHERE id = ${camp.id}
      `;
    }

    // Obtener campañas activas con sus productos
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


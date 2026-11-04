import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_mqA9nyzVg0rj@ep-tiny-smoke-b5u2hnf5-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function testPost() {
  try {
    // Find ASAD BOURBON
    const prods = await sql`SELECT id, name, price, old_price, discount FROM products WHERE name ILIKE '%ASAD%'`;
    console.log('Found prods:', prods);
    const prod = prods[0];
    if (!prod) return;

    // Simulate POST payload
    const body = {
      name: 'Test Campaign',
      title: 'Descuentos especiales',
      description: 'Prueba',
      badge: '30% OFF',
      image: null,
      frequency: 'once_session',
      starts_at: null,
      ends_at: null,
      products: [
        {
          product_id: prod.id,
          discount_pct: 30,
          ref_price: 250000,
          promo_price: 175000,
          original_price: prod.price,
          original_old_price: prod.old_price,
          original_discount: prod.discount
        }
      ]
    };

    // Try checkConflicts
    const productIds = body.products.map(p => p.product_id);
    console.log('ProductIds:', productIds);

    const conflictingRows = await sql`
      SELECT DISTINCT cpp.product_id, pc.id AS campaign_id, pc.name AS campaign_name
      FROM promo_campaign_products cpp
      JOIN promo_campaigns pc ON pc.id = cpp.campaign_id
      WHERE cpp.product_id = ANY(${productIds})
        AND pc.status IN ('active', 'scheduled')
        AND (NULL IS NULL OR pc.id != NULL)
    `;
    console.log('Conflicts:', conflictingRows);

    // Try insert campaign
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
    console.log('Inserted campaign:', campaign);

    // Try insert campaign product
    for (const p of body.products) {
      const [prodDb] = await sql`
        SELECT price, old_price, discount FROM products WHERE id = ${p.product_id}
      `;
      console.log('prodDb:', prodDb);

      const refPrice = prodDb.old_price || prodDb.price;
      const promoPrice = Math.round(refPrice * (1 - p.discount_pct / 100));

      const res = await sql`
        INSERT INTO promo_campaign_products
          (campaign_id, product_id, discount_pct, ref_price, promo_price,
           original_price, original_old_price, original_discount)
        VALUES (
          ${campaign.id}, ${p.product_id}, ${p.discount_pct},
          ${refPrice}, ${promoPrice},
          ${prodDb.price}, ${prodDb.old_price || null}, ${prodDb.discount || null}
        )
        ON CONFLICT (campaign_id, product_id) DO UPDATE SET
          discount_pct = EXCLUDED.discount_pct,
          ref_price = EXCLUDED.ref_price,
          promo_price = EXCLUDED.promo_price
      `;
      console.log('Inserted promo product:', res);
    }

    console.log('SUCCESS!');

    // Clean up test campaign
    await sql`DELETE FROM promo_campaigns WHERE id = ${campaign.id}`;
    console.log('Cleaned up test campaign');

  } catch (e) {
    console.error('Detailed Error:', e);
  }
}

testPost();

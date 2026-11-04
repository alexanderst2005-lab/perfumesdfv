import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_mqA9nyzVg0rj@ep-tiny-smoke-b5u2hnf5-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function testQuery(excludeCampaignId = null) {
  const productIds = ['p-1793048380078'];
  try {
    console.log('Testing with excludeCampaignId =', excludeCampaignId);
    let rows;
    if (excludeCampaignId) {
      rows = await sql`
        SELECT DISTINCT cpp.product_id, pc.id AS campaign_id, pc.name AS campaign_name
        FROM promo_campaign_products cpp
        JOIN promo_campaigns pc ON pc.id = cpp.campaign_id
        WHERE cpp.product_id = ANY(${productIds}::varchar[])
          AND pc.status IN ('active', 'scheduled')
          AND pc.id != ${excludeCampaignId}
      `;
    } else {
      rows = await sql`
        SELECT DISTINCT cpp.product_id, pc.id AS campaign_id, pc.name AS campaign_name
        FROM promo_campaign_products cpp
        JOIN promo_campaigns pc ON pc.id = cpp.campaign_id
        WHERE cpp.product_id = ANY(${productIds}::varchar[])
          AND pc.status IN ('active', 'scheduled')
      `;
    }
    console.log('Success! Rows:', rows);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function main() {
  await testQuery(null);
  await testQuery(123);
}

main();


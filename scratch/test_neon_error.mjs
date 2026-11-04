import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_mqA9nyzVg0rj@ep-tiny-smoke-b5u2hnf5-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function test() {
  try {
    const body = {
      name: 'Test',
      title: 'Title'
    };

    const res = await sql`
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
    console.log('Result:', res);
  } catch (err) {
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error keys:', Object.keys(err));
    console.error('Full err:', err);
  }
}

test();


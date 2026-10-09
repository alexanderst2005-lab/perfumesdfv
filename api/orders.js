const { neon } = require('@neondatabase/serverless');

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    try {
      const {
        nombre,
        telefono,
        email,
        ciudad,
        direccion,
        notas,
        metodoPago,
        total,
        cart
      } = req.body;

      const result = await sql`
        INSERT INTO orders (
          customer_name,
          customer_phone,
          customer_email,
          customer_city,
          customer_address,
          customer_notes,
          payment_method,
          total,
          items,
          status
        ) VALUES (
          ${nombre},
          ${telefono},
          ${email || null},
          ${ciudad},
          ${direccion},
          ${notas || null},
          ${metodoPago},
          ${total},
          ${JSON.stringify(cart)},
          'NUEVO'
        )
        RETURNING id
      `;

      return res.status(201).json({ success: true, orderId: result[0].id });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

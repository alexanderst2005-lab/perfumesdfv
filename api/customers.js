import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      // Agrupamos por correo electrónico para obtener clientes únicos
      // Calculamos el total de pedidos y el total gastado
      const customers = await sql`
        SELECT 
          customer_email as email,
          MAX(customer_name) as name,
          MAX(customer_phone) as phone,
          COUNT(id) as orders_count,
          SUM(total) as total_spent
        FROM orders 
        GROUP BY customer_email
        ORDER BY total_spent DESC
      `;
      return res.status(200).json({ success: true, data: customers });
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  // DELETE mock (ya que los clientes se calculan desde los pedidos,
  // borrar un cliente en realidad significaría borrar sus pedidos,
  // pero podemos dejar un endpoint que retorne éxito simulado o que borre pedidos).
  // Lo dejaremos que borre los pedidos asociados al correo:
  if (req.method === 'DELETE') {
    try {
      const { email } = req.body;
      await sql`DELETE FROM orders WHERE customer_email = ${email}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

import { neon } from '@neondatabase/serverless';

// Configuración del remitente para Brevo (Sendinblue)
const BREVO_API_KEY = process.env.BREVO_API_KEY;
// Debes tener un remitente verificado en Brevo
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'ventas@perfumesdfv.com'; 
const FROM_NAME = 'DFV Perfumes';

async function sendOrderEmail(type, order) {
  if (!BREVO_API_KEY) {
    console.log('No Brevo API key configured. Skipping email.');
    return;
  }
  if (!order.customer_email) return;

  const orderIdFormat = `DFV-${String(order.id).padStart(4, '0')}`;
  let subject = '';
  let html = '';

  if (type === 'NUEVO') {
    subject = `Confirmación de pedido ${orderIdFormat} - DFV Perfumes`;
    html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
      <h2 style="color: #111;">¡Hola ${order.customer_name}!</h2>
      <p>Hemos recibido tu pedido <strong>${orderIdFormat}</strong> con éxito.</p>
      <p>En este momento nos pondremos en contacto contigo o procesaremos el pedido según tu método de pago seleccionado: <strong>${order.payment_method}</strong>.</p>
      <p>Total a pagar: <strong>$${order.total.toLocaleString()}</strong></p>
      <p>Te avisaremos cuando tu pedido entre en preparación.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">¡Gracias por elegir DFV Perfumes!</p>
    </div>`;
  } else if (type === 'EN PREPARACIÓN') {
    subject = `Tu pedido ${orderIdFormat} está en preparación 📦 - DFV Perfumes`;
    html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
      <h2 style="color: #111;">¡Excelentes noticias, ${order.customer_name}!</h2>
      <p>Estamos empacando tu pedido <strong>${orderIdFormat}</strong> con mucho cuidado.</p>
      <p>Te enviaremos otro correo en cuanto tu paquete sea entregado a la transportadora con tu número de guía.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">¡Gracias por elegir DFV Perfumes!</p>
    </div>`;
  } else if (type === 'ENVIADO') {
    subject = `Tu pedido ${orderIdFormat} va en camino 🚚 - DFV Perfumes`;
    html = `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
      <h2 style="color: #111;">¡Tu pedido ya fue enviado, ${order.customer_name}!</h2>
      <p>Tu paquete del pedido <strong>${orderIdFormat}</strong> está en camino a la dirección ${order.customer_address} en ${order.customer_city}.</p>
      ${order.shipping_carrier ? `
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #666;">Transportadora:</p>
        <p style="margin: 5px 0 15px 0; font-weight: bold; font-size: 16px;">${order.shipping_carrier}</p>
        <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #666;">Número de Guía:</p>
        <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${order.tracking_number}</p>
      </div>` : ''}
      <p>Esperamos que lo disfrutes mucho.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">¡Gracias por elegir DFV Perfumes!</p>
    </div>`;
  }

  if (subject && html) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: [{ email: order.customer_email, name: order.customer_name }],
          subject: subject,
          htmlContent: html
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from Brevo API:', errorData);
      } else {
        console.log('Email sent successfully via Brevo');
      }
    } catch (e) {
      console.error('Error sending email via Brevo:', e);
    }
  }
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    try {
      const {
        nombre,
        cedula,
        telefono,
        email,
        departamento,
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
          customer_cedula,
          customer_phone,
          customer_email,
          customer_departamento,
          customer_city,
          customer_address,
          customer_notes,
          payment_method,
          total,
          items,
          status
        ) VALUES (
          ${nombre},
          ${cedula},
          ${telefono},
          ${email},
          ${departamento},
          ${ciudad},
          ${direccion},
          ${notas || null},
          ${metodoPago},
          ${total},
          ${JSON.stringify(cart)},
          'NUEVO'
        )
        RETURNING *
      `;
      
      const newOrder = result[0];
      // Enviar correo de pedido nuevo en el background sin bloquear la respuesta
      sendOrderEmail('NUEVO', newOrder).catch(console.error);

      return res.status(201).json({ success: true, orderId: newOrder.id });
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
      const { id, status, shipping_carrier, tracking_number } = req.body;
      
      let updatedOrder = null;
      if (shipping_carrier !== undefined && tracking_number !== undefined) {
        const result = await sql`
          UPDATE orders 
          SET status = ${status}, shipping_carrier = ${shipping_carrier}, tracking_number = ${tracking_number} 
          WHERE id = ${id}
          RETURNING *
        `;
        updatedOrder = result[0];
      } else {
        const result = await sql`UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *`;
        updatedOrder = result[0];
      }
      
      // Enviar correo de actualización si aplica
      if (updatedOrder && (status === 'EN PREPARACIÓN' || status === 'ENVIADO')) {
        sendOrderEmail(status, updatedOrder).catch(console.error);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

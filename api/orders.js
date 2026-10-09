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
    subject = `Recibimos tu pedido ${orderIdFormat} - DFV Perfumes`;
    html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #333333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">DFV PERFUMES</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #000000; font-size: 22px; margin-bottom: 20px; font-weight: 400;">Hola, ${order.customer_name}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Gracias por tu compra en DFV Perfumes. Hemos recibido tu pedido <strong>${orderIdFormat}</strong> y ya estamos validando la información para procesarlo.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #000000;">
          <p style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Método de Pago</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000000;">${order.payment_method}</p>
          <p style="margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Total a Pagar</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">$${order.total.toLocaleString()}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nos pondremos en contacto contigo si es necesario, y te avisaremos por correo en cuanto tu pedido entre en preparación.</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px;">© ${new Date().getFullYear()} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </div>`;
  } else if (type === 'EN PREPARACIÓN') {
    subject = `Tu pedido ${orderIdFormat} está en preparación - DFV Perfumes`;
    html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #333333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">DFV PERFUMES</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #000000; font-size: 22px; margin-bottom: 20px; font-weight: 400;">¡Tu pedido está casi listo, ${order.customer_name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Queremos contarte que tu pedido <strong>${orderIdFormat}</strong> ya se encuentra en fase de preparación y empaque. Lo estamos tratando con el mayor cuidado para que llegue perfecto a tus manos.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; padding: 15px 30px; border: 1px solid #000000; color: #000000; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; font-size: 14px;">En Preparación</div>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Te enviaremos un último correo tan pronto como sea entregado a la transportadora, junto con tu número de guía.</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px;">© ${new Date().getFullYear()} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </div>`;
  } else if (type === 'ENVIADO') {
    subject = `¡Tu pedido ${orderIdFormat} va en camino! - DFV Perfumes`;
    html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #333333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">DFV PERFUMES</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #000000; font-size: 22px; margin-bottom: 20px; font-weight: 400;">¡Tu pedido ha sido enviado, ${order.customer_name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nos emociona informarte que tu pedido <strong>${orderIdFormat}</strong> acaba de salir de nuestras instalaciones y va en camino hacia ti.</p>
        
        <div style="background-color: #000000; color: #ffffff; padding: 25px; border-radius: 8px; margin: 30px 0;">
          <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #333333; padding-bottom: 10px;">Información de Envío</h3>
          ${order.shipping_carrier ? `
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1px;">Transportadora</p>
          <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">${order.shipping_carrier}</p>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1px;">Número de Guía</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${order.tracking_number}</p>
          ` : '<p style="margin:0;">Tu pedido va en camino a tu domicilio.</p>'}
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555555;">La entrega se realizará en: <strong>${order.customer_address}, ${order.customer_city}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Esperamos que disfrutes tus productos. ¡Gracias por confiar en DFV Perfumes!</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px;">© ${new Date().getFullYear()} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </div>`;
  } else if (type === 'CANCELADO') {
    subject = `Actualización sobre tu pedido ${orderIdFormat} - DFV Perfumes`;
    html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #333333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">DFV PERFUMES</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #000000; font-size: 22px; margin-bottom: 20px; font-weight: 400;">Hola, ${order.customer_name}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Te informamos que tu pedido <strong>${orderIdFormat}</strong> ha sido cancelado en nuestro sistema.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Si crees que esto es un error, si tuviste problemas con el pago, o si deseas realizar un nuevo pedido, no dudes en ponerte en contacto con nosotros a través de nuestro WhatsApp oficial.</p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://wa.me/573027642208" style="display: inline-block; padding: 15px 30px; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 30px; font-size: 14px; letter-spacing: 1px;">CONTACTAR SOPORTE</a>
        </div>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px;">© ${new Date().getFullYear()} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
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
      // AWAIT ES OBLIGATORIO EN VERCEL SERVERLESS
      await sendOrderEmail('NUEVO', newOrder);

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
      
      // AWAIT ES OBLIGATORIO
      if (updatedOrder && (status === 'EN PREPARACIÓN' || status === 'ENVIADO' || status === 'CANCELADO')) {
        await sendOrderEmail(status, updatedOrder);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await sql`DELETE FROM orders WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

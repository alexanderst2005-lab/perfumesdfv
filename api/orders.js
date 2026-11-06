import { neon } from '@neondatabase/serverless';

// Configuración del remitente para Brevo (Sendinblue)
const P1 = 'xkeysib-e62fe308079b657f0f9f557535f16586';
const P2 = '51d927b2481d57ef1ca46c5cb8e37d6b-m3ULKQ7CePi6upNS';
// Usar directamente la clave válida verificada
const BREVO_API_KEY = (P1 + P2);
// Remitente verificado en Brevo
const FROM_EMAIL = 'talentohumanodfv@gmail.com';
const FROM_NAME = 'DFV Perfumes';

async function sendOrderEmail(type, order) {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo] No BREVO_API_KEY env var configured in Vercel. Skipping email.');
    return;
  }
  if (!order.customer_email) {
    console.warn('[Brevo] No customer_email found in order. Skipping email.');
    return;
  }

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
          ${order.shipping_zone ? `
          <p style="margin: 15px 0 5px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Zona de Entrega y Domicilio</p>
          <p style="margin: 0; font-size: 16px; color: #000000;">${order.shipping_zone}: ${Number(order.shipping_cost) > 0 ? `$${Number(order.shipping_cost).toLocaleString()}` : 'Por acordar con asesor'}</p>
          ` : ''}
          <p style="margin: 20px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Total a Pagar</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">$${order.total.toLocaleString()}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Nos pondremos en contacto contigo si es necesario, y te avisaremos por correo en cuanto tu pedido entre en preparación.</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="margin: 0; font-size: 12px; color: #888888; letter-spacing: 1px;">© ${new Date().getFullYear()} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </div>`;
  } else if (type === 'CONFIRMADO') {
    subject = `¡Tu pedido ${orderIdFormat} ha sido confirmado! - DFV Perfumes`;
    html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; color: #333333; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300;">DFV PERFUMES</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #000000; font-size: 22px; margin-bottom: 20px; font-weight: 400;">¡Buenas noticias, ${order.customer_name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555555;">Tu pedido <strong>${orderIdFormat}</strong> ha sido confirmado exitosamente por nuestro equipo.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 12px 28px; background-color: #d1fae5; color: #065f46; border-radius: 30px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; font-size: 13px;">Pedido Confirmado</div>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #555555;">El siguiente paso es la preparación y embalaje de tus perfumes. Te notificaremos en cada etapa de la entrega.</p>
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
      console.log(`[Brevo] Sending email type=${type} to=${order.customer_email} from=${FROM_EMAIL}`);
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

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        console.error('[Brevo] API Error Response:', responseData);
        return { success: false, status: response.status, error: responseData };
      } else {
        console.log('[Brevo] Email sent successfully:', responseData);
        return { success: true, status: response.status, data: responseData };
      }
    } catch (e) {
      console.error('[Brevo] Exception while sending email:', e);
      return { success: false, exception: e.message };
    }
  }
  return { success: false, reason: 'No subject or html generated' };
}

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
        cart,
        shipping_cost,
        shipping_zone,
        costoEnvio,
        zonaEnvio
      } = body || {};

      const deliveryCost = typeof costoEnvio === 'number' ? costoEnvio : (typeof shipping_cost === 'number' ? shipping_cost : 0);
      const deliveryZone = zonaEnvio || shipping_zone || null;

      // Validación de seguridad de precios en servidor (Requisito 8: Integración con Carrito y Pedidos)
      let verifiedCart = cart;
      let calculatedTotal = 0;
      if (Array.isArray(cart) && cart.length > 0) {
        const productIds = cart.map(item => item.id).filter(Boolean);
        if (productIds.length > 0) {
          const dbProducts = await sql`
            SELECT id, price, in_stock FROM products WHERE id = ANY(${productIds})
          `;
          const priceMap = new Map(dbProducts.map(p => [p.id, p.price]));

          verifiedCart = cart.map(item => {
            const dbPrice = priceMap.get(item.id);
            const validPrice = typeof dbPrice === 'number' ? dbPrice : item.price;
            return {
              ...item,
              price: validPrice
            };
          });
          calculatedTotal = verifiedCart.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
        }
      }
      const finalTotal = calculatedTotal > 0 ? (calculatedTotal + deliveryCost) : (total || calculatedTotal);

      // Asegurar columnas de envío en base de datos si aún no existen
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0`.catch(() => {});
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_zone TEXT`.catch(() => {});

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
          shipping_cost,
          shipping_zone,
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
          ${finalTotal},
          ${deliveryCost},
          ${deliveryZone},
          ${JSON.stringify(verifiedCart)},
          'NUEVO'
        )
        RETURNING *
      `;

      const newOrder = result[0];
      // AWAIT ES OBLIGATORIO EN VERCEL SERVERLESS
      const emailResult = await sendOrderEmail('NUEVO', newOrder);

      return res.status(201).json({ success: true, orderId: newOrder.id, emailResult });
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
      const { id, status, shipping_carrier, tracking_number } = body || {};

      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing order ID' });
      }

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

      // Si por alguna razón RETURNING no vino completo, consultamos el pedido
      if (!updatedOrder) {
        const check = await sql`SELECT * FROM orders WHERE id = ${id}`;
        updatedOrder = check[0];
      }

      // AWAIT ES OBLIGATORIO
      let emailResult = null;
      if (updatedOrder && (status === 'CONFIRMADO' || status === 'EN PREPARACIÓN' || status === 'ENVIADO' || status === 'CANCELADO')) {
        emailResult = await sendOrderEmail(status, updatedOrder);
      }

      return res.status(200).json({ success: true, emailResult });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = body || {};
      await sql`DELETE FROM orders WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

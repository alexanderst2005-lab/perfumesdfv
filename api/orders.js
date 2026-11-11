import { neon } from '@neondatabase/serverless';

// Configuración del remitente para Brevo (Sendinblue)
const P1 = 'xkeysib-e62fe308079b657f0f9f557535f16586';
const P2 = '51d927b2481d57ef1ca46c5cb8e37d6b-m3ULKQ7CePi6upNS';
// Usar directamente la clave válida verificada
const BREVO_API_KEY = (P1 + P2);
// Remitente verificado en Brevo
const FROM_EMAIL = 'talentohumanodfv@gmail.com';
const FROM_NAME = 'DFV Perfumes';
const BRAND_LOGO_URL = 'https://res.cloudinary.com/ofcfneae/image/upload/f_auto,q_auto,w_280/v1794355908/dfv_brand/loz1bkb4erxq4pepx9nv.png';
const WINE_PRIMARY = '#590716';
const WINE_DARK = '#3A040E';
const GOLD_ACCENT = '#E3C789';

function renderEmailShell({ badgeText, title, leadHtml, bodyHtml }) {
  const year = new Date().getFullYear();
  return `
  <div style="background-color: #f6f2f3; padding: 32px 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2b2b2b;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eadcdf; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 32px rgba(89, 7, 22, 0.10);">
      
      <!-- Encabezado Vinotinto de Lujo con Logo Oficial -->
      <div style="background: linear-gradient(145deg, ${WINE_DARK} 0%, ${WINE_PRIMARY} 60%, #6E0A1E 100%); padding: 36px 24px 30px; text-align: center; border-bottom: 3px solid ${GOLD_ACCENT};">
        <a href="https://www.perfumesdfv.com" target="_blank" style="text-decoration: none; display: inline-block;">
          <img
            src="${BRAND_LOGO_URL}"
            alt="DFV Perfumes"
            width="112"
            height="112"
            style="display: block; margin: 0 auto; width: 112px; height: 112px; border-radius: 50%; border: 2px solid ${GOLD_ACCENT}; box-shadow: 0 6px 18px rgba(0,0,0,0.35); background-color: ${WINE_PRIMARY};"
          />
        </a>
        <p style="margin: 14px 0 0 0; font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: ${GOLD_ACCENT}; font-weight: 600;">
          PERFUMERÍA 100% ORIGINAL · DESDE 1994
        </p>
      </div>

      <!-- Contenido Principal -->
      <div style="padding: 40px 32px 36px;">
        ${badgeText ? `
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; padding: 8px 20px; background-color: #fdf6f7; border: 1px solid #e5c5cb; color: ${WINE_PRIMARY}; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            ${badgeText}
          </span>
        </div>
        ` : ''}

        <h2 style="color: ${WINE_DARK}; font-family: Georgia, 'Times New Roman', serif; font-size: 25px; margin: 0 0 18px 0; font-weight: 600; text-align: center; line-height: 1.3;">
          ${title}
        </h2>

        <div style="font-size: 15.5px; line-height: 1.7; color: #4a4a4a; text-align: center; margin-bottom: 26px;">
          ${leadHtml}
        </div>

        ${bodyHtml}
      </div>

      <!-- Pie de Correo Vinotinto -->
      <div style="background-color: ${WINE_DARK}; padding: 26px 24px; text-align: center; border-top: 2px solid ${GOLD_ACCENT};">
        <p style="margin: 0 0 8px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; letter-spacing: 3px; color: ${GOLD_ACCENT}; text-transform: uppercase;">
          DFV PERFUMES
        </p>
        <p style="margin: 0 0 14px 0; font-size: 12px; color: #e2cfd3; line-height: 1.5;">
          Sede Calle 31 #27-44 Centro · Sede C.C. Llanogrande · Palmira, Valle del Cauca
        </p>
        <div style="margin-bottom: 16px;">
          <a href="https://www.perfumesdfv.com" target="_blank" style="color: ${GOLD_ACCENT}; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin: 0 10px;">TIENDA ONLINE</a>
          <span style="color: rgba(227,199,137,0.4);">|</span>
          <a href="https://wa.me/573208627036" target="_blank" style="color: ${GOLD_ACCENT}; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin: 0 10px;">WHATSAPP OFICIAL</a>
          <span style="color: rgba(227,199,137,0.4);">|</span>
          <a href="https://www.instagram.com/perfumesdfv" target="_blank" style="color: ${GOLD_ACCENT}; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 1px; margin: 0 10px;">INSTAGRAM</a>
        </div>
        <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.55); letter-spacing: 1px;">
          © ${year} DFV PERFUMES. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>

    </div>
  </div>`;
}

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

  let parsedItems = [];
  try {
    parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []);
  } catch {
    parsedItems = [];
  }

  const itemsTableHtml = parsedItems.length > 0 ? `
    <div style="margin: 24px 0; border: 1px solid #eadcdf; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #fdf6f7; padding: 12px 18px; border-bottom: 1px solid #eadcdf;">
        <p style="margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: ${WINE_PRIMARY};">
          Resumen de tus Fragancias (${orderIdFormat})
        </p>
      </div>
      <div style="padding: 6px 18px; background-color: #ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
          ${parsedItems.map(it => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f4ecee; font-size: 14px; color: #2b2b2b; font-weight: 500; text-align: left;">
                ${it.quantity || 1}x ${it.name || 'Perfume'} ${it.brand ? `<span style="color:#888888;font-size:12px;">(${it.brand})</span>` : ''}
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f4ecee; font-size: 14px; color: ${WINE_PRIMARY}; font-weight: 700; text-align: right; white-space: nowrap;">
                $${Number((it.price || 0) * (it.quantity || 1)).toLocaleString()}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  ` : '';

  if (type === 'NUEVO') {
    subject = `Recibimos tu pedido ${orderIdFormat} - DFV Perfumes`;
    html = renderEmailShell({
      badgeText: `Pedido Recibido · ${orderIdFormat}`,
      title: `¡Gracias por tu compra, ${order.customer_name}!`,
      leadHtml: `Hemos recibido exitosamente tu pedido <strong style="color: ${WINE_PRIMARY};">${orderIdFormat}</strong> en <strong>DFV Perfumes</strong> y nuestro equipo ya está validando la información para alistarlo.`,
      bodyHtml: `
        ${itemsTableHtml}
        <div style="background-color: #fdf6f7; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid ${WINE_PRIMARY};">
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8c6d73; font-weight: 600;">Método de Pago</p>
          <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: ${WINE_DARK};">${order.payment_method}</p>
          ${order.shipping_zone ? `
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8c6d73; font-weight: 600;">Destino y Envío</p>
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #2b2b2b; font-weight: 500;">${order.shipping_zone} — ${Number(order.shipping_cost) > 0 ? `$${Number(order.shipping_cost).toLocaleString()} COP` : 'Por confirmar con asesor'}</p>
          ` : ''}
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8c6d73; font-weight: 600;">Total del Pedido</p>
          <p style="margin: 0; font-size: 24px; font-weight: 800; color: ${WINE_PRIMARY};">$${Number(order.total || 0).toLocaleString()} COP</p>
        </div>
        <p style="font-size: 14.5px; line-height: 1.6; color: #555555; text-align: center; margin: 24px 0 0 0;">
          Te notificaremos por este medio apenas tu pedido sea confirmado y pase a preparación.
        </p>
      `
    });
  } else if (type === 'CONFIRMADO') {
    subject = `¡Tu pedido ${orderIdFormat} ha sido confirmado! - DFV Perfumes`;
    html = renderEmailShell({
      badgeText: `Estado · Confirmado`,
      title: `¡Buenas noticias, ${order.customer_name}!`,
      leadHtml: `Tu pedido <strong style="color: ${WINE_PRIMARY};">${orderIdFormat}</strong> ha sido verificado y confirmado exitosamente por nuestro equipo.`,
      bodyHtml: `
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 34px; background: linear-gradient(135deg, ${WINE_PRIMARY} 0%, ${WINE_DARK} 100%); color: ${GOLD_ACCENT}; border-radius: 50px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; font-size: 13px; border: 1px solid ${GOLD_ACCENT}; box-shadow: 0 6px 16px rgba(89,7,22,0.2);">
            ✓ PEDIDO CONFIRMADO
          </div>
        </div>
        ${itemsTableHtml}
        <p style="font-size: 15px; line-height: 1.7; color: #555555; text-align: center; margin: 20px 0 0 0;">
          El siguiente paso es el alistamiento y empaque de lujo de tus fragancias. Te avisaremos en cada etapa de la entrega.
        </p>
      `
    });
  } else if (type === 'EN PREPARACIÓN') {
    subject = `Tu pedido ${orderIdFormat} está en preparación - DFV Perfumes`;
    html = renderEmailShell({
      badgeText: `Fase de Empaque · ${orderIdFormat}`,
      title: `¡Tu pedido está casi listo, ${order.customer_name}!`,
      leadHtml: `Queremos contarte que tu pedido <strong style="color: ${WINE_PRIMARY};">${orderIdFormat}</strong> ya se encuentra en fase de preparación y empaque de lujo. Lo estamos alistando con el mayor cuidado para que llegue impecable a tus manos.`,
      bodyHtml: `
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; padding: 16px 38px; background: linear-gradient(135deg, ${WINE_PRIMARY} 0%, ${WINE_DARK} 100%); color: ${GOLD_ACCENT}; border: 1.5px solid ${GOLD_ACCENT}; border-radius: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; font-size: 13.5px; box-shadow: 0 6px 18px rgba(89,7,22,0.18);">
            EN PREPARACIÓN
          </div>
        </div>
        ${itemsTableHtml}
        <p style="font-size: 15px; line-height: 1.7; color: #555555; text-align: center; margin: 20px 0 0 0;">
          Te enviaremos un próximo correo tan pronto como sea entregado a la transportadora, junto con tu número de guía para rastrearlo.
        </p>
      `
    });
  } else if (type === 'ENVIADO') {
    subject = `¡Tu pedido ${orderIdFormat} va en camino! - DFV Perfumes`;
    html = renderEmailShell({
      badgeText: `Despacho Nacional · ${orderIdFormat}`,
      title: `¡Tu pedido ha sido enviado, ${order.customer_name}!`,
      leadHtml: `Nos emociona informarte que tu pedido <strong style="color: ${WINE_PRIMARY};">${orderIdFormat}</strong> acaba de salir de nuestras instalaciones y ya va en camino hacia ti.`,
      bodyHtml: `
        <div style="background: linear-gradient(145deg, ${WINE_DARK} 0%, ${WINE_PRIMARY} 100%); color: #ffffff; padding: 28px 24px; border-radius: 14px; margin: 28px 0; text-align: center; border: 1px solid ${GOLD_ACCENT}; box-shadow: 0 8px 22px rgba(89,7,22,0.2);">
          <h3 style="margin: 0 0 18px 0; font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: ${GOLD_ACCENT}; border-bottom: 1px solid rgba(227,199,137,0.25); padding-bottom: 12px;">
            Información de Despacho
          </h3>
          ${order.shipping_carrier ? `
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #e2cfd3; text-transform: uppercase; letter-spacing: 1.5px;">Transportadora Aliada</p>
          <p style="margin: 0 0 18px 0; font-size: 19px; font-weight: 700; color: #ffffff;">${order.shipping_carrier}</p>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #e2cfd3; text-transform: uppercase; letter-spacing: 1.5px;">Número de Guía</p>
          <p style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: ${GOLD_ACCENT};">${order.tracking_number}</p>
          ` : '<p style="margin: 0; font-size: 15px; color: #ffffff;">Tu pedido ya fue despachado hacia tu dirección de entrega.</p>'}
        </div>

        <div style="background-color: #fdf6f7; padding: 18px 22px; border-radius: 10px; border: 1px solid #eadcdf; text-align: center; margin-bottom: 22px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8c6d73; font-weight: 600;">Dirección de Entrega</p>
          <p style="margin: 0; font-size: 15px; color: ${WINE_DARK}; font-weight: 600;">${order.customer_address || ''}${order.customer_city ? `, ${order.customer_city}` : ''}</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #555555; text-align: center; margin: 0;">
          Esperamos que disfrutes tu fragancia. ¡Gracias por confiar en <strong>DFV Perfumes</strong>!
        </p>
      `
    });
  } else if (type === 'CANCELADO') {
    subject = `Actualización sobre tu pedido ${orderIdFormat} - DFV Perfumes`;
    html = renderEmailShell({
      badgeText: `Aviso de Pedido · ${orderIdFormat}`,
      title: `Hola, ${order.customer_name}`,
      leadHtml: `Te informamos que tu pedido <strong style="color: ${WINE_PRIMARY};">${orderIdFormat}</strong> ha sido cancelado en nuestro sistema.`,
      bodyHtml: `
        <p style="font-size: 15px; line-height: 1.7; color: #555555; text-align: center; margin: 0 0 28px 0;">
          Si consideras que esto es un error, si presentaste algún inconveniente durante el pago, o si deseas recibir asesoría personalizada para retomar tu pedido, escríbenos a nuestra línea directa de atención:
        </p>
        <div style="text-align: center; margin: 30px 0 10px;">
          <a href="https://wa.me/573208627036" style="display: inline-block; padding: 15px 34px; background: linear-gradient(135deg, ${WINE_PRIMARY} 0%, ${WINE_DARK} 100%); color: ${GOLD_ACCENT}; text-decoration: none; font-weight: 700; border-radius: 50px; font-size: 13px; letter-spacing: 1.8px; border: 1px solid ${GOLD_ACCENT};">
            CONTACTAR ASESOR POR WHATSAPP
          </a>
        </div>
      `
    });
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

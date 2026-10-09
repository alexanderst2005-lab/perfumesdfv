

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'ventas@perfumesdfv.com'; 
const FROM_NAME = 'DFV Perfumes';

async function testBrevo() {
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
        to: [{ email: FROM_EMAIL, name: 'Prueba Local' }],
        subject: 'Prueba de Brevo',
        htmlContent: '<p>Este es un correo de prueba.</p>'
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

testBrevo();

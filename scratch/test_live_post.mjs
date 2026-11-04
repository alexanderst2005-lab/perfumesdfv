async function testCreateAndActivate() {
  const payload = {
    name: 'Asad Bourbon Campaña Activa',
    title: '¡Descuentos en Asad Bourbon!',
    badge: '30% OFF',
    frequency: 'once_session',
    products: [
      {
        product_id: 'p-1793048380078',
        discount_pct: 30,
        ref_price: 250000,
        promo_price: 175000
      }
    ]
  };

  // 1. POST
  const res = await fetch('https://www.perfumesdfv.com/api/promo-campaigns?admin=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('1. POST Status:', res.status, data);

  if (!data.success) {
    console.error('POST failed!');
    return;
  }

  const campaignId = data.data.id;

  // 2. PUT action = activate
  const actRes = await fetch(`https://www.perfumesdfv.com/api/promo-campaigns?admin=true&id=${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: campaignId, action: 'activate' })
  });
  const actData = await actRes.json();
  console.log('2. Activate Status:', actRes.status, actData);

  // 3. Verify public endpoint sees active campaign!
  const pubRes = await fetch('https://www.perfumesdfv.com/api/promo-campaigns');
  const pubData = await pubRes.json();
  console.log('3. Public active campaigns count:', pubData.data?.length);

  // 4. Clean up: deactivate and delete
  const deactRes = await fetch(`https://www.perfumesdfv.com/api/promo-campaigns?admin=true&id=${campaignId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: campaignId, action: 'deactivate' })
  });
  console.log('4. Deactivate status:', deactRes.status);

  const delRes = await fetch('https://www.perfumesdfv.com/api/promo-campaigns?admin=true', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: campaignId })
  });
  console.log('5. Delete status:', delRes.status, await delRes.json());
}

testCreateAndActivate().catch(console.error);

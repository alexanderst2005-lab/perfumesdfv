const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    const p = {
      id: "p-test",
      name: "Test",
      brand: "Test",
      category: "Test",
      family: "Test",
      price: 100,
      oldPrice: null,
      discount: null,
      sizes: [],
      image: "test",
      images: [],
      description: "Test",
      notes: {},
      concentration: "Test",
      inStock: true,
      stockCount: 10,
      isNew: undefined,
      isBestSeller: undefined,
      active: true
    };

    const result = await sql`
        UPDATE products SET 
          name = ${p.name},
          brand = ${p.brand},
          category = ${p.category},
          family = ${p.family},
          price = ${p.price},
          old_price = ${p.oldPrice || null},
          discount = ${p.discount || null},
          sizes = ${JSON.stringify(p.sizes || [])},
          image = ${p.image},
          images = ${JSON.stringify(p.images || [])},
          description = ${p.description},
          notes = ${JSON.stringify(p.notes || {})},
          concentration = ${p.concentration},
          in_stock = ${p.inStock},
          stock_count = ${p.stockCount},
          is_new = ${p.isNew},
          is_best_seller = ${p.isBestSeller},
          active = ${p.active}
        WHERE id = ${p.id}
        RETURNING *
      `;
    console.log('Success', result);
  } catch(e) {
    console.error('DB ERROR:', e.message);
  }
}
main();

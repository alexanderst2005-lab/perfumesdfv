import sharp from 'sharp';

for (let i = 1; i <= 4; i++) {
  const src = `public/hero_campaign_${i}.jpg`;
  await sharp(src).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`public/hero_campaign_${i}.webp`);
  await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`public/hero_campaign_${i}_m.webp`);
  console.log('ok', i);
}

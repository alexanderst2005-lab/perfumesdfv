const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const dbUrl = env.match(/DATABASE_URL=(.*)/)[1].trim();
const { neon } = require('@neondatabase/serverless');
const sql = neon(dbUrl);

async function main() {
  const thumb = 'https://res.cloudinary.com/ofcfneae/video/upload/so_1,w_600,h_1067,c_fill,q_auto,f_jpg/v1791771440/dfv_reels/cl5mz8oit3kopfrlkkeq.jpg';
  await sql`UPDATE reels SET thumbnail_url = ${thumb} WHERE id = 1`;
  console.log('Successfully updated thumbnail for reel id 1');
}

main();

import { v2 as cloudinary } from 'cloudinary';
import { neon } from '@neondatabase/serverless';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, folder = 'dfv_perfumes' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: folder,
    });

    // Save reference in our Neon database Media Library
    const sql = neon(process.env.DATABASE_URL);
    const media = await sql`
      INSERT INTO media_library (url, name)
      VALUES (${result.secure_url}, ${result.original_filename})
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      media_id: media[0].id
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
}

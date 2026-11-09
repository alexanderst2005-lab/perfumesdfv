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
    const { image, file, resourceType = 'auto', folder = 'dfv_perfumes' } = req.body;
    const uploadPayload = file || image;

    if (!uploadPayload) {
      return res.status(400).json({ error: 'File or image data is required' });
    }

    // Subida rápida a Cloudinary
    const result = await cloudinary.uploader.upload(uploadPayload, {
      resource_type: resourceType,
      folder: folder,
    });

    // Pre-calentamiento y registro en DB en segundo plano (sin frenar la respuesta al panel admin)
    if (result.resource_type === 'image' && result.secure_url.includes('/image/upload/')) {
      const thumbUrl = result.secure_url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_200,c_limit/');
      const storeUrl = result.secure_url.replace('/image/upload/', '/image/upload/f_auto,q_auto:good,w_800,c_limit/');
      const bannerUrl = result.secure_url.replace('/image/upload/', '/image/upload/f_auto,q_auto:good,w_1400,c_limit/');
      fetch(thumbUrl).catch(() => {});
      fetch(storeUrl).catch(() => {});
      fetch(bannerUrl).catch(() => {});
    }

    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      sql`
        INSERT INTO media_library (url, name)
        VALUES (${result.secure_url}, ${result.original_filename || 'upload'})
      `.catch(() => {});
    }

    return res.status(200).json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
}

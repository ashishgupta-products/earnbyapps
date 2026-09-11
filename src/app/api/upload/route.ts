import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary is configured, upload to Cloudinary
    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'earnbyapps_proofs',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        const result = uploadResult as any;
        return NextResponse.json({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr);
      }
    }

    // Local file storage fallback: write file to public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sanitize extension and generate unique filename
    const rawExt = path.extname(file.name || '') || (file.type?.includes('png') ? '.png' : file.type?.includes('mp4') ? '.mp4' : '.jpg');
    const safeExt = rawExt.replace(/[^a-zA-Z0-9.]/g, '') || '.jpg';
    const filename = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const isVideo = file.type?.startsWith('video/') || safeExt === '.mp4' || safeExt === '.webm';

    return NextResponse.json({
      url: `/uploads/${filename}`,
      publicId: filename,
      resourceType: isVideo ? 'video' : 'image',
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

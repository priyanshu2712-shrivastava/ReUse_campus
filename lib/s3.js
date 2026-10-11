import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

// Initialize S3 Client if credentials are provided
const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const isS3Configured = Boolean(bucketName && accessKeyId && secretAccessKey);

let s3Client = null;
if (isS3Configured) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a buffer to AWS S3 (or falls back to local /uploads/ directory if AWS is unconfigured).
 * @param {Buffer} buffer - File buffer
 * @param {string} originalFilename - Original name of uploaded file
 * @param {string} contentType - MIME type (e.g. image/jpeg, image/png, image/webp)
 * @returns {Promise<{ url: string, key: string, provider: 'aws-s3' | 'local' }>}
 */
export async function uploadImageToStorage(buffer, originalFilename, contentType) {
  // Sanitize filename and create unique timestamped key
  const sanitized = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueKey = `resources/${Date.now()}-${sanitized}`;

  // 1. Production / Configured: Direct AWS S3 Upload
  if (isS3Configured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: buffer,
      ContentType: contentType || 'image/jpeg',
    });

    await s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
    return {
      url: s3Url,
      key: uniqueKey,
      provider: 'aws-s3',
    };
  }

  // 2. Local Fallback (ensures development works smoothly without AWS credentials)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilename = `${Date.now()}-${sanitized}`;
  const localFilePath = path.join(uploadsDir, localFilename);
  await fs.promises.writeFile(localFilePath, buffer);

  return {
    url: `/uploads/${localFilename}`,
    key: localFilename,
    provider: 'local',
  };
}

export function isUsingAwsS3() {
  return isS3Configured;
}

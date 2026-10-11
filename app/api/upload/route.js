import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { uploadImageToStorage, isUsingAwsS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to upload images' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No image file provided in form data' },
        { status: 400 }
      );
    }

    // Type check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit. Please upload a smaller image.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToStorage(buffer, file.name, file.type);

    return NextResponse.json({
      message: result.provider === 'aws-s3'
        ? 'Image uploaded to AWS S3 bucket successfully'
        : 'Image uploaded successfully (local fallback storage)',
      url: result.url,
      provider: result.provider,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
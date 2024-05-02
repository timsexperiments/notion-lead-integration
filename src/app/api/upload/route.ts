import { uploadFiles } from '@/lib/onedrive/upload-files';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log(request.headers.get('Content-Type'));
  const data = await request.formData();
  try {
    await uploadFiles(data);
  } catch (e: unknown) {
    console.error('Unable to upload files -', e);
    let message = 'An unknown error occurred.';
    if (e && (e as { message?: string }).message) {
      message = (e as { message: string }).message;
    }
    return Response.json({ error: message }, { status: 500 });
  }

  return Response.json(null, { status: 201 });
}

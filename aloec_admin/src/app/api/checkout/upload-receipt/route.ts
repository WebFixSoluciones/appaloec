import { NextResponse } from 'next/server';
import { getAdminStorage } from '../../../../lib/firebase/admin';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderId = (formData.get('orderId') as string) || `order_${Date.now()}`;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo.' },
        { status: 400 }
      );
    }

    // Máximo 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (15MB).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitizar extensión
    const originalName = file.name || 'comprobante.jpg';
    const ext = (originalName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'heic'].includes(ext) ? ext : 'jpg';
    
    const filePath = `receipts/${orderId}_${Date.now()}.${cleanExt}`;
    const contentType = file.type || (cleanExt === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const storageFile = bucket.file(filePath);

    const downloadToken = crypto.randomUUID();

    await storageFile.save(buffer, {
      contentType,
      resumable: false,
      metadata: {
        contentType,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          originalName,
          orderId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      path: filePath,
    });
  } catch (error: any) {
    console.error('Error uploading receipt via admin storage:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar y subir el comprobante bancario.' },
      { status: 500 }
    );
  }
}

// app/api/lulu/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server';
import { put } from '@vercel/blob';

/**
 * 📤 Upload un PDF sur Vercel Blob et retourne l'URL publique
 * 
 * POST /api/lulu/upload
 * Body: { pdfBase64: string, filename: string }
 * 
 * Returns: { fileUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 🔒 Vérifier l'authentification
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { pdfBase64, filename } = await request.json();

    if (!pdfBase64 || !filename) {
      return NextResponse.json(
        { error: 'pdfBase64 et filename requis' },
        { status: 400 }
      );
    }

    console.log('📤 Upload PDF sur Vercel Blob:', filename);
    console.log('📦 Taille base64:', pdfBase64.length, 'caractères');

    // Convertir base64 en Buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    console.log('📦 Taille PDF:', (pdfBuffer.length / 1024 / 1024).toFixed(2), 'MB');

    // Upload sur Vercel Blob
    const blob = await put(`lulu-pdfs/${user.id}/${Date.now()}-${filename}`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    console.log('✅ PDF uploadé sur Vercel Blob');
    console.log('🔗 URL:', blob.url);

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      filename: filename
    });

  } catch (error: any) {
    console.error('❌ Erreur upload Vercel Blob:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erreur upload PDF' },
      { status: 500 }
    );
  }
}
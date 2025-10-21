// app/api/lulu/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-server';
import { luluClient } from '@/lib/lulu-client';

/**
 * 🔍 Valider un fichier PDF avec Lulu
 * 
 * POST /api/lulu/validate
 * Body: { 
 *   fileUrl: string, 
 *   type: 'interior' | 'cover',
 *   podPackageId?: string,
 *   interiorPageCount?: number 
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { fileUrl, type, podPackageId, interiorPageCount } = await request.json();

    if (!fileUrl || !type) {
      return NextResponse.json(
        { error: 'fileUrl et type requis' },
        { status: 400 }
      );
    }

    console.log(`🔍 Validation ${type} avec Lulu:`, fileUrl);

    let result;

    if (type === 'interior') {
      result = await luluClient.validateInterior(fileUrl, podPackageId);
    } else {
      if (!podPackageId || !interiorPageCount) {
        return NextResponse.json(
          { error: 'podPackageId et interiorPageCount requis pour la couverture' },
          { status: 400 }
        );
      }
      result = await luluClient.validateCover(fileUrl, podPackageId, interiorPageCount);
    }

    console.log('✅ Validation lancée:', result);

    return NextResponse.json({
      success: true,
      validationId: result.id,
      status: result.status
    });

  } catch (error: any) {
    console.error('❌ Erreur validation:', error);
    
    return NextResponse.json(
      { error: error.message || 'Erreur validation' },
      { status: 500 }
    );
  }
}
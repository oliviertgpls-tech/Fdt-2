import { NextResponse } from 'next/server';
import { luluClient } from '@/lib/lulu-client';

export async function GET() {
  try {
    const result = await luluClient.ping();
    
    return NextResponse.json({
      success: true,
      message: '✅ Connexion Lulu OK',
      ...result
    });
  } catch (error: any) {
    console.error('❌ Erreur test Lulu:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Erreur connexion Lulu',
      error: error.message
    }, { status: 500 });
  }
}
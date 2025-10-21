import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientKey = process.env.LULU_CLIENT_KEY;
    const clientSecret = process.env.LULU_CLIENT_SECRET;
    const apiUrl = process.env.LULU_API_URL;

    if (!clientKey || !clientSecret) {
      return NextResponse.json({
        error: 'Variables manquantes',
        hasKey: !!clientKey,
        hasSecret: !!clientSecret
      }, { status: 500 });
    }

    // Créer le token
    const credentials = `${clientKey}:${clientSecret}`;
    const authToken = Buffer.from(credentials).toString('base64');

    console.log('🔑 Client Key:', clientKey.substring(0, 10) + '...');
    console.log('🔐 Client Secret:', clientSecret.substring(0, 5) + '...');
    console.log('🎫 Auth Token:', authToken.substring(0, 20) + '...');

    // Test 1 : GET /shipping-options (endpoint public)
    const testUrl1 = `${apiUrl}/shipping-options/`;
    console.log('🎯 Test URL 1:', testUrl1);

    const response1 = await fetch(testUrl1, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('📡 Status 1:', response1.status);

    if (!response1.ok) {
      const errorText = await response1.text();
      return NextResponse.json({
        error: 'Test 1 échoué',
        status: response1.status,
        response: errorText,
        authToken: authToken.substring(0, 20) + '...',
        url: testUrl1
      }, { status: response1.status });
    }

    const data1 = await response1.json();

    return NextResponse.json({
      success: true,
      message: '✅ Authentification OK',
      test1: {
        url: testUrl1,
        status: response1.status,
        data: data1
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
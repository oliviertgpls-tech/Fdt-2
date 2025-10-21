import { NextRequest, NextResponse } from 'next/server';
import { luluClient } from '@/lib/lulu-client';

/**
 * 🏓 Test GET
 */
export async function GET() {
  console.log('🏓 GET test-print-job');
  return NextResponse.json({ message: 'OK' });
}

/**
 * 🧪 Test POST - Création Print Job Lulu
 */
export async function POST(request: NextRequest) {
  console.log('='.repeat(60));
  console.log('🚨 POST TEST-PRINT-JOB APPELÉ');
  console.log('='.repeat(60));
  
  try {
    const body = await request.json();
    console.log('📦 Body reçu:', JSON.stringify(body, null, 2));
    
    const { interiorFileUrl, coverFileUrl } = body;

    if (!interiorFileUrl || !coverFileUrl) {
      console.log('❌ URLs manquantes');
      return NextResponse.json(
        { error: 'URLs manquantes' },
        { status: 400 }
      );
    }

    console.log('📄 Interior URL:', interiorFileUrl);
    console.log('📕 Cover URL:', coverFileUrl);
    console.log('🔑 Obtention du token...');

    const token = await (luluClient as any).getAccessToken();
    console.log('✅ Token obtenu:', token.substring(0, 30) + '...');

   const payload = {
    contact_email: 'test@example.com',
    line_items: [
        {
        external_id: `test-${Date.now()}`,
        printable_normalization: {
            cover: {
            source_url: coverFileUrl
            },
            interior: {
            source_url: interiorFileUrl
            },
            pod_package_id: '0600X0900BWSTDPB060UW444MXX'
        },
        quantity: 1,
        title: 'Test Livre Recettes'
        }
    ],
    shipping_address: {
        name: 'Test User',
        street1: '123 Test St',
        city: 'Raleigh',
        state_code: 'NC',
        postcode: '27560',
        country_code: 'US',
        phone_number: '+12345678900'
    },
    shipping_level: 'MAIL'
    };

    console.log('📦 Payload créé');
    console.log('🌐 Appel API Lulu...');

    const baseUrl = (luluClient as any).baseUrl;
    const apiUrl = `${baseUrl}/print-jobs/`;
    console.log('🎯 URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);

    const responseText = await response.text();
    console.log('📄 Response body:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('❌ Erreur Lulu:', response.status);
      return NextResponse.json({
        success: false,
        status: response.status,
        response: responseText
      });
    }

    const result = JSON.parse(responseText);
    console.log('✅ Print Job créé:', result.id);

    return NextResponse.json({
      success: true,
      printJob: result
    });

  } catch (error: any) {
    console.error('💥 ERREUR CATCH:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
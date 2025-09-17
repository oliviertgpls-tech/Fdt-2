import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Upload appelée')
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    // Convertir en base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    console.log('☁️ Tentative upload Cloudinary')
    console.log('📋 Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    console.log('📋 Upload preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

    // Upload ULTRA-SIMPLE vers Cloudinary (comme avant)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: dataURI,
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        }),
      }
    )

    console.log('📡 Réponse Cloudinary status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erreur complète Cloudinary:', JSON.stringify(errorData, null, 2))
      return NextResponse.json({ 
        error: `Cloudinary error: ${JSON.stringify(errorData)}` 
      }, { status: 400 })
    }

    const result = await response.json()
    console.log('✅ Upload réussi! URL:', result.secure_url)

    // 🆕 RETOURNER LE NOUVEAU FORMAT pour compatibilité
    return NextResponse.json({ 
      success: true, 
      originalUrl: result.secure_url,
      // Générer les versions optimisées à partir de l'URL de base
      versions: {
        thumbnail: result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto:good,f_auto/'),
        medium: result.secure_url.replace('/upload/', '/upload/w_800,h_600,c_fill,q_auto:good,f_auto/'),
        large: result.secure_url.replace('/upload/', '/upload/w_2400,h_1800,c_limit,q_auto:good,f_auto/')
      },
      message: "Upload réussi avec versions optimisées!" 
    })
    
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error.message)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

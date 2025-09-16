// app/api/upload/route.ts - Version Cloudinary
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Debug des variables d'environnement
    console.log('🔍 Cloudinary config:', {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'Présent' : 'MANQUANT',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? 'Présent' : 'MANQUANT'
    })

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    // Vérifications
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: "Le fichier doit être une image" 
      }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "Image trop volumineuse (max 10MB)" 
      }, { status: 400 })
    }

    // Convertir en base64 pour Cloudinary
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    console.log('☁️ Upload vers Cloudinary...')

    // Upload vers Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: dataURI,
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, // preset "unsigned"
          folder: 'food-memories', // optionnel : organiser dans un dossier
        }),
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error('❌ Erreur Cloudinary:', {
        status: cloudinaryResponse.status,
        statusText: cloudinaryResponse.statusText,
        error: errorData
      })
      throw new Error(`Erreur Cloudinary ${cloudinaryResponse.status}: ${JSON.stringify(errorData)}`)
    }

    const cloudinaryData = await cloudinaryResponse.json()
    console.log('✅ Upload Cloudinary réussi:', cloudinaryData.secure_url)

    return NextResponse.json({ 
      success: true, 
      imageUrl: cloudinaryData.secure_url, // URL Cloudinary permanente
      filename: cloudinaryData.public_id,
      size: file.size,
      message: "Image uploadée avec succès sur Cloudinary" 
    })
    
  } catch (error: any) {
    console.error('❌ Erreur upload:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur lors de l'upload" 
    }, { status: 500 })
  }
}

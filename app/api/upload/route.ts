import { NextRequest, NextResponse } from 'next/server'

// Types pour les versions d'images
type ImageVersions = {
  thumbnail: string;  // 200px - pour listes/vignettes
  medium: string;     // 800px - pour cartes/aperçus
  large: string;      // 2400px - pour affichage plein
}

type UploadResult = {
  success: boolean;
  versions: ImageVersions;
  originalUrl: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Upload optimisée appelée')
    
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    console.log('📁 Fichier reçu:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Vérifications de base
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB max
      return NextResponse.json({ error: "Fichier trop volumineux (max 10MB)" }, { status: 400 })
    }

    // Convertir en base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    console.log('🔄 Conversion base64 terminée')

    // Vérifier les variables d'environnement Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ 
        error: "Configuration Cloudinary manquante" 
      }, { status: 500 })
    }

    console.log('☁️ Upload vers Cloudinary avec optimisations multiples...')

    // Upload principal avec transformations automatiques
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: dataURI,
          upload_preset: uploadPreset,
          // Transformations à appliquer
          transformation: [
            { quality: 'auto:good', format: 'auto' }, // Format et qualité optimaux
            { width: 2400, height: 2400, crop: 'limit' } // Version large max
          ],
          // Options avancées
          tags: ['food-memories', 'optimized'],
          context: `filename=${file.name}|size=${file.size}`,
          overwrite: false,
          unique_filename: true
        }),
      }
    )

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      console.error('❌ Erreur Cloudinary:', errorData)
      return NextResponse.json({ 
        error: `Erreur Cloudinary: ${JSON.stringify(errorData)}` 
      }, { status: 400 })
    }

    const result = await uploadResponse.json()
    console.log('✅ Upload Cloudinary réussi:', result.public_id)

    // Générer les URLs pour les 3 versions
    const baseUrl = result.secure_url.split('/upload/')[0]
    const publicId = result.public_id
    const format = result.format

    const versions: ImageVersions = {
      // Thumbnail: 200px, optimisé pour les listes
      thumbnail: `${baseUrl}/image/upload/w_200,h_200,c_fill,q_auto:good,f_auto/${publicId}.${format}`,
      
      // Medium: 800px, optimisé pour les cartes
      medium: `${baseUrl}/image/upload/w_800,h_600,c_fill,q_auto:good,f_auto/${publicId}.${format}`,
      
      // Large: 2400px, optimisé pour l'affichage plein
      large: `${baseUrl}/image/upload/w_2400,h_1800,c_limit,q_auto:good,f_auto/${publicId}.${format}`
    }

    console.log('🎯 Versions générées:')
    console.log('  - Thumbnail:', versions.thumbnail)
    console.log('  - Medium:', versions.medium)
    console.log('  - Large:', versions.large)

    const uploadResult: UploadResult = {
      success: true,
      versions,
      originalUrl: result.secure_url, // URL originale pour compatibilité
      message: "Image uploadée et optimisée avec succès!"
    }

    return NextResponse.json(uploadResult)
    
  } catch (error: any) {
    console.error('❌ Erreur serveur upload:', error.message)
    return NextResponse.json({ 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  }
}

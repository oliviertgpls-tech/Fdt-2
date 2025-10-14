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
    let base64 = Buffer.from(bytes).toString('base64')

    // 🆕 NETTOYER le base64 : supprimer espaces/retours ligne
    base64 = base64.replace(/\s+/g, '');

    console.log('📏 Taille base64:', base64.length, 'caractères');

    // 🆕 VALIDATION du format base64
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
      console.error('❌ Base64 contient des caractères invalides');
      throw new Error('Format d\'image invalide - caractères non autorisés');
    }

    // Si le type est vide ou invalide, on détecte selon l'extension
    if (!mimeType || mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (fileName.endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        console.error('❌ HEIC non supporté - doit être converti en JPEG côté client');
        return NextResponse.json({ 
          success: false,
          error: 'Format HEIC non supporté. Veuillez utiliser JPEG ou PNG.' 
        }, { status: 400 });
      } else {
        // Par défaut JPEG
        mimeType = 'image/jpeg';
      }
      
      console.log(`🔧 Type MIME corrigé : ${file.type} → ${mimeType}`);
    }

    // 🆕 VÉRIFIER que le MIME est valide
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
      console.error('❌ Type MIME non supporté:', mimeType);
      return NextResponse.json({ 
        success: false,
        error: `Type d'image non supporté : ${mimeType}` 
      }, { status: 400 });
    }

    const dataURI = `data:${mimeType};base64,${base64}`;

    console.log('📦 Type MIME utilisé:', mimeType);
    console.log('📦 Taille dataURI:', dataURI.length, 'caractères');
    console.log('✅ DataURI valide, prêt pour Cloudinary');

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
        originalUrl: result.secure_url.replace('/upload/', '/upload/a_exif/'),
      // Générer les versions optimisées à partir de l'URL de base
      versions: {
        thumbnail: result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto:good,f_auto,a_exif/'),
        medium: result.secure_url.replace('/upload/', '/upload/w_800,h_600,c_fill,q_auto:good,f_auto,a_exif/'),
        large: result.secure_url.replace('/upload/', '/upload/w_2400,h_1800,c_limit,q_auto:good,f_auto,a_exif/')
      },
      message: "Upload réussi !" 
    })
    
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error.message)
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

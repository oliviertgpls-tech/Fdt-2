import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    // Vérification du type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: "Le fichier doit être une image (jpg, png, webp...)" 
      }, { status: 400 })
    }

    // Vérification de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "L'image est trop volumineuse (max 10MB)" 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${randomString}.${extension}`

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('📁 Dossier uploads créé/vérifié:', uploadsDir)
    } catch (error: any) {
      console.error('❌ Erreur création dossier uploads:', error)
      return NextResponse.json({ 
        error: `Impossible de créer le dossier uploads: ${error.message}` 
      }, { status: 500 })
    }

    // Sauvegarder le fichier
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, buffer)

    // Retourner l'URL publique
    const imageUrl = `/uploads/${filename}`
    
    console.log(`✅ Image uploadée: ${filename} (${file.size} bytes)`)
    
    return NextResponse.json({ 
      success: true, 
      imageUrl,
      filename,
      size: file.size,
      message: "Image uploadée avec succès" 
    })
    
  } catch (error: any) {
    console.error('❌ Erreur upload:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erreur lors de l'upload" 
    }, { status: 500 })
  }
}

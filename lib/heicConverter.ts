/**
 * 🔄 Convertisseur HEIC robuste
 */

export async function convertHEICtoJPEG(file: File): Promise<File> {
  console.log('🔄 Conversion HEIC démarrée:', {
    nom: file.name,
    type: file.type,
    taille: (file.size / 1024 / 1024).toFixed(2) + 'Mo'
  });

  try {
    const heic2any = (await import('heic2any')).default;
    
    // Timeout de 15 secondes
    const conversionPromise = heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
      multiple: false
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de conversion (15s)')), 15000);
    });
    
    const result = await Promise.race([conversionPromise, timeoutPromise]);
    const convertedBlob = Array.isArray(result) ? result[0] : result as Blob;
    
    if (!convertedBlob || convertedBlob.size === 0) {
      throw new Error('Blob converti vide');
    }
    
    const newFile = new File(
      [convertedBlob],
      file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
    
    console.log('✅ Conversion HEIC réussie:', {
      tailleAvant: (file.size / 1024).toFixed(0) + 'Ko',
      tailleAprès: (newFile.size / 1024).toFixed(0) + 'Ko'
    });
    
    return newFile;
    
  } catch (error: any) {
    console.error('❌ Échec conversion HEIC:', {
      erreur: error.message,
      fichier: file.name
    });
    
    // 🆕 Enrichir le message d'erreur avec des conseils
    if (error.message.includes('ERR_LIBHEIF')) {
      throw new Error('HEIC_TOO_RECENT'); // Code d'erreur spécifique
    } else if (error.message.includes('Timeout')) {
      throw new Error('HEIC_TIMEOUT');
    } else {
      throw new Error(`HEIC_ERROR: ${error.message}`);
    }
  }
}

export function isHEICFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return (
    fileName.endsWith('.heic') || 
    fileName.endsWith('.heif') ||
    file.type === 'image/heic' || 
    file.type === 'image/heif' ||
    (file.type === '' && (fileName.endsWith('.heic') || fileName.endsWith('.heif')))
  );
}

export async function safeConvertHEIC(file: File): Promise<File | null> {
  if (!isHEICFile(file)) {
    return file;
  }
  
  try {
    return await convertHEICtoJPEG(file);
  } catch (error: any) {
    console.error('🚫 Conversion impossible:', error.message);
    return null;
  }
}
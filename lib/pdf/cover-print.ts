/**
 * 📕 Génération de la COUVERTURE pour impression Lulu
 * 
 * Format : Back Cover + Spine + Front Cover en un seul PDF
 * Dimensions : Calculées selon le nombre de pages intérieures
 */

import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { mm, LULU_8_5x11, calculateCoverDimensions } from './units';
import { loadDefaultFonts, FontSet } from './fonts';

// ============================================
// 🎨 CONFIGURATION DES COULEURS
// ============================================

const COLORS = {
  background: rgb(0.96, 0.96, 0.95),      // Beige clair
  spine: rgb(0.92, 0.85, 0.78),           // Beige un peu plus foncé pour le dos
  titleText: rgb(0.1, 0.05, 0.02),        // Brun très foncé
  bodyText: rgb(0.3, 0.3, 0.3),           // Gris foncé
  bleedZone: rgb(1, 0.9, 0.9)             // Rose très pâle (zones de bleed - optionnel)
};

// ============================================
// 🔧 TYPES
// ============================================

interface GenerateCoverOptions {
  bookTitle: string;
  author?: string;
  description?: string;
  recipeCount: number;
  interiorPageCount: number;  // Nombre de pages intérieures (pour calculer le spine)
  coverImageUrl?: string;      // Image de couverture (optionnel)
  coverImageVersions?: {
    thumbnail: string;
    medium: string;
    large: string;
  } | null;
}

// ============================================
// 🖼️ HELPERS - IMAGES
// ============================================

/**
 * Récupère l'URL optimale pour l'impression de la couverture
 */
function getCoverImageForPrint(options: GenerateCoverOptions): string | null {
  if (options.coverImageVersions?.large) {
    console.log('✅ Utilisation de large:', options.coverImageVersions.large);
    return options.coverImageVersions.large;
  }
  
  if (options.coverImageUrl) {
    console.log('✅ Utilisation de URL directe:', options.coverImageUrl);
    return options.coverImageUrl;
  }
  console.warn('❌ Aucune image trouvée');
  return null;
}

/**
 * Charge et dessine une image dans le PDF
 */
async function drawImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  preserveAspect: boolean = true
) {
  try {
    console.log('🔍 Chargement de l\'image:', imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const imageBytes = await response.arrayBuffer();
    
    // ✅ DÉTECTION AUTOMATIQUE du format via les "magic bytes"
    const bytes = new Uint8Array(imageBytes);
    
    let image;
    
    // PNG : commence par 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      console.log('✅ Format détecté : PNG');
      image = await pdfDoc.embedPng(imageBytes);
    }
    // JPEG : commence par FF D8 FF
    else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      console.log('✅ Format détecté : JPEG');
      image = await pdfDoc.embedJpg(imageBytes);
    }
    // WebP : commence par "RIFF" puis "WEBP"
    else if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      console.warn('⚠️ Format WebP détecté - conversion nécessaire');
      throw new Error('WebP non supporté par pdf-lib. Utilisez PNG ou JPEG.');
    }
    else {
      console.error('❌ Format d\'image inconnu:', bytes.slice(0, 12));
      throw new Error('Format d\'image non reconnu');
    }
    
    const { width: imgW, height: imgH } = image.size();
    
    let drawWidth = width;
    let drawHeight = height;
    let finalX = x;
    let finalY = y;
    
    if (preserveAspect) {
      // Mode "fit" - l'image rentre entièrement dans la box
      const imgRatio = imgW / imgH;
      const boxRatio = width / height;
      
      if (imgRatio > boxRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
      } else {
        drawHeight = height;
        drawWidth = height * imgRatio;
      }
      
      // Centrer
      finalX = x + (width - drawWidth) / 2;
      finalY = y + (height - drawHeight) / 2;
    } else {
      // Mode "fill" - l'image remplit toute la box (crop si nécessaire)
      const imgRatio = imgW / imgH;
      const boxRatio = width / height;
      
      if (imgRatio > boxRatio) {
        // Image plus large → on crop les côtés
        drawHeight = height;
        drawWidth = height * imgRatio;
      } else {
        // Image plus haute → on crop haut/bas
        drawWidth = width;
        drawHeight = width / imgRatio;
      }
      
      // Centrer (l'image déborde mais sera clippée)
      finalX = x + (width - drawWidth) / 2;
      finalY = y + (height - drawHeight) / 2;
    }
    
    page.drawImage(image, {
      x: finalX,
      y: finalY,
      width: drawWidth,
      height: drawHeight
    });
    
    console.log('✅ Image dessinée avec succès');
    
  } catch (error: any) {
    console.error('❌ Erreur lors du chargement de l\'image:', error.message);
    
    // Si c'est un WebP, essayer de convertir l'URL
    if (error.message.includes('WebP')) {
      console.log('🔄 Tentative de conversion WebP → JPEG via Cloudinary');
      
      // Remplacer f_auto par f_jpg pour forcer JPEG
      const jpegUrl = imageUrl.replace(/f_auto/g, 'f_jpg');
      
      if (jpegUrl !== imageUrl) {
        console.log('🔄 Nouvelle URL:', jpegUrl);
        // Retry avec l'URL JPEG
        return drawImage(pdfDoc, page, jpegUrl, x, y, width, height, preserveAspect);
      }
    }
    
    // Si vraiment impossible, ne pas planter tout le PDF
    console.warn(`⚠️ Image ignorée: ${imageUrl}`);
  }
}

/**
 * Découpe un texte en lignes selon une largeur max
 */
function wrapText(
  text: string,
  font: any,
  size: number,
  maxWidth: number
): string[] {
  if (!text) return [];
  
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const width = font.widthOfTextAtSize(testLine, size);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// ============================================
// 🎯 FONCTION PRINCIPALE
// ============================================

/**
 * Génère le PDF de couverture complet pour Lulu
 * 
 * @returns Bytes du PDF prêt pour l'upload
 */
export async function generateCoverPDF(
  options: GenerateCoverOptions
): Promise<Uint8Array> {
  console.log('📕 Génération de la couverture...');
  console.log(`   Pages intérieures: ${options.interiorPageCount}`);
  
  // Calculer les dimensions de la couverture
  const cover = calculateCoverDimensions(options.interiorPageCount);
  
  console.log(`   Dimensions totales: ${cover.totalWidth}pt × ${cover.totalHeight}pt`);
  console.log(`   Largeur du dos (spine): ${cover.spineWidth}pt (${(cover.spineWidth / 2.83465).toFixed(1)}mm)`);
  
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadDefaultFonts(pdfDoc);
  
  // Créer la page unique de couverture
  const page = pdfDoc.addPage([cover.totalWidth, cover.totalHeight]);
  
  // Fond général
  page.drawRectangle({
    x: 0,
    y: 0,
    width: cover.totalWidth,
    height: cover.totalHeight,
    color: COLORS.background
  });
  
  // ============================================
// 🎨 AVANT (FRONT COVER) - 1ère de couverture
// ============================================

const frontX = cover.zones.frontCover.x;
const frontWidth = cover.zones.frontCover.width;
const safeMargin = mm(13); // 13mm de marge de sécurité

// ✅ TITRE EN HAUT à 30mm du bord
let titleY = cover.totalHeight - mm(30); // 60mm du haut
const titleMaxWidth = (frontWidth - (safeMargin * 2)) * 0.7; 

const titleLines = wrapText(
  options.bookTitle,
  fonts.bold,
  24, // ✅ Très gros (24pt = ~12.7mm)
  titleMaxWidth
);

for (const line of titleLines) {
  const textWidth = fonts.bold.widthOfTextAtSize(line, 36);
  page.drawText(line, {
    x: frontX + (frontWidth - textWidth) / 2, // Centré
    y: titleY,
    size: 36,
    font: fonts.bold,
    color: COLORS.titleText
  });
  titleY -= mm(15); // 15mm entre les lignes du titre
}

/// ✅ DESCRIPTION entre le titre et l'image (3 lignes max)
if (options.description) {
  titleY -= mm(0); // 0mm d'espace après le titre
  
  // ✅ Largeur réduite pour un meilleur rendu
  const descMaxWidth = (frontWidth - (safeMargin * 2)) * 0.8; // 80% de la largeur disponible
  
  const descLines = wrapText(
    options.description,
    fonts.italic,
    12,
    descMaxWidth // ✅ Largeur réduite
  );
  
  // Max 3 lignes
  for (const line of descLines.slice(0, 3)) {
    const lineWidth = fonts.italic.widthOfTextAtSize(line, 12); 
    const textX = frontX + (frontWidth - lineWidth) / 2; // 

    console.log('  Ligne:', line);
    console.log('  lineWidth:', lineWidth, 'textX:', textX);
    
    page.drawText(line, {
      x: textX, // 
      y: titleY,
      size: 12, // 
      font: fonts.italic,
      color: COLORS.bodyText
    });
    titleY -= mm(6);
  }
}

// ✅ IMAGE PLEINE PAGE sur les 2/3 bas
const coverImageUrl = getCoverImageForPrint(options);
console.log('🖼️ URL image de couverture:', coverImageUrl);
console.log('🖼️ coverImageVersions:', options.coverImageVersions);
console.log('🖼️ coverImageUrl:', options.coverImageUrl);

if (coverImageUrl) {
  const imageHeight = (cover.totalHeight * 195) / 300; // 2/3 de la hauteur totale
  const imageWidth = frontWidth - (safeMargin * 2); // Toute la largeur moins marges
  const imageX = frontX + safeMargin;
  const imageY = mm(10); // 10mm du bas (légèrement au-dessus du bord)

   console.log('📐 Position image:', { imageX, imageY, imageWidth, imageHeight });
  
  await drawImage(
    pdfDoc,
    page,
    coverImageUrl,
    imageX,
    imageY,
    imageWidth,
    imageHeight,
    false // ✅ false = remplir toute la box (crop si nécessaire)
  );
  console.log('✅ Image ajoutée au PDF');
} else {
  console.warn('⚠️ Pas d\'image de couverture trouvée');
}

  
  // ============================================
  // 📄 ARRIÈRE (BACK COVER) - 4e de couverture
  // ============================================
  
  const backX = cover.zones.backCover.x;
  const backWidth = cover.zones.backCover.width;
  
  // ============================================
  // 🔍 GUIDES DE DÉCOUPE (optionnel - pour vérification)
  // ============================================
  
  // Tu peux décommenter ces lignes pour voir les zones de bleed et de sécurité pendant les tests
  
  /*
  // Lignes de bleed (zones qui seront coupées)
  page.drawLine({
    start: { x: cover.bleed, y: 0 },
    end: { x: cover.bleed, y: cover.totalHeight },
    thickness: 0.5,
    color: rgb(1, 0, 0),
    opacity: 0.3
  });
  
  page.drawLine({
    start: { x: cover.totalWidth - cover.bleed, y: 0 },
    end: { x: cover.totalWidth - cover.bleed, y: cover.totalHeight },
    thickness: 0.5,
    color: rgb(1, 0, 0),
    opacity: 0.3
  });
  */
  
  console.log('💾 Sauvegarde de la couverture...');
  const pdfBytes = await pdfDoc.save();
  
  console.log(`✅ Couverture générée ! (${(pdfBytes.length / 1024).toFixed(0)} KB)`);
  
  return pdfBytes;
}
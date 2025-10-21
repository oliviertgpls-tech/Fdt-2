/**
 * 🔢 Convertisseur d'unités pour génération PDF
 * 
 * pdf-lib travaille en POINTS (pts), pas en millimètres.
 * Ce fichier permet d'écrire du code plus lisible avec des dimensions en mm.
 * 
 * Conversions :
 * - 1 point = 0.352778 mm
 * - 1 mm = 2.83465 points
 * - 1 inch = 72 points = 25.4 mm
 */

export const MM_TO_PT = 2.83465;
export const PT_TO_MM = 0.352778;
export const INCH_TO_PT = 72;

/**
 * Convertit des millimètres en points
 * @example mm(10) // 10mm = 28.35 points
 */
export function mm(millimetres: number): number {
  return millimetres * MM_TO_PT;
}

/**
 * Convertit des inches en points
 * @example inch(1) // 1 inch = 72 points
 */
export function inch(inches: number): number {
  return inches * INCH_TO_PT;
}

/**
 * Convertit des points en mm (utile pour debug)
 * @example pt(72) // 72 points = 25.4mm
 */
export function pt(points: number): number {
  return points * PT_TO_MM;
}

// ============================================
// 📏 DIMENSIONS LULU - Format 6" × 9" (LEGACY)
// ============================================

/**
 * Format 6" × 9" (15.24cm × 22.86cm)
 * Format compact - conservé pour compatibilité
 * ⚠️ DEPRECATED: Utilisez LULU_8_5x11 (US Letter) pour les nouveaux projets
 */
export const LULU_6x9 = {
  // Dimensions de base (SANS bleed)
  width: inch(6),           // 432pt = 152.4mm
  height: inch(9),          // 648pt = 228.6mm
  
  // Fond perdu (bleed) obligatoire pour Lulu
  bleed: mm(3),             // 8.5pt = 3mm de chaque côté
  
  // Marge de sécurité (safe area) - zone garantie sans découpe
  safeMargin: mm(25),       // 70.9pt = 25mm du bord
  
  // Dimensions AVEC bleed (ce qu'on envoie à Lulu)
  get widthWithBleed() {
    return this.width + (this.bleed * 2);   // 449pt = 158.4mm
  },
  
  get heightWithBleed() {
    return this.height + (this.bleed * 2);  // 665pt = 234.6mm
  },
  
  // Zone utilisable pour le contenu (entre bleed et safe margin)
  get contentWidth() {
    return this.width - (this.safeMargin * 2);  // 290.1pt = 102.4mm
  },
  
  get contentHeight() {
    return this.height - (this.safeMargin * 2); // 506.1pt = 178.6mm
  }
};

/**
 * Calcule la largeur du dos (spine) du livre selon le nombre de pages
 * Formule Lulu : 0.002252 inches par page
 * 
 * @param pageCount - Nombre de pages intérieures (doit être pair)
 * @returns Largeur du dos en points
 * 
 * @example
 * calculateSpineWidth(200) // ~32.2 points = 11.4mm
 */
export function calculateSpineWidth(pageCount: number): number {
  const spineInches = 0.002252 * pageCount;
  return inch(spineInches);
}

// ============================================
// 📐 DIMENSIONS COUVERTURE LULU
// ============================================

/**
 * Calcule les dimensions complètes de la couverture
 * Couverture = Back Cover (arrière) + Spine (dos) + Front Cover (avant)
 * 
 * @param interiorPageCount - Nombre de pages intérieures
 * @returns Dimensions de la couverture avec zones définies
 */
export function calculateCoverDimensions(interiorPageCount: number) {
  const spineWidth = calculateSpineWidth(interiorPageCount);
  const pageWidth = LULU_8_5x11.width;   // 612pt = 215.9mm
  const bleed = LULU_8_5x11.bleed;       // 8.5pt = 3mm

  return {
    // Largeur totale : bleed + arrière + dos + avant + bleed
    totalWidth: (bleed * 2) + (pageWidth * 2) + spineWidth,

    // Hauteur = hauteur page + bleed haut/bas
    totalHeight: LULU_8_5x11.heightWithBleed,  // 809pt = 285.4mm
    
    // Position X de chaque zone (depuis la gauche)
    zones: {
      backCover: {
        x: bleed,                           // 8.5pt = 3mm
        width: pageWidth,                   // 612pt = 215.9mm
        label: 'Arrière (back cover)'
      },
      spine: {
        x: bleed + pageWidth,               // 620.5pt
        width: spineWidth,                  // Variable selon nb pages
        label: 'Dos (spine)'
      },
      frontCover: {
        x: bleed + pageWidth + spineWidth,  // Variable
        width: pageWidth,                   // 612pt = 215.9mm
        label: 'Avant (front cover)'
      }
    },
    
    // Infos pratiques
    spineWidth,
    bleed,
    pageWidth,
    pageHeight: LULU_8_5x11.height
  };
}

// ============================================
// 🎨 AUTRES FORMATS LULU (pour plus tard)
// ============================================

/**
 * Format 8.5" × 11" (US Letter)
 * Format standard américain pour les livres de recettes
 */
export const LULU_8_5x11 = {
  // Dimensions de base (SANS bleed)
  width: inch(8.5),         // 612pt = 215.9mm
  height: inch(11),         // 792pt = 279.4mm

  // Fond perdu (bleed) obligatoire pour Lulu
  bleed: mm(3),             // 8.5pt = 3mm de chaque côté

  // Marge de sécurité (safe area) - zone garantie sans découpe
  safeMargin: mm(25),       // 70.9pt = 25mm du bord

  // Dimensions AVEC bleed (ce qu'on envoie à Lulu)
  get widthWithBleed() {
    return this.width + (this.bleed * 2);   // 629pt = 221.9mm
  },

  get heightWithBleed() {
    return this.height + (this.bleed * 2);  // 809pt = 285.4mm
  },

  // Zone utilisable pour le contenu (entre bleed et safe margin)
  get contentWidth() {
    return this.width - (this.safeMargin * 2);  // 470.1pt = 165.9mm
  },

  get contentHeight() {
    return this.height - (this.safeMargin * 2); // 650.1pt = 229.4mm
  }
};

/**
 * Format carré 8" × 8"
 * Populaire pour les livres photo / recettes visuelles
 */
export const LULU_8x8 = {
  width: inch(8),           // 576pt = 203.2mm
  height: inch(8),          // 576pt = 203.2mm
  bleed: mm(3),             // 8.5pt = 3mm
  safeMargin: mm(25),       // 70.9pt = 25mm
  
  get widthWithBleed() {
    return this.width + (this.bleed * 2);
  },
  
  get heightWithBleed() {
    return this.height + (this.bleed * 2);
  }
};

// ============================================
// 🔍 HELPERS DE DEBUG
// ============================================

/**
 * Affiche les dimensions d'une zone en format lisible
 * Utile pour debugger les positions dans le PDF
 */
export function debugDimensions(name: string, x: number, y: number, width: number, height: number) {
  console.log(`📐 ${name}:`, {
    position: `x=${x}pt (${pt(x).toFixed(1)}mm), y=${y}pt (${pt(y).toFixed(1)}mm)`,
    size: `${width}pt × ${height}pt (${pt(width).toFixed(1)}mm × ${pt(height).toFixed(1)}mm)`
  });
}

/**
 * Vérifie si une zone est dans la safe area (pas de risque de découpe)
 */
export function isInSafeArea(x: number, y: number, width: number, height: number): boolean {
  const { bleed, safeMargin, widthWithBleed, heightWithBleed } = LULU_8_5x11;
  const minX = bleed + safeMargin;
  const maxX = widthWithBleed - bleed - safeMargin;
  const minY = bleed + safeMargin;
  const maxY = heightWithBleed - bleed - safeMargin;
  
  return (
    x >= minX && 
    (x + width) <= maxX && 
    y >= minY && 
    (y + height) <= maxY
  );
}   
/**
 * 🔤 Gestion des polices pour PDF
 * 
 * Lulu EXIGE que toutes les polices soient incorporées (embedded).
 * Ce fichier gère le chargement des polices TrueType (.ttf) depuis /public/fonts/
 */

import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Type représentant un jeu de polices complet
 */
export interface FontSet {
  regular: any;  // PDFFont de pdf-lib
  bold: any;
  italic: any;
}

/**
 * Configuration d'un style de police
 */
export interface FontConfig {
  name: string;
  paths: {
    regular: string;
    bold: string;
    italic: string;
  };
}

// ============================================
// 📚 POLICES DISPONIBLES
// ============================================

/**
 * Style 1 : Classique (Open Sans)
 * Police moderne, neutre, excellente lisibilité
 */
export const FONT_CLASSIQUE: FontConfig = {
  name: 'Open Sans',
  paths: {
    regular: '/fonts/OpenSans-Regular.ttf',
    bold: '/fonts/OpenSans-Bold.ttf',
    italic: '/fonts/OpenSans-Italic.ttf'
  }
};

 //* Style 2 : Élégant (Playfair Display + Lato)
 //* Parfait pour un style magazine culinaire
 //*/
export const FONT_ELEGANT: FontConfig = {
  name: 'Playfair Display',
  paths: {
    regular: '/fonts/PlayfairDisplay-Regular.ttf',
    bold: '/fonts/PlayfairDisplay-Bold.ttf',
    italic: '/fonts/PlayfairDisplay-Italic.ttf'
  }
};

// * Style 3 : Moderne (Lato)
// * Police sans empattements, très lisible
//*/
export const FONT_MODERNE: FontConfig = {
  name: 'Lato',
  paths: {
    regular: '/fonts/Lato-Regular.ttf',
    bold: '/fonts/Lato-Bold.ttf',
    italic: '/fonts/Lato-Italic.ttf'
  }
};



// ============================================
// 🔧 FONCTIONS DE CHARGEMENT
// ============================================

/**
 * Charge un jeu de polices depuis les fichiers .ttf
 * 
 * @param pdfDoc - Document PDF dans lequel incorporer les polices
 * @param config - Configuration du style de police
 * @returns Jeu de polices prêt à utiliser
 */
export async function loadFonts(
  pdfDoc: PDFDocument, 
  config: FontConfig
): Promise<FontSet> {
  console.log(`🔤 Chargement des polices ${config.name}...`);
  
  // Enregistrer fontkit (requis pour les polices custom)
  pdfDoc.registerFontkit(fontkit);
  
  try {
    // Charger les 3 fichiers .ttf en parallèle
    const [regularBytes, boldBytes, italicBytes] = await Promise.all([
      fetch(config.paths.regular).then(r => {
        if (!r.ok) throw new Error(`Police Regular introuvable: ${config.paths.regular}`);
        return r.arrayBuffer();
      }),
      fetch(config.paths.bold).then(r => {
        if (!r.ok) throw new Error(`Police Bold introuvable: ${config.paths.bold}`);
        return r.arrayBuffer();
      }),
      fetch(config.paths.italic).then(r => {
        if (!r.ok) throw new Error(`Police Italic introuvable: ${config.paths.italic}`);
        return r.arrayBuffer();
      })
    ]);
    
    // Incorporer dans le PDF
    const [regular, bold, italic] = await Promise.all([
      pdfDoc.embedFont(regularBytes),
      pdfDoc.embedFont(boldBytes),
      pdfDoc.embedFont(italicBytes)
    ]);
    
    console.log(`✅ Polices ${config.name} chargées avec succès`);
    
    return { regular, bold, italic };
    
  } catch (error: any) {
    console.error(`❌ Erreur chargement polices ${config.name}:`, error);
    throw new Error(
      `Impossible de charger les polices ${config.name}. ` +
      `Vérifiez que les fichiers .ttf sont bien dans /public/fonts/\n` +
      `Erreur: ${error.message}`
    );
  }
}

/**
 * Charge les polices par défaut (Classique = Open Sans)
 * Raccourci pour le style le plus utilisé
 */
export async function loadDefaultFonts(pdfDoc: PDFDocument): Promise<FontSet> {
  return loadFonts(pdfDoc, FONT_CLASSIQUE);
}
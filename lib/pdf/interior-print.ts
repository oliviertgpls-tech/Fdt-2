/**
 * 📄 Génération du PDF INTÉRIEUR pour impression Lulu
 *
 * Ce fichier génère UNIQUEMENT les pages intérieures (pas la couverture).
 * Format : 8.5" × 11" (US Letter) avec bleed de 3mm
 * Polices : Incorporées (embedded) - requis par Lulu
 */

import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { mm, LULU_8_5x11 } from './units';
import { loadDefaultFonts, FontSet } from './fonts';

// ============================================
// 🎨 CONFIGURATION DU STYLE
// ============================================

const COLORS = {
  background: rgb(0.96, 0.96, 0.95),      // Gris très clair (stone-100)
  paper: rgb(0.99, 0.98, 0.96),           // Beige papier
  ingredientsBox: rgb(0.94, 0.87, 0.80),  // Beige plus foncé
  titleText: rgb(0, 0, 0),                // Noir
  bodyText: rgb(0.2, 0.2, 0.2),           // Gris foncé
  metaText: rgb(0.4, 0.4, 0.4),           // Gris moyen
  line: rgb(0.2, 0.2, 0.2)                // Noir pour les lignes
};

// ============================================
// 🔧 TYPES
// ============================================

interface Recipe {
  id: string;
  title: string;
  author?: string;
  prepMinutes?: number;
  servings?: number;
  ingredients: string[];
  steps: string | string[];
  imageUrl?: string;
  imageVersions?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

interface GenerateInteriorOptions {
  bookTitle: string;
  recipes: Recipe[];
  description?: string;
}

// ============================================
// 📐 HELPERS - TEXTE
// ============================================

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

/**
 * Dessine un paragraphe et retourne la position Y finale
 */
function drawParagraph(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color: any,
  maxWidth: number,
  lineGap: number = 4
): number {
  const lines = wrapText(text, font, size, maxWidth);
  let cursorY = y;
  
  for (const line of lines) {
    if (cursorY < mm(25)) break; // Stop si on sort de la zone sûre
    
    page.drawText(line, {
      x,
      y: cursorY,
      size,
      font,
      color
    });
    
    cursorY -= size + lineGap;
  }
  
  return cursorY;
}

// ============================================
// 🖼️ HELPERS - IMAGES
// ============================================

/**
 * Récupère l'URL optimale pour l'impression (toujours la version 'large')
 */
function getImageForPrint(recipe: Recipe): string | null {
  // Priorité 1 : Version large (2400px) - meilleure qualité
  if (recipe.imageVersions?.large) {
    return recipe.imageVersions.large;
  }
  
  // Priorité 2 : URL originale
  if (recipe.imageUrl) {
    return recipe.imageUrl;
  }
  
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
    const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
    
    // Détecter le type d'image
    let image;
    if (imageUrl.toLowerCase().includes('.png') || imageUrl.includes('image/png')) {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }
    
    const { width: imgW, height: imgH } = image.size();
    
    let drawWidth = width;
    let drawHeight = height;
    
    if (preserveAspect) {
      const imgRatio = imgW / imgH;
      const boxRatio = width / height;
      
      if (imgRatio > boxRatio) {
        // Image plus large
        drawWidth = width;
        drawHeight = width / imgRatio;
      } else {
        // Image plus haute
        drawHeight = height;
        drawWidth = height * imgRatio;
      }
    }
    
    // Centrer l'image
    const finalX = x + (width - drawWidth) / 2;
    const finalY = y + (height - drawHeight) / 2;
    
    page.drawImage(image, {
      x: finalX,
      y: finalY,
      width: drawWidth,
      height: drawHeight
    });
    
  } catch (error) {
    console.warn(`⚠️ Impossible de charger l'image: ${imageUrl}`, error);
    // On continue sans l'image plutôt que de planter
  }
}

// ============================================
// 📄 GÉNÉRATION DES PAGES
// ============================================

/**
 * Crée une nouvelle page avec fond de base
 */
function createPage(pdfDoc: PDFDocument): PDFPage {
  const page = pdfDoc.addPage([
    LULU_8_5x11.widthWithBleed,  // 158.4mm avec bleed
    LULU_8_5x11.heightWithBleed  // 234.6mm avec bleed
  ]);
  
  // Fond de page
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_8_5x11.widthWithBleed,
    height: LULU_8_5x11.heightWithBleed,
    color: COLORS.background
  });
  
  return page;
}

/**
 * Génère la page de garde (vierge)
 */
function generateGuardPage(pdfDoc: PDFDocument) {
  const page = createPage(pdfDoc);
  
  // Juste un fond uni
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_8_5x11.widthWithBleed,
    height: LULU_8_5x11.heightWithBleed,
    color: COLORS.paper
  });
}

/**
 * Génère le sommaire avec les numéros de pages réels
 */
async function generateSummaryWithPageNumbers(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  bookTitle: string,
  recipePageNumbers: { recipe: any; startPage: number; endPage: number }[]
) {
  // Insérer le sommaire en page 2 (index 1)
  const page = pdfDoc.insertPage(1, [
    LULU_8_5x11.widthWithBleed,
    LULU_8_5x11.heightWithBleed
  ]);
  
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_8_5x11.widthWithBleed,
    height: LULU_8_5x11.heightWithBleed,
    color: COLORS.background
  });
  
  const marginLeft = mm(20);
  const marginTop = mm(20);
  
  let cursorY = LULU_8_5x11.heightWithBleed - marginTop;
  
  // Titre "Sommaire"
  page.drawText('SOMMAIRE', {
    x: marginLeft,
    y: cursorY,
    size: 24,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  cursorY -= mm(15);
  
  // Liste des recettes avec VRAIS numéros de pages
  for (const { recipe, startPage, endPage } of recipePageNumbers) {
    if (cursorY < mm(30)) break;
    
    const pageText = startPage === endPage 
      ? `p.${startPage}` 
      : `p.${startPage}-${endPage}`;
    
    const recipeText = `${recipe.title}`;
    
    // Titre de la recette
    page.drawText(recipeText, {
      x: marginLeft,
      y: cursorY,
      size: 10,
      font: fonts.regular,
      color: COLORS.bodyText
    });
    
    // Numéro de page (aligné à droite)
    const pageTextWidth = fonts.regular.widthOfTextAtSize(pageText, 10);
    page.drawText(pageText, {
      x: LULU_8_5x11.widthWithBleed - mm(20) - pageTextWidth,
      y: cursorY,
      size: 10,
      font: fonts.regular,
      color: COLORS.metaText
    });
    
    cursorY -= mm(7);
  }
}

/**
 * Génère une page de recette (layout 2 colonnes)
 */
async function generateRecipePage(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  recipe: Recipe
) {
  const page = createPage(pdfDoc);
  
  const marginLeft = mm(15);   // 15mm du bord gauche
  const marginRight = mm(15);  // 15mm du bord droit
  const marginTop = mm(15);    // 15mm du bord haut
  
  let cursorY = LULU_8_5x11.heightWithBleed - marginTop;
  
  // === EN-TÊTE : Ligne décorative ===
const centerX = LULU_8_5x11.widthWithBleed / 2;
const lineLength = mm(30); // ✅ Même longueur que les traits du footer

page.drawLine({
    start: { x: marginLeft -lineLength, y: cursorY },
     end: { x: centerX + lineLength, y: cursorY },

    thickness: 0.5,
    color: COLORS.line
  });
  
  cursorY -= mm(15); // 15mm d'espace
  
  // === TITRE DE LA RECETTE ===
  const titleLines = wrapText(
    recipe.title.toUpperCase(),
    fonts.bold,
    20, // ~7mm de hauteur
    mm(100) // 100mm de largeur max
  );
  
  for (const line of titleLines) {
    page.drawText(line, {
      x: marginLeft,
      y: cursorY,
      size: 20,
      font: fonts.bold,
      color: COLORS.titleText
    });
    cursorY -= mm(8); // 8mm entre les lignes
  }
  
  cursorY -= mm(5); // 5mm d'espace
  
  // === MÉTADONNÉES (auteur, temps, portions) ===
  const metaParts = [];
  if (recipe.author) metaParts.push(`Par ${recipe.author}`);
  if (recipe.prepMinutes) metaParts.push(`${recipe.prepMinutes} min`);
  if (recipe.servings) metaParts.push(`${recipe.servings} pers.`);
  
  if (metaParts.length > 0) {
    const metaText = metaParts.join('  •  ');
    page.drawText(metaText, {
      x: marginLeft,
      y: cursorY,
      size: 9,
      font: fonts.regular,
      color: COLORS.metaText
    });
    cursorY -= mm(10); // 10mm d'espace
  }
  
  // === LAYOUT 2 COLONNES ===
  const leftColWidth = mm(70);   // 70mm pour la colonne gauche (étapes)
  const rightColWidth = mm(40);  // 40mm pour la colonne droite (ingrédients)
  const colGap = mm(10);         // 10mm entre les colonnes
  
  const leftX = marginLeft;
  const rightX = LULU_8_5x11.widthWithBleed - marginRight - rightColWidth;
  
  // === COLONNE DROITE : INGRÉDIENTS (encadré) ===
  const boxPadding = mm(5);      // 5mm de padding
  const imageHeight = mm(40);    // 40mm pour l'image

  // ✅ HAUTEUR MAX de l'encadré = hauteur disponible - marge de sécurité
    const maxBoxHeight = cursorY - mm(25); // 25mm de marge en bas (zone sûre)
  
  // Calculer hauteur de la box
  let boxHeight = mm(10); // Titre "INGRÉDIENTS"
  if (recipe.imageUrl) {
    boxHeight += imageHeight / 2 + mm(5); // Image déborde en haut
  }
  
  // Hauteur des ingrédients
  for (const ingredient of recipe.ingredients) {
    const lines = wrapText(ingredient, fonts.regular, 9, rightColWidth - boxPadding);
    boxHeight += lines.length * mm(4) + mm(2);
  }
  
  boxHeight += boxPadding + mm(2);
  boxHeight = Math.max(boxHeight, mm(60)); // Minimum 60mm

  // LIMITER à la hauteur max disponible
    boxHeight = Math.min(boxHeight, maxBoxHeight);
  
  const boxY = cursorY - boxHeight;
  
  // Dessiner l'encadré
  page.drawRectangle({
    x: rightX - boxPadding,
    y: boxY,
    width: rightColWidth + boxPadding * 2,
    height: boxHeight,
    color: COLORS.ingredientsBox
  });
  
  // Image débordant en haut (si présente)
  const imageUrl = getImageForPrint(recipe);
  if (imageUrl) {
    const imageY = boxY + boxHeight - (imageHeight / 2);
    await drawImage(
      pdfDoc,
      page,
      imageUrl,
      rightX,
      imageY,
      rightColWidth,
      imageHeight,
      true
    );
  }

  // Titre "INGRÉDIENTS"
let ingredientsY = cursorY - mm(5);
if (imageUrl) {
  ingredientsY -= imageHeight / 2 + mm(3);
}

page.drawText('INGRÉDIENTS', {
  x: rightX,
  y: ingredientsY,
  size: 11,
  font: fonts.bold,
  color: COLORS.titleText
});

ingredientsY -= mm(8);

// Liste des ingrédients (avec gestion "..." si trop long)
for (let i = 0; i < recipe.ingredients.length; i++) {
  const ingredient = recipe.ingredients[i];
  
  // Vérifier s'il reste assez de place
  if (ingredientsY < boxY + mm(8)) {
    // Afficher "..." seulement s'il reste des ingrédients non affichés
    if (i < recipe.ingredients.length - 1) {
      page.drawText('...', {
        x: rightX,
        y: ingredientsY,
        size: 9,
        font: fonts.regular,
        color: COLORS.metaText
      });
    }
    break; // Sortir de la boucle
  }
  
  const capitalizedIngredient = 
    ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  
  ingredientsY = drawParagraph(
    page,
    capitalizedIngredient,
    rightX,
    ingredientsY,
    fonts.regular,
    9,
    COLORS.bodyText,
    rightColWidth - boxPadding,
    2
  );
  
  ingredientsY -= mm(2);
}
  
  // === COLONNE GAUCHE : ÉTAPES ===
  let stepsY = cursorY;
  
  page.drawText('PRÉPARATION', {
    x: leftX,
    y: stepsY,
    size: 11,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  stepsY -= mm(8);
  
  // Convertir steps en array si nécessaire
  const steps = typeof recipe.steps === 'string'
    ? recipe.steps.split('\n\n').filter(s => s.trim())
    : Array.isArray(recipe.steps)
    ? recipe.steps
    : [];
  
  let stepNumber = 1;

  // ✅ Définir la largeur de la colonne des numéros
const numberColumnWidth = mm(8); // 8mm pour les numéros (assez pour "15.")
const textStartX = leftX + numberColumnWidth; // Le texte commence après la colonne

for (const step of steps) {
  if (stepsY < mm(25)) break; // Stop si on sort de la zone sûre
  
  // Numéro de l'étape
  const stepLabel = `${stepNumber}.`;
  const stepLabelWidth = fonts.bold.widthOfTextAtSize(stepLabel, 10);
  
  // ✅ Aligner le numéro À DROITE dans la colonne de 8mm
  const numberX = textStartX - mm(2) - stepLabelWidth; // 2mm d'espace avant le texte
  
  page.drawText(stepLabel, {
    x: numberX,  // ✅ Position calculée pour aligner à droite
    y: stepsY,
    size: 9,
    font: fonts.bold,
    color: COLORS.bodyText
  });
  
  // Texte de l'étape (commence toujours à textStartX)
  stepsY = drawParagraph(
    page,
    step.trim(),
    textStartX,  // ✅ Position fixe pour le texte
    stepsY,
    fonts.regular,
    9,
    COLORS.bodyText,
    leftColWidth - numberColumnWidth,  // ✅ Largeur ajustée
    2
  );
  
  stepsY -= mm(4);
  stepNumber++;
}
}

// ============================================
// 🎯 FONCTION PRINCIPALE
// ============================================

/**
 * Génère le PDF intérieur complet pour Lulu
 * 
 * @returns Bytes du PDF prêt pour l'upload
 */

/**
 * Ajoute un footer avec numéro de page centré
 */
function addPageFooter(
  page: PDFPage,
  pageNumber: number,
  font: any
) {
  const footerY = mm(15); // 15mm du bas (dans la zone sûre)
  const centerX = LULU_8_5x11.widthWithBleed / 2;
  
  // Numéro de page
  const pageText = `${pageNumber}`;
  const textWidth = font.widthOfTextAtSize(pageText, 9);
  
  // ✅ Position du texte (centré)
  const textX = centerX - (textWidth / 2);
  
  // Ligne décorative
  const lineLength = mm(30); // 30mm de long
  const lineY = footerY + mm(1); // 1mm au-dessus du texte
  const gapFromText = mm(3); // 3mm d'espace entre le texte et chaque trait
  
  // ✅ Trait gauche - commence au bord gauche de la page, finit avant le texte
  page.drawLine({
    start: { x: centerX - lineLength, y: lineY },
    end: { x: textX - gapFromText, y: lineY }, // ✅ Finit AVANT le texte
    thickness: 0.5,
    color: COLORS.line
  });
  
  // ✅ Trait droit - commence après le texte, finit au bord droit
  page.drawLine({
    start: { x: textX + textWidth + gapFromText, y: lineY }, // ✅ Commence APRÈS le texte
    end: { x: centerX + lineLength, y: lineY },
    thickness: 0.5,
    color: COLORS.line
  });
  
  // Numéro de page centré
  page.drawText(pageText, {
    x: textX,
    y: footerY,
    size: 9,
    font: font,
    color: COLORS.metaText
  });
}


/**
 * Génère les pages d'une recette avec pagination automatique
 * @returns Nombre de pages créées
 */
async function generateRecipePageWithPagination(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  recipe: Recipe,
  startingPageNumber: number
): Promise<number> {
  
  let pagesCreated = 0;
let currentPageNumber = startingPageNumber;

  let currentPage = createPage(pdfDoc);
  pagesCreated++;

    addPageFooter(currentPage, currentPageNumber, fonts.regular);
  currentPageNumber++;
  
  const marginLeft = mm(15);
  const marginRight = mm(15);
  const marginTop = mm(15);
  const minY = mm(25); // Zone de sécurité en bas
  
  let cursorY = LULU_8_5x11.heightWithBleed - marginTop;
  
  // === EN-TÊTE : Ligne décorative (PREMIÈRE PAGE SEULEMENT) ===
  currentPage.drawLine({
    start: { x: marginLeft, y: cursorY },
    end: { x: LULU_8_5x11.widthWithBleed - marginRight, y: cursorY },
    thickness: 0.5,
    color: COLORS.line
  });
  
  cursorY -= mm(15);
  
  // === TITRE DE LA RECETTE (PREMIÈRE PAGE SEULEMENT) ===
  const titleLines = wrapText(
    recipe.title.toUpperCase(),
    fonts.bold,
    20,
    mm(100)
  );
  
  for (const line of titleLines) {
    currentPage.drawText(line, {
      x: marginLeft,
      y: cursorY,
      size: 20,
      font: fonts.bold,
      color: COLORS.titleText
    });
    cursorY -= mm(8);
  }
  
  cursorY -= mm(5);
  
  // === MÉTADONNÉES (PREMIÈRE PAGE SEULEMENT) ===
  const metaParts = [];
  if (recipe.author) metaParts.push(`Par ${recipe.author}`);
  if (recipe.prepMinutes) metaParts.push(`${recipe.prepMinutes} min`);
  if (recipe.servings) metaParts.push(`${recipe.servings} pers.`);
  
  if (metaParts.length > 0) {
    const metaText = metaParts.join('  •  ');
    currentPage.drawText(metaText, {
      x: marginLeft,
      y: cursorY,
      size: 9,
      font: fonts.regular,
      color: COLORS.metaText
    });
    cursorY -= mm(10);
  }
  
  // === LAYOUT 2 COLONNES (PREMIÈRE PAGE SEULEMENT) ===
  const leftColWidth = mm(70);
  const rightColWidth = mm(40);
  
  const leftX = marginLeft;
  const rightX = LULU_8_5x11.widthWithBleed - marginRight - rightColWidth;
  
  // === COLONNE DROITE : INGRÉDIENTS ===
  const boxPadding = mm(3);
  const imageHeight = mm(40);
  
  const maxBoxHeight = cursorY - minY;
  
  let boxHeight = mm(10);
  if (recipe.imageUrl) {
    boxHeight += imageHeight / 2 + mm(5);
  }
  
  for (const ingredient of recipe.ingredients) {
    const lines = wrapText(ingredient, fonts.regular, 9, rightColWidth - boxPadding);
    boxHeight += lines.length * mm(4) + mm(2);
  }
  
  boxHeight += boxPadding + mm(3);
  boxHeight = Math.max(boxHeight, mm(60));
  boxHeight = Math.min(boxHeight, maxBoxHeight);
  
  const boxY = cursorY - boxHeight;
  
  currentPage.drawRectangle({
    x: rightX - boxPadding,
    y: boxY,
    width: rightColWidth + boxPadding * 2,
    height: boxHeight,
    color: COLORS.ingredientsBox
  });
  
  const imageUrl = getImageForPrint(recipe);
  if (imageUrl) {
    const imageY = boxY + boxHeight - (imageHeight / 2);
    await drawImage(
      pdfDoc,
      currentPage,
      imageUrl,
      rightX,
      imageY,
      rightColWidth,
      imageHeight,
      true
    );
  }
  
  let ingredientsY = cursorY - mm(5);
  if (imageUrl) {
    ingredientsY -= imageHeight / 2 + mm(3);
  }
  
  currentPage.drawText('INGRÉDIENTS', {
    x: rightX,
    y: ingredientsY,
    size: 11,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  ingredientsY -= mm(8);
  
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ingredient = recipe.ingredients[i];
    
    if (ingredientsY < boxY + mm(8)) {
      if (i < recipe.ingredients.length - 1) {
        currentPage.drawText('...', {
          x: rightX,
          y: ingredientsY,
          size: 9,
          font: fonts.regular,
          color: COLORS.metaText
        });
      }
      break;
    }
    
    const capitalizedIngredient = 
      ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    
    ingredientsY = drawParagraph(
      currentPage,
      capitalizedIngredient,
      rightX,
      ingredientsY,
      fonts.regular,
      9,
      COLORS.bodyText,
      rightColWidth - boxPadding,
      2
    );
    
    ingredientsY -= mm(2);
  }
  
  // === COLONNE GAUCHE : ÉTAPES AVEC PAGINATION ===
  let stepsY = cursorY;
  
  currentPage.drawText('PRÉPARATION', {
    x: leftX,
    y: stepsY,
    size: 11,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  stepsY -= mm(8);
  
  const steps = typeof recipe.steps === 'string'
    ? recipe.steps.split('\n\n').filter(s => s.trim())
    : Array.isArray(recipe.steps)
    ? recipe.steps
    : [];
  
  const numberColumnWidth = mm(8);
  const textStartX = leftX + numberColumnWidth;
  
  let stepNumber = 1;
  
  // ✅ BOUCLE AVEC PAGINATION
  for (const step of steps) {
    // Vérifier si on a assez d'espace (minimum 15mm pour numéro + 2 lignes)
    if (stepsY < minY + mm(15)) {
      // ✅ CRÉER UNE NOUVELLE PAGE
      currentPage = createPage(pdfDoc);
      pagesCreated++;

        addPageFooter(currentPage, currentPageNumber, fonts.regular);
    currentPageNumber++;
      
      stepsY = LULU_8_5x11.heightWithBleed - marginTop;
      
      // Titre "PRÉPARATION (suite)"
      currentPage.drawText('PRÉPARATION (suite)', {
        x: leftX,
        y: stepsY,
        size: 11,
        font: fonts.bold,
        color: COLORS.titleText
      });
      stepsY -= mm(8);
    }
    
    // Numéro de l'étape
    const stepLabel = `${stepNumber}.`;
    const stepLabelWidth = fonts.bold.widthOfTextAtSize(stepLabel, 10);
    const numberX = textStartX - mm(2) - stepLabelWidth;
    
    currentPage.drawText(stepLabel, {
      x: numberX,
      y: stepsY,
      size: 10,
      font: fonts.bold,
      color: COLORS.bodyText
    });
    
    // Texte de l'étape
    stepsY = drawParagraph(
      currentPage,
      step.trim(),
      textStartX,
      stepsY,
      fonts.regular,
      10,
      COLORS.bodyText,
      leftColWidth - numberColumnWidth,
      2
    );
    
    stepsY -= mm(4);
    stepNumber++;
  }
  
  return pagesCreated;
}

export async function generateInteriorPDF(
  options: GenerateInteriorOptions
): Promise<Uint8Array> {
  console.log('📄 Génération du PDF intérieur...');
  console.log(`   Format: ${LULU_8_5x11.widthWithBleed}pt × ${LULU_8_5x11.heightWithBleed}pt (avec bleed)`);
  console.log(`   Recettes: ${options.recipes.length}`);
  
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadDefaultFonts(pdfDoc);
  
  console.log(' Polices chargées');
  
  // Page 1 : Page de garde vierge
  generateGuardPage(pdfDoc);
  
  // ✅ TRACKER pour les numéros de pages réels
  const recipePageNumbers: { recipe: any; startPage: number; endPage: number }[] = [];
  let currentPageNumber = 5; // Les recettes commencent page 5 (après garde + sommaire + garde)
  
 // Pages 4+ : Recettes (pagination automatique)
for (let i = 0; i < options.recipes.length; i++) {
  const recipe = options.recipes[i];
  console.log(`   Génération recette ${i + 1}/${options.recipes.length}: ${recipe.title}`);
  
  const startPage = currentPageNumber;
  
  // ✅ Passer le numéro de page actuel
  const pagesCreated = await generateRecipePageWithPagination(
    pdfDoc, 
    fonts, 
    recipe,
    currentPageNumber  // ✅ NOUVEAU
  );
    
    currentPageNumber += pagesCreated;
    const endPage = currentPageNumber - 1;
    
    recipePageNumbers.push({ recipe, startPage, endPage });
  }
  
 // Page 2 : Sommaire (INSÉRÉ après génération des recettes pour avoir les vrais numéros)
  await generateSummaryWithPageNumbers(pdfDoc, fonts, options.bookTitle, recipePageNumbers);
  
  // Page 3 : Autre page de garde
  generateGuardPage(pdfDoc);
  
  console.log('💾 Sauvegarde du PDF...');
  const pdfBytes = await pdfDoc.save();
  
  console.log(`✅ PDF intérieur généré ! (${(pdfBytes.length / 1024).toFixed(0)} KB)`);
  
  return pdfBytes;
}
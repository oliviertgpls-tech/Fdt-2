/**
 * 📄 Génération du PDF INTÉRIEUR pour impression Lulu
 * 
 * Format : 6" × 9" avec bleed de 3mm
 * Minimum : 32 pages (padding automatique si moins)
 * Polices : Embedded (requis par Lulu)
 * 
 * Layout inspiré du design "Choux à la crème" :
 * - Titre en majuscules, gros, gras
 * - Colonne gauche : étapes numérotées
 * - Colonne droite : image + ingrédients sur fond beige
 */

import { PDFDocument, rgb, PDFPage, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// ============================================
// 📏 CONSTANTES LULU 6"×9"
// ============================================

const INCH_TO_PT = 72;
const MM_TO_PT = 2.83465;

/** Convertit mm en points */
const mm = (millimetres: number): number => millimetres * MM_TO_PT;

/** Convertit inches en points */
const inch = (inches: number): number => inches * INCH_TO_PT;

const LULU_6x9 = {
  width: inch(6),              // 432pt = 152.4mm
  height: inch(9),             // 648pt = 228.6mm
  bleed: mm(3),                // 8.5pt = 3mm
  
  get widthWithBleed() {
    return this.width + (this.bleed * 2);   // ~449pt
  },
  get heightWithBleed() {
    return this.height + (this.bleed * 2);  // ~665pt
  }
};

// Minimum de pages requis par Lulu pour Perfect Bound
const LULU_MIN_PAGES = 32;

// ============================================
// 🎨 COULEURS
// ============================================

const COLORS = {
  background: rgb(0.96, 0.96, 0.95),      // Gris très clair (fond page)
  paper: rgb(0.99, 0.98, 0.96),           // Beige papier
  ingredientsBox: rgb(0.94, 0.91, 0.87),  // Beige plus foncé pour ingrédients
  titleText: rgb(0, 0, 0),                // Noir
  bodyText: rgb(0.15, 0.15, 0.15),        // Gris très foncé
  metaText: rgb(0.4, 0.4, 0.4),           // Gris moyen
  line: rgb(0.2, 0.2, 0.2)                // Ligne décorative
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

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

// ============================================
// 🔤 CHARGEMENT DES POLICES
// ============================================

async function loadFonts(pdfDoc: PDFDocument): Promise<FontSet> {
  // pdf-lib ne supporte que les polices standard par défaut
  // Pour Lulu, on utilise Helvetica qui est toujours disponible
  const { StandardFonts } = await import('pdf-lib');
  
  return {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  };
}

// ============================================
// 📐 HELPERS - TEXTE
// ============================================

/**
 * Découpe un texte en lignes selon une largeur max
 */
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  if (!text) return [];
  
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
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
 * Dessine un paragraphe avec retour à la ligne automatique
 * @returns La position Y après le texte
 */
function drawParagraph(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  maxWidth: number,
  lineGap: number = 4
): number {
  const lines = wrapText(text, font, size, maxWidth);
  let cursorY = y;
  
  for (const line of lines) {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= size + lineGap;
  }
  
  return cursorY;
}

// ============================================
// 🖼️ HELPERS - IMAGES
// ============================================

/**
 * Récupère la meilleure URL d'image disponible
 */
function getImageUrl(recipe: Recipe): string | null {
  if (recipe.imageVersions?.large) return recipe.imageVersions.large;
  if (recipe.imageVersions?.medium) return recipe.imageVersions.medium;
  if (recipe.imageUrl) return recipe.imageUrl;
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
  maxWidth: number,
  maxHeight: number
): Promise<{ width: number; height: number } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const imageBytes = await response.arrayBuffer();
    const bytes = new Uint8Array(imageBytes);
    
    let image;
    
    // Détecter le format via magic bytes
    if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      console.warn('⚠️ Format image non supporté');
      return null;
    }
    
    const { width: imgW, height: imgH } = image.size();
    const ratio = Math.min(maxWidth / imgW, maxHeight / imgH);
    const drawWidth = imgW * ratio;
    const drawHeight = imgH * ratio;
    
    // Centrer horizontalement dans la zone
    const finalX = x + (maxWidth - drawWidth) / 2;
    
    page.drawImage(image, {
      x: finalX,
      y: y,
      width: drawWidth,
      height: drawHeight
    });
    
    return { width: drawWidth, height: drawHeight };
    
  } catch (error) {
    console.warn('⚠️ Erreur chargement image:', error);
    return null;
  }
}

// ============================================
// 📄 CRÉATION DE PAGES
// ============================================

/**
 * Crée une nouvelle page avec fond
 */
function createPage(pdfDoc: PDFDocument): PDFPage {
  const page = pdfDoc.addPage([
    LULU_6x9.widthWithBleed,
    LULU_6x9.heightWithBleed
  ]);
  
  // Fond de page
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_6x9.widthWithBleed,
    height: LULU_6x9.heightWithBleed,
    color: COLORS.background
  });
  
  return page;
}

/**
 * Crée une page blanche (pour le padding)
 */
function createBlankPage(pdfDoc: PDFDocument): void {
  const page = createPage(pdfDoc);
  
  // Juste le fond, rien d'autre
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_6x9.widthWithBleed,
    height: LULU_6x9.heightWithBleed,
    color: COLORS.paper
  });
}

/**
 * Ajoute un numéro de page centré en bas
 */
function addPageNumber(page: PDFPage, pageNumber: number, font: PDFFont): void {
  const text = `${pageNumber}`;
  const size = 9;
  const textWidth = font.widthOfTextAtSize(text, size);
  const centerX = LULU_6x9.widthWithBleed / 2;
  
  page.drawText(text, {
    x: centerX - textWidth / 2,
    y: mm(10),
    size,
    font,
    color: COLORS.metaText
  });
}

// ============================================
// 📖 GÉNÉRATION DES PAGES SPÉCIALES
// ============================================

/**
 * Génère la page de garde (vide avec fond)
 */
function generateGuardPage(pdfDoc: PDFDocument): void {
  const page = createPage(pdfDoc);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_6x9.widthWithBleed,
    height: LULU_6x9.heightWithBleed,
    color: COLORS.paper
  });
}

/**
 * Génère la page de titre
 */
function generateTitlePage(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  bookTitle: string,
  description?: string
): void {
  const page = createPage(pdfDoc);
  
  const centerX = LULU_6x9.widthWithBleed / 2;
  let y = LULU_6x9.heightWithBleed - mm(60);
  
  // Titre du livre
  const titleLines = wrapText(bookTitle.toUpperCase(), fonts.bold, 28, mm(100));
  for (const line of titleLines) {
    const lineWidth = fonts.bold.widthOfTextAtSize(line, 28);
    page.drawText(line, {
      x: centerX - lineWidth / 2,
      y,
      size: 28,
      font: fonts.bold,
      color: COLORS.titleText
    });
    y -= 36;
  }
  
  // Description si présente
  if (description) {
    y -= mm(10);
    const descLines = wrapText(description, fonts.italic, 12, mm(90));
    for (const line of descLines) {
      const lineWidth = fonts.italic.widthOfTextAtSize(line, 12);
      page.drawText(line, {
        x: centerX - lineWidth / 2,
        y,
        size: 12,
        font: fonts.italic,
        color: COLORS.metaText
      });
      y -= 18;
    }
  }
}

/**
 * Génère le sommaire
 */
function generateSummary(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  recipePages: { recipe: Recipe; startPage: number }[]
): void {
  const page = createPage(pdfDoc);
  
  const marginLeft = mm(20);
  const marginRight = mm(20);
  let y = LULU_6x9.heightWithBleed - mm(25);
  
  // Titre "SOMMAIRE"
  page.drawText('SOMMAIRE', {
    x: marginLeft,
    y,
    size: 20,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  y -= mm(3);
  
  // Ligne décorative
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: LULU_6x9.widthWithBleed - marginRight, y },
    thickness: 0.5,
    color: COLORS.line
  });
  
  y -= mm(10);
  
  // Liste des recettes
  for (const { recipe, startPage } of recipePages) {
    if (y < mm(20)) break; // Sécurité bas de page
    
    const title = recipe.title;
    const pageText = `${startPage}`;
    
    // Titre à gauche
    const titleWidth = LULU_6x9.widthWithBleed - marginLeft - marginRight - mm(15);
    const titleLines = wrapText(title, fonts.regular, 10, titleWidth);
    
    page.drawText(titleLines[0], {
      x: marginLeft,
      y,
      size: 10,
      font: fonts.regular,
      color: COLORS.bodyText
    });
    
    // Numéro de page à droite
    const pageWidth = fonts.regular.widthOfTextAtSize(pageText, 10);
    page.drawText(pageText, {
      x: LULU_6x9.widthWithBleed - marginRight - pageWidth,
      y,
      size: 10,
      font: fonts.regular,
      color: COLORS.metaText
    });
    
    y -= mm(6);
  }
}

// ============================================
// 🍳 GÉNÉRATION PAGE RECETTE
// ============================================

/**
 * Génère les pages d'une recette (avec pagination si nécessaire)
 * @returns Nombre de pages créées
 */
async function generateRecipePages(
  pdfDoc: PDFDocument,
  fonts: FontSet,
  recipe: Recipe,
  startPageNumber: number
): Promise<number> {
  
  // === CONFIGURATION LAYOUT ===
  const marginLeft = mm(18);
  const marginRight = mm(15);
  const marginTop = mm(20);
  const minY = mm(18); // Zone sécurité bas
  
  const pageWidth = LULU_6x9.widthWithBleed;
  const pageHeight = LULU_6x9.heightWithBleed;
  
  // Colonnes
  const rightColWidth = mm(45);  // Colonne ingrédients
  const colGap = mm(8);
  const leftColWidth = pageWidth - marginLeft - marginRight - rightColWidth - colGap;
  
  const leftX = marginLeft;
  const rightX = pageWidth - marginRight - rightColWidth;
  
  let pagesCreated = 0;
  let currentPage = createPage(pdfDoc);
  let currentPageNum = startPageNumber;
  pagesCreated++;
  
  let y = pageHeight - marginTop;
  
  // === LIGNE DÉCORATIVE EN-TÊTE ===
  currentPage.drawLine({
    start: { x: marginLeft, y },
    end: { x: pageWidth - marginRight, y },
    thickness: 0.5,
    color: COLORS.line
  });
  
  y -= mm(12);
  
  // === TITRE RECETTE (GROS, MAJUSCULES) ===
  const titleSize = 24;
  const titleLines = wrapText(
    recipe.title.toUpperCase(),
    fonts.bold,
    titleSize,
    leftColWidth + mm(10) // Le titre peut être un peu plus large
  );
  
  for (const line of titleLines) {
    currentPage.drawText(line, {
      x: leftX,
      y,
      size: titleSize,
      font: fonts.bold,
      color: COLORS.titleText
    });
    y -= titleSize + 6;
  }
  
  y -= mm(2);
  
  // === MÉTADONNÉES (auteur • temps • portions) ===
  const metaParts: string[] = [];
  if (recipe.author) metaParts.push(`Par ${recipe.author}`);
  if (recipe.prepMinutes) metaParts.push(`${recipe.prepMinutes} min`);
  if (recipe.servings) metaParts.push(`${recipe.servings} pers.`);
  
  if (metaParts.length > 0) {
    currentPage.drawText(metaParts.join('  •  '), {
      x: leftX,
      y,
      size: 9,
      font: fonts.regular,
      color: COLORS.metaText
    });
    y -= mm(8);
  }
  
  // === COLONNE DROITE : IMAGE + INGRÉDIENTS ===
  const contentStartY = y;
  
  // Zone ingrédients (fond beige)
  const imageUrl = getImageUrl(recipe);
  const imageHeight = imageUrl ? mm(38) : 0;
  const ingredientsTopPadding = mm(5);
  
  // Calculer hauteur box ingrédients
  let ingredientsHeight = mm(8); // Titre "INGRÉDIENTS"
  for (const ing of recipe.ingredients) {
    const lines = wrapText(ing, fonts.regular, 9, rightColWidth - mm(6));
    ingredientsHeight += lines.length * 12 + 2;
  }
  ingredientsHeight += mm(5); // Padding bas
  
  const boxHeight = imageHeight + ingredientsTopPadding + ingredientsHeight;
  const boxY = contentStartY - boxHeight;
  
  // Fond beige pour ingrédients
  currentPage.drawRectangle({
    x: rightX - mm(3),
    y: boxY,
    width: rightColWidth + mm(6),
    height: boxHeight,
    color: COLORS.ingredientsBox
  });
  
  // Image en haut de la colonne droite
  let ingredientsY = contentStartY - ingredientsTopPadding;
  
  if (imageUrl) {
    const imgResult = await drawImage(
      pdfDoc,
      currentPage,
      imageUrl,
      rightX,
      contentStartY - imageHeight,
      rightColWidth,
      imageHeight
    );
    
    if (imgResult) {
      ingredientsY = contentStartY - imageHeight - mm(5);
    }
  }
  
  // Titre "INGRÉDIENTS"
  currentPage.drawText('INGRÉDIENTS', {
    x: rightX,
    y: ingredientsY,
    size: 11,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  ingredientsY -= mm(5);
  
  // Liste des ingrédients
  for (const ingredient of recipe.ingredients) {
    if (ingredientsY < boxY + mm(3)) break;
    
    const capitalizedIng = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    ingredientsY = drawParagraph(
      currentPage,
      capitalizedIng,
      rightX,
      ingredientsY,
      fonts.regular,
      9,
      COLORS.bodyText,
      rightColWidth - mm(3),
      2
    );
    ingredientsY -= 2;
  }
  
  // === COLONNE GAUCHE : ÉTAPES ===
  let stepsY = contentStartY;
  
  // Titre "ÉTAPES"
  currentPage.drawText('ÉTAPES', {
    x: leftX,
    y: stepsY,
    size: 11,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  stepsY -= mm(6);
  
  // Parser les étapes
  const steps = typeof recipe.steps === 'string'
    ? recipe.steps.split('\n\n').filter(s => s.trim())
    : Array.isArray(recipe.steps)
    ? recipe.steps
    : [];
  
  const numberColWidth = mm(6);
  const stepTextX = leftX + numberColWidth;
  const stepTextWidth = leftColWidth - numberColWidth;
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i].trim().replace(/^\d+\.?\s*/, ''); // Enlever numéro existant
    
    // Vérifier si besoin nouvelle page
    if (stepsY < minY + mm(15)) {
      // Ajouter numéro de page
      addPageNumber(currentPage, currentPageNum, fonts.regular);
      currentPageNum++;
      
      // Nouvelle page
      currentPage = createPage(pdfDoc);
      pagesCreated++;
      stepsY = pageHeight - marginTop;
      
      // Titre continuation
      currentPage.drawText('ÉTAPES (suite)', {
        x: leftX,
        y: stepsY,
        size: 11,
        font: fonts.bold,
        color: COLORS.titleText
      });
      stepsY -= mm(6);
    }
    
    // Numéro de l'étape
    const stepNum = `${i + 1}.`;
    currentPage.drawText(stepNum, {
      x: leftX,
      y: stepsY,
      size: 10,
      font: fonts.bold,
      color: COLORS.bodyText
    });
    
    // Texte de l'étape
    stepsY = drawParagraph(
      currentPage,
      step,
      stepTextX,
      stepsY,
      fonts.regular,
      10,
      COLORS.bodyText,
      stepTextWidth,
      3
    );
    
    stepsY -= mm(3);
  }
  
  // Numéro de page sur la dernière page de cette recette
  addPageNumber(currentPage, currentPageNum, fonts.regular);
  
  return pagesCreated;
}

// ============================================
// 🎯 FONCTION PRINCIPALE
// ============================================

export async function generateInteriorPDF(
  options: GenerateInteriorOptions
): Promise<Uint8Array> {
  console.log('📄 Génération du PDF intérieur Lulu...');
  console.log(`   Format: ${LULU_6x9.widthWithBleed.toFixed(0)}pt × ${LULU_6x9.heightWithBleed.toFixed(0)}pt`);
  console.log(`   Recettes: ${options.recipes.length}`);
  
  const pdfDoc = await PDFDocument.create();
  const fonts = await loadFonts(pdfDoc);
  
  // === PAGES DE DÉBUT ===
  
  // Page 1 : Page de garde (vierge)
  generateGuardPage(pdfDoc);
  
  // Page 2 : Page de titre
  generateTitlePage(pdfDoc, fonts, options.bookTitle, options.description);
  
  // Page 3 : Verso titre (vierge)
  generateGuardPage(pdfDoc);
  
  // On va insérer le sommaire après avoir généré les recettes
  // pour connaître les vrais numéros de page
  
  // Page 4 : Placeholder pour sommaire (on le remplacera)
  generateGuardPage(pdfDoc);
  
  // === PAGES DE RECETTES ===
  const recipePages: { recipe: Recipe; startPage: number }[] = [];
  let currentPage = 5; // Les recettes commencent page 5
  
  for (const recipe of options.recipes) {
    console.log(`   → ${recipe.title}`);
    
    recipePages.push({ recipe, startPage: currentPage });
    
    const pagesCreated = await generateRecipePages(
      pdfDoc,
      fonts,
      recipe,
      currentPage
    );
    
    currentPage += pagesCreated;
  }
  
  // === REMPLACER LE PLACEHOLDER SOMMAIRE ===
  // Supprimer la page 4 (index 3) et insérer le vrai sommaire
  pdfDoc.removePage(3);
  
  // Créer le sommaire sur une nouvelle page
  const summaryPage = pdfDoc.insertPage(3, [
    LULU_6x9.widthWithBleed,
    LULU_6x9.heightWithBleed
  ]);
  
  // Fond
  summaryPage.drawRectangle({
    x: 0,
    y: 0,
    width: LULU_6x9.widthWithBleed,
    height: LULU_6x9.heightWithBleed,
    color: COLORS.background
  });
  
  // Contenu sommaire
  const marginLeft = mm(20);
  const marginRight = mm(20);
  let y = LULU_6x9.heightWithBleed - mm(25);
  
  summaryPage.drawText('SOMMAIRE', {
    x: marginLeft,
    y,
    size: 20,
    font: fonts.bold,
    color: COLORS.titleText
  });
  
  y -= mm(3);
  
  summaryPage.drawLine({
    start: { x: marginLeft, y },
    end: { x: LULU_6x9.widthWithBleed - marginRight, y },
    thickness: 0.5,
    color: COLORS.line
  });
  
  y -= mm(10);
  
  for (const { recipe, startPage } of recipePages) {
    if (y < mm(20)) break;
    
    const title = recipe.title;
    const pageText = `${startPage}`;
    
    summaryPage.drawText(title, {
      x: marginLeft,
      y,
      size: 10,
      font: fonts.regular,
      color: COLORS.bodyText
    });
    
    const pageWidth = fonts.regular.widthOfTextAtSize(pageText, 10);
    summaryPage.drawText(pageText, {
      x: LULU_6x9.widthWithBleed - marginRight - pageWidth,
      y,
      size: 10,
      font: fonts.regular,
      color: COLORS.metaText
    });
    
    y -= mm(6);
  }
  
  // === PADDING POUR ATTEINDRE 32 PAGES MINIMUM ===
  const totalPages = pdfDoc.getPageCount();
  
  if (totalPages < LULU_MIN_PAGES) {
    const pagesToAdd = LULU_MIN_PAGES - totalPages;
    console.log(`   ⚠️ Seulement ${totalPages} pages, ajout de ${pagesToAdd} pages blanches`);
    
    for (let i = 0; i < pagesToAdd; i++) {
      createBlankPage(pdfDoc);
    }
  }
  
  // S'assurer que le nombre de pages est pair (requis pour impression)
  if (pdfDoc.getPageCount() % 2 !== 0) {
    console.log('   📄 Ajout d\'une page pour avoir un nombre pair');
    createBlankPage(pdfDoc);
  }
  
  console.log(`   ✅ Total: ${pdfDoc.getPageCount()} pages`);
  
  // === EXPORT ===
  const pdfBytes = await pdfDoc.save();
  
  console.log(`✅ PDF intérieur généré ! (${(pdfBytes.length / 1024).toFixed(0)} KB)`);
  
  return pdfBytes;
}
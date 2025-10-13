'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit3, Trash2, Plus, Eye, Download, X, Loader, GripVertical } from 'lucide-react';
import { useRecipes } from '@/contexts/RecipesProvider';
import { ImageSearch } from '@/components/ImageSearch';
import { useToast } from '@/components/Toast';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  TouchSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Type pour les versions d'images
type UploadResult = {
  versions: {
    small: string;
    medium: string;
    large: string;
  } | null;
};

// Composant pour une recette draggable
function SortableRecipeItem({ 
  recipe, 
  index, 
  pageNumber,
  onRemove 
}: { 
  recipe: any; 
  index: number; 
  pageNumber: string;  // Ex: "5" ou "5-6"
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipe.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-green-50 rounded-lg p-4 border-2 ${
        isDragging ? 'border-green-400 shadow-lg z-50' : 'border-green-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Poignée de drag */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-green-100 rounded transition-colors touch-none flex-shrink-0"
          title="Réorganiser"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>

        {/* Numéro de page dynamique */}
        <div className="w-auto min-w-[2.5rem] px-2 h-7 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
          p.{pageNumber}
        </div>

        {/* Info recette */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{recipe.title}</h4>
          <p className="text-xs text-gray-600">par {recipe.author || 'Famille'}</p>
        </div>

        {/* Bouton suppression */}
        <button
          onClick={() => {
            if (confirm(`Retirer "${recipe.title}" de ce livre ?`)) {
              onRemove(recipe.id);
            }
          }}
          className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0 text-red-600"
          title="Retirer du livre"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function BookPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // Sensors pour le drag & drop (desktop + mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distance minimale avant d'activer le drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Délai avant d'activer le drag sur mobile (pour permettre le scroll)
        tolerance: 8,
      },
    })
  );
  
  // Utilisez le context RecipesProvider
  const { 
    books, 
    recipes, 
    updateBook,
    reorderBookRecipes,
    addRecipeToBook,
    removeRecipeFromBook,
    deleteBook
  } = useRecipes();

  const { showToast } = useToast();
  
  // États locaux
  const [bookDescription, setBookDescription] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  
  // États pour la photo de couverture
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageVersions, setCoverImageVersions] = useState<UploadResult['versions'] | null>(null);
  const [editingCover, setEditingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // États pour la modale PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // États pour l'édition du titre
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // State local pour l'ordre des recettes (pour mise à jour immédiate)
  const [localRecipeIds, setLocalRecipeIds] = useState<string[]>([]);
  // Flag pour éviter que useEffect écrase pendant un drag
  const [isDragging, setIsDragging] = useState(false);

  // Trouvez les données directement depuis le context
  const book = books.find(b => b.id === id);

  useEffect(() => {
    if (book?.recipeIds && localRecipeIds.length === 0) {
      console.log('🎬 INITIAL LOAD - setting localRecipeIds');
      setLocalRecipeIds(book.recipeIds);
    }
  }, [book?.recipeIds]);

    const bookRecipes = localRecipeIds.length > 0
      ? localRecipeIds
          .map(id => recipes.find(r => r.id === id))
          .filter((r): r is any => r !== undefined)
      : [];

  const availableRecipes = recipes.filter(recipe => 
    !book?.recipeIds?.includes(recipe.id)
  );

  const imageUrlToDisplay = coverImageVersions?.medium 
                          || coverImageUrl           
                          || book?.coverImageVersions?.medium 
                          || book?.coverImageUrl;    

  // Initialiser les états
  useEffect(() => {
    if (book) {
      setBookDescription(book.description || '');
      setCoverImageUrl(book.coverImageUrl || '');
      setCoverImageVersions(book.coverImageVersions || null);
    }
  }, [book]);

  // Fonction save titre
  const saveTitle = () => {
    if (book && tempTitle.trim()) {
      updateBook(book.id, { title: tempTitle.trim() });
      setEditingTitle(false);
    }
  };

  // FONCTION SUPPRESSION LIVRE
  const handleDeleteBook = () => {
    if (window.confirm(`Supprimer le livre "${book?.title}" ?\n\nCette action est irréversible.`)) {
      deleteBook(id);
      router.push('/livres');
    }
  };

  // Actions simplifiées
 const handleAddRecipeToBook = async (bookId: string, recipeId: string) => {
  try {
    // Ajouter via l'API
    await addRecipeToBook(bookId, recipeId);
    
    // Mettre à jour le state local immédiatement
    // On ajoute à la fin de la liste
    setLocalRecipeIds(prev => [...prev, recipeId]);
    
    showToast('Recette ajoutée au livre !', 'success');
  } catch (error) {
    console.error('Erreur ajout:', error);
    showToast('Erreur lors de l\'ajout', 'error');
  }
};

  const handleRemoveRecipeFromBook = (bookId: string, recipeId: string) => {
    removeRecipeFromBook(bookId, recipeId);
  };

  const saveDescription = () => {
    if (book) {
      updateBook(book.id, { description: bookDescription });
      setEditingDescription(false);
    }
  };

    // FONCTION D'UPLOAD pour les images de couverture AVEC CONVERSION HEIC
    const handleCoverImageUpload = async (file: File) => {
      setIsUploadingCover(true);
      
      try {
        console.log('📤 Upload image de couverture...', file.name);
        
        // 🔄 CONVERSION HEIC → JPEG si nécessaire
        let processedFile = file;
        
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
          console.log('🔄 Conversion HEIC → JPEG en cours...');
          try {
            // Import dynamique de la librairie (chargée uniquement si nécessaire)
            const heic2any = (await import('heic2any')).default;
            
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.9
            });
            
            // heic2any peut retourner un tableau de Blobs, on prend le premier
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            
            processedFile = new File(
              [blob], 
              file.name.replace(/\.heic$/i, '.jpg'),
              { type: 'image/jpeg' }
            );
            console.log('✅ Conversion HEIC réussie');
          } catch (error) {
            console.error('❌ Erreur conversion HEIC:', error);
            showToast('Erreur lors de la conversion HEIC, tentative avec le fichier original...', 'error');
            // On continue avec le fichier original en cas d'échec
          }
        }
        
        // Upload du fichier (converti ou original)
        const formData = new FormData();
        formData.append('file', processedFile);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload couverture réussi:', result);
        
        if (result.success) {
          setCoverImageUrl(result.originalUrl);
          setCoverImageVersions(result.versions || null);
          showToast('Image de couverture uploadée !', 'success');
        } else {
          throw new Error(result.message || 'Erreur upload');
        }
        
      } catch (error: any) {
        console.error('💥 Erreur upload couverture:', error);
        showToast('Erreur lors de l\'upload de l\'image', 'error');
      } finally {
        setIsUploadingCover(false);
      }
    };

  // Génération PDF
  const generatePreviewPDF = async () => {
    console.log('🚀 generatePreviewPDF appelée !');
    if (!book) return;

    setIsGeneratingPreview(true);
    try {
    console.log('📚 Livre trouvé:', book.title);
    console.log('📖 Recettes du livre:', bookRecipes.length);
      const pdfLib = await import('pdf-lib');
      console.log('✅ pdf-lib importé');
      const { PDFDocument, rgb, StandardFonts } = pdfLib;

      const printableRecipes = bookRecipes.filter(recipe => !recipe.isFromExternalUrl);
      console.log('🖨️ Recettes imprimables:', printableRecipes.length);
      console.log('🔍 Détail recettes:', bookRecipes.map(r => ({ 
          title: r.title, 
          isExternal: r.isFromExternalUrl 
        })));

      if (printableRecipes.length === 0) {
        console.log('❌ Aucune recette imprimable');
        showToast('Aucune recette imprimable dans ce livre', 'error');
        return;
      }
      console.log('🎯 Création du PDF...');

      // Constantes
      const A4 = { w: 595.28, h: 841.89 };
      const margin = 60;
      console.log('📐 Constantes définies');

      // Fonctions helpers
      const wrapText = (text: string, font: any, size: number, maxWidth: number): string[] => {
        if (!text) return [];
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let line = '';
        for (const w of words) {
          const test = line ? line + ' ' + w : w;
          const width = font.widthOfTextAtSize(test, size);
          if (width > maxWidth && line) {
            lines.push(line);
            line = w;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        return lines;
      };

      const drawParagraph = (page: any, text: string, x: number, y: number, font: any, size: number, color: any, maxWidth: number, lineGap = 4) => {
        const lines = wrapText(text, font, size, maxWidth);
        let cursorY = y;
        for (const line of lines) {
          page.drawText(line, { x, y: cursorY, size, font, color });
          cursorY -= size + lineGap;
          if (cursorY < margin) break;
        }
        return cursorY;
      };

      const fetchImageBytes = async (url?: string | null): Promise<Uint8Array | null> => {
        if (!url) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const buf = await res.arrayBuffer();
          return new Uint8Array(buf);
        } catch {
          return null;
        }
      };

      const drawImageFitted = async (pdfDoc: any, page: any, url: string | undefined, x: number, y: number, boxW: number, boxH: number, preserveAspect = true) => {
      const bytes = await fetchImageBytes(url);
      if (!bytes) {
        page.drawRectangle({
          x, y, width: boxW, height: boxH,
          color: rgb(0.95, 0.94, 0.92),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1
        });
        page.drawText('Image indisponible', {
          x: x + 12, y: y + boxH / 2 - 6,
          size: 12, color: rgb(0.4, 0.35, 0.3)
        });
        return;
      }

        // Détection robuste : essayer JPEG d'abord, puis PNG en cas d'erreur
        let img;
        try {
          // La plupart des photos sont des JPEG
          img = await pdfDoc.embedJpg(bytes);
        } catch (jpgError) {
          try {
            // Si JPG échoue, essayer PNG
            img = await pdfDoc.embedPng(bytes);
          } catch (pngError) {
            console.error('❌ Impossible d\'intégrer l\'image (ni JPG ni PNG)');
            // Afficher un rectangle de remplacement
            page.drawRectangle({
              x, y, width: boxW, height: boxH,
              color: rgb(0.95, 0.94, 0.92),
              borderColor: rgb(0.8, 0.8, 0.8),
              borderWidth: 1
            });
            page.drawText('Image incompatible', {
              x: x + 12, y: y + boxH / 2 - 6,
              size: 12, color: rgb(0.4, 0.35, 0.3)
            });
            return;
          }
        }
      const { width, height } = img.size();

      // Calcul du ratio pour préserver les proportions
      const imgRatio = width / height;
      const boxRatio = boxW / boxH;
      
      let w, h;
      
      if (preserveAspect) {
        // Préserver le ratio - l'image rentre entièrement dans la box
        if (imgRatio > boxRatio) {
          // Image plus large que la box
          w = boxW;
          h = boxW / imgRatio;
        } else {
          // Image plus haute que la box
          h = boxH;
          w = boxH * imgRatio;
        }
      } else {
        // Ancien comportement - remplir la box
        const scale = Math.min(boxW / width, boxH / height);
        w = width * scale;
        h = height * scale;
      }
      
      // Centrer l'image dans la box
      const cx = x + (boxW - w) / 2;
      const cy = y + (boxH - h) / 2;

      page.drawImage(img, { x: cx, y: cy, width: w, height: h });
    };

      // Création du PDF
      const pdfDoc = await PDFDocument.create();
      console.log('📄 PDFDocument créé');
      const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);
      console.log('🔤 Polices intégrées');
      const colorTitle = rgb(0.2, 0.1, 0.05);
      const colorBody = rgb(0.3, 0.3, 0.3);

        // 1) Page de couverture
      const cover = pdfDoc.addPage([A4.w, A4.h]);
      console.log('✅ Page de couverture créée');

      cover.drawRectangle({
        x: 0, y: 0, width: A4.w, height: A4.h,
        color: rgb(0.98, 0.97, 0.95)
      });

      // Titre du livre (descendu)
      const titleLines = wrapText(book.title, fontTitle, 28, A4.w - 200);
      let titleY = A4.h - 250;
      titleLines.forEach(line => {
        const textWidth = fontTitle.widthOfTextAtSize(line, 28);
        cover.drawText(line, {
          x: (A4.w - textWidth) / 2,
          y: titleY,
          size: 28,
          font: fontTitle,
          color: colorTitle
        });
        titleY -= 35;
      });

      
      // Image de couverture centrée (si présente)
      if (imageUrlToDisplay) {
        const imageSize = 320;
        const imageX = (A4.w - imageSize) / 2; // Centré horizontalement
        const imageY = titleY - 10 - imageSize;
        
        await drawImageFitted(pdfDoc, cover, imageUrlToDisplay, imageX, imageY, imageSize, imageSize);
        
       // Description en italique centrée sous l'image (si présente)
       if (book.description) {
          const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
          const descSize = 14;  // 🆕 Définir la taille une seule fois
          const descriptionLines = wrapText(book.description, fontItalic, descSize, A4.w - 120);
          let descY = imageY - 20;  // 🆕 Position sous l'image
          
          descriptionLines.forEach(line => {
            const lineWidth = fontItalic.widthOfTextAtSize(line, descSize);  // ✅ Même taille
            cover.drawText(line, {
              x: (A4.w - lineWidth) / 2,  // Centré
              y: descY,
              size: descSize,  // ✅ Même taille
              font: fontItalic,
              color: colorBody
            });
            descY -= 18;
          });
        }
      }

      // 2) Page de garde vide (p.2 - verso couverture)
      const guardPage1 = pdfDoc.addPage([A4.w, A4.h]);
      guardPage1.drawRectangle({
        x: 0, y: 0, width: A4.w, height: A4.h,
        color: rgb(0.99, 0.98, 0.96) // Même couleur que le reste
      });

// 3) Générer TOUTES les pages de recettes AVANT le sommaire
const recipePageNumbers: { recipe: any; startPage: number; endPage: number }[] = [];
let currentPageNumber = 5; // Première recette = page 5

for (const recipe of printableRecipes) {
  const startPage = currentPageNumber;
  let currentPage = pdfDoc.addPage([A4.w, A4.h]);
  
  // Fond stone-100
  currentPage.drawRectangle({
    x: 0, y: 0, width: A4.w, height: A4.h,
    color: rgb(0.96, 0.96, 0.95)
  });

  let currentY = A4.h - 60;
  const minY = 80; // Limite basse de page

  // 📌 EN-TÊTE : Ligne décorative simple
  const lineY = currentY;
  currentPage.drawLine({
    start: { x: 60, y: lineY },
    end: { x: A4.w - 60, y: lineY },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.2)
  });

  currentY -= 80;

  // 📌 TITRE DE LA RECETTE
  const titleLines = wrapText(recipe.title.toUpperCase(), fontTitle, 36, 320);
  titleLines.forEach(line => {
    currentPage.drawText(line, {
      x: 60,
      y: currentY,
      size: 36,
      font: fontTitle,
      color: rgb(0, 0, 0)
    });
    currentY -= 42;
  });

  currentY -= 20;

  // Métadonnées
  const metaParts = [];
  if (recipe.author) metaParts.push(`Par ${recipe.author}`);
  if (recipe.prepMinutes) metaParts.push(`${recipe.prepMinutes} min`);
  if (recipe.servings) metaParts.push(`${recipe.servings} pers.`);
  const metaText = metaParts.join('  •  ');

  if (metaText) {
    currentPage.drawText(metaText, {
      x: 60,
      y: currentY,
      size: 9,
      font: fontBody,
      color: rgb(0.4, 0.4, 0.4)
    });
    currentY -= 40;
  }

  // 📌 LAYOUT EN 2 COLONNES
  const leftColWidth = 270;
  const rightColWidth = 150;
  const leftX = 60;
  const marginRight = 60; // Marge droite souhaitée

  // Calculer rightX en tenant compte du padding de la box
  const boxPadding = 20;
  const rightX = A4.w - marginRight - boxPadding - rightColWidth;

  // === COLONNE DROITE : ENCADRÉ INGRÉDIENTS (PAGE 1 UNIQUEMENT) ===
  const boxX = rightX - boxPadding;
  const imageHeight = recipe.imageUrl ? 150 : 0;
  const imageWidth = rightColWidth;

  let calculatedHeight = 0;
  if (imageHeight > 0) {
    calculatedHeight += (imageHeight / 2) + 20;
  }
  calculatedHeight += 40;

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
let tempY = 0;
for (const ingredient of ingredients) {
  // Capitaliser : première lettre en majuscule
  const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  const lines = wrapText(capitalizedIngredient, fontBody, 10, rightColWidth - 10);
  tempY += (lines.length * 12) + 8;
}
calculatedHeight += tempY + boxPadding * 2;

  const boxHeight = Math.max(calculatedHeight, 250);
  const rightYStart = currentY + 40;
  const boxY = rightYStart - boxHeight;

  // Encadré
  currentPage.drawRectangle({
    x: boxX,
    y: boxY,
    width: rightColWidth + (boxPadding * 2),
    height: boxHeight,
    color: rgb(0.94, 0.87, 0.80),
  });

  let contentY = rightYStart - boxPadding;
  if (imageHeight > 0) {
    contentY -= (imageHeight / 2) + 15;
  }

  currentPage.drawText('INGRÉDIENTS', {
    x: rightX,
    y: contentY,
    size: 14,
    font: fontTitle,
    color: rgb(0, 0, 0)
  });
  contentY -= 30;

for (const ingredient of ingredients) {
  if (contentY < boxY + boxPadding + 10) break;
  
  // Capitaliser
  const capitalizedIngredient = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
  
  contentY = drawParagraph(currentPage, capitalizedIngredient, rightX, contentY, fontBody, 10, rgb(0.2, 0.2, 0.2), rightColWidth - 10, 2) - 8;
}

  // Image débordant en haut
  if (recipe.imageUrl) {
    const imageX = rightX;
    const imageY = (boxY + boxHeight) - (imageHeight / 2);

    await drawImageFitted(pdfDoc, currentPage, recipe.imageUrl, imageX, imageY, imageWidth, imageHeight, true);
  }

  // === COLONNE GAUCHE : ÉTAPES AVEC PAGINATION ===
  let leftY = currentY;

  currentPage.drawText('ÉTAPES', {
    x: leftX,
    y: leftY,
    size: 14,
    font: fontTitle,
    color: rgb(0, 0, 0)
  });
  leftY -= 25;

  const steps = typeof recipe.steps === 'string'
    ? recipe.steps.split('\n\n').filter((s: string) => s.trim())
    : Array.isArray(recipe.steps) ? recipe.steps : [];

  // 🆕 GESTION DES PAGES MULTIPLES
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    
    // Vérifier si on a assez d'espace pour le numéro + au moins 2 lignes
    if (leftY < minY + 40) {
      // Créer une nouvelle page
      currentPageNumber += 1;
      currentPage = pdfDoc.addPage([A4.w, A4.h]);
      
      currentPage.drawRectangle({
        x: 0, y: 0, width: A4.w, height: A4.h,
        color: rgb(0.96, 0.96, 0.95)
      });
      
      leftY = A4.h - 80;
      
      // Titre de section sur la nouvelle page
      currentPage.drawText('ÉTAPES (suite)', {
        x: leftX,
        y: leftY,
        size: 14,
        font: fontTitle,
        color: rgb(0, 0, 0)
      });
      leftY -= 25;
    }

    // Numéro de l'étape
    const stepNumber = `${idx + 1}.`;
    currentPage.drawText(stepNumber, {
      x: leftX,
      y: leftY,
      size: 11,
      font: fontTitle,
      color: rgb(0, 0, 0)
    });

    // Texte de l'étape
    const stepText = step.replace(/^\d+\.?\s*/, '');
    const newY = drawParagraph(currentPage, stepText, leftX + 20, leftY, fontBody, 11, rgb(0.2, 0.2, 0.2), leftColWidth - 20, 3);
    leftY = newY - 15;
  }

    // Numéro de page sur toutes les pages de la recette
    currentPageNumber += 1;
    const endPage = currentPageNumber - 1;
    
    recipePageNumbers.push({ recipe, startPage, endPage });
  }

      // 4) Insérer le SOMMAIRE en position 2 (= page 3 physique)
      const summaryPage = pdfDoc.insertPage(2, [A4.w, A4.h]);

      // Fond
      summaryPage.drawRectangle({
        x: 0, y: 0, width: A4.w, height: A4.h,
        color: rgb(0.99, 0.98, 0.96)
      });

      // Titre "Sommaire"
      let summaryY = A4.h - margin - 20;
      summaryPage.drawText('Sommaire', {
        x: margin,
        y: summaryY,
        size: 24,
        font: fontTitle,
        color: colorTitle
      });

      summaryY -= 50;

      // Ligne décorative
      summaryPage.drawLine({
        start: { x: margin, y: summaryY + 10 },
        end: { x: A4.w - margin, y: summaryY + 10 },
        thickness: 1,
        color: rgb(0.7, 0.6, 0.5)
      });

      summaryY -= 30;

      // Liste des recettes avec VRAIS numéros
      recipePageNumbers.forEach(({ recipe, startPage, endPage }) => {
        if (summaryY < margin + 40) return;
        
        const pageText = startPage === endPage 
          ? `p.${startPage}` 
          : `p.${startPage}-${endPage}`;
        
        const authorText = recipe.author ? ` par ${recipe.author}` : '';
        const recipeText = `${pageText} - ${recipe.title}${authorText}`;
        
        const lines = wrapText(recipeText, fontBody, 12, A4.w - (margin * 2));
        
        lines.forEach((line, lineIndex) => {
          summaryPage.drawText(line, {
            x: margin + (lineIndex > 0 ? 40 : 0),
            y: summaryY,
            size: 12,
            font: fontBody,
            color: colorBody
          });
          summaryY -= 18;
        });
        
        summaryY -= 8;
      });

      // 5) Insérer page de garde vide après sommaire (= page 4 physique)
      const guardPage2 = pdfDoc.insertPage(3, [A4.w, A4.h]);
      guardPage2.drawRectangle({
        x: 0, y: 0, width: A4.w, height: A4.h,
        color: rgb(0.99, 0.98, 0.96)
      });

      console.log('💾 Génération des bytes PDF...');
      // Export du PDF
      const pdfBytes = await pdfDoc.save();
      console.log('✅ PDF bytes généré, taille:', pdfBytes.length);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      console.log('🔗 URL blob créée:', url);
      setPdfUrl(url);
      setTimeout(() => setShowPDFModal(true), 100);
      console.log('🔍 showPDFModal state:', showPDFModal);
      console.log('🔍 pdfUrl state:', pdfUrl);

    } catch (error) {
      console.error('PDF error', error);
      showToast('Erreur lors de la génération du PDF', 'error');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Fermer la modale PDF
  const closePDFModal = () => {
    setShowPDFModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Télécharger le PDF
  const downloadPDF = () => {
    if (pdfUrl && book) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${book.title}.pdf`;
      link.click();
    }
  };

  // Calculs
  const pageCount = 1 + 1 + 1 + (bookRecipes.length * 2);
  // Page 1 : Couverture
  // Page 2 : Verso vide
  // Page 3 : Sommaire
  // Pages 4+ : Recettes (2 pages par recette)
  const estimatedPrice = Math.round((pageCount * 0.30 + 15) * 1) / 1;



  // Gestion du réordonnement des recettes
  // Log quand le drag commence
  const handleDragStart = (event: any) => {
  console.log('🎬 DRAG START - active.id:', event.active.id);
  setIsDragging(true);
  // Haptique au début du drag
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  console.log('🏁 DRAG END - active:', active.id, 'over:', over?.id);

  if (over && active.id !== over.id && book) {
    const oldIndex = localRecipeIds.indexOf(active.id as string);
    const newIndex = localRecipeIds.indexOf(over.id as string);

    console.log('📍 Indexes:', { oldIndex, newIndex });
    
    const newOrder = arrayMove(localRecipeIds, oldIndex, newIndex);
    
    console.log('📦 OLD ORDER:', localRecipeIds);
    console.log('✨ NEW ORDER:', newOrder);
    
    // Mise à jour immédiate du state local (UI instantanée)
    setLocalRecipeIds(newOrder);
    console.log('💾 Local state updated');

    try {
      // Appeler l'API de réordonnement
      await reorderBookRecipes(book.id, newOrder);
      console.log('✅ API Success');
      showToast('Ordre des recettes modifié !', 'success');
    } catch (error) {
      console.error('❌ Save ERROR:', error);
      // En cas d'erreur, revenir à l'ancien ordre
      setLocalRecipeIds(localRecipeIds);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  } else {
    console.log('⚠️ No drag happened');
  }
  
  setIsDragging(false);
  console.log('🔓 isDragging set to false');
};

  // Fonction pour retirer une recette du livre
    const handleRemoveRecipe = async (recipeId: string) => {
      if (book) {
        try {
          // Supprimer via l'API
          await removeRecipeFromBook(book.id, recipeId);
          
          // Mettre à jour le state local immédiatement
          setLocalRecipeIds(prev => prev.filter(id => id !== recipeId));
          
          showToast('Recette retirée du livre', 'success');
        } catch (error) {
          console.error('Erreur suppression:', error);
          showToast('Erreur lors de la suppression', 'error');
        }
      }
    };

  // Si le livre n'existe pas
  if (!book) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Livre introuvable</h2>
          <p className="text-gray-600 mb-6">Ce livre n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/livres')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ← Retour aux livres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      <div className="w-full pt-1 px-1">
        <div className="text-orange-500 underline mb-2">
        <button
              onClick={() => router.back()}
              className="text-orange-600 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux livres</span>
            </button>
        </div>

        {/* En-tête avec titre éditable */}
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex items-center justify-between items-center gap-3">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-lg md:text-xl font-semibold text-gray-700 border border-gray-300 rounded px-2 md:px-3 py-1 focus:border-orange-500 focus:outline-none w-full min-w-0"
                    autoFocus
                  />
                  <button
                    onClick={saveTitle}
                    disabled={!tempTitle.trim()}
                    className="bg-secondary-600 text-white px-2 md:px-3 py-1 rounded text-sm hover:bg-secondary-700 disabled:opacity-50"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingTitle(false)}
                    className="bg-gray-100 text-gray-700 px-2 md:px-3 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                  
                    <div className="flex items-center justify-between">
                      <h1 className="text-base font-semibold text-gray-800 m-3">{book.title}</h1>
                      <button
                        onClick={() => {
                          setTempTitle(book.title);
                          setEditingTitle(true);
                        }}
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4 mr-4" />
                      </button>
                </div>
              )}
              <p className="mx-3 text-sm text-gray-600">
                {bookRecipes.length} recettes • {pageCount/2} pages • ≈ {estimatedPrice}€
              </p>
            </div>
          </div>
  
        </div>

        <div className="space-y-6">
          
          {/* Description du livre */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Description du livre</h2>
              <button
                onClick={() => setEditingDescription(!editingDescription)}
                className="text-gray-500 text-base hover:text-gray-700 p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  className="w-full h-32 text-sm p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Décrivez ce livre de recettes..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDescription}
                    className="bg-secondary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingDescription(false)}
                    className="bg-gray-100 text-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed">
                {bookDescription || "Aucune description pour le moment. Cliquez sur l'icône pour en ajouter une."}
              </p>
            )}
          </div>

          {/* Photo de couverture */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Photo de couverture</h2>
            </div>

{editingCover ? (
  <div className="space-y-4">
    {/* Aperçu immédiat en mode édition */}
    {imageUrlToDisplay && (
      <div className="relative mb-4 mx-auto w-48 h-64 border rounded-lg shadow-md">
        <img 
          src={imageUrlToDisplay}
          alt="Nouvelle couverture" 
          className="w-full h-full object-cover rounded-lg"
        />
        
        {coverImageVersions && (
          <div className="absolute bottom-2 left-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded">
            Uploadé !
          </div>
        )}
      </div>
    )}
    
        {/* 🆕 Upload + Unsplash - EN COLONNE SUR MOBILE */}
        <div className="flex flex-col md:flex-row justify-center py-3 gap-3">
          <label className={`flex justify-center items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
            isUploadingCover 
              ? 'bg-secondary-100 text-secondary-700 cursor-wait' 
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverImageUpload(file);
              }}
              className="hidden"
              disabled={isUploadingCover}
            />
            {isUploadingCover ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                Choisir ma photo
              </>
            )}
          </label>
        <div className="flex justify-center">
          <ImageSearch 
            onImageSelect={(url) => {
              setCoverImageUrl(url);
              setEditingCover(false);
            }}
            initialQuery={`${book.title} family cooking`}
          />
          </div>
        </div>
        
        {/* Boutons de validation */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              updateBook(book.id, { 
                coverImageUrl: coverImageUrl,
                coverImageVersions: coverImageVersions
              });
              setEditingCover(false);
              router.refresh();
            }}
            disabled={isUploadingCover || (!coverImageUrl && !imageUrlToDisplay)}
            className="bg-secondary-500 0 text-secondary-100 text-sm px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors disabled:opacity-50"
          >
            Définir comme couverture
          </button>
          <button
            onClick={() => setEditingCover(false)}
            className="text-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
      
            ) : (
              <div>
                {imageUrlToDisplay ? (
                  <div className="relative">
                    <img 
                      src={imageUrlToDisplay} 
                      alt="Couverture" 
                      className="w-full max-w-sm h-64 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        setCoverImageUrl("");
                        setCoverImageVersions(null);
                        updateBook(book.id, { coverImageUrl: "", coverImageVersions: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm text-gray-600 mb-4">Aucune photo de couverture</p>
                    <button
                      onClick={() => setEditingCover(true)}
                      className="bg-blue-600 text-sm text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ajouter une photo
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-center text-gray-500 mt-3">
              💡 <strong>Idée :</strong> Photo de famille en cuisine, portrait de grand-mère, ou image symbolique
            </p>
          </div>

          {/* Contenu du livre */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Contenu du livre</h2>
            
            {bookRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📖</div>
                <p>Livre vide - ajoutez des recettes</p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Pages fixes */}
                <div className="bg-accent-50 rounded-lg p-4 border border-accent-300">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-medium">p.1</div>
                    <div>
                      <h4 className="font-medium text-sm text-accent-900">Couverture</h4>
                      <p className="text-xs text-gray-600">Titre + Image si définie + description</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">p.2</div>
                    <div>
                      <h4 className="font-medium text-sm text-accent-900">Page de Garde</h4>
                      <p className="text-xs text-gray-600">Vide</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">p.{3}</div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Sommaire</h4>
                      <p className="text-xs text-gray-600">Liste des recettes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">p.4</div>
                    <div>
                      <h4 className="font-medium text-sm text-accent-900">Page de Garde</h4>
                      <p className="text-xs text-gray-600">Vide</p>
                    </div>
                  </div>
                </div>

              {/* Recettes avec drag & drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={bookRecipes.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {bookRecipes.map((recipe, index) => {
                    // 🆕 Calculer le numéro de page dynamiquement
                    let currentPageCalc = 5; // Page de départ
                    
                    // Ajouter les pages des recettes précédentes
                    for (let i = 0; i < index; i++) {
                      const prevRecipe = bookRecipes[i];
                      const steps = typeof prevRecipe.steps === 'string'
                        ? prevRecipe.steps.split('\n\n').filter((s: string) => s.trim())
                        : Array.isArray(prevRecipe.steps) ? prevRecipe.steps : [];
                      
                      // Estimer si débordement (plus de 10 étapes = 2 pages)
                      const pageCount = steps.length > 10 ? 2 : 1;
                      currentPageCalc += pageCount;
                    }
                    
                    // Calculer pour la recette actuelle
                    const currentSteps = typeof recipe.steps === 'string'
                      ? recipe.steps.split('\n\n').filter((s: string) => s.trim())
                      : Array.isArray(recipe.steps) ? recipe.steps : [];
                    
                    const currentPageCount = currentSteps.length > 10 ? 2 : 1;
                    const pageDisplay = currentPageCount === 1 
                      ? `${currentPageCalc}` 
                      : `${currentPageCalc}-${currentPageCalc + 1}`;
                    
                    return (
                      <SortableRecipeItem
                        key={recipe.id}
                        recipe={recipe}
                        index={index}
                        pageNumber={pageDisplay}
                        onRemove={handleRemoveRecipe}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
              </div>
            )}

          </div>

          {/* Ajouter des recettes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Ajouter des recettes</h3>
            
            {availableRecipes.length === 0 ? (
              <div className="text-center text-sm p-8 text-gray-500">
                <div className="text-3xl mb-2">🎉</div>
                <p>Toutes vos recettes sont dans ce livre !</p>
              </div>


            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="border border-secondary-200 rounded-lg p-2 sm:p-3 hover:border-secondary-300 hover:bg-secondary-50 transition-colors cursor-pointer"
                    onClick={() => handleAddRecipeToBook(book.id, recipe.id)}
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <img 
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'}
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-accent-900 truncate">{recipe.title}</h5>
                        <p className="text-xs text-gray-600">par {recipe.author || 'Famille'}</p>
                        {recipe.isFromExternalUrl && (
                          <div className="mt-1 text-xs text-red-600 font-medium">
                            ⚠️ Impression indisponible (recette externe)
                          </div>
                        )}
                      </div>
                      
                      {recipe.isFromExternalUrl ? (
                        <div className="self-center text-red-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.366zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <Plus className="w-4 h-4 text-gray-400 self-center" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

<div className="mb-4 border-gray-500">
      <div className="items-center justify-center m-4 mb-4 flex items-center">
            <button
              onClick={handleDeleteBook}
              className="inline-flex items-center text-sm text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
            >
              <Trash2 className="w-4 h-6 mr-2" />
              Supprimer
            </button>
            <button
              onClick={generatePreviewPDF}
              disabled={isGeneratingPreview}
              className="bg-secondary-600 text-white text-sm mx-3 px-4 py-2 rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isGeneratingPreview ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Aperçu du livre
                </>
              )}
            </button>
          </div>
          </div>

      {/* Modale PDF plein écran */}
        {showPDFModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-full flex flex-col shadow-2xl">
            
            {/* Header de la modale */}
            <div className="bg-gray-100 px-6 py-4 border-b flex items-start justify-between rounded-t-lg">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">Aperçu : {book.title}</h2>
          <p className="text-sm text-gray-600">{bookRecipes.length} recettes</p>
        </div>
        
        <button
          onClick={closePDFModal}
          className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors ml-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Viewer PDF */}
      <div className="flex-1 bg-gray-50 p-6 flex flex-col">
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          title="Aperçu PDF"
          className="border-0 rounded-lg flex-1"
        />

        {/* Bouton de téléchargement large en bas */}
        <div className="m-10">
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center bg-secondary-600 text-white text-sm px-6 py-4 rounded-lg hover:bg-secondary-700 transition-colors font-semibold gap-3"
          >
            Bientôt dispo : Impression du livre ! En attendant → Téléchargez le PDF
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
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
  onRemove 
}: { 
  recipe: any; 
  index: number; 
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

  // Haptique mobile
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // Vibration de 10ms
    }
  };

    return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-green-50 border border-green-200 rounded-lg p-3"
    >
      <div className="flex items-center gap-3">
        {/* Handle de drag EN PREMIER */}
        <button
          {...listeners}
          {...attributes}
          onMouseDown={triggerHaptic}
          onTouchStart={triggerHaptic}
          className="cursor-move p-1 hover:bg-green-200 rounded transition-all flex-shrink-0"
          title="Glisser pour réorganiser"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </button>

        {/* Numéro de page */}
        <div className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
          p.{4 + index}
        </div>

        {/* Contenu texte */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 whitespace-normal break-words">
            {recipe.title}
          </h4>
          <p className="text-xs text-gray-600">
            par {recipe.author || 'Famille'}
          </p>
        </div>

        {/* Bouton suppression EN DERNIER */}
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
  // Sensors pour le drag & drop
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Évite les clics accidentels
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

  // FONCTION D'UPLOAD pour les images de couverture
  const handleCoverImageUpload = async (file: File) => {
    setIsUploadingCover(true);
    
    try {
      console.log('📤 Upload image de couverture...', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
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

      const drawImageFitted = async (pdfDoc: any, page: any, url: string | undefined, x: number, y: number, boxW: number, boxH: number) => {
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

        const isPng = url?.toLowerCase().endsWith('.png');
        const img = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
        const { width, height } = img.size();

        const scale = Math.min(boxW / width, boxH / height);
        const w = width * scale;
        const h = height * scale;
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
        const imageY = titleY - 50 - imageSize;
        
        await drawImageFitted(pdfDoc, cover, imageUrlToDisplay, imageX, imageY, imageSize, imageSize);
        
       // Description en italique centrée sous l'image (si présente)
        if (book.description) {
          const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
          // Centrer la description
          const descriptionLines = wrapText(book.description, fontItalic, 14, A4.w - 120);
          let descY = titleY - 110 - imageSize;
          descriptionLines.forEach(line => {
            const lineWidth = fontItalic.widthOfTextAtSize(line, 12);
            cover.drawText(line, {
              x: (A4.w - lineWidth) / 2, // Centré
              y: descY,
              size: 14,
              font: fontItalic,
              color: colorBody
            });
            descY -= 16;
          });
        }
      }
      // 2) Pages des recettes
      for (const recipe of printableRecipes) {
        const page = pdfDoc.addPage([A4.w, A4.h]);
        
        page.drawRectangle({
          x: 0, y: 0, width: A4.w, height: A4.h,
          color: rgb(0.99, 0.98, 0.96)
        });

        let currentY = A4.h - margin;

        // Titre de la recette
        const titleLines = wrapText(recipe.title, fontTitle, 20, A4.w - 80);
        titleLines.forEach(line => {
          page.drawText(line, {
            x: margin, y: currentY,
            size: 20, font: fontTitle, color: colorTitle
          });
          currentY -= 25;
        });

        // Métadonnées
        const metaText = [
          recipe.author ? `par ${recipe.author}` : '',
          recipe.prepMinutes ? `${recipe.prepMinutes} min` : '',
          recipe.servings ? `${recipe.servings} pers.` : ''
        ].filter(Boolean).join(' • ');

        if (metaText) {
          page.drawText(metaText, {
            x: margin, y: currentY,
            size: 11, font: fontBody, color: colorBody
          });
          currentY -= 25;
        }

        // Layout en 2 colonnes
        const colWidth = (A4.w - margin * 3) / 2;
        const colGap = margin;
        const leftX = margin;
        const rightX = margin + colWidth + colGap;

        // Colonne de gauche : image + ingrédients
        let leftY = currentY;

        if (recipe.imageUrl) {
          const imageSize = 180;
          await drawImageFitted(pdfDoc, page, recipe.imageUrl, leftX, leftY - imageSize, colWidth, imageSize);
          leftY -= imageSize + 25;
        }

        page.drawText('Ingrédients', {
          x: leftX, y: leftY,
          size: 16, font: fontTitle, color: colorTitle
        });
        leftY -= 20;

        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        for (const ingredient of ingredients) {
          if (leftY < margin + 40) break;
          
          page.drawCircle({ 
            x: leftX + 4, y: leftY + 4, 
            size: 1.5, color: colorBody 
          });
          
          leftY = drawParagraph(page, ingredient, leftX + 12, leftY, fontBody, 12, colorBody, colWidth - 12, 2) - 4;
        }

        // Colonne de droite : préparation
        let rightY = currentY;

        page.drawText('Préparation', {
          x: rightX, y: rightY,
          size: 16, font: fontTitle, color: colorTitle
        });
        rightY -= 20;

        const steps = typeof recipe.steps === 'string'
          ? recipe.steps.split('\n\n').filter(s => s.trim())
          : Array.isArray(recipe.steps) ? recipe.steps : [];

        steps.forEach((step, idx) => {
          if (rightY < margin + 40) return;

          const stepNum = `${idx + 1}. `;
          const stepNumWidth = fontBody.widthOfTextAtSize(stepNum, 10);

          rightY = drawParagraph(page, step, rightX, rightY, fontBody, 12, colorBody, colWidth, 2) - 12;
        });
      }
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
  const pageCount = 6 + (bookRecipes.length * 2);
  const estimatedPrice = pageCount * 0.30 + 10;



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

  if (over && active.id !== over.id && book) {
    const oldIndex = localRecipeIds.indexOf(active.id as string);
    const newIndex = localRecipeIds.indexOf(over.id as string);

    const newOrder = arrayMove(localRecipeIds, oldIndex, newIndex);
    
    // Mise à jour immédiate du state local (UI instantanée)
    setLocalRecipeIds(newOrder);

    try {
      // Appeler l'API de réordonnement
      await reorderBookRecipes(book.id, newOrder);
      showToast('Ordre des recettes modifié !', 'success');
    } catch (error) {
      console.error('❌ Save ERROR:', error);
      // En cas d'erreur, revenir à l'ancien ordre
      setLocalRecipeIds(localRecipeIds);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  }
  
  setIsDragging(false);
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
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
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
                    className="bg-green-600 text-white px-2 md:px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
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
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                  placeholder="Décrivez ce livre de recettes..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDescription}
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Uploadé !
                      </div>
                    )}
                  </div>
                )}
                
                {/* Upload + Unsplash */}
                <div className="flex flex-wrap gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
                    isUploadingCover 
                      ? 'bg-blue-100 text-blue-700 cursor-wait' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
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
                        📷 Ma photo
                      </>
                    )}
                  </label>

                  <ImageSearch 
                    onImageSelect={(url) => {
                      setCoverImageUrl(url);
                      setEditingCover(false);
                    }}
                    initialQuery={`${book.title} family cooking`}
                  />
                  
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none text-sm"
                    placeholder="Ou collez un lien d'image..."
                  />
                </div>
                
                <div className="flex gap-2">
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
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-vert-700 transition-colors disabled:opacity-50"
                  >
                    Définir comme couverture
                  </button>
                  <button
                    onClick={() => setEditingCover(false)}
                    className="bg-gray-100 text-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">p.1</div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">Couverture</h4>
                      <p className="text-xs text-gray-600">Titre+Image si définie+ description</p>
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
                  {bookRecipes.map((recipe, index) => (
                    <SortableRecipeItem
                      key={recipe.id}
                      recipe={recipe}
                      index={index}
                      onRemove={handleRemoveRecipe}
                    />
                  ))}
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
                    className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => handleAddRecipeToBook(book.id, recipe.id)}
                  >
                    <div className="flex gap-2 sm:gap-3">
                      <img 
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'}
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 truncate">{recipe.title}</h5>
                        <p className="text-xs text-gray-600">{recipe.author || 'Famille'}</p>
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
              onClick={generatePreviewPDF}
              disabled={isGeneratingPreview}
              className="bg-green-600 text-white text-sm mx-3 px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isGeneratingPreview ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Aperçu
                </>
              )}
            </button>

            <button
              onClick={handleDeleteBook}
              className="inline-flex items-center text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
            >
              <Trash2 className="w-4 h-6 mx-2" />
              Supprimer
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
            className="flex items-center justify-center bg-green-600 text-white text-sm px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold gap-3"
          >
            <Download className="w-4 h-4" />
            🚀 Soon : Impression du livre ! En attendant → Téléchargez le PDF
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  Eye, 
  Download, 
  X, 
  Loader,
  GripVertical 
} from 'lucide-react';
import { useRecipes } from '@/contexts/RecipesProvider';
import { ImageSearch } from '@/components/ImageSearch';

export default function BookPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  
  // Utilisez le context RecipesProvider
  const { 
    books, 
    recipes, 
    updateBook,
    addRecipeToBook,
    removeRecipeFromBook 
  } = useRecipes();
  
  // États locaux
  const [bookDescription, setBookDescription] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  
  // 🆕 NOUVEAUX ÉTATS pour la photo de couverture
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [editingCover, setEditingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // États pour la modale PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Trouvez les données directement depuis le context
  const book = books.find(b => b.id === id);
  const bookRecipes = book ? recipes.filter(r => book.recipeIds.includes(r.id)) : [];
  const availableRecipes = recipes.filter(recipe => 
    !book?.recipeIds?.includes(recipe.id)
  );

  // 🆕 AJOUTE les nouveaux états
  const [bookTitle, setBookTitle] = useState(book?.title || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  // 🆕 États pour titre éditable
  const [bookTitle, setBookTitle] = useState(book?.title || '');
  const [editingTitle, setEditingTitle] = useState(false);
  );
  // Initialiser les états
  useEffect(() => {
    if (book) {
      setBookDescription(book.description || '');
      setCoverImageUrl(book.coverImageUrl || '');
      setBookTitle(book.title || '');
    }
  }, [book]);

  // 🆕 FONCTION save titre
const saveTitle = () => {
  if (book && bookTitle.trim()) {
    updateBook(book.id, { title: bookTitle.trim() });
    setEditingTitle(false);
    }
  };

  // 🆕 FONCTION upload photo couverture
  const handleCoverImageUpload = async (file: File) => {
    setIsUploadingCover(true);
    
    try {
      const tempUrl = URL.createObjectURL(file);
      setCoverImageUrl(tempUrl);
      // Sauvegarder immédiatement
      if (book) {
        updateBook(book.id, { coverImageUrl: tempUrl });
      }
    } catch (error) {
      alert("Erreur lors de l'upload de l'image");
      console.error(error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Actions simplifiées (pas d'async)
  const handleAddRecipeToBook = (bookId: string, recipeId: string) => {
    addRecipeToBook(bookId, recipeId);
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

  // Génération PDF aperçu avec import dynamique et débogage complet
  const generatePreviewPDF = async () => {
    if (!book) return;

    setIsGeneratingPreview(true);
    try {
      const pdfLib = await import('pdf-lib');
      const { PDFDocument, rgb, StandardFonts } = pdfLib;

      // --- Helpers locaux ---
      const A4 = { w: 595.28, h: 841.89 }; // points
      const margin = 36; // 0.5 inch

      const mm = (x: number) => x * 2.83465;

      const wrapText = (
        text: string,
        font: any,
        size: number,
        maxWidth: number
      ): string[] => {
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

      const drawParagraph = (
        page: any,
        text: string,
        x: number,
        y: number,
        font: any,
        size: number,
        color: any,
        maxWidth: number,
        lineGap = 4
      ) => {
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

      const drawImageFitted = async (
        pdfDoc: any,
        page: any,
        url: string | undefined,
        x: number,
        y: number,
        boxW: number,
        boxH: number
      ) => {
        const bytes = await fetchImageBytes(url);
        if (!bytes) {
          // placeholder si pas d'image
          page.drawRectangle({
            x, y,
            width: boxW,
            height: boxH,
            color: rgb(0.95, 0.94, 0.92),
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 1
          });
          page.drawText('Image indisponible', {
            x: x + 12,
            y: y + boxH / 2 - 6,
            size: 12,
            color: rgb(0.4, 0.35, 0.3)
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

      // --- Création du doc + polices ---
      const pdfDoc = await PDFDocument.create();
      const fontTitle = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const fontBody = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const colorTitle = rgb(0.2, 0.1, 0.05);
      const colorBody = rgb(0.25, 0.2, 0.17);

      // --- 1) Couverture améliorée ---
      const cover = pdfDoc.addPage([A4.w, A4.h]);

      // 📝 ZONE TITRE (1/3 supérieur) - Élégante
      const titleZoneHeight = A4.h / 3;

      // Fond titre élégant
      cover.drawRectangle({
        x: 0, y: A4.h - titleZoneHeight,
        width: A4.w, height: titleZoneHeight,
        color: rgb(0.95, 0.94, 0.90) // Beige doux
      });

      // Ligne séparatrice subtile
      cover.drawRectangle({
        x: 0, y: A4.h - titleZoneHeight,
        width: A4.w, height: 2,
        color: rgb(0.85, 0.82, 0.76) // Ligne dorée
      });

      // TITRE PRINCIPAL - Centré et lisible
      const titleLines = wrapText(book.title, fontTitle, 32, A4.w - 80);
      let titleY = A4.h - 60;

      titleLines.forEach(line => {
        const textWidth = fontTitle.widthOfTextAtSize(line, 32);
        cover.drawText(line, {
          x: (A4.w - textWidth) / 2, // Centré
          y: titleY,
          size: 32,
          font: fontTitle,
          color: rgb(0.15, 0.10, 0.05) // Brun élégant
        });
        titleY -= 40;
      });

      // SOUS-TITRE stylé
      cover.drawText('Carnet de recettes familiales', {
        x: 40, y: A4.h - titleZoneHeight + 80,
        size: 16, font: fontBody,
        color: rgb(0.4, 0.35, 0.30)
      });

      // NOMBRE DE RECETTES
      cover.drawText(`${bookRecipes.length} recettes de famille`, {
        x: 40, y: A4.h - titleZoneHeight + 50,
        size: 14, font: fontBody,
        color: rgb(0.5, 0.45, 0.40)
      });

      // 📸 ZONE PHOTO (2/3 inférieur) - PLEINE LARGEUR
      const photoHeight = (A4.h * 2) / 3;
      await drawImageFitted(
        pdfDoc, cover, 
        book.coverImageUrl || bookRecipes[0]?.imageUrl, // 🆕 Photo dédiée ou fallback
        0, 0,  // Pas de marge = pleine largeur
        A4.w, photoHeight       // Toute la largeur
      );

      // --- 2) Sommaire ---
      const toc = pdfDoc.addPage([A4.w, A4.h]);
      toc.drawText('Sommaire', {
        x: margin,
        y: A4.h - margin - 20,
        size: 22,
        font: fontTitle,
        color: colorTitle
      });
      let yToc = A4.h - margin - 60;
      bookRecipes.forEach((r, i) => {
        const line = `${(i + 1).toString().padStart(2, '0')}  ${r.title}`;
        toc.drawText(line, {
          x: margin,
          y: yToc,
          size: 12,
          font: fontBody,
          color: colorBody
        });
        yToc -= 18;
        if (yToc < margin + 40) {
          yToc = A4.h - margin - 20;
        }
      });

      // --- 3) Pages par recette : 2 pages (photo + contenu) ---
      for (const recipe of bookRecipes) {
        // 3.1) Page Photo
        const pPhoto = pdfDoc.addPage([A4.w, A4.h]);
        pPhoto.drawRectangle({
          x: 0, y: 0, width: A4.w, height: A4.h, color: rgb(0.996, 0.988, 0.972)
        });
        await drawImageFitted(
          pdfDoc,
          pPhoto,
          recipe.imageUrl,
          margin,
          margin + mm(20),
          A4.w - margin * 2,
          A4.h - margin * 2 - mm(40)
        );
        // bandeau titre bas
        pPhoto.drawRectangle({
          x: 0, y: margin, width: A4.w, height: mm(18),
          color: rgb(0.18, 0.10, 0.06)
        });
        pPhoto.drawText(recipe.title, {
          x: margin,
          y: margin + 6,
          size: 14,
          font: fontTitle,
          color: rgb(1, 1, 1)
        });
        if (recipe.author) {
          pPhoto.drawText(`par ${recipe.author}`, {
            x: margin + 240,
            y: margin + 6,
            size: 12,
            font: fontBody,
            color: rgb(1, 1, 1)
          });
        }

        // 3.2) Page Contenu
        const pCont = pdfDoc.addPage([A4.w, A4.h]);
        pCont.drawRectangle({
          x: 0, y: 0, width: A4.w, height: A4.h, color: rgb(0.996, 0.988, 0.972)
        });

        // Header
        pCont.drawText(recipe.title, {
          x: margin,
          y: A4.h - margin - 24,
          size: 18,
          font: fontTitle,
          color: colorTitle
        });
        const meta = `${recipe.prepMinutes || 30} min • ${recipe.servings || '4'} pers.`;
        pCont.drawText(meta, {
          x: margin,
          y: A4.h - margin - 42,
          size: 12,
          font: fontBody,
          color: colorBody
        });

        // Colonnes
        const colGap = 18;
        const colW = (A4.w - margin * 2 - colGap) / 2;
        let yLeft = A4.h - margin - 70;
        let yRight = A4.h - margin - 70;

        // Ingrédients (gauche)
        pCont.drawText('Ingrédients', {
          x: margin,
          y: yLeft,
          size: 14,
          font: fontTitle,
          color: colorTitle
        });
        yLeft -= 18;

        const ingredients: string[] = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        for (const ing of ingredients) {
          // puce
          pCont.drawCircle({ x: margin + 3, y: yLeft + 4, size: 1.5, color: colorBody });
          yLeft = drawParagraph(pCont, ing, margin + 10, yLeft, fontBody, 11, colorBody, colW - 12, 3) - 6;
          if (yLeft < margin + 40) break;
        }

        // Préparation (droite)
        pCont.drawText('Préparation', {
          x: margin + colW + colGap,
          y: yRight,
          size: 14,
          font: fontTitle,
          color: colorTitle
        });
        yRight -= 18;

        const steps: string[] =
          typeof recipe.steps === 'string'
            ? recipe.steps.split('\n\n').filter(s => s.trim())
            : Array.isArray(recipe.steps)
            ? recipe.steps
            : [];

        steps.forEach((step, idx) => {
          const prefix = `${idx + 1}. `;
          const prefixWidth = fontBody.widthOfTextAtSize(prefix, 11);
          // numéro
          pCont.drawText(prefix, {
            x: margin + colW + colGap,
            y: yRight,
            size: 11,
            font: fontBody,
            color: colorBody
          });
          // texte wrap
          yRight = drawParagraph(
            pCont,
            step,
            margin + colW + colGap + prefixWidth,
            yRight,
            fontBody,
            11,
            colorBody,
            colW - prefixWidth - 6,
            3
          ) - 4;
          if (yRight < margin + 40) return;
        });
      }

      // --- Export ---
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPDFModal(true);
    } catch (error) {
      console.error('PDF error', error);
      alert('Erreur lors de la génération du PDF');
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
  const estimatedPrice = pageCount * 0.15 + 3;

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
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-6xl mx-auto pt-8 px-8">
        
        {/* En-tête avec titre éditable */}
<div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between mb-8">
  <div className="flex items-center gap-4">
    <button
      onClick={() => router.back()}
      className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Retour
    </button>
    
    <div className="flex-1">
      {editingTitle ? (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className="text-xl font-semibold text-gray-800 border border-gray-300 rounded px-3 py-1 focus:border-orange-500 focus:outline-none"
            placeholder="Titre du livre"
            autoFocus
          />
          <button
            onClick={saveTitle}
            disabled={!bookTitle.trim()}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            ✓
          </button>
          <button
            onClick={() => {
              setBookTitle(book.title);
              setEditingTitle(false);
            }}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-800">{book.title}</h1>
          <button
            onClick={() => setEditingTitle(true)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}
      <p className="text-sm text-gray-600">
        {bookRecipes.length} recettes • {pageCount} pages • ≈ {estimatedPrice.toFixed(2)}€
      </p>
    </div>
  </div>
  
  <div className="flex items-center gap-3">
    {/* Bouton aperçu PDF */}
    <button
      onClick={generatePreviewPDF}
      disabled={isGeneratingPreview}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
    >
      {isGeneratingPreview ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          Aperçu PDF
        </>
      )}
    </button>
  </div>
</div>

        <div className="space-y-6">
          
          {/* Description du livre */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">📝 Description du livre</h2>
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingDescription(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {bookDescription || "Aucune description pour le moment. Cliquez sur l'icône pour en ajouter une."}
              </p>
            )}
          </div>

          {/* 🆕 Photo de couverture */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">📸 Photo de couverture</h2>
              <button
                onClick={() => setEditingCover(!editingCover)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            {editingCover ? (
              <div className="space-y-4">
                {/* Upload + Unsplash */}
                <div className="flex flex-wrap gap-3">
                  {/* Upload photo personnelle */}
                  <label className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCoverImageUpload(file);
                      }}
                      className="hidden"
                      disabled={isUploadingCover}
                    />
                    📷 {isUploadingCover ? "Upload..." : "Ma photo"}
                  </label>

                  {/* Recherche Unsplash */}
                  <ImageSearch 
                    onImageSelect={(url) => {
                      setCoverImageUrl(url);
                      updateBook(book.id, { coverImageUrl: url });
                    }}
                    initialQuery={`${book.title} family cooking`}
                  />
                  
                  {/* URL manuelle */}
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
                      updateBook(book.id, { coverImageUrl });
                      setEditingCover(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingCover(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {coverImageUrl ? (
                  <div className="relative">
                    <img 
                      src={coverImageUrl} 
                      alt="Couverture" 
                      className="w-full max-w-sm h-64 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        setCoverImageUrl("");
                        updateBook(book.id, { coverImageUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 mb-4">Aucune photo de couverture</p>
                    <button
                      onClick={() => setEditingCover(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ajouter une photo
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-3">
              💡 <strong>Idée :</strong> Photo de famille en cuisine, portrait de grand-mère, ou image symbolique
            </p>
          </div>

          {/* Contenu du livre */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">📖 Contenu du livre</h2>
            
            {bookRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📖</div>
                <p>Livre vide - ajoutez des recettes</p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Pages fixes */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Couverture</h4>
                      <p className="text-sm text-gray-600">{book.title}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="text-sm text-gray-600">À propos de ce livre</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4-5</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Sommaire</h4>
                      <p className="text-sm text-gray-600">Liste des recettes</p>
                    </div>
                  </div>
                </div>

                {/* Recettes */}
                {bookRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 group">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {6 + (index * 2)}-{7 + (index * 2)}
                        </span>
                        <button className="opacity-50 group-hover:opacity-100 cursor-move p-1 hover:bg-purple-200 rounded transition-all">
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <img 
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'} 
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">par {recipe.author || 'Famille'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Double page • ⏱️ {recipe.prepMinutes || 30}min
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveRecipeFromBook(book.id, recipe.id)}
                        className="opacity-50 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter des recettes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">➕ Ajouter des recettes</h3>
            
            {availableRecipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🎉</div>
                <p>Toutes vos recettes sont dans ce livre !</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => handleAddRecipeToBook(book.id, recipe.id)}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=100'}
                        alt={recipe.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 truncate">{recipe.title}</h5>
                        <p className="text-xs text-gray-600">{recipe.author || 'Famille'}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400 self-center" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modale PDF plein écran */}
      {showPDFModal && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-full flex flex-col shadow-2xl">
            
            {/* Header de la modale */}
            <div className="bg-gray-100 px-6 py-4 border-b flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Aperçu : {book.title}</h2>
                <p className="text-sm text-gray-600">{bookRecipes.length} recettes</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                
                <button
                  onClick={closePDFModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Fermer
                </button>
              </div>
            </div>

            {/* Viewer PDF */}
            <div className="flex-1 bg-gray-50">
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                title="Aperçu PDF"
                className="border-0 rounded-b-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

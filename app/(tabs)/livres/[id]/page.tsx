'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PDFDocument, rgb } from 'pdf-lib';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  Upload, 
  Eye, 
  Download, 
  X, 
  Loader,
  GripVertical 
} from 'lucide-react';
import { useRecipes } from '@/contexts/RecipesProvider';

export default function BookPage() {
  const router = useRouter();
  const { id } = useParams();
  
  // ✅ Utilisez le context RecipesProvider
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
  
  // États pour la modale PDF
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // ✅ Trouvez les données directement depuis le context
  const book = books.find(b => b.id === id);
  const bookRecipes = book ? recipes.filter(r => book.recipeIds.includes(r.id)) : [];
  const availableRecipes = recipes.filter(recipe => 
    !book?.recipeIds.includes(recipe.id)
  );

  // Initialiser la description
  useEffect(() => {
    if (book) {
      setBookDescription(book.description || '');
    }
  }, [book]);

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

  // Génération PDF aperçu
  const generatePreviewPDF = async () => {
    if (!book) return;
    
    setIsGeneratingPreview(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      // Page 1 : Couverture
      const coverPage = pdfDoc.addPage([595, 842]); // A4
      
      // Titre principal
      coverPage.drawText(book.title, {
        x: 50,
        y: 750,
        size: 32,
        color: rgb(0.2, 0.1, 0.05)
      });
      
      // Sous-titre
      coverPage.drawText('Livre de recettes familiales', {
        x: 50,
        y: 700,
        size: 16,
        color: rgb(0.4, 0.3, 0.2)
      });
      
      // Nombre de recettes
      coverPage.drawText(`${bookRecipes.length} recettes délicieuses`, {
        x: 50,
        y: 650,
        size: 14,
        color: rgb(0.5, 0.4, 0.3)
      });

      // Description si elle existe
      if (bookDescription) {
        const lines = bookDescription.match(/.{1,70}/g) || [];
        let yPos = 600;
        lines.slice(0, 8).forEach((line) => {
          coverPage.drawText(line, {
            x: 50,
            y: yPos,
            size: 11,
            color: rgb(0.5, 0.4, 0.3)
          });
          yPos -= 20;
        });
      }

      // Page 2 : Sommaire
      const summaryPage = pdfDoc.addPage();
      summaryPage.drawText('Sommaire', {
        x: 50,
        y: 750,
        size: 24,
        color: rgb(0.2, 0.1, 0.05)
      });

      let yPosition = 700;
      bookRecipes.forEach((recipe, index) => {
        if (yPosition < 100) {
          yPosition = 750;
        }
        
        summaryPage.drawText(`${index + 1}. ${recipe.title}`, {
          x: 70,
          y: yPosition,
          size: 14,
          color: rgb(0.3, 0.2, 0.1)
        });
        
        summaryPage.drawText(`${recipe.prepMinutes || 30} min`, {
          x: 450,
          y: yPosition,
          size: 10,
          color: rgb(0.6, 0.5, 0.4)
        });
        
        yPosition -= 30;
      });

      // Pages recettes
      bookRecipes.forEach((recipe) => {
        const recipePage = pdfDoc.addPage();
        
        // Titre de la recette
        recipePage.drawText(recipe.title, {
          x: 50,
          y: 750,
          size: 22,
          color: rgb(0.2, 0.1, 0.05)
        });
        
        // Informations générales
        recipePage.drawText(`⏱️ Temps: ${recipe.prepMinutes || 30} min  |  👥 ${recipe.servings || 4} personnes`, {
          x: 50,
          y: 710,
          size: 12,
          color: rgb(0.4, 0.3, 0.2)
        });

        // Ingrédients
        recipePage.drawText('🥘 Ingrédients :', {
          x: 50,
          y: 670,
          size: 16,
          color: rgb(0.3, 0.2, 0.1)
        });

        let yPos = 640;
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          recipe.ingredients.forEach((ingredient) => {
            recipePage.drawText(`• ${ingredient}`, {
              x: 70,
              y: yPos,
              size: 11,
              color: rgb(0.4, 0.3, 0.2)
            });
            yPos -= 20;
          });
        } else {
          recipePage.drawText('• Ingrédients à ajouter...', {
            x: 70,
            y: yPos,
            size: 11,
            color: rgb(0.6, 0.5, 0.4)
          });
          yPos -= 20;
        }

        // Instructions (adaptées à votre structure de steps en string)
        recipePage.drawText('👨‍🍳 Instructions :', {
          x: 50,
          y: yPos - 20,
          size: 16,
          color: rgb(0.3, 0.2, 0.1)
        });

        yPos -= 50;
        if (recipe.steps) {
          // Découper les étapes par double saut de ligne ou numérotation
          const steps = recipe.steps.split('\n\n').filter(step => step.trim());
          
          steps.forEach((step, index) => {
            const maxLength = 65;
            const lines = step.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [step];
            
            lines.forEach((line, lineIndex) => {
              const prefix = lineIndex === 0 ? `${index + 1}. ` : '   ';
              recipePage.drawText(`${prefix}${line}`, {
                x: 70,
                y: yPos,
                size: 11,
                color: rgb(0.4, 0.3, 0.2)
              });
              yPos -= 18;
            });
            yPos -= 10;
          });
        } else {
          recipePage.drawText('1. Instructions à ajouter...', {
            x: 70,
            y: yPos,
            size: 11,
            color: rgb(0.6, 0.5, 0.4)
          });
        }
      });

      // Générer le PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPDFModal(true);

    } catch (error) {
      console.error('Erreur génération PDF:', error);
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
        
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{book.title}</h1>
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

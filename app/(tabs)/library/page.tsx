"use client";

import React, { useState } from 'react';
import { Plus, BookOpen, Eye, Upload, ArrowLeft, Move, Trash2, X } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';

export default function LibraryPage() {
  const { books, createBook, recipes, addRecipeToBook, removeRecipeFromBook } = useRecipes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedRecipeForBook, setSelectedRecipeForBook] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleCreateBook = () => {
    if (!formData.title.trim()) return;

    createBook(formData.title.trim(), formData.description.trim());
    setFormData({ title: '', description: '' });
    setShowCreateModal(false);
  };

  const handleAddToBook = (recipeId) => {
    if (books.length === 0) {
      alert("Créez d'abord un livre pour ajouter cette recette !");
      setShowCreateModal(true);
      return;
    }
    
    if (books.length === 1) {
      const book = books[0];
      if (book.recipeIds.includes(recipeId)) {
        alert("Cette recette est déjà dans votre livre !");
        return;
      }
      addRecipeToBook(book.id, recipeId);
      alert("Recette ajoutée au livre !");
    } else {
      setSelectedRecipeForBook(recipeId);
      setShowBookModal(true);
    }
  };

  const CreateBookModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau livre</h2>
              <p className="text-gray-600 mt-1">Donnez vie à votre patrimoine culinaire familial</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre du livre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                placeholder="Ex: Les Recettes de Grand-mère, Carnet de Famille Martin..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Histoire culinaire familiale
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none resize-none"
                placeholder="Racontez l'histoire de ces recettes... D'où viennent-elles ? Qui les a créées ? Quels souvenirs évoquent-elles ? Cette introduction apparaîtra au début de votre livre."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Cette description créera une belle page d'introduction à votre livre
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-orange-500 text-xl">📚</div>
                <div>
                  <h4 className="font-medium text-orange-800 mb-1">Après création</h4>
                  <p className="text-sm text-orange-700">
                    Vous pourrez ajouter vos recettes une par une, réorganiser l'ordre, 
                    et prévisualiser votre livre avant impression.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateBook}
                disabled={!formData.title.trim()}
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                ✨ Créer le livre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BookSelectionModal = () => {
    const recipe = recipes.find(r => r.id === selectedRecipeForBook);
    const availableBooks = books.filter(book => !book.recipeIds.includes(selectedRecipeForBook));
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Ajouter à un livre
              </h3>
              <button 
                onClick={() => setShowBookModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={recipe?.imageUrl} 
                  alt={recipe?.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{recipe?.title}</h4>
                  <p className="text-sm text-gray-600">par {recipe?.author}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    addRecipeToBook(book.id, selectedRecipeForBook);
                    setShowBookModal(false);
                    setSelectedRecipeForBook(null);
                  }}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  <h4 className="font-medium text-gray-900">{book.title}</h4>
                  <p className="text-sm text-gray-600">{book.recipeIds.length} recettes</p>
                </button>
              ))}
            </div>

            {availableBooks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">Cette recette est déjà dans tous vos livres !</p>
                <button
                  onClick={() => {
                    setShowBookModal(false);
                    setShowCreateModal(true);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Créer un nouveau livre
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BooksLibrary = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Mes Livres de Cuisine</h1>
          <p className="text-gray-600 mt-1">
            Créez de beaux livres à partir de vos recettes familiales
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau livre
        </button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Aucun livre pour l'instant
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier livre de recettes familiales
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Créer mon premier livre
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-6xl">
                📚
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {book.description || "Aucune description"}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{book.recipeIds.length} recettes</span>
                  <span>{(book.recipeIds.length * 2) + 2} pages</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentBook(book)}
                    className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm"
                  >
                    Éditer
                  </button>
                  <Link
                    href={`/library/preview/${book.id}`}
                    className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const BookEditor = () => {
    const bookRecipes = recipes.filter(recipe => currentBook.recipeIds.includes(recipe.id));
    const availableRecipes = recipes.filter(recipe => !currentBook.recipeIds.includes(recipe.id));

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentBook(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour aux livres
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentBook.title}</h1>
              <p className="text-gray-600">{currentBook.recipeIds.length} recettes • {(currentBook.recipeIds.length * 2) + 2} pages</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/library/preview/${currentBook.id}`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </Link>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
              <Upload className="w-4 h-4 mr-2 inline" />
              Imprimer
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📝 Recettes disponibles
            </h2>
            
            {availableRecipes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-600">Toutes vos recettes sont dans ce livre !</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">par {recipe.author}</p>
                        <p className="text-xs text-gray-500 mt-1">⏱️ {recipe.prepMinutes}min</p>
                      </div>
                      <button
                        onClick={() => addRecipeToBook(currentBook.id, recipe.id)}
                        className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium self-start"
                      >
                        <Plus className="w-4 h-4 mr-1 inline" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📚 Dans le livre
            </h2>
            
            {bookRecipes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">📖</div>
                <h4 className="font-medium text-gray-800 mb-2">Livre vide</h4>
                <p className="text-gray-600">Ajoutez vos premières recettes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookRecipes.map((recipe, index) => (
                  <div key={recipe.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <Move className="w-4 h-4 text-gray-400 cursor-move" />
                      </div>
                      
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">par {recipe.author}</p>
                        <p className="text-xs text-gray-500 mt-1">⏱️ {recipe.prepMinutes}min • 2 pages</p>
                      </div>
                      
                      <button
                        onClick={() => removeRecipeFromBook(currentBook.id, recipe.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors self-start p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-blue-600 text-sm">
                    <strong>Estimation :</strong> {(currentBook.recipeIds.length * 2) + 2} pages • Prix impression ~{((currentBook.recipeIds.length * 2) + 2) * 0.25}€
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-8">
      {currentBook ? <BookEditor /> : <BooksLibrary />}
      
      {showCreateModal && <CreateBookModal />}
      {showBookModal && <BookSelectionModal />}

      {/* Fonction globale pour les autres pages */}
      <div style={{ display: 'none' }}>
        <div id="addToBookFunction" onClick={() => handleAddToBook} />
      </div>
    </section>
  );
}

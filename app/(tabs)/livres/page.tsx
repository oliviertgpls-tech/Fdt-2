"use client";

import React, { useState } from 'react';
import { Plus, BookOpen, Eye, Upload, Move, Trash2, X, Filter, Search } from 'lucide-react';
import { useRecipes } from "@/contexts/RecipesProvider";
import Link from 'next/link';

export default function LivresPage() {
  const { books: carnets, recipes } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarnet, setSelectedCarnet] = useState<string>('all');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookTitle, setBookTitle] = useState('');

  // Livres simulés (en attendant la vraie structure)
  const [books, setBooks] = useState([
    {
      id: 'l1',
      title: 'Le Grand Livre de Famille',
      description: 'Toutes nos recettes préférées dans un beau livre',
      recipeIds: ['r1', 'r2'],
      createdAt: Date.now(),
      status: 'draft'
    }
  ]);

  // Filtrer les recettes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarnet = selectedCarnet === 'all' || 
                         carnets.find(c => c.id === selectedCarnet)?.recipeIds.includes(recipe.id);
    return matchesSearch && matchesCarnet;
  });

  const toggleRecipeSelection = (recipeId: string) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const selectAllFromCarnet = (carnetId: string) => {
    const carnet = carnets.find(c => c.id === carnetId);
    if (carnet) {
      setSelectedRecipes(prev => [...new Set([...prev, ...carnet.recipeIds])]);
    }
  };

  const CreateBookModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Créer un nouveau livre</h2>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du livre
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Mon livre de recettes"
              />
            </div>

            {selectedRecipes.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>{selectedRecipes.length} recettes sélectionnées</strong>
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Vous pourrez les réorganiser après création
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (bookTitle.trim()) {
                    const newBook = {
                      id: `l-${Date.now()}`,
                      title: bookTitle.trim(),
                      recipeIds: [...selectedRecipes],
                      createdAt: Date.now(),
                      status: 'draft'
                    };
                    setBooks(prev => [newBook, ...prev]);
                    setBookTitle('');
                    setSelectedRecipes([]);
                    setShowCreateModal(false);
                  }
                }}
                disabled={!bookTitle.trim()}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                Créer le livre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📖 Mes Livres</h1>
          <p className="text-gray-600 mt-1">
            Créez de beaux livres à imprimer avec vos recettes sélectionnées
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

      {/* Livres existants */}
      {books.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Mes livres en cours</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-6xl">
                  📖
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {book.recipeIds.length} recettes • {(book.recipeIds.length * 2) + 2} pages
                  </p>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/livres/${book.id}`}
                      className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium text-sm text-center"
                    >
                      Éditer
                    </Link>
                    <button className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sélection de recettes pour nouveau livre */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Sélectionner des recettes pour un nouveau livre
          </h2>
          {selectedRecipes.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedRecipes.length} sélectionnées
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Créer le livre
              </button>
            </div>
          )}
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Rechercher une recette..."
            />
          </div>
          
          <select
            value={selectedCarnet}
            onChange={(e) => setSelectedCarnet(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">Toutes les recettes</option>
            {carnets.map((carnet) => (
              <option key={carnet.id} value={carnet.id}>
                {carnet.title} ({carnet.recipeIds.length})
              </option>
            ))}
          </select>

          {selectedCarnet !== 'all' && (
            <button
              onClick={() => selectAllFromCarnet(selectedCarnet)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              Tout sélectionner
            </button>
          )}
        </div>

        {/* Liste des recettes */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600">Aucune recette trouvée</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedRecipes.includes(recipe.id)
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => toggleRecipeSelection(recipe.id)}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    {selectedRecipes.includes(recipe.id) && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{recipe.title}</h4>
                    <p className="text-sm text-gray-600">par {recipe.author}</p>
                    <p className="text-xs text-gray-500 mt-1">⏱️ {recipe.prepMinutes}min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && <CreateBookModal />}
    </div>
  );
}

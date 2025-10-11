"use client";

import { useState } from 'react';
import { Image as ImageIcon, X, Loader } from 'lucide-react';

type UnsplashImage = {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
};

type ImageSearchProps = {
  onImageSelect: (imageUrl: string) => void;
  initialQuery?: string;
};

export function ImageSearch({ onImageSelect, initialQuery = "" }: ImageSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche d\'images');
      }
      
      const data = await response.json();
      setImages(data.results || []);
      
      if (data.results?.length === 0) {
        setError("Aucune image trouvée. Essayez d'autres mots-clés.");
      }
    } catch (err) {
      setError("Erreur lors de la recherche. Vérifiez votre connexion.");
      console.error('Erreur Unsplash:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  const handleImageSelect = (image: UnsplashImage) => {
    onImageSelect(image.urls.regular);
    setIsOpen(false);
    setQuery("");
    setImages([]);
  };

  const suggestFromTitle = () => {
    if (initialQuery) {
      setQuery(initialQuery);
      searchImages(initialQuery);
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir la recherche */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          if (initialQuery && !query) {
            suggestFromTitle();
          }
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ImageIcon className="w-4 h-4" />
        Image libre de droits
      </button>

      {/* Modal de recherche */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    🖼️ Choisir une image
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Photos libres de droits via Unsplash
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 🆕 BARRE DE RECHERCHE CLEAN - SANS ICÔNE */}
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: pizza, gâteau au chocolat, salade..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Chercher"}
                </button>
              </form>
              
              {initialQuery && (
                <button
                  type="button"
                  onClick={suggestFromTitle}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  💡 Suggérer des images pour "{initialQuery}"
                </button>
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">😕</div>
                  <p className="text-gray-600">{error}</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Recherche en cours...</p>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleImageSelect(image)}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition-all"
                    >
                      <img
                        src={image.urls.small}
                        alt={image.alt_description || "Photo de recette"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                          <ImageIcon className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                        <p className="text-white text-xs">
                          📸 {image.user.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && images.length === 0 && query && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600">
                    Tapez un mot-clé et cliquez sur "Chercher" pour voir des images
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Images fournies par{" "}
                <a 
                  href="https://unsplash.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Unsplash
                </a>
                {" "}• Libres de droits pour usage commercial
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

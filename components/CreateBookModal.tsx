'use client';

import { useState } from 'react';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  selectedCount: number;
}

export function CreateBookModal({ isOpen, onClose, onSubmit, selectedCount }: CreateBookModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle(''); // Reset après soumission
    }
  };

  const handleClose = () => {
    setTitle(''); // Reset à la fermeture
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl mx-4">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">Créer un nouveau livre</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1">
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du livre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Mon livre de recettes familiales"
                autoFocus
              />
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                <strong>{selectedCount}</strong> recettes sélectionnées
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Créer le livre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
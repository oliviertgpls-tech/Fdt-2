"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, PenTool, Edit3, ArrowLeft, Sparkles, Upload, FileText } from "lucide-react";

export default function AddRecipePage() {
  const router = useRouter();
  
  const [mode, setMode] = useState<'choose' | 'manual' | 'photo' | 'scan'>('choose');
  const [isProcessing, setIsProcessing] = useState(false);

  // États pour saisie manuelle
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // État pour IA
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Upload d'image personnelle
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
    } catch (error) {
      alert("Erreur lors de l'upload de l'image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveManual = async () => {
    if (!title.trim()) {
      alert("Le titre est obligatoire !");
      return;
    }

    setIsSaving(true);

    try {
      const recipeData = {
        title: title.trim(),
        author: author.trim() || undefined,
        prepMinutes: prepMinutes ? parseInt(prepMinutes) : undefined,
        servings: servings.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        ingredients: ingredients
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== ""),
        steps: steps.trim(),
        updatedAt: Date.now()
      };

      // Appel API direct (sans useRecipes pour l'instant)
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      router.push("/recipes");
    } catch (error) {
      alert("Erreur lors de la sauvegarde !");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Simulation IA pour l'instant (remplacera openAIService plus tard)
  const handlePhotoUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Simulation de l'analyse IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Résultats simulés
      setTitle("Recette analysée par IA");
      setAuthor("IA Assistant");
      setPrepMinutes("30");
      setServings("4 personnes");
      setIngredients("Ingrédients détectés par IA\nIngrédient 2\nIngrédient 3");
      setSteps("Étape 1 : Préparer les ingrédients\n\nÉtape 2 : Mélanger\n\nÉtape 3 : Cuire");
      setAiConfidence(85);
      
      // Image uploadée
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      
      setMode('manual'); // Passer en mode édition
      
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      alert('Simulation IA - En cours de développement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Simulation OCR
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setTitle("Recette numérisée");
      setAuthor("Recette familiale");
      setPrepMinutes("45");
      setServings("6 personnes");
      setIngredients("Texte OCR : Ingrédient 1\nIngrédient 2 lu par OCR\nIngrédient 3");
      setSteps("Étape OCR 1\n\nÉtape OCR 2\n\nÉtape OCR 3");
      setAiConfidence(78);
      
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      
      setMode('manual');
      
    } catch (error) {
      console.error('Erreur OCR:', error);
      alert('Simulation OCR - En cours de développement');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🤖 IA en cours d'analyse...
          </h2>
          <p className="text-gray-600 mb-8">
            Notre IA analyse votre {mode === 'photo' ? 'photo' : 'recette manuscrite'} et extrait automatiquement les informations
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Simulation IA - Cela prend 3 secondes...
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            ✨ Nouvelle recette
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez comment vous souhaitez ajouter votre recette
          </p>
        </div>

        {/* 3 modes de création */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Mode 1 : Saisie manuelle */}
          <div 
            onClick={() => setMode('manual')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                <Edit3 className="w-10 h-10 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Saisie manuelle
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Tapez votre recette directement. Parfait pour créer une nouvelle recette ou retranscrire fidèlement.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-100 transition-colors">
                  🆓 Gratuit
                </div>
              </div>
            </div>
          </div>

          {/* Mode 2 : Photo d'un plat */}
          <div 
            onClick={() => setMode('photo')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-orange-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
                <Camera className="w-10 h-10 text-orange-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Photo d'un plat
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Prenez en photo votre plat terminé. Notre IA devine la recette et génère automatiquement les instructions.
                </p>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-orange-100 transition-colors">
                  🤖 IA Simulation
                </div>
                <p className="text-xs text-gray-500">
                  Version de démonstration
                </p>
              </div>
            </div>
          </div>

          {/* Mode 3 : Scan recette manuscrite */}
          <div 
            onClick={() => setMode('scan')}
            className="group bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-green-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-200 transition-colors">
                <PenTool className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Recette manuscrite
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Photographiez une recette écrite à la main ou imprimée. Notre IA lit et structure automatiquement le texte.
                </p>
              </div>
              
              <div className="pt-4">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-green-100 transition-colors">
                  🤖 OCR Simulation
                </div>
                <p className="text-xs text-gray-500">
                  Version de démonstration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Infos IA */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                IA en cours de développement
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Mode manuel</strong> : Entièrement fonctionnel</li>
                <li>• <strong>IA Photo</strong> : Version simulation (sera OpenAI)</li>
                <li>• <strong>OCR</strong> : Version simulation (sera OpenAI)</li>
                <li>• <strong>Éditable</strong> : Vous pouvez corriger tous les résultats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'photo') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('choose')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            📸 Photo d'un plat (Simulation)
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-12 h-12 text-orange-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Photographiez votre plat
          </h2>
          <p className="text-gray-600 mb-8">
            Mode démonstration : L'IA va simuler une analyse de votre photo
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Tester l'analyse IA (simulation)
            </div>
          </label>

          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">🔬 Mode démonstration</h4>
            <ul className="text-sm text-orange-700 text-left space-y-1">
              <li>• L'IA générera des données de test</li>
              <li>• Vous pourrez modifier tous les champs</li>
              <li>• La vraie IA OpenAI sera ajoutée plus tard</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setMode('choose')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            📄 Recette manuscrite (Simulation)
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scannez votre recette
          </h2>
          <p className="text-gray-600 mb-8">
            Mode démonstration : L'OCR va simuler la lecture de votre document
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScanUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Tester l'OCR (simulation)
            </div>
          </label>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">🔬 Mode démonstration</h4>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• L'OCR générera du texte de test</li>
              <li>• Vous pourrez tout modifier</li>
              <li>• La vraie IA OpenAI sera ajoutée plus tard</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Mode saisie manuelle
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setMode('choose')}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          ✍️ Saisie manuelle
        </h1>
      </div>

      {/* Badge confiance IA */}
      {aiConfidence && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h4 className="font-medium text-green-800">Analyse IA terminée (simulation)</h4>
              <p className="text-sm text-green-700">
                Confiance : {aiConfidence}% • Vous pouvez modifier les champs ci-dessous
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        
        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom de la recette *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            placeholder="Ex: Gâteau de Mamie"
            required
          />
        </div>

        {/* Rangée rapide */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Par qui ?
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="Mamie, Papa..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temps (min)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Personnes
            </label>
            <input
              type="text"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="4, 6-8..."
            />
          </div>
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo (optionnel)
          </label>
          
          <div className="space-y-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              placeholder="Collez un lien d'image..."
            />
            
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
                📷 {isUploading ? "Upload..." : "Ma photo"}
              </label>
            </div>
            
            {imageUrl && (
              <div className="mt-3 relative">
                <img 
                  src={imageUrl} 
                  alt="Aperçu" 
                  className="w-full max-w-xs h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ingrédients */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🥄 Ingrédients
          </label>
          <textarea
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Un ingrédient par ligne :

200g de farine
3 œufs
100ml de lait"
          />
        </div>

        {/* Étapes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Instructions
          </label>
          <textarea
            rows={8}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Écrivez les étapes naturellement :

Préchauffer le four à 180°C.

Mélanger la farine et le sucre.

Enfourner 25 minutes."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setMode('choose')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Changer de mode
          </button>
          <button
            type="button"
            onClick={handleSaveManual}
            disabled={isSaving || !title.trim() || isUploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "⏳ Sauvegarde..." : "✨ Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

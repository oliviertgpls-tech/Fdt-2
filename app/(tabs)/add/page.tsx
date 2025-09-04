"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipes } from "@/contexts/RecipesProvider";
import { Camera, PenTool, Edit3, ArrowLeft, Sparkles, Upload, FileText } from "lucide-react";
import type { Recipe } from "@/lib/types";

export default function AddRecipePage() {
  const router = useRouter();
  const { addRecipe } = useRecipes();
  
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

  const handleSaveManual = async () => {
    if (!title.trim()) {
      alert("Le titre est obligatoire !");
      return;
    }

    setIsSaving(true);

    try {
      const recipeData: Omit<Recipe, 'id' | 'createdAt'> = {
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

      addRecipe(recipeData);
      router.push("/recipes");
    } catch (error) {
      alert("Erreur lors de la sauvegarde !");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Simulation de traitement IA
    setTimeout(() => {
      // Simulation de résultat IA
      setTitle("Tarte aux pommes de Mamie");
      setAuthor("Mamie");
      setPrepMinutes("45");
      setServings("6");
      setIngredients("6 pommes Golden\n200g de farine\n100g de beurre\n2 œufs\n80g de sucre\n1 pincée de sel");
      setSteps("Éplucher et couper les pommes en quartiers.\n\nPréparer la pâte en mélangeant farine, beurre et œufs.\n\nÉtaler la pâte dans un moule à tarte.\n\nDisposer les pommes sur la pâte et saupoudrer de sucre.\n\nCuire 35 minutes à 180°C.");
      setImageUrl("https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?q=80&w=600");
      setMode('manual'); // Passer en mode édition
      setIsProcessing(false);
    }, 3000);
  };

  const handleScanUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Simulation de traitement OCR + IA
    setTimeout(() => {
      // Simulation de résultat OCR
      setTitle("Gâteau au chocolat de Papa");
      setAuthor("Papa");
      setPrepMinutes("60");
      setServings("8");
      setIngredients("200g de chocolat noir\n200g de beurre\n4 œufs\n150g de sucre\n100g de farine\n1 sachet de levure");
      setSteps("Faire fondre le chocolat avec le beurre au bain-marie.\n\nBattre les œufs avec le sucre jusqu'à blanchiment.\n\nIncorporer le mélange chocolat-beurre tiédi.\n\nAjouter la farine et la levure tamisées.\n\nVerser dans un moule beurré et cuire 45 min à 180°C.");
      setImageUrl("https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600");
      setMode('manual'); // Passer en mode édition
      setIsProcessing(false);
    }, 4000);
  };

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✨ Magie en cours...
          </h2>
          <p className="text-gray-600 mb-8">
            Notre IA analyse votre {mode === 'photo' ? 'photo' : 'recette manuscrite'} et extrait automatiquement les informations
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Cela prend généralement 3-5 secondes...
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
                  🤖 IA Premium - 2€
                </div>
                <p className="text-xs text-gray-500">
                  + Photo HD optimisée gratuite
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
                  🤖 IA Premium - 1€
                </div>
                <p className="text-xs text-gray-500">
                  OCR + structuration automatique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Infos complémentaires */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Pourquoi utiliser l'IA ?
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Gain de temps</strong> : Plus besoin de tout retaper</li>
                <li>• <strong>Précision</strong> : L'IA comprend même l'écriture manuscrite</li>
                <li>• <strong>Optimisation</strong> : Photos automatiquement améliorées pour l'impression</li>
                <li>• <strong>Structuration</strong> : Format automatiquement adapté pour vos livres</li>
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
            📸 Photo d'un plat
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
            Notre IA va analyser votre photo et créer automatiquement la recette complète
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Prendre une photo / Choisir une image
            </div>
          </label>

          <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">💡 Conseils pour une meilleure analyse</h4>
            <ul className="text-sm text-orange-700 text-left space-y-1">
              <li>• Cadrez bien le plat au centre</li>
              <li>• Éclairage naturel de préférence</li>
              <li>• Évitez les reflets et ombres fortes</li>
              <li>• Plus la photo est nette, meilleur sera le résultat</li>
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
            📄 Recette manuscrite
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
            Photographiez une recette écrite à la main ou imprimée. Notre IA va lire et structurer le texte automatiquement.
          </p>

          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScanUpload(file);
              }}
              className="hidden"
            />
            <div className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Prendre une photo de la recette
            </div>
          </label>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">📝 Conseils pour un bon scan</h4>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Placez la recette sur une surface plane</li>
              <li>• Assurez-vous que tout le texte est visible</li>
              <li>• Éclairage uniforme sans ombres</li>
              <li>• Maintenez l'appareil bien droit</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Mode saisie manuelle (mode par défaut existant)
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        
        {/* Titre - OBLIGATOIRE */}
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

        {/* Rangée rapide : Auteur + Temps + Personnes */}
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

        {/* Photo (optionnel) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Photo (optionnel)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
            placeholder="Collez un lien d'image..."
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Ou utilisez notre mode "Photo d'un plat" pour une photo optimisée !
          </p>
        </div>

        {/* Ingrédients - SIMPLE textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🥄 Ingrédients
          </label>
          <textarea
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Tapez chaque ingrédient sur une nouvelle ligne :

200g de farine
3 œufs
100ml de lait
1 pincée de sel"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Un ingrédient par ligne, c'est tout !
          </p>
        </div>

        {/* Étapes - SIMPLE textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📋 Instructions
          </label>
          <textarea
            rows={8}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none resize-none"
            placeholder="Écrivez les étapes comme vous le feriez naturellement :

Préchauffer le four à 180°C.

Mélanger la farine et le sucre dans un saladier.

Ajouter les œufs un par un...

Enfourner 25 minutes.

Simple et naturel !"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Laissez une ligne vide entre chaque étape pour une navigation plus facile !
          </p>
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
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "⏳ Sauvegarde..." : "✨ Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}
